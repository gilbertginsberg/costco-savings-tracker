"use client";

import { useMemo, useState } from "react";
import DealCard from "./DealCard";
import { CATEGORIES, CATEGORY_EMOJI, categorySlug, type Category } from "@/lib/categories";
import { formatMoney } from "@/lib/format";
import type { Availability, DealItem } from "@/lib/types";

type SortKey = "savings" | "ending" | "name";
type AvailabilityFilter = "all" | Availability;

const MIN_SAVINGS_OPTIONS = [0, 5, 10, 25, 50, 100];

interface Props {
  items: DealItem[];
  /** valid_end per promo_period_id, used by the "Ending soon" sort. */
  periodEnds: Record<string, string>;
  initialCategory?: Category | null;
  /**
   * When set, choosing a category also updates the address bar to
   * `${categoryBasePath}${slug}` (a real, shareable category page).
   */
  categoryBasePath?: string;
  /** item id → affiliate URL, precomputed on the server for curated items. */
  amazonLinks?: Record<string, string>;
}

export default function DealsBrowser({
  items,
  periodEnds,
  initialCategory = null,
  categoryBasePath,
  amazonLinks = {},
}: Props) {
  const [category, setCategory] = useState<Category | null>(initialCategory);
  const [query, setQuery] = useState("");
  const [availability, setAvailability] = useState<AvailabilityFilter>("all");
  const [minSavings, setMinSavings] = useState(0);
  const [sort, setSort] = useState<SortKey>("savings");

  const hasMultipleEnds = new Set(Object.values(periodEnds)).size > 1;

  const counts = useMemo(() => {
    const c = new Map<Category, number>();
    for (const i of items) c.set(i.category, (c.get(i.category) ?? 0) + 1);
    return c;
  }, [items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = items.filter(
      (i) =>
        (!category || i.category === category) &&
        (availability === "all" ||
          i.availability === availability ||
          // "Warehouse" / "Online" filters include items available in both.
          i.availability === "both") &&
        i.discount_amount >= minSavings &&
        (!q || i.item_name.toLowerCase().includes(q) || i.item_number.includes(q)),
    );
    const bySavings = (a: DealItem, b: DealItem) => b.discount_amount - a.discount_amount;
    return filtered.sort((a, b) => {
      if (sort === "name") return a.item_name.localeCompare(b.item_name);
      if (sort === "ending") {
        const d = (periodEnds[a.promo_period_id] ?? "").localeCompare(periodEnds[b.promo_period_id] ?? "");
        if (d !== 0) return d;
      }
      return bySavings(a, b);
    });
  }, [items, category, query, availability, minSavings, sort, periodEnds]);

  function chooseCategory(next: Category | null) {
    setCategory(next);
    if (categoryBasePath) {
      const href = next ? `${categoryBasePath}${categorySlug(next)}` : "/";
      window.history.replaceState(null, "", href);
    }
  }

  const filtersActive = query || availability !== "all" || minSavings > 0;

  return (
    <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-8">
      {/* Category navigation: horizontal tabs on mobile, sidebar on desktop */}
      <nav aria-label="Categories" className="-mx-4 mb-4 lg:mx-0 lg:mb-0">
        <ul className="flex gap-2 overflow-x-auto px-4 pb-2 lg:sticky lg:top-4 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0">
          <li>
            <CategoryButton active={category === null} onClick={() => chooseCategory(null)} count={items.length}>
              All deals
            </CategoryButton>
          </li>
          {CATEGORIES.map((c) => {
            const n = counts.get(c) ?? 0;
            return (
              <li key={c}>
                <CategoryButton
                  active={category === c}
                  disabled={n === 0}
                  onClick={() => chooseCategory(c)}
                  count={n}
                >
                  <span aria-hidden="true">{CATEGORY_EMOJI[c]}</span> {c}
                </CategoryButton>
              </li>
            );
          })}
        </ul>
      </nav>

      <div>
        {/* Filters */}
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-kc-ink/10 bg-white p-3 shadow-sm sm:grid-cols-4">
          <label className="col-span-2 sm:col-span-1">
            <span className="sr-only">Search deals</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or item #"
              className="w-full rounded-lg border border-kc-ink/15 px-3 py-2 text-sm focus:border-kc-blue focus:outline-none"
            />
          </label>
          <Select
            label="Availability"
            value={availability}
            onChange={(v) => setAvailability(v as AvailabilityFilter)}
            options={[
              ["all", "Anywhere"],
              ["warehouse", "In warehouse"],
              ["online", "Online"],
            ]}
          />
          <Select
            label="Minimum savings"
            value={String(minSavings)}
            onChange={(v) => setMinSavings(Number(v))}
            options={MIN_SAVINGS_OPTIONS.map((n) => [String(n), n === 0 ? "Any savings" : `${formatMoney(n)}+ off`])}
          />
          <Select
            label="Sort"
            value={sort}
            onChange={(v) => setSort(v as SortKey)}
            options={[
              ["savings", "Biggest savings"],
              ...(hasMultipleEnds ? [["ending", "Ending soon"] as [string, string]] : []),
              ["name", "Name A–Z"],
            ]}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2 text-sm text-kc-ink/60">
          <p aria-live="polite">
            <strong className="text-kc-ink">{visible.length}</strong> of {items.length} deals
            {category ? ` in ${category}` : ""}
          </p>
          {filtersActive && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setAvailability("all");
                setMinSavings(0);
              }}
              className="font-semibold text-kc-red hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {visible.length > 0 ? (
          <ul className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((item) => (
              <li key={item.id}>
                <DealCard item={item} amazonUrl={amazonLinks[item.id]} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3 rounded-2xl border border-dashed border-kc-ink/20 bg-white p-10 text-center text-kc-ink/60">
            <p className="text-2xl" aria-hidden="true">🛒</p>
            <p className="mt-2">No deals match those filters. Even Costco can&rsquo;t stock everything.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryButton({
  active,
  disabled,
  onClick,
  count,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`flex w-full items-center justify-between gap-3 whitespace-nowrap rounded-full px-3 py-1.5 text-left text-sm transition-colors lg:rounded-lg ${
        active
          ? "bg-kc-blue font-semibold text-white"
          : "bg-white text-kc-ink hover:bg-kc-blue/10 lg:bg-transparent"
      } disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent`}
    >
      <span>{children}</span>
      <span className={`text-xs ${active ? "text-white/70" : "text-kc-ink/40"}`}>{count}</span>
    </button>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-kc-ink/15 bg-white px-3 py-2 text-sm focus:border-kc-blue focus:outline-none"
      >
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}
