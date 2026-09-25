/**
 * Pure logic for filing a fetch into the archive: same date range → refresh the
 * existing period; new date range → a new period. No I/O.
 */
import type { ParsedPage } from "./parser";
import type { DealItem, PeriodFile } from "./types";

export function periodId(valid_start: string, valid_end: string): string {
  return `${valid_start}_${valid_end}`;
}

export interface MergeResult {
  file: PeriodFile;
  isNewPeriod: boolean;
  added: string[];
  updated: string[];
  /** In the stored period but absent from this fetch. Kept, not deleted. */
  missing: string[];
}

const ITEM_FIELDS = [
  "item_name",
  "price",
  "discount_amount",
  "discount_type",
  "category",
  "availability",
  "purchase_limit",
  "product_url",
] as const;

/**
 * Merges a parsed fetch into the stored period file (or creates one).
 *
 * Items are keyed by item number. Changed fields are overwritten (Costco
 * fixing a typo mid-period). Items that vanish mid-period are kept: the offer
 * was published for the whole range, and the archive should never lose data.
 */
export function mergeFetch(
  existing: PeriodFile | null,
  parsed: ParsedPage,
  opts: { now: Date; sourceUrl: string },
): MergeResult {
  const id = periodId(parsed.valid_start, parsed.valid_end);
  const nowIso = opts.now.toISOString();

  if (existing && existing.period.id !== id) {
    throw new Error(`mergeFetch: period mismatch (${existing.period.id} vs ${id})`);
  }

  const period = existing
    ? { ...existing.period, last_fetched_at: nowIso, source_url: opts.sourceUrl }
    : {
        id,
        valid_start: parsed.valid_start,
        valid_end: parsed.valid_end,
        first_fetched_at: nowIso,
        last_fetched_at: nowIso,
        source_url: opts.sourceUrl,
      };

  const byNumber = new Map<string, DealItem>(
    (existing?.items ?? []).map((i) => [i.item_number, i]),
  );
  const added: string[] = [];
  const updated: string[] = [];
  const seenNow = new Set<string>();

  for (const p of parsed.items) {
    seenNow.add(p.item_number);
    const prev = byNumber.get(p.item_number);
    const next: DealItem = {
      id: `${id}:${p.item_number}`,
      promo_period_id: id,
      ...p,
      // A fetch that misses a link shouldn't erase one we already found.
      product_url: p.product_url ?? prev?.product_url ?? null,
    };
    if (!prev) added.push(p.item_number);
    else if (ITEM_FIELDS.some((f) => prev[f] !== next[f])) updated.push(p.item_number);
    byNumber.set(p.item_number, next);
  }

  const missing = [...byNumber.keys()].filter((n) => !seenNow.has(n));

  return {
    file: { period, items: [...byNumber.values()] },
    isNewPeriod: !existing,
    added,
    updated,
    missing,
  };
}
