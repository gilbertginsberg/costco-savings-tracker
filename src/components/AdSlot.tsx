"use client";

import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT } from "@/lib/site";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Fixed-size container for a display ad, so swapping AdSense → Ezoic →
 * Mediavine is a change here, not a layout change. Renders nothing in
 * production until a network is configured; shows a dashed placeholder in dev.
 * Never place this inside the deals grid.
 */
export default function AdSlot({ slot, label }: { slot: string; label: string }) {
  const pushed = useRef(false);
  const live = Boolean(ADSENSE_CLIENT && slot);

  useEffect(() => {
    if (!live || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers throw here; the empty container is fine.
    }
  }, [live]);

  if (!live && process.env.NODE_ENV === "production") return null;

  return (
    <aside aria-label="Advertisement" className="mx-auto my-8 w-full max-w-3xl">
      <p className="mb-1 text-center text-[10px] uppercase tracking-widest text-kc-ink/40">
        Advertisement
      </p>
      {live ? (
        <ins
          className="adsbygoogle block min-h-[100px]"
          style={{ display: "block" }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div className="flex min-h-[100px] items-center justify-center rounded-lg border-2 border-dashed border-kc-ink/15 text-xs text-kc-ink/40">
          Ad slot: {label} (dev placeholder)
        </div>
      )}
    </aside>
  );
}
