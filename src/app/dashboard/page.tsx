"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { useRealtime } from "@/store/useRealtime";
import { Rand } from "@/lib/rng";
import { Sparkline } from "@/components/ui/Sparkline";
import { WalletButton } from "@/components/wallet/WalletButton";
import { formatUsd, formatPct, pnlColor } from "@/lib/format";
import { cn } from "@/lib/cn";
import { LayoutDashboard, Wallet } from "lucide-react";

interface Position {
  tokenId: string;
  ticker: string;
  name: string;
  logo: string;
  value: number;
  unrealized: number;
  unrealizedPct: number;
}

export default function DashboardPage() {
  const { wallets, activeWallet, tracked } = useAppStore();
  const connected = wallets.length > 0;
  const lastTrade = useRealtime((s) => s.lastTrade);
  const [positions, setPositions] = useState<Position[]>([]);
  const [totals, setTotals] = useState({ value: 0, unrealized: 0 });
  const [points, setPoints] = useState<number>(0);

  useEffect(() => {
    if (!connected) return;
    fetch("/api/positions")
      .then((r) => r.json())
      .then((d) => {
        setPositions(d.positions ?? []);
        setTotals({ value: d.totalValue ?? 0, unrealized: d.totalUnrealized ?? 0 });
      })
      .catch(() => {});
    fetch("/api/points")
      .then((r) => r.json())
      .then((d) => setPoints(d.points ?? 0))
      .catch(() => {});
  }, [connected, lastTrade]);

  const curve = useMemo(() => {
    const r = new Rand("dash:" + (activeWallet ?? "x"));
    return Array.from({ length: 40 }, () => r.range(-500, 800)).reduce<number[]>((a, v) => {
      a.push((a[a.length - 1] ?? 40000) + v);
      return a;
    }, [40000]);
  }, [activeWallet]);
  const portfolio = 40000 + totals.value;

  if (!connected) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-mint">
          <Wallet size={24} />
        </div>
        <h1 className="text-xl font-bold">Connect to view your dashboard</h1>
        <p className="mt-2 text-sm text-white/50">Portfolio, PnL, holdings, orders and more — aggregated across all your wallets.</p>
        <div className="mt-5 flex justify-center">
          <WalletButton />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-5">
      <div className="mb-4 flex items-center gap-2">
        <LayoutDashboard size={20} className="text-mint" />
        <h1 className="text-xl font-bold">Dashboard</h1>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="panel-flat p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-white/40">Portfolio Value</div>
              <div className="tnum text-3xl font-bold">{formatUsd(portfolio)}</div>
              <div className={cn("tnum text-sm", pnlColor(totals.unrealized))}>
                {formatUsd(totals.unrealized)} unrealized
              </div>
            </div>
            <Sparkline data={curve} width={240} height={64} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Points" value={points.toLocaleString()} accent="text-mint" />
          <StatCard label="Positions" value={String(positions.length)} />
          <StatCard label="Referral Earnings" value={formatUsd(9600)} accent="text-gain" />
          <StatCard label="Voting Power" value="8,400" accent="text-ai" />
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <div className="panel-flat lg:col-span-2">
          <div className="border-b border-white/6 px-3 py-2.5 text-sm font-semibold">Token Holdings</div>
          <table className="w-full text-xs">
            <thead className="text-white/40">
              <tr className="border-b border-white/6">
                <th className="px-3 py-2 text-left text-[10px] uppercase">Token</th>
                <th className="px-3 py-2 text-right text-[10px] uppercase">Value</th>
                <th className="px-3 py-2 text-right text-[10px] uppercase">PnL</th>
                <th className="px-3 py-2 text-right text-[10px] uppercase">ROI</th>
                <th className="px-3 py-2 text-right text-[10px] uppercase"></th>
              </tr>
            </thead>
            <tbody>
              {positions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-xs text-white/30">
                    No open positions yet. Buy a token on the terminal to start.
                  </td>
                </tr>
              ) : (
                positions.map((h) => (
                  <tr key={h.tokenId} className="border-b border-white/4 hover:bg-white/4">
                    <td className="px-3 py-2">
                      <Link href={`/token/${h.tokenId}`} className="flex items-center gap-2 hover:text-mint">
                        <span>{h.logo}</span>
                        <span className="font-medium">{h.ticker}</span>
                      </Link>
                    </td>
                    <td className="tnum px-3 py-2 text-right">{formatUsd(h.value)}</td>
                    <td className={cn("tnum px-3 py-2 text-right", pnlColor(h.unrealized))}>{formatUsd(h.unrealized)}</td>
                    <td className={cn("tnum px-3 py-2 text-right", pnlColor(h.unrealizedPct))}>{formatPct(h.unrealizedPct)}</td>
                    <td className="px-3 py-2 text-right">
                      <Link href={`/token/${h.tokenId}`} className="rounded border border-loss/30 bg-loss/10 px-2 py-0.5 text-[11px] text-loss">Trade</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="panel-flat">
          <div className="border-b border-white/6 px-3 py-2.5 text-sm font-semibold">Watchlist</div>
          {tracked.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-white/30">
              No tracked wallets yet. Click any address to track it.
            </div>
          ) : (
            <div className="divide-y divide-white/4">
              {tracked.map((t) => (
                <Link key={t.address} href={`/wallet/${t.address}`} className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/4">
                  <span>{t.emoji}</span>
                  <span className="tnum">{t.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="panel-flat p-3">
      <div className="text-[10px] uppercase text-white/40">{label}</div>
      <div className={cn("tnum text-lg font-bold", accent)}>{value}</div>
    </div>
  );
}
