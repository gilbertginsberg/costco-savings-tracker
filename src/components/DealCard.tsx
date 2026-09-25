import { CATEGORY_EMOJI } from "@/lib/categories";
import { AVAILABILITY_LABEL, formatMoney } from "@/lib/format";
import type { DealItem } from "@/lib/types";

const AVAILABILITY_STYLE = {
  both: "bg-kc-blue/10 text-kc-blue",
  online: "bg-kc-gold/20 text-[#8a5a00]",
  warehouse: "bg-kc-ink/10 text-kc-ink/80",
} as const;

export default function DealCard({ item, amazonUrl }: { item: DealItem; amazonUrl?: string }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-kc-ink/10 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide">
        <span className="rounded-full bg-kc-bg px-2 py-0.5 text-kc-ink/70">
          <span aria-hidden="true">{CATEGORY_EMOJI[item.category]} </span>
          {item.category}
        </span>
        <span className={`rounded-full px-2 py-0.5 ${AVAILABILITY_STYLE[item.availability]}`}>
          {AVAILABILITY_LABEL[item.availability]}
        </span>
      </div>

      <div className="mt-3">
        {item.discount_type === "after_discount" && item.price !== null ? (
          <>
            <p className="font-display text-3xl leading-none text-kc-red">
              {formatMoney(item.price)}
            </p>
            <p className="mt-1 text-sm font-semibold text-kc-red-dark">
              after {formatMoney(item.discount_amount)} off
            </p>
          </>
        ) : (
          <p className="font-display text-3xl uppercase leading-none text-kc-red">
            Save {formatMoney(item.discount_amount)}
          </p>
        )}
      </div>

      <h3 className="mt-3 flex-1 text-[15px] font-semibold leading-snug text-kc-ink">
        {item.item_name}
      </h3>

      <dl className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-kc-ink/60">
        <div>
          <dt className="inline">Item </dt>
          <dd className="inline font-mono text-kc-ink/80">{item.item_number}</dd>
        </div>
        {item.purchase_limit !== null && (
          <div>
            <dt className="inline">Limit </dt>
            <dd className="inline font-semibold text-kc-ink/80">{item.purchase_limit}</dd>
          </div>
        )}
      </dl>

      {amazonUrl && (
        <a
          href={amazonUrl}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="mt-3 border-t border-kc-ink/10 pt-3 text-xs font-semibold text-kc-blue hover:text-kc-red hover:underline"
        >
          Compare on Amazon →
        </a>
      )}
    </article>
  );
}
