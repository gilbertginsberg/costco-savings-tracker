/**
 * Affiliate + sponsored placements, driven by small JSON files in data/ so
 * they can be curated without touching components.
 */
import amazonRulesJson from "../../data/amazon-compare.json";
import sponsored from "../../data/sponsored.json";
import type { Category } from "./categories";
import { AMAZON_TAG } from "./site";
import type { DealItem } from "./types";

interface AmazonRules {
  categories: string[];
  minDiscount: number;
  excludeNamePatterns: string[];
  include: string[];
  exclude: string[];
}
const amazonRules: AmazonRules = amazonRulesJson;

const excludePatterns = amazonRules.excludeNamePatterns.map((p) => new RegExp(p, "i"));

/**
 * Amazon search URL for items where a comparison is genuinely useful, or null.
 * Deliberately selective: brand-name items in relevant categories with a
 * meaningful discount, plus manual include/exclude by item number.
 */
export function amazonCompareUrl(item: DealItem): string | null {
  if (!AMAZON_TAG) return null;
  if (amazonRules.exclude.includes(item.item_number)) return null;
  const eligible =
    amazonRules.include.includes(item.item_number) ||
    (amazonRules.categories.includes(item.category) &&
      item.discount_amount >= amazonRules.minDiscount &&
      !excludePatterns.some((re) => re.test(item.item_name)));
  if (!eligible) return null;
  const query = item.item_name.replace(/,?\s*\d+-(pack|count)\b.*$/i, "");
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${encodeURIComponent(AMAZON_TAG)}`;
}

export interface SponsoredPlacement {
  /** null = shown on every category page. */
  category: Category | null;
  title: string;
  body: string;
  href: string;
  cta: string;
  /** ISO dates, inclusive. */
  start: string;
  end: string;
}

export function activeSponsored(category: Category | null, today: string): SponsoredPlacement | null {
  return (
    (sponsored as SponsoredPlacement[]).find(
      (s) => (s.category === null || s.category === category) && s.start <= today && today <= s.end,
    ) ?? null
  );
}
