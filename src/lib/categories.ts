/**
 * Costco's Warehouse Savings category sections, in page order. The parser uses
 * this as a lookup: a line matching one of these starts a new section.
 */
export const CATEGORIES = [
  "Apparel",
  "Appliances",
  "Automotive",
  "Beauty",
  "Electronics",
  "Furniture",
  "Grocery",
  "Health & Personal Care",
  "Home & Kitchen",
  "Home Improvement",
  "Household Items",
  "Optical",
  "Mattresses",
  "Patio/Lawn/Garden",
  "Pets",
  "Pharmacy",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_EMOJI: Record<Category, string> = {
  Apparel: "👕",
  Appliances: "🧺",
  Automotive: "🚗",
  Beauty: "💄",
  Electronics: "📺",
  Furniture: "🛋️",
  Grocery: "🛒",
  "Health & Personal Care": "🩹",
  "Home & Kitchen": "🍳",
  "Home Improvement": "🔨",
  "Household Items": "🧻",
  Optical: "👓",
  Mattresses: "🛏️",
  "Patio/Lawn/Garden": "🌱",
  Pets: "🐾",
  Pharmacy: "💊",
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/&amp;/g, " ")
    .replace(/\band\b/g, " ")
    .replace(/[^a-z]+/g, "");
}

const BY_NORMALIZED = new Map<string, Category>(
  CATEGORIES.map((c) => [normalize(c), c]),
);

/**
 * Returns the category if `line` is a category header. Tolerates case, "and"
 * vs "&", punctuation ("Patio, Lawn & Garden"), and a trailing "Savings"/"Deals".
 */
export function matchCategoryHeader(line: string): Category | null {
  const trimmed = line.trim().replace(/\s+(savings|deals|offers)$/i, "");
  if (trimmed.length > 40) return null;
  return BY_NORMALIZED.get(normalize(trimmed)) ?? null;
}

export function categorySlug(category: Category): string {
  return category
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function categoryFromSlug(slug: string): Category | null {
  return CATEGORIES.find((c) => categorySlug(c) === slug) ?? null;
}
