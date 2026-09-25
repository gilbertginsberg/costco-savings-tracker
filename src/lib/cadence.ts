/**
 * Decides whether the scheduled job should hit Costco.com today.
 *
 * The workflow runs once a day; this function thins that out to every few
 * days, stepping up to daily in the final week of the known period so the
 * changeover is caught quickly. It never allows more than one fetch per day.
 */
import { daysBetween, todayIso } from "./dates";
import type { PromoPeriod } from "./types";

export const DEFAULT_INTERVAL_DAYS = 3;
export const FINAL_WEEK_DAYS = 7;

export interface CadenceDecision {
  fetch: boolean;
  reason: string;
}

export function shouldFetch(
  latest: Pick<PromoPeriod, "valid_end" | "last_fetched_at"> | null,
  now: Date,
  intervalDays = DEFAULT_INTERVAL_DAYS,
): CadenceDecision {
  if (!latest) return { fetch: true, reason: "No stored periods yet." };

  const today = todayIso(now);
  const lastDay = todayIso(new Date(latest.last_fetched_at));
  const sinceLast = daysBetween(lastDay, today);
  if (sinceLast < 1) {
    return { fetch: false, reason: "Already fetched today (max once per day)." };
  }

  const untilEnd = daysBetween(today, latest.valid_end);
  if (untilEnd < FINAL_WEEK_DAYS) {
    return {
      fetch: true,
      reason:
        untilEnd < 0
          ? `Period ended ${-untilEnd} day(s) ago; checking daily for the new one.`
          : `Final week of the period (${untilEnd} day(s) left); checking daily.`,
    };
  }
  if (sinceLast >= intervalDays) {
    return { fetch: true, reason: `${sinceLast} day(s) since last fetch.` };
  }
  return {
    fetch: false,
    reason: `Last fetched ${sinceLast} day(s) ago; next fetch after ${intervalDays}.`,
  };
}
