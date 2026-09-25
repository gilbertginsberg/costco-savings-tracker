/**
 * Parser for Costco's official Warehouse Savings page
 * (https://www.costco.com/o/-/warehouse-savings).
 *
 * Pure: takes HTML, returns the promo period + items. No I/O, so it is
 * unit-tested against saved fixtures in `tests/fixtures/`.
 *
 * Strategy (see README → "Parser logic"):
 *   1. Flatten the DOM into text lines in document order (block elements
 *      become line breaks), so we don't depend on Costco's CSS class names,
 *      which change without notice.
 *   2. Find the single "Valid M/D/YY - M/D/YY" banner. That date pair is the
 *      period key.
 *   3. Walk the lines top to bottom. A line matching a known category header
 *      starts a new section.
 *   4. Tokenize every line into fields (availability, "Item N", "Limit N",
 *      discount) plus leftover text (the product name), then group tokens into
 *      items anchored on the unique "Item N" marker.
 */
import * as cheerio from "cheerio";
import { matchCategoryHeader, type Category } from "./categories";
import type { Availability, DiscountType } from "./types";

export interface ParsedItem {
  item_name: string;
  item_number: string;
  price: number | null;
  discount_amount: number;
  discount_type: DiscountType;
  category: Category;
  availability: Availability;
  purchase_limit: number | null;
  /** Product page on costco.com, when the savings page links to one. */
  product_url: string | null;
}

export interface ParsedPage {
  valid_start: string;
  valid_end: string;
  items: ParsedItem[];
  warnings: string[];
}

export class ParseError extends Error {}

// ---------------------------------------------------------------------------
// 1. HTML → lines
// ---------------------------------------------------------------------------

const BLOCK_ELEMENTS = [
  "address", "article", "aside", "blockquote", "button", "dd", "details",
  "dialog", "div", "dl", "dt", "fieldset", "figcaption", "figure", "footer",
  "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "li", "main",
  "nav", "ol", "p", "pre", "section", "summary", "table", "tbody", "td",
  "tfoot", "th", "thead", "tr", "ul",
].join(",");

const COSTCO_ORIGIN = "https://www.costco.com";
/**
 * Returns a canonical costco.com product URL for `href`, or null if it isn't
 * a product page (nav, footer, "#", the savings page itself, other sites).
 * Covers both URL styles: `/name.product.4000123456.html` and `/p/-/name/4000123456`.
 */
export function productUrl(href: string | undefined): string | null {
  if (!href) return null;
  let url: URL;
  try {
    url = new URL(href, COSTCO_ORIGIN);
  } catch {
    return null;
  }
  if (!/(^|\.)costco\.com$/i.test(url.hostname)) return null;
  if (!/\.product\.\d+\.html$|^\/p\//i.test(url.pathname)) return null;
  url.protocol = "https:";
  url.hostname = "www.costco.com";
  url.search = "";
  url.hash = "";
  return url.toString();
}

const ITEM_NUMBER_RE = /items?\s*#?\s*:?\s*(\d{3,9})/gi;

function itemNumbersIn(text: string): Set<string> {
  return new Set([...text.matchAll(ITEM_NUMBER_RE)].map((m) => m[1]));
}

/**
 * Maps item number → product URL using page structure rather than text order:
 * from each product link, climb to the nearest ancestor that mentions an item
 * number. If it mentions exactly one, that ancestor is the product's tile.
 * If it mentions several, the link isn't inside a single tile, so it's skipped.
 */
export function extractProductLinks(html: string): Map<string, string> {
  const $ = cheerio.load(html);
  $("script, style, noscript, template").remove();
  const links = new Map<string, string>();
  $("a[href]").each((_, a) => {
    const url = productUrl($(a).attr("href"));
    if (!url) return;
    for (let el = $(a); el.length > 0 && !el.is("html"); el = el.parent()) {
      const numbers = itemNumbersIn(el.text());
      if (numbers.size === 0) continue;
      if (numbers.size === 1) {
        const [n] = numbers;
        if (!links.has(n)) links.set(n, url);
      }
      return;
    }
  });
  return links;
}

/** Flattens HTML to trimmed, non-empty text lines in document order. */
export function htmlToLines(html: string): string[] {
  const $ = cheerio.load(html);
  $("script, style, noscript, svg, template, iframe, link, meta").remove();

  $("br").replaceWith("\n");
  $(BLOCK_ELEMENTS).each((_, el) => {
    $(el).prepend("\n").append("\n");
  });
  // Image alt text is sometimes the only place a product name appears.
  $("img[alt]").each((_, el) => {
    const alt = $(el).attr("alt")?.trim();
    $(el).replaceWith(alt ? `\n${alt}\n` : "");
  });
  const text = $.root().text();
  return joinSplitFields(
    text
      .split("\n")
      .map((l) => l.replace(/ /g, " ").replace(/\s+/g, " ").trim())
      .filter(Boolean),
  );
}

/**
 * Re-joins fields that markup split across lines, e.g. "Save" / "$50",
 * "Item" / "1234567", "$19.99" / "After $5 OFF".
 */
function joinSplitFields(lines: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    while (i + 1 < lines.length) {
      const next = lines[i + 1];
      const joinable =
        /^(save|item|item #|limit|after|valid|\$|save up to)$/i.test(line) ||
        (/^\$\s*[\d,.]+$/.test(line) && /^after\b/i.test(next)) ||
        (/^(save|after)\b.*\$$/i.test(line) && /^[\d,.]+/.test(next)) ||
        (/^valid\b.*[-–—]$/i.test(line) && /^\d/.test(next));
      if (!joinable) break;
      line = `${line} ${next}`;
      i++;
    }
    out.push(line);
  }
  return out;
}

// ---------------------------------------------------------------------------
// 2. Period key
// ---------------------------------------------------------------------------

const VALID_RE =
  /valid\s*(?:from\s*)?(\d{1,2})\/(\d{1,2})\/(\d{4}|\d{2})(?!\d)\s*(?:-|–|—|to|through|thru)\s*(\d{1,2})\/(\d{1,2})\/(\d{4}|\d{2})(?!\d)/gi;

function toIsoDate(m: string, d: string, y: string): string {
  const year = y.length === 2 ? 2000 + Number(y) : Number(y);
  const month = Number(m);
  const day = Number(d);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new ParseError(`Invalid date ${m}/${d}/${y}`);
  }
  return date.toISOString().slice(0, 10);
}

/**
 * Parses the first "Valid [start] - [end]" range in `text`.
 * Returns null if there isn't one.
 */
export function parseValidRange(
  text: string,
): { valid_start: string; valid_end: string } | null {
  VALID_RE.lastIndex = 0;
  const m = VALID_RE.exec(text);
  if (!m) return null;
  const valid_start = toIsoDate(m[1], m[2], m[3]);
  const valid_end = toIsoDate(m[4], m[5], m[6]);
  if (valid_end < valid_start) {
    throw new ParseError(`Valid range ends before it starts: ${m[0]}`);
  }
  return { valid_start, valid_end };
}

// ---------------------------------------------------------------------------
// 3–4. Tokenize + group
// ---------------------------------------------------------------------------

const MONEY = String.raw`\$\s*([\d,]+(?:\.\d{1,2})?)`;

type Token =
  | { kind: "availability"; value: Availability }
  | { kind: "item"; value: string }
  | { kind: "limit"; value: number }
  | { kind: "discount"; type: DiscountType; amount: number; price: number | null }
  | { kind: "valid" }
  | { kind: "text"; value: string };

/** Field patterns, tried in order at each position. Order matters. */
const FIELD_PATTERNS: { re: RegExp; toToken: (m: RegExpExecArray) => Token }[] = [
  { re: VALID_RE, toToken: () => ({ kind: "valid" }) },
  {
    re: /warehouse\s*(?:&|and|\+)\s*online|online\s*(?:&|and|\+)\s*(?:in[-\s]?)?warehouse/gi,
    toToken: () => ({ kind: "availability", value: "both" }),
  },
  {
    re: /online\s*only|only\s*online/gi,
    toToken: () => ({ kind: "availability", value: "online" }),
  },
  {
    re: /(?:in[-\s]?)?warehouse\s*only|in[-\s]warehouse/gi,
    toToken: () => ({ kind: "availability", value: "warehouse" }),
  },
  {
    // "Item 1234567" (variants: "Item #", "Items 123, 456" → first number).
    re: /items?\s*#?\s*:?\s*(\d{3,9})(?:\s*(?:,|\/|&|or)\s*\d{3,9})*/gi,
    toToken: (m) => ({ kind: "item", value: m[1] }),
  },
  {
    re: /limit\s*:?\s*(\d{1,3})(?:\s*per\s*member(?:ship)?)?/gi,
    toToken: (m) => ({ kind: "limit", value: Number(m[1]) }),
  },
  {
    // "$19.99 After $5 OFF"
    re: new RegExp(
      `${MONEY}\\s*after\\s*${MONEY}\\s*(?:off|instant\\s*savings|manufacturer'?s?\\s*savings)?`,
      "gi",
    ),
    toToken: (m) => ({
      kind: "discount",
      type: "after_discount",
      price: money(m[1]),
      amount: money(m[2]),
    }),
  },
  {
    // "Save$50", "Save $50", "Save up to $50"
    re: new RegExp(`save\\s*(?:up\\s*to\\s*)?${MONEY}(?:\\s*off)?`, "gi"),
    toToken: (m) => ({ kind: "discount", type: "save", price: null, amount: money(m[1]) }),
  },
  {
    // bare "$50 OFF"
    re: new RegExp(`${MONEY}\\s*off\\b`, "gi"),
    toToken: (m) => ({ kind: "discount", type: "save", price: null, amount: money(m[1]) }),
  },
];

function money(s: string): number {
  return Number(s.replace(/,/g, ""));
}

/** Marketing / UI chrome that should never become part of a product name. */
const NOISE_RE =
  /^(shop\s*(now|all|online)?|learn\s*more|see\s*details|details|view\s*(all|more)|add\s*to\s*cart|while\s*supplies\s*last\.?|online\s*price\s*may\s*vary\.?|price\s*varies|\*+|[-–—|•·]+|new|sale|warehouse\s*savings|member\s*only\s*savings|instant\s*savings|\d+\s*%?)$/i;

const MAX_NAME_PART = 160;

/** Splits one line into field tokens + leftover text tokens. */
export function tokenizeLine(line: string): Token[] {
  const hits: { start: number; end: number; token: Token }[] = [];
  for (const { re, toToken } of FIELD_PATTERNS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line))) {
      const start = m.index;
      const end = start + m[0].length;
      if (!hits.some((h) => start < h.end && end > h.start)) {
        hits.push({ start, end, token: toToken(m) });
      }
    }
  }
  hits.sort((a, b) => a.start - b.start);

  const tokens: Token[] = [];
  let cursor = 0;
  const pushText = (s: string) => {
    const t = s.replace(/^[\s,;:|*•·–—-]+|[\s,;:|*•·–—-]+$/g, "").trim();
    if (t && !NOISE_RE.test(t) && t.length <= MAX_NAME_PART) {
      tokens.push({ kind: "text", value: t });
    }
  };
  for (const h of hits) {
    pushText(line.slice(cursor, h.start));
    tokens.push(h.token);
    cursor = h.end;
  }
  pushText(line.slice(cursor));
  return tokens;
}

interface Draft {
  nameParts: string[];
  item_number?: string;
  availability?: Availability;
  purchase_limit?: number;
  discount?: { type: DiscountType; amount: number; price: number | null };
}

/**
 * Parses the full Warehouse Savings page.
 * Throws ParseError if the period banner is missing; item-level problems are
 * reported in `warnings` rather than thrown.
 */
export function parseWarehouseSavings(html: string): ParsedPage {
  const lines = htmlToLines(html);
  const period = parseValidRange(lines.join("\n"));
  if (!period) {
    throw new ParseError(
      'No "Valid M/D/YY - M/D/YY" banner found. The page layout may have changed, or the fetch returned a bot-check page.',
    );
  }

  const links = extractProductLinks(html);
  const warnings: string[] = [];
  const items: ParsedItem[] = [];
  const seen = new Set<string>();

  // Other distinct ranges are worth flagging: the spec says there is one.
  const allRanges = new Set<string>();
  VALID_RE.lastIndex = 0;
  for (const m of lines.join("\n").matchAll(VALID_RE)) allRanges.add(m[0].toLowerCase().replace(/\s+/g, " "));
  if (allRanges.size > 1) {
    warnings.push(
      `Found ${allRanges.size} distinct "Valid" ranges; using the first (${period.valid_start} → ${period.valid_end}).`,
    );
  }

  let category: Category | null = null;
  let draft: Draft = { nameParts: [] };

  const finalize = () => {
    const d = draft;
    draft = { nameParts: [] };
    if (!d.item_number) return; // stray text (nav, footer, disclaimers)
    const name = d.nameParts.slice(-3).join(" ").trim();
    const where = `item ${d.item_number}${name ? ` (${name})` : ""}`;
    if (!category) {
      warnings.push(`Skipped ${where}: appeared before any category header.`);
      return;
    }
    if (!name) {
      warnings.push(`Skipped ${where}: no product name found.`);
      return;
    }
    if (!d.discount) {
      warnings.push(`Skipped ${where}: no discount found.`);
      return;
    }
    if (seen.has(d.item_number)) {
      warnings.push(`Skipped duplicate ${where} in ${category}.`);
      return;
    }
    if (!d.availability) {
      warnings.push(`No availability for ${where}; assuming "Warehouse & Online".`);
    }
    seen.add(d.item_number);
    items.push({
      item_name: name,
      item_number: d.item_number,
      price: d.discount.price,
      discount_amount: d.discount.amount,
      discount_type: d.discount.type,
      category,
      availability: d.availability ?? "both",
      purchase_limit: d.purchase_limit ?? null,
      product_url: links.get(d.item_number) ?? null,
    });
  };

  for (const line of lines) {
    const header = matchCategoryHeader(line);
    if (header) {
      finalize();
      category = header;
      continue;
    }

    for (const token of tokenizeLine(line)) {
      switch (token.kind) {
        case "valid":
          break;
        case "text":
          // Text after a completed anchor starts the next item's name.
          if (draft.item_number) finalize();
          draft.nameParts.push(token.value);
          break;
        case "item":
          if (draft.item_number) finalize();
          draft.item_number = token.value;
          break;
        case "availability":
          if (draft.item_number && draft.availability) finalize();
          draft.availability = token.value;
          break;
        case "limit":
          if (draft.item_number && draft.purchase_limit !== undefined) finalize();
          draft.purchase_limit = token.value;
          break;
        case "discount":
          // A second discount means we've crossed into the next item
          // (layouts that print the discount above the name).
          if (draft.discount) {
            if (draft.item_number) finalize();
            else draft.nameParts = [];
          }
          draft.discount = { type: token.type, amount: token.amount, price: token.price };
          break;
      }
    }
  }
  finalize();

  return { ...period, items, warnings };
}
