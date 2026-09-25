"use client";

import { useRouter } from "next/navigation";

export default function PeriodPicker({
  periods,
  currentId,
}: {
  periods: { id: string; label: string }[];
  currentId: string;
}) {
  const router = useRouter();
  return (
    <label className="mt-5 inline-flex flex-wrap items-center gap-2 text-sm">
      <span className="text-white/80">Jump to period:</span>
      <select
        value={currentId}
        onChange={(e) => router.push(`/archive/${e.target.value}`)}
        className="rounded-lg border border-white/30 bg-white px-3 py-1.5 text-kc-ink"
      >
        {periods.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>
    </label>
  );
}
