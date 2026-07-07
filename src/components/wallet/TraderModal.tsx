"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Sparkline } from "@/components/ui/Sparkline";
import { getWallet, getToken } from "@/lib/mock";
import { Rand } from "@/lib/rng";
import { formatUsd, formatPct, truncateAddress, formatAge, timeAgo, pnlColor } from "@/lib/format";
import {
  Target,
  Copy,
  Bell,
  ExternalLink,
  UserPlus,
  Check,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/cn";

export function TraderModal() {
  const { traderModalAddress, traderModalToken, closeTraderModal, toggleTracked, isTracked, openTracking } =
    useAppStore();
  const open = !!traderModalAddress;
  const address = traderModalAddress ?? "";

  const [activity, setActivity] = useState<any | null>(null);
  useEffect(() => {
    if (!address) {
      setActivity(null);
      return;
    }
    let cancelled = false;
    fetch(`/api/wallet/${address}`)
      .then((r) => r.json())
      .then((d) => !cancelled && setActivity(d))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [address]);

  const data = useMemo(() => {
    if (!address) return null;
    const w = getWallet(address);
    const r = new Rand("tm:" + address);
    const spark = Array.from({ length: 30 }, () => r.range(-100, 100)).reduce<number[]>(
      (acc, v) => {
        acc.push((acc[acc.length - 1] ?? 0) + v);
        return acc;
      },
      [0],
    );
    const positions = Array.from({ length: 6 }, (_, i) => {
      const t = getToken(["mdoge", "hpepe", "lcat", "nrn", "fuel", "giga"][i % 6]);
      const roi = r.range(-70, 320);
      return {
        token: t,
        entry: r.range(0.00001, 0.01),
        exit: r.range(0.00001, 0.02),
        size: r.range(200, 40000),
        pnl: r.range(-5000, 42000),
        roi,
        hold: r.range(1000 * 60, 1000 * 60 * 60 * 48),
        win: roi > 0,
      };
    });
    const tokenActivity = traderModalToken
      ? {
          token: getToken(traderModalToken),
          bought: r.range(500, 40000),
          sold: r.range(0, 30000),
          remaining: r.range(0, 60),
          pnl: r.range(-3000, 20000),
        }
      : null;
    return { w, spark, positions, tokenActivity };
  }, [address, traderModalToken]);

  if (!data) return null;
  const { w, spark, positions, tokenActivity } = data;
  const tracked = isTracked(address);

  return (
    <Modal open={open} onClose={closeTraderModal} bottomSheetOnMobile className="max-w-lg">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="tnum text-base font-semibold">
              {w.isKol ? w.kolName : truncateAddress(address, 6)}
            </span>
            {w.isKol && <Badge variant="KOL">KOL</Badge>}
            <span className="text-xs text-white/40">{formatAge(w.ageMs)} old</span>
          </div>
          {w.isKol && (
            <div className="mt-1 flex items-center gap-2 text-xs text-ai">
              <span>{w.twitter}</span>
              <span className="text-white/30">·</span>
              <span>Credibility {w.credibility}/100</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {w.pnlUsd > 50000 && <Badge variant="Whale">Whale</Badge>}
          {w.winRate > 60 && <Badge variant="Pro">Pro</Badge>}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Total PnL" value={formatUsd(w.pnlUsd)} sub={formatPct(w.pnlPct)} color={pnlColor(w.pnlUsd)} />
        <Stat label="Win Rate" value={`${w.winRate.toFixed(0)}%`} />
        <Stat label="Trades" value={String(w.trades)} />
        <Stat label="Avg ROI" value={formatPct(w.avgRoi)} color={pnlColor(w.avgRoi)} />
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg border border-white/6 bg-white/3 p-3">
        <div className="text-xs text-white/50">
          <div>PnL curve</div>
          <div className="text-[10px] text-white/30">Avg hold {formatAge(w.avgHoldMs)}</div>
        </div>
        <Sparkline data={spark} width={180} height={40} />
      </div>

      {tokenActivity?.token && (
        <div className="mt-3 rounded-lg border border-mint/20 bg-mint/5 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-mint">
            <TrendingUp size={13} /> Activity on {tokenActivity.token.ticker}
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <MiniStat label="Bought" value={formatUsd(tokenActivity.bought)} />
            <MiniStat label="Sold" value={formatUsd(tokenActivity.sold)} />
            <MiniStat label="Holding" value={`${tokenActivity.remaining.toFixed(1)}%`} />
            <MiniStat label="PnL" value={formatUsd(tokenActivity.pnl)} color={pnlColor(tokenActivity.pnl)} />
          </div>
        </div>
      )}

      {activity?.stats?.tradeCount > 0 && (
        <div className="mt-3 grid grid-cols-4 gap-2 rounded-lg border border-white/6 bg-white/3 p-2 text-center">
          <MiniStat label="Volume" value={formatUsd(activity.stats.volume)} />
          <MiniStat label="Trades" value={String(activity.stats.tradeCount)} />
          <MiniStat label="Tokens" value={String(activity.stats.tokensTraded)} />
          <MiniStat
            label="Realized"
            value={activity.stats.realizedPnl != null ? formatUsd(activity.stats.realizedPnl) : "—"}
            color={activity.stats.realizedPnl != null ? pnlColor(activity.stats.realizedPnl) : undefined}
          />
        </div>
      )}

      <div className="mt-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wide text-white/40">
            {activity?.trades?.length ? "Trade history" : "Recent positions"}
          </span>
          {activity?.trades?.length ? <span className="text-[9px] text-mint">live on-chain</span> : null}
        </div>
        <div className="max-h-40 overflow-y-auto rounded-lg border border-white/6">
          <table className="w-full text-left text-xs">
            <tbody>
              {activity?.trades?.length ? (
                activity.trades.map((t: any) => (
                  <tr key={t.id} className="border-b border-white/4 last:border-0">
                    <td className="px-2 py-1.5">
                      <Link href={`/token/${t.tokenId}`} onClick={closeTraderModal} className="flex items-center gap-1.5 hover:text-mint">
                        <span>{t.logo}</span>
                        <span className="font-medium">{t.ticker}</span>
                      </Link>
                    </td>
                    <td className={cn("px-2 py-1.5 text-[10px] font-semibold uppercase", t.side === "buy" ? "text-gain" : "text-loss")}>
                      {t.side}
                    </td>
                    <td className="tnum px-2 py-1.5 text-right text-white/60">{formatUsd(t.usd)}</td>
                    <td className="tnum px-2 py-1.5 text-right text-white/40">${t.price.toPrecision(4)}</td>
                    <td className="px-2 py-1.5 text-right text-white/30">{timeAgo(t.ts)}</td>
                  </tr>
                ))
              ) : (
                positions.map((p, i) => (
                  <tr key={i} className="border-b border-white/4 last:border-0">
                    <td className="px-2 py-1.5">
                      {p.token ? (
                        <Link href={`/token/${p.token.id}`} onClick={closeTraderModal} className="flex items-center gap-1.5 hover:text-mint">
                          <span>{p.token.logo}</span>
                          <span className="font-medium">{p.token.ticker}</span>
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="tnum px-2 py-1.5 text-white/50">{formatUsd(p.size)}</td>
                    <td className={cn("tnum px-2 py-1.5 text-right", pnlColor(p.pnl))}>{formatUsd(p.pnl)}</td>
                    <td className={cn("tnum px-2 py-1.5 text-right", pnlColor(p.roi))}>{formatPct(p.roi)}</td>
                    <td className="px-2 py-1.5 text-right text-white/30">{formatAge(p.hold)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <ActionBtn
          onClick={() => toggleTracked(address, w.isKol ? w.kolName : undefined)}
          active={tracked}
          icon={tracked ? <Check size={14} /> : <Target size={14} />}
          label={tracked ? "Tracked" : "Track"}
        />
        <ActionBtn icon={<Copy size={14} />} label="Copy Trade" onClick={() => openTracking(address, w.isKol ? w.kolName : undefined, "copy")} />
        <ActionBtn icon={<Bell size={14} />} label="Set Alert" onClick={() => openTracking(address, w.isKol ? w.kolName : undefined, "alert")} />
        <ActionBtn icon={<UserPlus size={14} />} label="Full Profile" href={`/wallet/${address}`} onNavigate={closeTraderModal} />
        <ActionBtn icon={<Copy size={14} />} label="Copy Addr" onClick={() => navigator.clipboard?.writeText(address)} />
        <ActionBtn icon={<ExternalLink size={14} />} label="Explorer" />
      </div>
    </Modal>
  );
}

function Stat({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-lg border border-white/6 bg-white/3 p-2">
      <div className="text-[10px] text-white/40">{label}</div>
      <div className={cn("tnum text-sm font-semibold", color)}>{value}</div>
      {sub && <div className={cn("tnum text-[10px]", color)}>{sub}</div>}
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div className="text-[10px] text-white/40">{label}</div>
      <div className={cn("tnum text-xs font-semibold", color)}>{value}</div>
    </div>
  );
}

function ActionBtn({
  icon,
  label,
  onClick,
  active,
  href,
  onNavigate,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  href?: string;
  onNavigate?: () => void;
}) {
  const cls = cn(
    "flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
    active
      ? "border-mint/40 bg-mint/15 text-mint"
      : "border-white/8 bg-white/3 text-white/70 hover:border-white/20 hover:text-white",
  );
  if (href) {
    return (
      <Link href={href} onClick={onNavigate} className={cls}>
        {icon}
        {label}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={cls}>
      {icon}
      {label}
    </button>
  );
}
