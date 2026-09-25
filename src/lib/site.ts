/** Site-wide constants and env-driven config (all optional, all public). */

export const SITE_NAME = "Costco Savings Tracker";
/**
 * Canonical URL. Prefers NEXT_PUBLIC_SITE_URL, then Vercel's production domain
 * (set automatically on Vercel builds), then localhost.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");
export const NEWSLETTER_URL = "https://kirklandcorner.substack.com";
export const KIRKLAND_CALC_URL = "https://kirklandcalc.com";
export const COSTCO_SAVINGS_URL = "https://www.costco.com/o/-/warehouse-savings";
export const INSTAGRAM_URL = "https://www.instagram.com/kirklandcorner";
export const CONTACT_EMAIL = "kirklandcorner00@gmail.com";

/** Same Amazon Associates tag as Kirkland Calc. Unset → no affiliate links. */
export const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG ?? "";
/** AdSense publisher id, e.g. "ca-pub-9197346169922497". Unset → no ads. */
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";
export const ADSENSE_SLOTS = {
  belowGrid: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BELOW_GRID ?? "",
  archive: process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARCHIVE ?? "",
};
/** Matomo site id (same Matomo account as Kirkland Calc). Unset → no analytics. */
export const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID ?? "";
