import "server-only";
import { amazonCompareUrl } from "./monetization";
import type { PeriodFile } from "./types";

/** Serializable props for <DealsBrowser> from one or more period files. */
export function browserProps(files: PeriodFile[]) {
  const items = files.flatMap((f) => f.items);
  const periodEnds = Object.fromEntries(files.map((f) => [f.period.id, f.period.valid_end]));
  const amazonLinks: Record<string, string> = {};
  for (const item of items) {
    const url = amazonCompareUrl(item);
    if (url) amazonLinks[item.id] = url;
  }
  return { items, periodEnds, amazonLinks };
}
