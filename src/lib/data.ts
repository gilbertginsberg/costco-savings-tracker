/**
 * Read-side data access for pages (server only; runs at build/revalidate).
 * Falls back to clearly-labelled sample data until the first real fetch lands.
 */
import "server-only";
import { readPeriodFiles, SAMPLE_DIR } from "./store";
import { todayIso } from "./dates";
import type { PeriodFile } from "./types";

export function getAllPeriods(): PeriodFile[] {
  const real = readPeriodFiles();
  if (real.length > 0) return real;
  return readPeriodFiles(SAMPLE_DIR).map((f) => ({
    ...f,
    period: { ...f.period, is_sample: true },
  }));
}

/**
 * The period whose range contains today; otherwise the most recent one
 * (e.g. the day after a period ends, before the next fetch lands).
 */
export function getCurrentPeriod(now: Date = new Date()): PeriodFile | null {
  const periods = getAllPeriods();
  const today = todayIso(now);
  return (
    periods.find((p) => p.period.valid_start <= today && today <= p.period.valid_end) ??
    periods[0] ??
    null
  );
}

export function getPeriod(id: string): PeriodFile | null {
  return getAllPeriods().find((p) => p.period.id === id) ?? null;
}
