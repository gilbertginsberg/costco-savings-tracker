import { KIRKLAND_CALC_URL } from "@/lib/site";

/** Cross-link: deals → "is Executive worth it for me?" */
export default function KirklandCalcPromo() {
  return (
    <section className="rounded-2xl border border-kc-ink/10 bg-white p-5 shadow-sm sm:p-6">
      <p className="font-display text-sm uppercase tracking-[0.2em] text-kc-gold">
        From the makers of this tracker
      </p>
      <h2 className="mt-1 font-display text-xl uppercase tracking-wide text-kc-blue">
        Stacking savings? Check if Executive pays for itself
      </h2>
      <p className="mt-2 text-sm text-kc-ink/70">
        Executive members earn 2% back on qualified purchases, including these deals.
        Kirkland Calc does the breakeven math on your actual spend in about 20 seconds.
      </p>
      <a
        href={KIRKLAND_CALC_URL}
        className="mt-4 inline-block rounded-full bg-kc-red px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-kc-red-dark"
      >
        Try Kirkland Calc →
      </a>
    </section>
  );
}
