/**
 * File-backed archive: one JSON file per promo period in `data/periods/`.
 * Used by both the fetch script (read/write) and the Next.js build (read).
 * Git history on these files doubles as an audit log of every change.
 */
import fs from "node:fs";
import path from "node:path";
import type { PeriodFile } from "./types";

export const DATA_DIR = path.join(process.cwd(), "data");
export const PERIODS_DIR = path.join(DATA_DIR, "periods");
export const SAMPLE_DIR = path.join(DATA_DIR, "sample");

export function readPeriodFiles(dir: string = PERIODS_DIR): PeriodFile[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => normalize(JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as PeriodFile))
    .sort((a, b) => b.period.valid_start.localeCompare(a.period.valid_start));
}

export function readPeriodFile(id: string, dir: string = PERIODS_DIR): PeriodFile | null {
  const file = path.join(dir, `${id}.json`);
  return fs.existsSync(file) ? normalize(JSON.parse(fs.readFileSync(file, "utf8")) as PeriodFile) : null;
}

/** Fills fields added after a file was written (older files lack product_url). */
function normalize(file: PeriodFile): PeriodFile {
  return {
    ...file,
    items: file.items.map((i) => ({ ...i, product_url: i.product_url ?? null })),
  };
}

export function writePeriodFile(file: PeriodFile, dir: string = PERIODS_DIR): string {
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, `${file.period.id}.json`);
  const sorted: PeriodFile = {
    period: file.period,
    items: [...file.items].sort(
      (a, b) => a.category.localeCompare(b.category) || a.item_number.localeCompare(b.item_number),
    ),
  };
  fs.writeFileSync(out, `${JSON.stringify(sorted, null, 2)}\n`);
  return out;
}
