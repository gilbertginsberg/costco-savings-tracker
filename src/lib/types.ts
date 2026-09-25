import type { Category } from "./categories";

/** How a deal's savings are expressed on Costco's page. */
export type DiscountType = "save" | "after_discount";

/** Where the deal can be redeemed. */
export type Availability = "warehouse" | "online" | "both";

/**
 * One promo period, identified by its exact date range (NOT the fetch date and
 * NOT a calendar month, since Costco periods straddle two months).
 */
export interface PromoPeriod {
  /** `${valid_start}_${valid_end}`, e.g. "2026-09-21_2026-10-18". */
  id: string;
  /** ISO date (YYYY-MM-DD). */
  valid_start: string;
  /** ISO date (YYYY-MM-DD), inclusive. */
  valid_end: string;
  /** ISO timestamp of the first fetch that saw this period. */
  first_fetched_at: string;
  /** ISO timestamp of the most recent fetch that saw this period. */
  last_fetched_at: string;
  source_url: string;
  /** True for bundled preview data, never for real fetched data. */
  is_sample?: boolean;
}

export interface DealItem {
  /** `${promo_period_id}:${item_number}`; stable across refreshes. */
  id: string;
  promo_period_id: string;
  item_name: string;
  item_number: string;
  /** Final price for "after_discount" deals; null for plain "Save $X" deals. */
  price: number | null;
  discount_amount: number;
  discount_type: DiscountType;
  category: Category;
  availability: Availability;
  purchase_limit: number | null;
  /** Product page link found on the savings page, if any. */
  product_url: string | null;
  /**
   * Whether `product_url` has been opened and confirmed to show this item's
   * number. The site only links product pages that are "verified"; anything
   * else falls back to a Costco.com search for the item number.
   */
  product_url_status: ProductUrlStatus;
}

export type ProductUrlStatus = "unchecked" | "verified" | "broken";

/** On-disk shape of `data/periods/<period id>.json`. */
export interface PeriodFile {
  period: PromoPeriod;
  items: DealItem[];
}
