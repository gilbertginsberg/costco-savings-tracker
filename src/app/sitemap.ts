import type { MetadataRoute } from "next";
import { CATEGORIES, categorySlug } from "@/lib/categories";
import { getAllPeriods } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const periods = getAllPeriods();
  const lastModified = periods[0]?.period.last_fetched_at ?? new Date().toISOString();
  return [
    { url: SITE_URL, lastModified, changeFrequency: "daily", priority: 1 },
    ...CATEGORIES.map((c) => ({
      url: `${SITE_URL}/category/${categorySlug(c)}`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    { url: `${SITE_URL}/archive`, lastModified, changeFrequency: "weekly", priority: 0.6 },
    ...periods.map((p) => ({
      url: `${SITE_URL}/archive/${p.period.id}`,
      lastModified: p.period.last_fetched_at,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
