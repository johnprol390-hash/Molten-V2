"use client";

import { useLiveValue } from "@/store/useRealtime";
import { compactNumber } from "@/lib/format";

const STATS = [
  { id: "tokens", label: "Tokens Launched", base: 48213, prefix: "", live: false },
  { id: "volume", label: "Total Volume", base: 1_284_000_000, prefix: "$", live: true },
  { id: "mcap", label: "Total Market Cap", base: 642_000_000, prefix: "$", live: true },
  { id: "traders", label: "Active Traders", base: 89204, prefix: "", live: true },
  { id: "treasury", label: "Treasury Value", base: 12_400_000, prefix: "$", live: false },
  { id: "hype", label: "HYPE Collected", base: 3_920_000, prefix: "", live: true },
  { id: "grad", label: "Tokens Graduated", base: 6127, prefix: "", live: false },
];

export function LiveStats() {
  return (
    <section className="border-y border-white/6 bg-base-950/40">
      <div className="mx-auto grid max-w-[1600px] grid-cols-2 gap-px bg-white/6 sm:grid-cols-4 lg:grid-cols-7">
        {STATS.map((s) => (
          <StatCell key={s.id} {...s} />
        ))}
      </div>
    </section>
  );
}

function StatCell({ label, base, prefix, live }: { label: string; base: number; prefix: string; live: boolean }) {
  const value = useLiveValue(base, "stat:" + label, live ? 0.004 : 0);
  return (
    <div className="bg-base-900 px-4 py-5">
      <div className="tnum text-lg font-bold text-white sm:text-xl">
        {prefix}
        {compactNumber(value)}
      </div>
      <div className="mt-0.5 text-[11px] text-white/40">{label}</div>
    </div>
  );
}
