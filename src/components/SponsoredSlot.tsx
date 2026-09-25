import type { SponsoredPlacement } from "@/lib/monetization";

/** Clearly labelled paid placement. Renders nothing without an active placement. */
export default function SponsoredSlot({ placement }: { placement: SponsoredPlacement | null }) {
  if (!placement) return null;
  return (
    <aside className="rounded-2xl border border-kc-gold bg-kc-gold/10 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-kc-ink/50">
        Sponsored
      </p>
      <h2 className="mt-1 font-display text-lg uppercase tracking-wide text-kc-blue">
        {placement.title}
      </h2>
      <p className="mt-1 text-sm text-kc-ink/70">{placement.body}</p>
      <a
        href={placement.href}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className="mt-2 inline-block text-sm font-semibold text-kc-red hover:underline"
      >
        {placement.cta} →
      </a>
    </aside>
  );
}
