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

  // Fear/Greed index (#34): higher graduation rate + volume growth = greed,
  // higher rug rate = fear.
  const gradSeries = metrics.graduationRate ?? [];
  const rugSeries = metrics.rugRate ?? [];
  const volSeries = metrics.volume ?? [];
  const grad = gradSeries[gradSeries.length - 1]?.value ?? 20;
  const rug = rugSeries[rugSeries.length - 1]?.value ?? 10;
  const volTrend =
    volSeries.length > 1 ? (volSeries[volSeries.length - 1].value / volSeries[0].value - 1) * 100 : 0;
  const fearGreed = Math.max(0, Math.min(100, Math.round(50 + grad - rug * 1.5 + Math.max(-20, Math.min(20, volTrend / 5)))));
  const fgLabel = fearGreed >= 75 ? "Extreme Greed" : fearGreed >= 55 ? "Greed" : fearGreed >= 45 ? "Neutral" : fearGreed >= 25 ? "Fear" : "Extreme Fear";
  const fgColor = fearGreed >= 55 ? "text-gain" : fearGreed >= 45 ? "text-warn" : "text-loss";

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

      <div className="panel mb-3 flex items-center gap-4 p-4">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="currentColor"
              className={fgColor}
              strokeWidth="3"
              strokeDasharray={`${(fearGreed / 100) * 97.4} 97.4`}
              strokeLinecap="round"
            />
          </svg>
          <span className={cn("absolute tnum text-lg font-bold", fgColor)}>{fearGreed}</span>
        </div>
        <div>
          <div className="text-xs text-white/40">Molten Fear / Greed Index</div>
          <div className={cn("text-lg font-bold", fgColor)}>{fgLabel}</div>
          <div className="text-[11px] text-white/40">Computed from graduation rate, rug rate & volume flow</div>
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
