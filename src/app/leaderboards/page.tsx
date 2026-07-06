"use client";

import { useMemo, useState } from "react";
import { getKols } from "@/lib/mock";
import { Rand } from "@/lib/rng";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { WalletLink } from "@/components/wallet/WalletLink";
import { useAppStore } from "@/store/useAppStore";
import { formatUsd, formatPct, compactNumber, pnlColor } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Trophy } from "lucide-react";

const CATEGORIES = [
  "Top Traders",
  "Top Creators",
  "Top Referrers",
  "Highest ROI",
  "Most Volume",
  "Best Snipers",
  "Win Streaks",
  "Points Leaders",
];

interface Row {
  rank: number;
  address: string;
  name: string;
  pnl: number;
  roi: number;
  volume: number;
  winStreak: number;
  points: number;
}

export default function LeaderboardsPage() {
  const [cat, setCat] = useState("Top Traders");
  const [tf, setTf] = useState<"24H" | "7D" | "30D" | "All">("7D");
  const { toggleTracked, isTracked } = useAppStore();

  const rows = useMemo<Row[]>(() => {
    const r = new Rand(cat + tf);
    const kols = getKols();
    return Array.from({ length: 40 }, (_, i) => {
      const isKol = i < 10 && r.bool(0.5);
      return {
        rank: i + 1,
        address: isKol ? kols[i % kols.length].address : r.address(),
        name: isKol ? kols[i % kols.length].kolName! : "",
        pnl: r.range(5000, 900000) * (1 - i / 60),
        roi: r.range(20, 900) * (1 - i / 80),
        volume: r.range(50000, 8_000_000) * (1 - i / 60),
        winStreak: r.int(1, 34),
        points: Math.round(r.range(1000, 120000) * (1 - i / 50)),
      };
    });
  }, [cat, tf]);

  const cols: Column<Row>[] = [
    { key: "rank", header: "#", width: "44px", render: (r) => (
      <span className={cn("tnum font-semibold", r.rank <= 3 ? "text-mint" : "text-white/40")}>{r.rank}</span>
    ) },
    { key: "addr", header: "Trader", render: (r) => <WalletLink address={r.address} label={r.name || undefined} /> },
    { key: "pnl", header: "PnL", align: "right", sortable: true, sortValue: (r) => r.pnl, render: (r) => <span className={cn("tnum", pnlColor(r.pnl))}>{formatUsd(r.pnl)}</span> },
    { key: "roi", header: "ROI", align: "right", sortable: true, sortValue: (r) => r.roi, render: (r) => <span className="tnum text-gain">{formatPct(r.roi)}</span> },
    { key: "vol", header: "Volume", align: "right", sortable: true, sortValue: (r) => r.volume, render: (r) => <span className="tnum text-white/60">{formatUsd(r.volume)}</span> },
    { key: "streak", header: "Streak", align: "right", render: (r) => <span className="tnum text-white/60">{r.winStreak}</span> },
    { key: "pts", header: "Points", align: "right", sortable: true, sortValue: (r) => r.points, render: (r) => <span className="tnum text-mint">{compactNumber(r.points)}</span> },
    {
      key: "act",
      header: "",
      align: "right",
      render: (r) => (
        <button
          onClick={(e) => { e.stopPropagation(); toggleTracked(r.address, r.name || undefined); }}
          className={cn("rounded-md border px-2 py-0.5 text-[11px]", isTracked(r.address) ? "border-mint/40 bg-mint/15 text-mint" : "border-white/10 text-white/60 hover:border-mint/30")}
        >
          {isTracked(r.address) ? "Tracked" : "Track"}
        </button>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-5">
      <div className="mb-4 flex items-center gap-2">
        <Trophy size={20} className="text-warn" />
        <h1 className="text-xl font-bold">Leaderboards</h1>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={cn("rounded-lg px-3 py-1.5 text-xs font-medium", cat === c ? "bg-mint/15 text-mint" : "text-white/50 hover:bg-white/5")}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-0.5 rounded-md border border-white/8 p-0.5">
          {(["24H", "7D", "30D", "All"] as const).map((t) => (
            <button key={t} onClick={() => setTf(t)} className={cn("rounded px-2 py-0.5 text-[11px]", tf === t ? "bg-mint/15 text-mint" : "text-white/40")}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="panel-flat">
        <DataTable columns={cols} rows={rows} rowKey={(r) => String(r.rank)} defaultSort={{ key: "pnl", dir: "desc" }} />
      </div>
    </div>
  );
}
