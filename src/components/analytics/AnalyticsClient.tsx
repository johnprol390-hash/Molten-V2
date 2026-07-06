"use client";

import { useState } from "react";
import { AreaChart } from "@/components/ui/AreaChart";
import { compactNumber, formatPct } from "@/lib/format";
import { cn } from "@/lib/cn";

type Series = Record<string, { day: number; value: number }[]>;

const METRICS: { key: string; label: string; prefix?: string; suffix?: string; color: string }[] = [
  { key: "volume", label: "Volume", prefix: "$", color: "#97FCE4" },
  { key: "mcap", label: "Market Cap", prefix: "$", color: "#5FE9CC" },
  { key: "liquidity", label: "Liquidity", prefix: "$", color: "#3BE38A" },
  { key: "holders", label: "Holder Growth", color: "#97FCE4" },
  { key: "revenue", label: "Revenue", prefix: "$", color: "#B98CFF" },
  { key: "treasury", label: "Treasury Growth", prefix: "$", color: "#97FCE4" },
  { key: "launches", label: "Launch Activity", color: "#FFB84D" },
  { key: "graduationRate", label: "Graduation Rate", suffix: "%", color: "#3BE38A" },
  { key: "rugRate", label: "Rug Rate", suffix: "%", color: "#FF5C6C" },
];

const TF = { "7D": 7, "30D": 30, "90D": 90, All: 91 } as const;

export function AnalyticsClient({ metrics }: { metrics: Series }) {
  const [tf, setTf] = useState<keyof typeof TF>("30D");
  const days = TF[tf];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-5">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Analytics</h1>
        <div className="flex gap-0.5 rounded-md border border-white/8 p-0.5">
          {(Object.keys(TF) as (keyof typeof TF)[]).map((t) => (
            <button key={t} onClick={() => setTf(t)} className={cn("rounded px-2 py-0.5 text-[11px]", tf === t ? "bg-mint/15 text-mint" : "text-white/40")}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {METRICS.map((m) => {
          const series = (metrics[m.key] ?? []).slice(-days);
          const values = series.map((s) => s.value);
          const last = values[values.length - 1] ?? 0;
          const first = values[0] ?? 0;
          const change = first ? ((last - first) / first) * 100 : 0;
          const display = m.suffix
            ? `${last.toFixed(1)}${m.suffix}`
            : `${m.prefix ?? ""}${compactNumber(last)}`;
          return (
            <div key={m.key} className="panel-flat p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-white/40">{m.label}</div>
                  <div className="tnum text-xl font-bold">{display}</div>
                </div>
                <span className={cn("tnum text-xs", change >= 0 ? "text-gain" : "text-loss")}>{formatPct(change)}</span>
              </div>
              <div className="mt-3">
                <AreaChart data={values} color={m.color} height={90} />
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-[11px] text-white/30">
        Data served from the analytics warehouse (Prisma). Export to CSV available per chart in production.
      </p>
    </div>
  );
}
