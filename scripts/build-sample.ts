/**
 * Regenerates data/sample/ from the test fixtures by running them through the
 * real parser + archive merge. The site shows this preview data (with a loud
 * "sample data" banner) only until the first real fetch lands in data/periods/.
 * The fixtures are illustrative, NOT real Costco offers.
 */
import fs from "node:fs";
import path from "node:path";
import { mergeFetch } from "../src/lib/archive";
import { parseWarehouseSavings } from "../src/lib/parser";
import { SAMPLE_DIR, writePeriodFile } from "../src/lib/store";

const fixtures: [string, string][] = [
  ["warehouse-savings-2026-08.html", "2026-08-25T14:00:00Z"],
  ["warehouse-savings-2026-09.html", "2026-09-22T14:00:00Z"],
];

fs.rmSync(SAMPLE_DIR, { recursive: true, force: true });
for (const [name, fetchedAt] of fixtures) {
  const html = fs.readFileSync(path.join("tests", "fixtures", name), "utf8");
  const { file } = mergeFetch(null, parseWarehouseSavings(html), {
    now: new Date(fetchedAt),
    sourceUrl: "https://www.costco.com/o/-/warehouse-savings",
  });
  file.period.is_sample = true;
  console.log(`wrote ${writePeriodFile(file, SAMPLE_DIR)}`);
}
