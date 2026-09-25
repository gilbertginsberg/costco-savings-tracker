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
