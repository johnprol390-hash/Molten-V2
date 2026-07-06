"use client";

import Link from "next/link";
import { useLiveValue } from "@/store/useRealtime";
import { PriceChart } from "@/components/token/PriceChart";
import { TradeWidget } from "@/components/token/TradeWidget";
import { SafetyPanel } from "@/components/token/SafetyPanel";
import { TokenTabs } from "@/components/token/TokenTabs";
import { PositionStrip } from "@/components/token/PositionStrip";
import { CurveViz } from "@/components/token/CurveViz";
import { NetFlowGauge } from "@/components/token/NetFlowGauge";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { Badge } from "@/components/ui/Badge";
import { formatUsd, formatPct, pnlColor, compactNumber, timeAgo } from "@/lib/format";
import { useMoney } from "@/lib/money";
import { cn } from "@/lib/cn";
import { ArrowLeft, Globe, Send } from "lucide-react";
import type { Token, Trade, Holder } from "@/lib/types";
import { useEffect } from "react";
import { useRecent } from "@/store/useRecent";

export function TokenTerminal({ token, trades, holders }: { token: Token; trades: Trade[]; holders: Holder[] }) {
  const id = token.id;
  const price = useLiveValue(token.price, id + ":hp", 0.015);
  const change = useLiveValue(token.change24h, id + ":hc", 0.02);
  const addRecent = useRecent((s) => s.add);
  const { money } = useMoney();

  useEffect(() => {
    addRecent({ id: token.id, ticker: token.ticker, logo: token.logo });
  }, [token.id, token.ticker, token.logo, addRecent]);

  return (
    <div className="mx-auto max-w-[1600px] px-3 py-3">
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Link href="/discover" className="rounded-md p-1.5 text-white/40 hover:bg-white/5 hover:text-white">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-2xl">{token.logo}</div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold">{token.name}</h1>
            <span className="tnum text-sm text-white/40">${token.ticker}</span>
            <RiskBadge risk={token.risk} />
            {token.status === "graduated" && <Badge variant="Pro">Graduated</Badge>}
            {token.kolCount > 0 && <Badge variant="KOL">{token.kolCount} KOLs</Badge>}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-white/40">
            <span>{token.category}</span>
            <span>·</span>
            <span>{timeAgo(token.createdAt)}</span>
            {token.socials.site && (
              <a href={token.socials.site} target="_blank" rel="noreferrer" className="hover:text-mint">
                <Globe size={12} />
              </a>
            )}
            {token.socials.tg && (
              <a href={token.socials.tg} target="_blank" rel="noreferrer" className="hover:text-mint">
                <Send size={12} />
              </a>
            )}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <HeaderStat label="Price" value={money(price, { decimals: 6 })} />
          <HeaderStat label="24h" value={formatPct(change)} color={pnlColor(change)} />
          <HeaderStat label="MCap" value={money(token.mcap)} />
          <HeaderStat label="Volume" value={money(token.volume24h)} />
          <HeaderStat label="Holders" value={compactNumber(token.holders)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-3">
          <PositionStrip token={token} />
          <div className="panel-flat h-[380px]">
            <PriceChart candles={token.candles} />
          </div>
          <TokenTabs token={token} trades={trades} holders={holders} />
        </div>

        <div className="flex flex-col gap-3">
          <TradeWidget token={token} />
          <CurveViz token={token} />
          <NetFlowGauge trades={trades} tokenId={token.id} />
          <SafetyPanel token={token} />
        </div>
      </div>
    </div>
  );
}

function HeaderStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="text-right">
      <div className="text-[10px] uppercase text-white/35">{label}</div>
      <div className={cn("tnum text-sm font-semibold", color)}>{value}</div>
    </div>
  );
}
