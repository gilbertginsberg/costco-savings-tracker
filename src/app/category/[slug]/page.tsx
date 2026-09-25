import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdSlot from "@/components/AdSlot";
import DealsBrowser from "@/components/DealsBrowser";
import KirklandCalcPromo from "@/components/KirklandCalcPromo";
import NoData from "@/components/NoData";
import PeriodHero from "@/components/PeriodHero";
import { EndingSoonBanner } from "@/components/PeriodStatus";
import SampleDataNotice from "@/components/SampleDataNotice";
import SponsoredSlot from "@/components/SponsoredSlot";
import SubstackEmbed from "@/components/SubstackEmbed";
import { CATEGORIES, categoryFromSlug, categorySlug } from "@/lib/categories";
import { getCurrentPeriod } from "@/lib/data";
import { todayIso } from "@/lib/dates";
import { activeSponsored } from "@/lib/monetization";
import { ADSENSE_SLOTS } from "@/lib/site";
import { browserProps } from "@/lib/view";

export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: categorySlug(c) }));
}

export async function generateMetadata(props: PageProps<"/category/[slug]">): Promise<Metadata> {
  const category = categoryFromSlug((await props.params).slug);
  if (!category) return {};
  return {
    title: `Costco ${category} Deals This Month`,
    description: `Every ${category} deal in Costco's current Warehouse Savings, with item numbers, limits, and where to buy.`,
    alternates: { canonical: `/category/${categorySlug(category)}` },
  };
}

export default async function CategoryPage(props: PageProps<"/category/[slug]">) {
  const category = categoryFromSlug((await props.params).slug);
  if (!category) notFound();
  const current = getCurrentPeriod();
  if (!current) return <NoData />;

  return (
    <main className="flex-1">
      {current.period.is_sample && <SampleDataNotice />}
      <PeriodHero file={current} eyebrow="Costco Warehouse Savings" title={`Costco ${category} deals`} />
      <div className="px-4 sm:px-5">
        <EndingSoonBanner validEnd={current.period.valid_end} />
        <div className="mx-auto max-w-6xl py-8">
          <div className="mb-6 empty:hidden">
            <SponsoredSlot placement={activeSponsored(category, todayIso())} />
          </div>
          <DealsBrowser {...browserProps([current])} initialCategory={category} categoryBasePath="/category/" />
        </div>
        <AdSlot slot={ADSENSE_SLOTS.belowGrid} label="below deals grid" />
        <div className="mx-auto grid max-w-6xl gap-6 pb-14 md:grid-cols-2">
          <SubstackEmbed />
          <KirklandCalcPromo />
        </div>
      </div>
    </main>
  );
}
