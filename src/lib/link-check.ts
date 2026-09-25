/**
 * Verifies product links before the site shows them: a link counts only if
 * the page loads and mentions the deal's own item number. Used by the fetch
 * job; `fetchImpl` is injectable so the logic is unit-tested without network.
 */
import { productUrl } from "./parser";
import type { DealItem } from "./types";

export type LinkCheck = "verified" | "broken" | "blocked";

/** Max product pages opened per run, so a new period can't mean hundreds of requests. */
export const MAX_LINK_CHECKS = 40;
/** Pause between product page requests. */
export const LINK_CHECK_DELAY_MS = 2_000;

export async function checkProductPage(
  url: string,
  itemNumber: string,
  fetchImpl: typeof fetch,
  headers: Record<string, string> = {},
): Promise<LinkCheck> {
  let res: Response;
  try {
    res = await fetchImpl(url, { headers, redirect: "follow", signal: AbortSignal.timeout(20_000) });
  } catch {
    return "blocked"; // network trouble says nothing about the link itself
  }
  if (res.status === 403 || res.status === 429 || res.status >= 500) return "blocked";
  if (!res.ok) return "broken";
  // Redirected off the product (e.g. to the homepage or a category): broken.
  if (res.url && !productUrl(res.url)) return "broken";
  const body = await res.text();
  return new RegExp(`(^|\\D)${itemNumber}(\\D|$)`).test(body) ? "verified" : "broken";
}

export interface LinkCheckSummary {
  verified: number;
  broken: string[];
  skipped: number;
  blocked: boolean;
}

/**
 * Checks unchecked links in place (sets `product_url_status`). Stops early if
 * Costco starts refusing requests; those links stay "unchecked" for next run.
 */
export async function verifyProductLinks(
  items: DealItem[],
  opts: {
    fetchImpl: typeof fetch;
    headers?: Record<string, string>;
    max?: number;
    delayMs?: number;
    log?: (msg: string) => void;
  },
): Promise<LinkCheckSummary> {
  const { fetchImpl, headers, max = MAX_LINK_CHECKS, delayMs = LINK_CHECK_DELAY_MS, log = () => {} } = opts;
  const pending = items.filter((i) => i.product_url && i.product_url_status === "unchecked");
  const summary: LinkCheckSummary = { verified: 0, broken: [], skipped: 0, blocked: false };

  for (const [n, item] of pending.entries()) {
    if (n >= max) {
      summary.skipped = pending.length - n;
      break;
    }
    if (n > 0 && delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
    const result = await checkProductPage(item.product_url!, item.item_number, fetchImpl, headers);
    if (result === "blocked") {
      summary.blocked = true;
      summary.skipped = pending.length - n;
      log(`Link checks blocked at item ${item.item_number}; ${summary.skipped} left for next run.`);
      break;
    }
    item.product_url_status = result;
    if (result === "verified") summary.verified++;
    else summary.broken.push(`${item.item_number} ${item.product_url}`);
  }
  return summary;
}
