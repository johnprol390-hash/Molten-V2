"use client";

import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { useLiveValue } from "@/store/useRealtime";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { BondingBar } from "@/components/ui/BondingBar";
import { Badge } from "@/components/ui/Badge";
import { compactNumber, formatPct, timeAgo, pnlColor } from "@/lib/format";
import { useMoney } from "@/lib/money";
import { cn } from "@/lib/cn";
import type { Token } from "@/lib/types";
import { Zap, Users, ShieldCheck } from "lucide-react";

export function TokenCard({ token }: { token: Token }) {
  const preset = useAppStore((s) => s.presets.find((p) => p.id === s.activePreset));
  const price = useLiveValue(token.price, token.id + ":price", 0.02);
  const change = useLiveValue(token.change24h, token.id + ":chg", 0.03);
  const { money } = useMoney();

  const metrics: { label: string; value: string; danger?: boolean }[] = [
    { label: "Top10", value: `${token.safety.top10Pct.toFixed(0)}%`, danger: token.safety.top10Pct > 40 },
    { label: "Dev", value: `${token.safety.devHoldingsPct.toFixed(0)}%`, danger: token.safety.devHoldingsPct > 8 },
    { label: "Snipe", value: `${token.safety.snipersPct.toFixed(0)}%`, danger: token.safety.snipersPct > 15 },
    { label: "Insdr", value: `${token.safety.insidersPct.toFixed(0)}%`, danger: token.safety.insidersPct > 10 },
  ];

  return (
    <Link
      href={`/token/${token.id}`}
      className="group block rounded-xl border border-white/6 bg-base-850/60 p-3 transition-all hover:border-mint/30 hover:bg-base-800/80"
    >
      <div className="flex items-start gap-2.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xl">
          {token.logo}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold">{token.ticker}</span>
            {token.safety.lpBurnedPct >= 99 && (
              <ShieldCheck size={12} className="text-gain" aria-label="LP burned" />
            )}
            {token.kolCount > 0 && (
              <Badge variant="KOL" className="px-1 py-0">
                {token.kolCount} KOL
              </Badge>
            )}
          </div>
          <div className="truncate text-xs text-white/40">{token.name}</div>
        </div>
        <RiskBadge risk={token.risk} />
      </div>

      <div className="mt-2.5 flex items-end justify-between">
        <div>
          <div className="tnum text-sm font-semibold">{money(price, { decimals: price < 1 ? 6 : 2 })}</div>
          <div className={cn("tnum text-xs", pnlColor(change))}>{formatPct(change)}</div>
        </div>
        <div className="text-right text-[11px] text-white/40">
          <div className="tnum">MC {money(token.mcap)}</div>
          <div className="tnum">V {money(token.volume24h)}</div>
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-4 gap-1">
        {metrics.map((m) => (
          <div key={m.label} className="rounded bg-white/4 px-1 py-1 text-center">
            <div className="text-[9px] uppercase text-white/35">{m.label}</div>
            <div className={cn("tnum text-[11px] font-semibold", m.danger ? "text-loss" : "text-white/70")}>
              {m.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2.5">
        <BondingBar pct={token.bondingPct} />
      </div>

      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] text-white/40">
          <span className="flex items-center gap-0.5">
            <Users size={11} /> {compactNumber(token.holders)}
          </span>
          <span>{timeAgo(token.createdAt)}</span>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
          }}
          className="flex items-center gap-1 rounded-md bg-mint/15 px-2 py-1 text-[11px] font-semibold text-mint opacity-0 transition-opacity group-hover:opacity-100 hover:bg-mint/25"
          title={`Instant buy ${preset?.amount ?? 0.5} HYPE`}
        >
          <Zap size={11} /> {preset?.amount ?? 0.5}
        </button>
      </div>
    </Link>
  );
}
