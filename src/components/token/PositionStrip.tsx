"use client";

import type { Token } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";
import { useLiveValue } from "@/store/useRealtime";
import { formatUsd, formatPct, pnlColor } from "@/lib/format";
import { cn } from "@/lib/cn";

export function PositionStrip({ token }: { token: Token }) {
  const connected = useAppStore((s) => s.wallets.length > 0);
  const unreal = useLiveValue(312, token.id + ":unreal", 0.05);

  if (!connected) {
    return (
      <div className="panel-flat flex items-center justify-between px-4 py-2.5 text-xs text-white/40">
        <span>No open position — connect a wallet to start trading {token.ticker}.</span>
        <span className="text-mint">Guest terminal access</span>
      </div>
    );
  }

  const cells = [
    { label: "Bought", value: formatUsd(1580), color: "" },
    { label: "Sold", value: formatUsd(420), color: "" },
    { label: "Holding", value: formatUsd(1240), color: "" },
    { label: "Unrealized", value: formatUsd(unreal), color: pnlColor(unreal), sub: formatPct(24.3) },
    { label: "Realized", value: formatUsd(88), color: pnlColor(88), sub: formatPct(5.6) },
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
