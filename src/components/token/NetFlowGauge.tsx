"use client";

import { useMemo } from "react";
import type { Trade } from "@/lib/types";
import { useRealtime } from "@/store/useRealtime";
import { formatUsd } from "@/lib/format";
import { cn } from "@/lib/cn";

// Buy vs sell pressure gauge for a token, computed from its recent trades (#35).
export function NetFlowGauge({ trades, tokenId }: { trades: Trade[]; tokenId: string }) {
  const lastTrade = useRealtime((s) => s.lastTrade);

  const { buyUsd, sellUsd, buyPct } = useMemo(() => {
    let buy = 0;
    let sell = 0;
    for (const t of trades) {
      if (t.side === "buy") buy += t.usd;
      else sell += t.usd;
    }
    // Fold in the latest realtime trade for this token.
    if (lastTrade?.tokenId === tokenId && lastTrade.usd > 0) {
      if (lastTrade.side === "buy") buy += lastTrade.usd;
      else sell += lastTrade.usd;
    }
    const total = buy + sell || 1;
    return { buyUsd: buy, sellUsd: sell, buyPct: (buy / total) * 100 };
  }, [trades, lastTrade, tokenId]);

  return (
    <div className="panel-flat p-3">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-medium text-white/50">Net Flow</span>
        <span className={cn("font-semibold", buyPct >= 50 ? "text-gain" : "text-loss")}>
          {buyPct >= 50 ? "Buy pressure" : "Sell pressure"}
        </span>
      </div>
      <div className="flex h-2.5 overflow-hidden rounded-full">
        <div className="bg-gain" style={{ width: `${buyPct}%` }} />
        <div className="bg-loss" style={{ width: `${100 - buyPct}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px]">
        <span className="tnum text-gain">Buys {formatUsd(buyUsd)}</span>
        <span className="tnum text-loss">Sells {formatUsd(sellUsd)}</span>
      </div>
    </div>
  );
}
