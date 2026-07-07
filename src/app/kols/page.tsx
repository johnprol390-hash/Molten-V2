"use client";

import { useState } from "react";
import { getKols, getKolActivity } from "@/lib/mock";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { WalletLink } from "@/components/wallet/WalletLink";
import { useAppStore } from "@/store/useAppStore";
import { formatUsd, formatPct, compactNumber, pnlColor, timeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";
import { BadgeCheck, Users } from "lucide-react";
import type { Kol } from "@/lib/mock";

export default function KolsPage() {
  const kols = getKols();
  const activity = getKolActivity();
  const { toggleTracked, isTracked, openTracking } = useAppStore();
  const [tf, setTf] = useState<"24H" | "7D" | "30D" | "All">("7D");

  const cols: Column<Kol>[] = [
    {
      key: "name",
      header: "KOL",
      render: (k) => (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ai/15 text-xs text-ai">{k.kolName?.[0]}</div>
          <div>
            <div className="flex items-center gap-1 text-sm font-medium">
              {k.kolName} <BadgeCheck size={13} className="text-ai" />
            </div>
            <div className="text-[10px] text-white/40">{k.twitter}</div>
          </div>
        </div>
      ),
    },
    { key: "followers", header: "Followers", align: "right", sortable: true, sortValue: (k) => k.followers, render: (k) => <span className="tnum text-white/60">{compactNumber(k.followers)}</span> },
    { key: "pnl", header: "PnL", align: "right", sortable: true, sortValue: (k) => k.pnlUsd, render: (k) => <span className={cn("tnum", pnlColor(k.pnlUsd))}>{formatUsd(k.pnlUsd)}</span> },
    { key: "win", header: "Win %", align: "right", sortable: true, sortValue: (k) => k.winRate, render: (k) => <span className="tnum text-white/60">{k.winRate.toFixed(0)}%</span> },
    { key: "roi", header: "Avg ROI", align: "right", sortable: true, sortValue: (k) => k.avgRoi, render: (k) => <span className={cn("tnum", pnlColor(k.avgRoi))}>{formatPct(k.avgRoi)}</span> },
    { key: "cred", header: "Cred", align: "right", sortable: true, sortValue: (k) => k.credibility ?? 0, render: (k) => <span className="tnum text-ai">{k.credibility}</span> },
    {
      key: "action",
      header: "",
      align: "right",
      render: (k) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openTracking(k.address, k.kolName, "copy");
            }}
            className="rounded-md border border-white/10 px-2 py-1 text-[11px] font-medium text-white/70 hover:border-mint/40 hover:text-mint"
            title="Copy trade this KOL"
          >
            Copy
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openTracking(k.address, k.kolName, "alert");
            }}
            className="rounded-md border border-white/10 px-2 py-1 text-[11px] font-medium text-white/70 hover:border-mint/40 hover:text-mint"
            title="Set buy alert"
          >
            Alert
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleTracked(k.address, k.kolName);
            }}
            className={cn(
              "rounded-md border px-2 py-1 text-[11px] font-medium",
              isTracked(k.address) ? "border-mint/40 bg-mint/15 text-mint" : "border-white/10 text-white/60 hover:border-mint/30",
            )}
          >
            {isTracked(k.address) ? "✓" : "Follow"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-5">
      <div className="mb-4 flex items-center gap-2">
        <Users size={20} className="text-ai" />
        <h1 className="text-xl font-bold">KOL Directory</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="panel-flat">
          <div className="flex items-center justify-between border-b border-white/6 px-3 py-2.5">
            <span className="text-sm font-semibold">Leaderboard</span>
            <div className="flex gap-0.5 rounded-md border border-white/8 p-0.5">
              {(["24H", "7D", "30D", "All"] as const).map((t) => (
                <button key={t} onClick={() => setTf(t)} className={cn("rounded px-2 py-0.5 text-[11px]", tf === t ? "bg-mint/15 text-mint" : "text-white/40")}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <DataTable columns={cols} rows={kols} rowKey={(k) => k.address} defaultSort={{ key: "pnl", dir: "desc" }} />
        </div>

        <div className="panel-flat flex flex-col">
          <div className="flex items-center gap-2 border-b border-white/6 px-3 py-2.5 text-sm font-semibold">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-ai" /> Live KOL Activity
          </div>
          <div className="flex max-h-[560px] flex-col divide-y divide-white/4 overflow-y-auto">
            {activity.map((a) => (
              <div key={a.id} className="flex items-center gap-2 px-3 py-2 text-xs">
                <span className={cn("font-semibold uppercase", a.side === "buy" ? "text-gain" : "text-loss")}>{a.side}</span>
                <WalletLink address={a.kol.address} label={a.kol.kolName} />
                <span className="text-white/30">→</span>
                <span className="flex items-center gap-1">
                  {a.token.logo} <span className="font-medium">{a.token.ticker}</span>
                </span>
                <span className="tnum ml-auto text-white/50">{formatUsd(a.usd)}</span>
                <span className="text-[10px] text-white/30">{timeAgo(a.ts)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
