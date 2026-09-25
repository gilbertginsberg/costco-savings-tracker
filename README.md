# Costco Savings Tracker

Costco's monthly Warehouse Savings, searchable and filterable, with an archive of every past promo period.

**Live demo:** _TODO: add production URL once deployed_

## Overview

Costco's [Warehouse Savings page](https://www.costco.com/o/-/warehouse-savings) only shows the current promotion. You can't search it, filter it, or look back at last month. This tool fixes that:

- **Current deals**: every item in the active period, filterable by category, minimum discount, and availability (warehouse / online), sortable by biggest savings.
- **Category pages**: `/category/electronics`, `/category/grocery`, and so on.
- **Archive**: each promo period is kept, filed by its exact date range, so nothing is lost when Costco swaps in a new list.
- **Ending-soon callout**: a countdown appears in the last 5 days of a period.

It's a companion to [Kirkland Calc](https://kirklandcalc.com) and part of [Kirkland Corner](https://kirklandcorner.substack.com). Data comes only from Costco's own page, never from third-party deal sites.

## Tech stack

- **Next.js 16** (App Router, TypeScript), fully static pages
- **Tailwind CSS v4** with the Kirkland Corner palette (shared with Kirkland Calc)
- **cheerio** for HTML parsing
- **JSON files in git** (`data/periods/`) as the database. No server or DB to run, and git history is an audit log
- **GitHub Actions** for the scheduled fetch and CI, **Vercel** for hosting (each data commit redeploys)

## Local setup

```bash
npm install
npm run dev            # http://localhost:3000
npm test               # parser, archive merge, and cadence tests
npm run lint && npm run typecheck
npm run build
```

Until the first real fetch lands, the site shows **sample data** generated from `tests/fixtures/`, with a red "Preview with sample data" banner on every page.

## Project structure

```
src/
  app/                    # Routes: /, /category/[slug], /archive, /archive/[periodId], legal pages, SEO
  components/             # DealsBrowser (filters + grid), DealCard, PeriodStatus (countdown), AdSlot, …
  lib/
    parser.ts             # HTML → { valid_start, valid_end, items }. Pure, unit-tested
    archive.ts            # Files a fetch into a new or existing period
    cadence.ts            # Decides whether today's scheduled run should fetch
    categories.ts         # The hardcoded category list + header matching
    store.ts / data.ts    # Reads and writes data/periods/*.json
    monetization.ts       # Amazon compare rules, sponsored placements
scripts/
  fetch-deals.ts          # The scheduled job
  build-sample.ts         # Regenerates data/sample/ from test fixtures
data/
  periods/                # Real archive: one <valid_start>_<valid_end>.json per period
  sample/                 # Preview data (not real offers)
  amazon-compare.json     # Which items get a "Compare on Amazon" link
  sponsored.json          # Sponsored placements (empty by default)
tests/                    # node:test suites + HTML fixtures
```

## Parser logic and the period key

**A period is its date range, not a month.** Costco's page carries exactly one temporal marker, a banner like `Valid 9/21/26 - 10/18/26`. The URL, title, and meta tags have no month. Periods also straddle two months (Sep 21 – Oct 18), so "the October deals" is ambiguous. The fetch date is also wrong: we might fetch the same period ten times. So the `(valid_start, valid_end)` pair is the ID: `2026-09-21_2026-10-18`.

For each fetch, `src/lib/parser.ts`:

1. **Flattens the DOM to text lines** in document order, with block elements becoming line breaks. It deliberately avoids Costco's CSS class names, which change without notice.
2. **Extracts the period key** from the `Valid … - …` banner. If there is no banner, it throws, and nothing is written. This is usually a layout change or a bot-check page.
3. **Walks lines top to bottom**, and any line matching a known category header (`categories.ts`) starts a new section.
4. **Tokenizes each line** into fields (`Warehouse & Online` / `Online Only`, `Item 1234567`, `Limit 2`, `Save$50` or `$19.99 After $5 OFF`). Leftover text is the product name. Tokens are grouped into items anchored on the unique `Item N` marker, which works whether fields sit on separate lines or run together.

Then `archive.ts` **files the result**:

- If the range matches a stored period, the fetch is a **refresh**: changed fields are updated (e.g. Costco fixed a typo), and items that disappear are kept.
- If the range is new, a **new period** is created. This is how the archive grows.

Safety rails: fewer than `MIN_ITEMS` parsed items means nothing is written, and if the page still shows an ended period 2+ days later, the job fails loudly because the URL may have moved.

### Cadence

The workflow runs daily. `cadence.ts` fetches every 3 days mid-period and daily in the final week (and after the end date) to catch the changeover. It never fetches more than once a day.

## Deployment

**Vercel** (config in `vercel.json`: Next.js preset, `npm ci`, Node 22 from `package.json` engines, basic security headers):

1. In Vercel, **Add New → Project → Import** `gilbertginsberg/costco-savings-tracker`. The preset and commands are picked up from `vercel.json`, so leave the defaults.
2. Set **Production Branch** to `main` (Settings → Git).
3. Add the env vars below (Settings → Environment Variables). If you leave `NEXT_PUBLIC_SITE_URL` unset, canonical URLs use the Vercel production domain. Set it once a custom domain is attached.
4. Every push redeploys, including the fetch job's data commits to `main`. That's how new deals go live. Preview deployments are `noindex` by default on Vercel.

**Scheduled fetch** (`.github/workflows/fetch-deals.yml`):

1. Scheduled runs are **off** until you set the repo variable `FETCH_ENABLED=true` (Settings → Secrets and variables → Actions → Variables). Read Costco.com's Terms of Use first (see Open questions). Manual runs from the Actions tab always work.
2. The job commits to the default branch with the built-in `GITHUB_TOKEN`. Under Settings → Actions → General → Workflow permissions, allow **Read and write**.
3. **First data**: run the workflow manually, or locally run `npm run fetch-deals -- --force` and commit `data/periods/`.
4. If Costco blocks plain HTTP fetches, use `--browser` (Playwright), or save the page from a browser and run `npm run fetch-deals -- --file page.html`.

## Environment variables

All optional. See `.env.example`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata and sitemap. Defaults to the Vercel production domain |
| `NEXT_PUBLIC_AMAZON_TAG` | Amazon Associates tag (same as Kirkland Calc). Unset means no affiliate links |
| `NEXT_PUBLIC_ADSENSE_CLIENT`, `NEXT_PUBLIC_ADSENSE_SLOT_*` | AdSense. Unset means ad slots render nothing |
| `NEXT_PUBLIC_MATOMO_SITE_ID` | Matomo analytics, used to track sessions toward Mediavine/Raptive eligibility |
| `COSTCO_SAVINGS_URL` | Override the source URL if Costco moves the page |
| `FETCH_INTERVAL_DAYS`, `MIN_ITEMS` | Fetch job tuning (defaults 3 and 10) |

**Monetization hooks:** ads render only in `<AdSlot>` below the grid and in the archive, never inside the grid. To swap networks, change `AdSlot.tsx`. "Compare on Amazon" links appear only for items matching `data/amazon-compare.json` (brand-name items in relevant categories, $10+ off, never Kirkland Signature). To add a sponsored placement on category pages, add an entry to `data/sponsored.json`.

## Open questions

- [ ] **Parser vs. the live DOM.** The parser was built against fixtures that mirror the page's text structure. The live page wasn't reachable from the build environment. Run `npm run fetch-deals -- --force --dry-run` against the real page and adjust if needed.
- [ ] **Is `/o/-/warehouse-savings` stable across periods?** The job logs redirects and fails on a 404 or a stale period. Override with `COSTCO_SAVINGS_URL` if it moves.
- [ ] **Costco.com Terms of Use** on automated access: review before setting `FETCH_ENABLED=true`.

## License

[MIT](./LICENSE)

## Credits

Built by [Kirkland Corner](https://kirklandcorner.substack.com), the newsletter for people who plan their weekends around the Costco sample schedule. Not affiliated with Costco Wholesale Corporation.
