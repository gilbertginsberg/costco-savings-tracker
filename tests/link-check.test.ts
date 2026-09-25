import { test } from "node:test";
import assert from "node:assert/strict";
import { checkProductPage, verifyProductLinks } from "../src/lib/link-check";
import { costcoLink } from "../src/lib/format";
import type { DealItem } from "../src/lib/types";

const PRODUCT = "https://www.costco.com/vitamix-5300.product.4000000003.html";

/** Fake fetch: url → [status, body, finalUrl?] */
function fakeFetch(routes: Record<string, [number, string, string?]>): typeof fetch {
  return (async (input: string | URL | Request) => {
    const url = String(input);
    const route = routes[url];
    if (!route) throw new Error("network down");
    const [status, body, finalUrl] = route;
    const res = new Response(body, { status });
    Object.defineProperty(res, "url", { value: finalUrl ?? url });
    return res;
  }) as typeof fetch;
}

const item = (over: Partial<DealItem> = {}): DealItem => ({
  id: "p:1704138",
  promo_period_id: "p",
  item_name: "Vitamix 5300 Blender",
  item_number: "1704138",
  price: 299.99,
  discount_amount: 100,
  discount_type: "after_discount",
  category: "Appliances",
  availability: "both",
  purchase_limit: 1,
  product_url: PRODUCT,
  product_url_status: "unchecked",
  ...over,
});

test("verified only when the page loads and shows the item's own number", async () => {
  const ok = fakeFetch({ [PRODUCT]: [200, "<h1>Vitamix</h1><p>Item 1704138</p>"] });
  assert.equal(await checkProductPage(PRODUCT, "1704138", ok), "verified");
  // A page for a different product is wrong even though it loads.
  assert.equal(await checkProductPage(PRODUCT, "9999999", ok), "broken");
  // Item number must match whole, not as part of a longer number.
  const longer = fakeFetch({ [PRODUCT]: [200, "Item 17041385"] });
  assert.equal(await checkProductPage(PRODUCT, "1704138", longer), "broken");
});

test("404s and redirects away from a product page are broken", async () => {
  assert.equal(await checkProductPage(PRODUCT, "1", fakeFetch({ [PRODUCT]: [404, "Page not found"] })), "broken");
  const redirected = fakeFetch({ [PRODUCT]: [200, "Item 1704138", "https://www.costco.com/"] });
  assert.equal(await checkProductPage(PRODUCT, "1704138", redirected), "broken");
});

test("bot blocks and network errors are inconclusive, not broken", async () => {
  assert.equal(await checkProductPage(PRODUCT, "1", fakeFetch({ [PRODUCT]: [403, "Access Denied"] })), "blocked");
  assert.equal(await checkProductPage(PRODUCT, "1", fakeFetch({})), "blocked");
});

test("verifyProductLinks updates statuses, respects the cap, and stops when blocked", async () => {
  const good = item();
  const bad = item({ item_number: "222", product_url: "https://www.costco.com/gone.product.2.html" });
  const done = item({ item_number: "333", product_url_status: "verified" });
  const fetchImpl = fakeFetch({
    [PRODUCT]: [200, "Item 1704138"],
    "https://www.costco.com/gone.product.2.html": [404, ""],
  });
  const s = await verifyProductLinks([good, bad, done], { fetchImpl, delayMs: 0 });
  assert.equal(good.product_url_status, "verified");
  assert.equal(bad.product_url_status, "broken");
  assert.equal(s.verified, 1);
  assert.equal(s.broken.length, 1);

  const a = item({ item_number: "1" });
  const b = item({ item_number: "2" });
  const capped = await verifyProductLinks([a, b], { fetchImpl: fakeFetch({ [PRODUCT]: [200, "Item 1"] }), delayMs: 0, max: 1 });
  assert.equal(a.product_url_status, "verified");
  assert.equal(b.product_url_status, "unchecked");
  assert.equal(capped.skipped, 1);

  const c = item();
  const blocked = await verifyProductLinks([c], { fetchImpl: fakeFetch({ [PRODUCT]: [429, ""] }), delayMs: 0 });
  assert.equal(blocked.blocked, true);
  assert.equal(c.product_url_status, "unchecked");
});

test("cards only link product pages that were verified", () => {
  assert.equal(costcoLink(item({ product_url_status: "verified" })).href, PRODUCT);
  for (const status of ["unchecked", "broken"] as const) {
    assert.equal(
      costcoLink(item({ product_url_status: status })).href,
      "https://www.costco.com/s?keyword=1704138",
    );
  }
  assert.equal(
    costcoLink(item(), { isSample: true }).href,
    "https://www.costco.com/s?keyword=Vitamix%205300%20Blender",
  );
});
