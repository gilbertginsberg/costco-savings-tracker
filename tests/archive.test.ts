import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeFetch, periodId } from "../src/lib/archive";
import type { ParsedPage } from "../src/lib/parser";

const page = (items: Partial<ParsedPage["items"][number]>[], start = "2026-09-21", end = "2026-10-18"): ParsedPage => ({
  valid_start: start,
  valid_end: end,
  warnings: [],
  items: items.map((i) => ({
    item_name: "Thing",
    item_number: "1",
    price: null,
    discount_amount: 5,
    discount_type: "save",
    category: "Grocery",
    availability: "both",
    purchase_limit: null,
    ...i,
  })),
});
const url = "https://www.costco.com/o/-/warehouse-savings";

test("a new date range creates a new period keyed by its dates", () => {
  const now = new Date("2026-09-22T15:00:00Z");
  const r = mergeFetch(null, page([{ item_number: "1" }, { item_number: "2" }]), { now, sourceUrl: url });
  assert.equal(r.isNewPeriod, true);
  assert.equal(r.file.period.id, "2026-09-21_2026-10-18");
  assert.equal(r.file.period.first_fetched_at, now.toISOString());
  assert.equal(r.file.items[0].id, "2026-09-21_2026-10-18:1");
  assert.deepEqual(r.added, ["1", "2"]);
});

test("the same date range refreshes: updates fields, keeps first_fetched_at, never drops items", () => {
  const t1 = new Date("2026-09-22T15:00:00Z");
  const t2 = new Date("2026-09-25T15:00:00Z");
  const first = mergeFetch(null, page([{ item_number: "1", item_name: "Tyop" }, { item_number: "2" }]), { now: t1, sourceUrl: url });
  const second = mergeFetch(first.file, page([{ item_number: "1", item_name: "Typo fixed" }, { item_number: "3" }]), { now: t2, sourceUrl: url });

  assert.equal(second.isNewPeriod, false);
  assert.equal(second.file.period.first_fetched_at, t1.toISOString());
  assert.equal(second.file.period.last_fetched_at, t2.toISOString());
  assert.deepEqual(second.updated, ["1"]);
  assert.deepEqual(second.added, ["3"]);
  assert.deepEqual(second.missing, ["2"]);
  assert.equal(second.file.items.length, 3);
  assert.equal(second.file.items.find((i) => i.item_number === "1")?.item_name, "Typo fixed");
});

test("refusing to merge into a different period", () => {
  const first = mergeFetch(null, page([{}]), { now: new Date(), sourceUrl: url });
  assert.throws(() =>
    mergeFetch(first.file, page([{}], "2026-10-19", "2026-11-15"), { now: new Date(), sourceUrl: url }),
  );
  assert.equal(periodId("2026-10-19", "2026-11-15"), "2026-10-19_2026-11-15");
});
