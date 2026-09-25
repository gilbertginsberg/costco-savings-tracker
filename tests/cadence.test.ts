import { test } from "node:test";
import assert from "node:assert/strict";
import { shouldFetch } from "../src/lib/cadence";

// 20:00 UTC = 1pm Pacific, same calendar day in both zones.
const at = (d: string) => new Date(`${d}T20:00:00Z`);

test("fetches when there is no data", () => {
  assert.equal(shouldFetch(null, at("2026-09-25")).fetch, true);
});

test("never fetches twice in one day", () => {
  const latest = { valid_end: "2026-09-26", last_fetched_at: at("2026-09-25").toISOString() };
  assert.equal(shouldFetch(latest, new Date("2026-09-25T23:00:00Z")).fetch, false);
});

test("mid-period: every 3 days by default", () => {
  const latest = { valid_end: "2026-10-18", last_fetched_at: at("2026-09-22").toISOString() };
  assert.equal(shouldFetch(latest, at("2026-09-23")).fetch, false);
  assert.equal(shouldFetch(latest, at("2026-09-24")).fetch, false);
  assert.equal(shouldFetch(latest, at("2026-09-25")).fetch, true);
  assert.equal(shouldFetch(latest, at("2026-09-24"), 2).fetch, true);
});

test("final week and after the period ends: daily", () => {
  const latest = { valid_end: "2026-10-18", last_fetched_at: at("2026-10-12").toISOString() };
  assert.equal(shouldFetch(latest, at("2026-10-13")).fetch, true);
  const ended = { valid_end: "2026-10-18", last_fetched_at: at("2026-10-19").toISOString() };
  assert.equal(shouldFetch(ended, at("2026-10-20")).fetch, true);
});
