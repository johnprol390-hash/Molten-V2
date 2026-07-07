"use client";

import { useEffect, useState, useCallback } from "react";
import type { Token } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";
import { useRealtime } from "@/store/useRealtime";
import { formatUsd, formatPct, pnlColor } from "@/lib/format";
import { cn } from "@/lib/cn";

interface Pos {
  value: number;
  unrealized: number;
  unrealizedPct: number;
  realized: number;
  boughtUsd: number;
  soldUsd: number;
}

export function PositionStrip({ token }: { token: Token }) {
  const connected = useAppStore((s) => s.wallets.length > 0);
  const lastTrade = useRealtime((s) => s.lastTrade);
  const [pos, setPos] = useState<Pos | null>(null);

  const load = useCallback(() => {
    fetch(`/api/positions?tokenId=${token.id}`)
      .then((r) => r.json())
      .then((d) => setPos(d.positions?.[0] ?? null))
      .catch(() => {});
  }, [token.id]);

  useEffect(() => {
    if (connected) load();
  }, [connected, load]);

  // Refresh when a trade on this token lands over the realtime feed.
  useEffect(() => {
    if (connected && lastTrade?.tokenId === token.id) load();
  }, [lastTrade, connected, token.id, load]);

  if (!connected) {
    return (
      <div className="panel-flat flex items-center justify-between px-4 py-2.5 text-xs text-white/40">
        <span>No open position — connect a wallet to start trading {token.ticker}.</span>
        <span className="text-mint">Guest terminal access</span>
      </div>
    );
  }

  const cells = [
    { label: "Bought", value: formatUsd(pos?.boughtUsd ?? 0), color: "" },
    { label: "Sold", value: formatUsd(pos?.soldUsd ?? 0), color: "" },
    { label: "Holding", value: formatUsd(pos?.value ?? 0), color: "" },
    {
      label: "Unrealized",
      value: formatUsd(pos?.unrealized ?? 0),
      color: pnlColor(pos?.unrealized ?? 0),
      sub: formatPct(pos?.unrealizedPct ?? 0),
    },
    { label: "Realized", value: formatUsd(pos?.realized ?? 0), color: pnlColor(pos?.realized ?? 0) },
  ];

  return (
    <div className="panel-flat grid grid-cols-2 divide-x divide-white/6 sm:grid-cols-5">
      {cells.map((c) => (
        <div key={c.label} className="px-4 py-2.5">
          <div className="text-[10px] uppercase text-white/35">{c.label}</div>
          <div className={cn("tnum text-sm font-semibold", c.color)}>{c.value}</div>
          {c.sub && <div className={cn("tnum text-[10px]", c.color)}>{c.sub}</div>}
        </div>
      ))}
    </div>
  );
}
