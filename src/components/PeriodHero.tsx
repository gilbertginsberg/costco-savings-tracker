import type { ReactNode } from "react";
import { formatRange } from "@/lib/dates";
import { formatMoney, totalSavings } from "@/lib/format";
import type { PeriodFile } from "@/lib/types";
import { DaysLeftPill } from "./PeriodStatus";

export default function PeriodHero({
  file,
  eyebrow,
  title,
  children,
  showCountdown = true,
}: {
  file: PeriodFile;
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  showCountdown?: boolean;
}) {
  const { period, items } = file;
  return (
    <section className="bg-kc-blue px-4 pb-10 pt-8 text-white sm:px-5 sm:pb-14 sm:pt-12">
      <div className="mx-auto max-w-6xl">
        <p className="font-display text-sm uppercase tracking-[0.2em] text-kc-gold">{eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl uppercase leading-tight tracking-wide sm:text-5xl">
          {title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="font-display text-lg tracking-wide sm:text-xl">
            Valid {formatRange(period.valid_start, period.valid_end)}
          </span>
          {showCountdown && <DaysLeftPill validStart={period.valid_start} validEnd={period.valid_end} />}
        </div>
        <p className="mt-2 text-sm text-white/70">
          {items.length} deals · {formatMoney(totalSavings(items))} in total savings if you bought one of
          everything (please don&rsquo;t).
        </p>
        {children}
      </div>
    </section>
  );
}
