import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  extractProductLinks,
  htmlToLines,
  productUrl,
  parseValidRange,
  parseWarehouseSavings,
  ParseError,
  tokenizeLine,
} from "../src/lib/parser";
import { matchCategoryHeader } from "../src/lib/categories";

const fixture = (name: string) =>
  fs.readFileSync(path.join(__dirname, "fixtures", name), "utf8");

// Source rows the fixtures were generated from:
// [category, name, availability, limit, ["save", amt] | ["after", price, amt]]
type Row = [string, string, string, number | null, [string, ...(string | number)[]]];
const source = JSON.parse(fixture("expected-source.json")) as { CUR: Row[]; PREV: Row[] };

const AVAIL: Record<string, string> = {
  "Warehouse & Online": "both",
  "Online Only": "online",
  "Warehouse Only": "warehouse",
};

function assertMatchesSource(html: string, rows: Row[]) {
  const page = parseWarehouseSavings(html);
  assert.equal(page.items.length, rows.length, page.warnings.join("\n"));
  rows.forEach(([category, name, avail, limit, disc], i) => {
    const item = page.items[i];
    assert.equal(item.category, category, `category of ${name}`);
    assert.equal(item.item_name, name);
    assert.equal(item.availability, AVAIL[avail], `availability of ${name}`);
    assert.equal(item.purchase_limit, limit, `limit of ${name}`);
    if (disc[0] === "save") {
      assert.equal(item.discount_type, "save");
      assert.equal(item.discount_amount, disc[1]);
      assert.equal(item.price, null);
    } else {
      assert.equal(item.discount_type, "after_discount");
      assert.equal(item.price, Number(disc[1]));
      assert.equal(item.discount_amount, disc[2]);
    }
  });
  return page;
}

test("parses the period key from the Valid banner", () => {
  const page = parseWarehouseSavings(fixture("warehouse-savings-2026-09.html"));
  assert.equal(page.valid_start, "2026-09-21");
  assert.equal(page.valid_end, "2026-10-18");
});

test("ignores Valid strings inside <script>", () => {
  // The fixture's <script> contains "Valid 1/1/99 - 1/2/99".
  const lines = htmlToLines(fixture("warehouse-savings-2026-09.html"));
  assert.ok(!lines.some((l) => l.includes("1/1/99")));
});

test("parses every item on a card-layout page", () => {
  const page = assertMatchesSource(fixture("warehouse-savings-2026-09.html"), source.CUR);
  assert.deepEqual(page.warnings, []);
});

test("parses the previous period fixture", () => {
  const page = assertMatchesSource(fixture("warehouse-savings-2026-08.html"), source.PREV);
  assert.equal(page.valid_start, "2026-08-24");
  assert.equal(page.valid_end, "2026-09-20");
});

test("parses a flat, discount-first layout with concatenated fields", () => {
  const page = assertMatchesSource(fixture("warehouse-savings-flat.html"), source.CUR);
  assert.equal(page.valid_start, "2026-09-21");
});

test("item numbers are unique anchors", () => {
  const page = parseWarehouseSavings(fixture("warehouse-savings-2026-09.html"));
  const numbers = page.items.map((i) => i.item_number);
  assert.equal(new Set(numbers).size, numbers.length);
  assert.ok(numbers.every((n) => /^\d+$/.test(n)));
});

test("throws ParseError when there is no Valid banner", () => {
  assert.throws(
    () => parseWarehouseSavings("<html><body>Access Denied</body></html>"),
    ParseError,
  );
});

test("parseValidRange handles dash variants and 4-digit years", () => {
  assert.deepEqual(parseValidRange("Valid 9/21/26 - 10/18/26"), {
    valid_start: "2026-09-21",
    valid_end: "2026-10-18",
  });
  assert.deepEqual(parseValidRange("Valid 12/29/2026–1/25/2027"), {
    valid_start: "2026-12-29",
    valid_end: "2027-01-25",
  });
  assert.deepEqual(parseValidRange("VALID 1/2/27 through 1/29/27"), {
    valid_start: "2027-01-02",
    valid_end: "2027-01-29",
  });
  assert.equal(parseValidRange("no dates here"), null);
  assert.throws(() => parseValidRange("Valid 2/30/26 - 3/1/26"), ParseError);
});

test("tokenizeLine splits a fully concatenated text-rendered item", () => {
  const tokens = tokenizeLine("Warehouse & OnlineItem 1234567Limit 2Save$50");
  assert.deepEqual(tokens, [
    { kind: "availability", value: "both" },
    { kind: "item", value: "1234567" },
    { kind: "limit", value: 2 },
    { kind: "discount", type: "save", amount: 50, price: null },
  ]);
  assert.deepEqual(tokenizeLine("$1,299.99 After $300 OFF"), [
    { kind: "discount", type: "after_discount", price: 1299.99, amount: 300 },
  ]);
});

test("items missing a discount or a category are skipped with a warning", () => {
  const html = `<div>Valid 9/21/26 - 10/18/26</div>
    <div>Orphan Widget</div><div>Item 111111</div><div>Save $5</div>
    <h2>Grocery</h2>
    <div>Mystery Snack</div><div>Item 222222</div>
    <div>Real Snack</div><div>Warehouse & Online</div><div>Item 333333</div><div>Save $2</div>`;
  const page = parseWarehouseSavings(html);
  assert.deepEqual(page.items.map((i) => i.item_number), ["333333"]);
  assert.equal(page.warnings.length, 2);
});

test("category headers tolerate punctuation and 'and'", () => {
  assert.equal(matchCategoryHeader("Patio, Lawn & Garden"), "Patio/Lawn/Garden");
  assert.equal(matchCategoryHeader("Health and Personal Care"), "Health & Personal Care");
  assert.equal(matchCategoryHeader("ELECTRONICS"), "Electronics");
  assert.equal(matchCategoryHeader("Electronics Savings"), "Electronics");
  assert.equal(matchCategoryHeader("Electronics Sale Item 123"), null);
});

test("attaches each tile's product link to its own item, skipping nav/footer links", () => {
  const page = parseWarehouseSavings(fixture("warehouse-savings-2026-09.html"));
  const linked = page.items.filter((i) => i.product_url);
  // Every 5th tile in the fixture has no link.
  assert.equal(linked.length, 24);
  assert.equal(
    page.items[0].product_url,
    "https://www.costco.com/kirkland-signature-men-x27-s-performance-fleece-pullover.product.4000000000.html",
  );
  assert.equal(page.items[4].product_url, null, "an unlinked tile must not borrow a neighbour's link");
  assert.ok(linked.every((i) => i.product_url!.endsWith(`.product.${4000000000 + page.items.indexOf(i)}.html`)));
  const urls = page.items.map((i) => i.product_url).join(" ");
  assert.ok(!urls.includes("4999999999") && !urls.includes("4888888888"));
});

test("handles new-style /p/ product URLs", () => {
  const page = parseWarehouseSavings(fixture("warehouse-savings-2026-08.html"));
  assert.equal(page.items.filter((i) => i.product_url).length, 15);
  assert.match(page.items[0].product_url!, /^https:\/\/www\.costco\.com\/p\/-\/[a-z0-9-]+\/4000100000$/);
});

test("pages without product links parse with product_url null", () => {
  const page = parseWarehouseSavings(fixture("warehouse-savings-flat.html"));
  assert.ok(page.items.every((i) => i.product_url === null));
});

test("productUrl only accepts costco.com product pages", () => {
  assert.equal(
    productUrl("//costco.com/foo.product.123.html?x=1#y"),
    "https://www.costco.com/foo.product.123.html",
  );
  assert.equal(productUrl("/p/-/foo/123"), "https://www.costco.com/p/-/foo/123");
  assert.equal(productUrl("#"), null);
  assert.equal(productUrl("/o/-/warehouse-savings"), null);
  assert.equal(productUrl("https://www.amazon.com/foo.product.123.html"), null);
  assert.equal(productUrl("https://evilcostco.com/foo.product.123.html"), null);
  assert.equal(productUrl(undefined), null);
});

test("a link in a container holding several items is ignored", () => {
  const links = extractProductLinks(`<div>
    <a href="/bundle.product.1.html">Shop the bundle</a>
    <div>Item 111111</div><div>Item 222222</div></div>`);
  assert.equal(links.size, 0);
});
