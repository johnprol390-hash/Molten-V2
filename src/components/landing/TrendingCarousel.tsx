"use client";

import Link from "next/link";
import { getTokens } from "@/lib/mock";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { formatUsd, formatPct, pnlColor } from "@/lib/format";
import { cn } from "@/lib/cn";

export function TrendingCarousel() {
  const tokens = [...getTokens()].sort((a, b) => b.volume24h - a.volume24h).slice(0, 12);
  const doubled = [...tokens, ...tokens];

  return (
    <section className="overflow-hidden border-b border-white/6 py-4">
      <div className="mx-auto max-w-[1600px] px-4">
        <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-white/40">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-mint" /> Trending now
        </div>
      </div>
      <div className="relative flex w-max animate-marquee gap-3 px-4 hover:[animation-play-state:paused]">
        {doubled.map((t, i) => (
          <Link
            key={t.id + i}
            href={`/token/${t.id}`}
            className="flex w-64 shrink-0 items-center gap-3 rounded-xl border border-white/6 bg-base-850/60 p-3 hover:border-mint/30"
          >
            <span className="text-2xl">{t.logo}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold">{t.ticker}</span>
                <RiskBadge risk={t.risk} className="scale-90" />
              </div>
              <div className="tnum text-xs text-white/50">{formatUsd(t.price, { decimals: 6 })}</div>
            </div>
            <div className="text-right">
              <div className={cn("tnum text-xs font-semibold", pnlColor(t.change24h))}>
                {formatPct(t.change24h)}
              </div>
              <div className="tnum text-[10px] text-white/40">MC {formatUsd(t.mcap)}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
