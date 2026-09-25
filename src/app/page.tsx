import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import DealsBrowser from "@/components/DealsBrowser";
import KirklandCalcPromo from "@/components/KirklandCalcPromo";
import NoData from "@/components/NoData";
import PeriodHero from "@/components/PeriodHero";
import { EndingSoonBanner } from "@/components/PeriodStatus";
import SampleDataNotice from "@/components/SampleDataNotice";
import SubstackEmbed from "@/components/SubstackEmbed";
import { getAllPeriods, getCurrentPeriod } from "@/lib/data";
import { ADSENSE_SLOTS, COSTCO_SAVINGS_URL } from "@/lib/site";
import { browserProps } from "@/lib/view";

export default function Home() {
  const current = getCurrentPeriod();
  if (!current) return <NoData />;
  const archiveCount = getAllPeriods().length - 1;

  return (
    <main className="flex-1">
      {current.period.is_sample && <SampleDataNotice />}
      <PeriodHero file={current} eyebrow="Costco Warehouse Savings" title="This month's Costco deals, searchable">
        <p className="mt-4 max-w-2xl text-white/75">
          Every deal from Costco&rsquo;s official{" "}
          <a href={COSTCO_SAVINGS_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
            Warehouse Savings
          </a>{" "}
          list, minus the endless scrolling. Filter by category, discount, and where you can buy it.
        </p>
      </PeriodHero>

      <div className="px-4 sm:px-5">
        <EndingSoonBanner validEnd={current.period.valid_end} />
        <div className="mx-auto max-w-6xl py-8">
          <DealsBrowser {...browserProps([current])} categoryBasePath="/category/" />
        </div>
      </div>

      <div className="px-4 sm:px-5">
        <AdSlot slot={ADSENSE_SLOTS.belowGrid} label="below deals grid" />
        <div className="mx-auto grid max-w-6xl gap-6 pb-14 md:grid-cols-2">
          <SubstackEmbed />
          <div className="flex flex-col gap-6">
            <KirklandCalcPromo />
            {archiveCount > 0 && (
              <section className="rounded-2xl border border-kc-ink/10 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="font-display text-xl uppercase tracking-wide text-kc-blue">
                  Missed last month?
                </h2>
                <p className="mt-2 text-sm text-kc-ink/70">
                  Costco&rsquo;s page only ever shows the current deals. We keep every past promo
                  period, so you can see what went on sale before and spot the repeats.
                </p>
                <Link
                  href="/archive"
                  className="mt-3 inline-block text-sm font-semibold text-kc-red hover:underline"
                >
                  Browse the archive ({archiveCount} past period{archiveCount === 1 ? "" : "s"}) →
                </Link>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
