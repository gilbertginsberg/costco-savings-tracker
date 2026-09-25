import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import NoData from "@/components/NoData";
import SampleDataNotice from "@/components/SampleDataNotice";
import SubstackEmbed from "@/components/SubstackEmbed";
import { getAllPeriods, getCurrentPeriod } from "@/lib/data";
import { formatRange } from "@/lib/dates";
import { describeDiscount, formatMoney, totalSavings } from "@/lib/format";
import { ADSENSE_SLOTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Past Costco Warehouse Savings: Deal Archive",
  description:
    "Every past Costco Warehouse Savings promo period, archived and searchable, so you can see what went on sale before and when.",
  alternates: { canonical: "/archive" },
};

export default function ArchivePage() {
  const periods = getAllPeriods();
  if (periods.length === 0) return <NoData />;
  const currentId = getCurrentPeriod()?.period.id;

  return (
    <main className="flex-1">
      {periods[0].period.is_sample && <SampleDataNotice />}
      <section className="bg-kc-blue px-4 pb-10 pt-8 text-white sm:px-5 sm:pt-12">
        <div className="mx-auto max-w-6xl">
          <p className="font-display text-sm uppercase tracking-[0.2em] text-kc-gold">The archive</p>
          <h1 className="mt-2 font-display text-3xl uppercase leading-tight tracking-wide sm:text-5xl">
            Every Costco promo period, kept
          </h1>
          <p className="mt-4 max-w-2xl text-white/75">
            Costco&rsquo;s savings page forgets last month the moment a new one starts. We don&rsquo;t.
            Each period is filed by its exact &ldquo;Valid&rdquo; date range.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-5">
        <ul className="grid gap-4 md:grid-cols-2">
          {periods.map(({ period, items }) => {
            const top = [...items].sort((a, b) => b.discount_amount - a.discount_amount).slice(0, 3);
            const isCurrent = period.id === currentId;
            return (
              <li key={period.id}>
                <Link
                  href={isCurrent ? "/" : `/archive/${period.id}`}
                  className="block h-full rounded-2xl border border-kc-ink/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-display text-xl tracking-wide text-kc-blue">
                      {formatRange(period.valid_start, period.valid_end)}
                    </h2>
                    {isCurrent && (
                      <span className="rounded-full bg-kc-red px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-kc-ink/60">
                    {items.length} deals · {formatMoney(totalSavings(items))} total savings
                  </p>
                  <ul className="mt-3 space-y-1 text-sm">
                    {top.map((i) => (
                      <li key={i.id} className="flex justify-between gap-3">
                        <span className="truncate text-kc-ink/80">{i.item_name}</span>
                        <span className="shrink-0 font-semibold text-kc-red">{describeDiscount(i)}</span>
                      </li>
                    ))}
                  </ul>
                </Link>
              </li>
            );
          })}
        </ul>
        <AdSlot slot={ADSENSE_SLOTS.archive} label="archive" />
        <div className="mx-auto max-w-3xl pb-6">
          <SubstackEmbed />
        </div>
      </div>
    </main>
  );
}
