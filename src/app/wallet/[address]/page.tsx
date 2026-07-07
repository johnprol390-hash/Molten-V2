"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getWallet, getTokens } from "@/lib/mock";
import { Rand } from "@/lib/rng";
import { useAppStore } from "@/store/useAppStore";
import { Sparkline } from "@/components/ui/Sparkline";
import { Badge } from "@/components/ui/Badge";
import { formatUsd, formatPct, truncateAddress, formatAge, timeAgo, pnlColor } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Target, Copy, Bell, Check } from "lucide-react";

export default function WalletProfilePage() {
  const params = useParams();
  const address = String(params.address);
  const { toggleTracked, isTracked, openTracking } = useAppStore();
  const tracked = isTracked(address);

  const [activity, setActivity] = useState<any | null>(null);
  useEffect(() => {
    fetch(`/api/wallet/${address}`)
      .then((r) => r.json())
      .then(setActivity)
      .catch(() => {});
  }, [address]);
  const realTrades: any[] = activity?.trades ?? [];

  const { wallet, curve, trades } = useMemo(() => {
    const w = getWallet(address);
    const r = new Rand("wp:" + address);
    const c = Array.from({ length: 50 }, () => r.range(-2000, 3000)).reduce<number[]>((a, v) => {
      a.push((a[a.length - 1] ?? 0) + v);
      return a;
    }, [0]);
    const tokens = getTokens();
    const t = Array.from({ length: 14 }, (_, i) => {
      const tok = tokens[i % tokens.length];
      const pnl = r.range(-4000, 22000);
      return {
        token: tok,
        side: r.bool(0.6) ? "buy" : "sell",
        size: r.range(200, 30000),
        pnl,
        roi: r.range(-70, 340),
        hold: r.range(60000, 1000 * 60 * 60 * 40),
        win: pnl > 0,
      };
    });
    return { wallet: w, curve: c, trades: t };
  }, [address]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-5">
      <div className="panel-flat mb-3 flex flex-wrap items-center gap-4 p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint/15 text-xl text-mint">
          {wallet.isKol ? wallet.kolName?.[0] : "0x"}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="tnum text-lg font-bold">{wallet.isKol ? wallet.kolName : truncateAddress(address, 6)}</h1>
            {wallet.isKol && <Badge variant="KOL">KOL</Badge>}
            {wallet.winRate > 60 && <Badge variant="Pro">Pro</Badge>}
            {wallet.pnlUsd > 50000 && <Badge variant="Whale">Whale</Badge>}
          </div>
          <div className="text-xs text-white/40">Wallet age {formatAge(wallet.ageMs)} · {wallet.trades} trades</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => openTracking(address, wallet.isKol ? wallet.kolName : undefined, "copy")}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium hover:border-mint/40 hover:text-mint"
          >
            <Copy size={15} /> Copy
          </button>
          <button
            onClick={() => openTracking(address, wallet.isKol ? wallet.kolName : undefined, "alert")}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium hover:border-mint/40 hover:text-mint"
          >
            <Bell size={15} /> Alert
          </button>
          <button
            onClick={() => toggleTracked(address, wallet.isKol ? wallet.kolName : undefined)}
            className={cn("flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium", tracked ? "border-mint/40 bg-mint/15 text-mint" : "border-white/10 hover:border-mint/30")}
          >
            {tracked ? <Check size={15} /> : <Target size={15} />}
            {tracked ? "Tracking" : "Track"}
          </button>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-4">
        <Stat label="Total PnL" value={formatUsd(wallet.pnlUsd)} sub={formatPct(wallet.pnlPct)} color={pnlColor(wallet.pnlUsd)} />
        <Stat label="Win Rate" value={`${wallet.winRate.toFixed(0)}%`} />
        <Stat label="Avg ROI" value={formatPct(wallet.avgRoi)} color={pnlColor(wallet.avgRoi)} />
        <Stat label="Avg Hold" value={formatAge(wallet.avgHoldMs)} />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <div className="panel-flat p-4 lg:col-span-1">
          <div className="mb-2 text-xs font-medium text-white/50">PnL Curve</div>
          <Sparkline data={curve} width={300} height={120} />
        </div>
        <div className="panel-flat lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/6 px-3 py-2.5">
            <span className="text-sm font-semibold">Trade History</span>
            {realTrades.length > 0 && <span className="text-[10px] text-mint">live on-chain · {activity?.stats?.tradeCount} trades</span>}
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            <table className="w-full text-xs">
              <tbody>
                {realTrades.length > 0
                  ? realTrades.map((t) => (
                      <tr key={t.id} className="border-b border-white/4 hover:bg-white/4">
                        <td className="px-3 py-2">
                          <Link href={`/token/${t.tokenId}`} className="flex items-center gap-1.5 hover:text-mint">
                            <span>{t.logo}</span>
                            <span className="font-medium">{t.ticker}</span>
                          </Link>
                        </td>
                        <td className={cn("px-3 py-2 text-[10px] font-semibold uppercase", t.side === "buy" ? "text-gain" : "text-loss")}>{t.side}</td>
                        <td className="tnum px-3 py-2 text-right text-white/50">{formatUsd(t.usd)}</td>
                        <td className="tnum px-3 py-2 text-right text-white/40">${t.price.toPrecision(4)}</td>
                        <td className="px-3 py-2 text-right text-white/30">{timeAgo(t.ts)}</td>
                      </tr>
                    ))
                  : trades.map((t, i) => (
                      <tr key={i} className="border-b border-white/4 hover:bg-white/4">
                        <td className="px-3 py-2">
                          <Link href={`/token/${t.token.id}`} className="flex items-center gap-1.5 hover:text-mint">
                            <span>{t.token.logo}</span>
                            <span className="font-medium">{t.token.ticker}</span>
                          </Link>
                        </td>
                        <td className={cn("px-3 py-2 text-[10px] font-semibold uppercase", t.side === "buy" ? "text-gain" : "text-loss")}>{t.side}</td>
                        <td className="tnum px-3 py-2 text-right text-white/50">{formatUsd(t.size)}</td>
                        <td className={cn("tnum px-3 py-2 text-right", pnlColor(t.pnl))}>{formatUsd(t.pnl)}</td>
                        <td className={cn("tnum px-3 py-2 text-right", pnlColor(t.roi))}>{formatPct(t.roi)}</td>
                        <td className="px-3 py-2 text-right text-white/30">{formatAge(t.hold)}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="panel-flat p-3">
      <div className="text-[10px] uppercase text-white/40">{label}</div>
      <div className={cn("tnum text-xl font-bold", color)}>{value}</div>
      {sub && <div className={cn("tnum text-xs", color)}>{sub}</div>}
    </div>
  );
}
