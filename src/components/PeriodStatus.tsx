"use client";

import { useSyncExternalStore } from "react";
import { daysBetween, formatDate, todayIso } from "@/lib/dates";

/** Show the "ending soon" callout when this many days (or fewer) remain. */
export const ENDING_SOON_DAYS = 5;

const subscribe = () => () => {};
const getToday = () => todayIso();
const getServerToday = () => null;

/** Today's date, computed in the browser (the page itself is static). */
function useToday(): string | null {
  return useSyncExternalStore(subscribe, getToday, getServerToday);
}

/** Small pill: "12 days left" / "Ends today" / "Ended Oct 18". */
export function DaysLeftPill({ validStart, validEnd }: { validStart: string; validEnd: string }) {
  const today = useToday();
  if (!today) return null;
  let text: string;
  if (today < validStart) text = `Starts ${formatDate(validStart)}`;
  else {
    const left = daysBetween(today, validEnd);
    text = left < 0 ? `Ended ${formatDate(validEnd)}` : left === 0 ? "Ends today" : `${left} day${left === 1 ? "" : "s"} left`;
  }
  return (
    <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
      {text}
    </span>
  );
}

/** Prominent countdown banner in the final days of a period (or once it has ended). */
export function EndingSoonBanner({ validEnd }: { validEnd: string }) {
  const today = useToday();
  if (!today) return null;
  const left = daysBetween(today, validEnd);
  if (left > ENDING_SOON_DAYS) return null;

  const ended = left < 0;
  return (
    <div
      role="status"
      className={`mx-auto mt-6 flex max-w-6xl items-start gap-3 rounded-2xl border-2 px-4 py-3 sm:items-center ${
        ended ? "border-kc-ink/20 bg-white" : "border-kc-gold bg-kc-gold/15"
      }`}
    >
      <span className="text-2xl" aria-hidden="true">
        {ended ? "🗓️" : "⏰"}
      </span>
      <p className="text-sm text-kc-ink">
        {ended ? (
          <>
            <strong>This promo period ended {formatDate(validEnd)}.</strong> Costco usually posts the
            next round within a day or two, and we&rsquo;ll pick it up automatically.
          </>
        ) : (
          <>
            <strong className="font-display text-base uppercase tracking-wide text-kc-red-dark">
              {left === 0 ? "Last day!" : `Ending soon: ${left} day${left === 1 ? "" : "s"} left.`}
            </strong>{" "}
            These deals end {formatDate(validEnd)}. Grab what you need before the list turns over.
          </>
        )}
      </p>
    </div>
  );
}
