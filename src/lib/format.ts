import type { Availability, DealItem } from "./types";

export function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  both: "Warehouse & Online",
  online: "Online Only",
  warehouse: "Warehouse Only",
};

/** One-line human summary of a deal's discount. */
export function describeDiscount(item: DealItem): string {
  return item.discount_type === "after_discount" && item.price !== null
    ? `${formatMoney(item.price)} after ${formatMoney(item.discount_amount)} off`
    : `Save ${formatMoney(item.discount_amount)}`;
}

export function totalSavings(items: DealItem[]): number {
  return items.reduce((sum, i) => sum + i.discount_amount, 0);
}

export interface CostcoLink {
  href: string;
  label: string;
}

const costcoSearch = (q: string) => `https://www.costco.com/s?keyword=${encodeURIComponent(q)}`;

/**
 * Where a deal card links on costco.com:
 * - the product page, but only once the fetch job has verified it shows this item;
 * - otherwise a Costco.com search for the item number, which Costco's search
 *   resolves to that exact product;
 * - for sample data (fake item numbers), a search by product name.
 */
export function costcoLink(item: DealItem, opts: { isSample?: boolean } = {}): CostcoLink {
  if (opts.isSample) return { href: costcoSearch(item.item_name), label: "Search Costco.com" };
  if (item.product_url && item.product_url_status === "verified") {
    return { href: item.product_url, label: "View on Costco.com" };
  }
  return { href: costcoSearch(item.item_number), label: "Find on Costco.com" };
}
