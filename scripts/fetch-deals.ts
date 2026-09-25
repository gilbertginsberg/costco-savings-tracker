/**
 * Scheduled fetch job: pulls Costco's Warehouse Savings page, parses it, and
 * files the result into data/periods/<valid_start>_<valid_end>.json.
 *
 * Usage:
 *   npm run fetch-deals                  # respects cadence (skips most days)
 *   npm run fetch-deals -- --force       # ignore cadence
 *   npm run fetch-deals -- --file page.html   # parse a saved page instead of fetching
 *   npm run fetch-deals -- --skip-link-check  # don't open product pages
 *   npm run fetch-deals -- --browser     # render with Playwright (if installed)
 *   npm run fetch-deals -- --dry-run     # parse + report, write nothing
 *
 * After parsing, new product links are opened (at most 40 per run, 2s apart)
 * and kept only if the page shows the item's number; see src/lib/link-check.ts.
 *
 * Exit codes: 0 ok/skipped, 1 fetch or parse failure (nothing written),
 * 3 stale (page still shows a period that has ended; URL may have moved).
 */
import fs from "node:fs";
import { parseArgs } from "node:util";
import { mergeFetch, periodId } from "../src/lib/archive";
import { shouldFetch, DEFAULT_INTERVAL_DAYS } from "../src/lib/cadence";
import { daysBetween, todayIso } from "../src/lib/dates";
import { verifyProductLinks } from "../src/lib/link-check";
import { parseWarehouseSavings, ParseError } from "../src/lib/parser";
import { readPeriodFile, readPeriodFiles, writePeriodFile } from "../src/lib/store";

const DEFAULT_URL = "https://www.costco.com/o/-/warehouse-savings";
const USER_AGENT =
  "Mozilla/5.0 (compatible; CostcoSavingsTracker/0.1; +https://kirklandcorner.substack.com)";
/** Fewer items than this almost certainly means the parser missed the layout. */
const MIN_ITEMS = Number(process.env.MIN_ITEMS ?? 10);
/** Days past valid_end before a still-unchanged page is treated as stale. */
const STALE_GRACE_DAYS = 2;

const { values: args } = parseArgs({
  options: {
    force: { type: "boolean", default: false },
    "dry-run": { type: "boolean", default: false },
    "skip-link-check": { type: "boolean", default: false },
    browser: { type: "boolean", default: false },
    file: { type: "string" },
    url: { type: "string" },
  },
});

const sourceUrl = args.url ?? process.env.COSTCO_SAVINGS_URL ?? DEFAULT_URL;

function log(msg: string) {
  console.log(`[fetch-deals] ${msg}`);
}

function fail(msg: string, code = 1): never {
  // `::error::` surfaces as an annotation in GitHub Actions.
  console.error(`::error::${msg}`);
  process.exit(code);
}

async function fetchHtml(url: string): Promise<string> {
  if (args.browser) {
    const pw = await import("playwright" as string).catch(() =>
      fail('--browser needs Playwright: `npm i -D playwright && npx playwright install chromium`'),
    );
    const browser = await pw.chromium.launch();
    try {
      const page = await browser.newPage({ userAgent: USER_AGENT });
      await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
      return await page.content();
    } finally {
      await browser.close();
    }
  }

  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(30_000),
  });
  if (res.status === 403 || res.status === 429) {
    fail(`GET ${url} → HTTP ${res.status}: blocked (bot protection or rate limit). Try --browser or --file.`);
  }
  if (!res.ok) fail(`GET ${url} → HTTP ${res.status}. The URL may have changed.`);
  if (res.url && res.url !== url) log(`Redirected to ${res.url} — check whether the savings URL moved.`);
  return res.text();
}

async function main() {
  const now = new Date();
  const stored = readPeriodFiles();

  if (!args.file && !args.force) {
    const latest = stored[0]?.period ?? null;
    const lastFetchedAt = stored
      .map((p) => p.period.last_fetched_at)
      .sort()
      .at(-1);
    const decision = shouldFetch(
      latest && lastFetchedAt ? { valid_end: latest.valid_end, last_fetched_at: lastFetchedAt } : null,
      now,
      Number(process.env.FETCH_INTERVAL_DAYS ?? DEFAULT_INTERVAL_DAYS),
    );
    log(decision.reason);
    if (!decision.fetch) return;
  }

  const html = args.file ? fs.readFileSync(args.file, "utf8") : await fetchHtml(sourceUrl);

  let parsed;
  try {
    parsed = parseWarehouseSavings(html);
  } catch (err) {
    if (err instanceof ParseError) fail(err.message);
    throw err;
  }

  for (const w of parsed.warnings) console.warn(`::warning::${w}`);
  log(`Period ${parsed.valid_start} → ${parsed.valid_end}: ${parsed.items.length} items parsed.`);

  if (parsed.items.length < MIN_ITEMS) {
    fail(`Only ${parsed.items.length} items parsed (minimum ${MIN_ITEMS}); not writing. Check the parser against the live page.`);
  }

  const id = periodId(parsed.valid_start, parsed.valid_end);
  const existing = readPeriodFile(id);
  const result = mergeFetch(existing, parsed, { now, sourceUrl });

  log(
    result.isNewPeriod
      ? `New promo period ${id} — archiving ${result.file.items.length} items.`
      : `Refresh of ${id}: ${result.added.length} added, ${result.updated.length} updated, ${result.missing.length} no longer listed (kept).`,
  );

  // Only links confirmed to show the right item are displayed (see link-check.ts).
  if (!args["skip-link-check"]) {
    const links = await verifyProductLinks(result.file.items, {
      fetchImpl: fetch,
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      log,
    });
    log(
      `Product links: ${links.verified} verified, ${links.broken.length} broken, ${links.skipped} left for a later run.`,
    );
    for (const b of links.broken) console.warn(`::warning::Broken product link (item falls back to search): ${b}`);
  }

  if (args["dry-run"]) {
    log("Dry run: nothing written.");
  } else {
    log(`Wrote ${writePeriodFile(result.file)}`);
  }

  const pastEnd = daysBetween(parsed.valid_end, todayIso(now));
  if (pastEnd > STALE_GRACE_DAYS) {
    fail(
      `The page still shows a period that ended ${pastEnd} days ago (${parsed.valid_end}). ` +
        `Verify ${sourceUrl} is still the current savings URL.`,
      3,
    );
  }
}

main().catch((err) => fail(err instanceof Error ? err.stack ?? err.message : String(err)));
