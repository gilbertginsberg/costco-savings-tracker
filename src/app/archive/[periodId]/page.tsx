import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdSlot from "@/components/AdSlot";
import DealsBrowser from "@/components/DealsBrowser";
import PeriodHero from "@/components/PeriodHero";
import PeriodPicker from "@/components/PeriodPicker";
import SampleDataNotice from "@/components/SampleDataNotice";
import SubstackEmbed from "@/components/SubstackEmbed";
import { getAllPeriods, getPeriod } from "@/lib/data";
import { formatRange } from "@/lib/dates";
import { ADSENSE_SLOTS } from "@/lib/site";
import { browserProps } from "@/lib/view";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPeriods().map((p) => ({ periodId: p.period.id }));
}

export async function generateMetadata(props: PageProps<"/archive/[periodId]">): Promise<Metadata> {
  const file = getPeriod((await props.params).periodId);
  if (!file) return {};
  const range = formatRange(file.period.valid_start, file.period.valid_end);
  return {
    title: `Costco Warehouse Savings, ${range}`,
    description: `All ${file.items.length} Costco Warehouse Savings deals valid ${range}, searchable by category and discount.`,
    alternates: { canonical: `/archive/${file.period.id}` },
  };
}

export default async function ArchivePeriodPage(props: PageProps<"/archive/[periodId]">) {
  const file = getPeriod((await props.params).periodId);
  if (!file) notFound();
  const periods = getAllPeriods().map((p) => ({
    id: p.period.id,
    label: formatRange(p.period.valid_start, p.period.valid_end),
  }));

  return (
    <main className="flex-1">
      {file.period.is_sample && <SampleDataNotice />}
      <PeriodHero file={file} eyebrow="Archive" title="Past Costco Warehouse Savings">
        <PeriodPicker periods={periods} currentId={file.period.id} />
        <p className="mt-3 text-sm">
          <Link href="/" className="font-semibold text-kc-gold hover:underline">
            ← Back to this month&rsquo;s deals
          </Link>
        </p>
      </PeriodHero>
      <div className="px-4 sm:px-5">
        <div className="mx-auto max-w-6xl py-8">
          <DealsBrowser {...browserProps([file])} />
        </div>
        <AdSlot slot={ADSENSE_SLOTS.archive} label="archive" />
        <div className="mx-auto max-w-3xl pb-14">
          <SubstackEmbed />
        </div>
      </div>
    </main>
  );
}
