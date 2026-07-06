"use client";

import { useEffect, useMemo, useState } from "react";
import type { Token, Holder, Trade } from "@/lib/types";
import { getTopTraders, type TopTrader } from "@/lib/mock";
import { useRealtime } from "@/store/useRealtime";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { WalletLink } from "@/components/wallet/WalletLink";
import { Badge } from "@/components/ui/Badge";
import { BubbleMap } from "./BubbleMap";
import { AiInsights } from "./AiInsights";
import { CommunityChat } from "./CommunityChat";
import { useAppStore } from "@/store/useAppStore";
import { formatUsd, formatHype, compactNumber, timeAgo, formatAge, pnlColor, formatPct } from "@/lib/format";
import { cn } from "@/lib/cn";
import { EmptyState } from "@/components/ui/Skeleton";

const TABS = [
  "Trades",
  "Positions",
  "Orders",
  "Holders",
  "Top Traders",
  "Dev Tokens",
  "Bubble Map",
  "Community",
  "AI Insights",
] as const;

export function TokenTabs({ token, trades, holders }: { token: Token; trades: Trade[]; holders: Holder[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Trades");
  const [onlyTracked, setOnlyTracked] = useState(false);
  const isTracked = useAppStore((s) => s.isTracked);

  const topTraders = useMemo(() => getTopTraders(token), [token]);

  return (
    <div className="panel-flat flex flex-col">
      <div className="flex items-center gap-1 overflow-x-auto border-b border-white/6 px-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-medium transition-colors",
              tab === t
                ? "border-mint text-white"
                : "border-transparent text-white/40 hover:text-white/70",
            )}
          >
            {t}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 pr-2">
          {(tab === "Holders" || tab === "Trades") && (
            <label className="flex items-center gap-1.5 text-[11px] text-white/50">
              <input
                type="checkbox"
                checked={onlyTracked}
                onChange={(e) => setOnlyTracked(e.target.checked)}
                className="accent-mint"
              />
              Only Tracked
            </label>
          )}
        </div>
      </div>

      <div className="p-2">
        {tab === "Trades" && <TradesTab trades={trades} token={token} onlyTracked={onlyTracked} isTracked={isTracked} />}
        {tab === "Positions" && <PositionsTab token={token} />}
        {tab === "Orders" && <EmptyState title="No open orders" hint="Your limit, TWAP and stop orders on this token will appear here." icon="📋" />}
        {tab === "Holders" && <HoldersTab holders={holders} token={token} onlyTracked={onlyTracked} isTracked={isTracked} />}
        {tab === "Top Traders" && <TopTradersTab traders={topTraders} token={token} />}
        {tab === "Dev Tokens" && <DevTokensTab token={token} />}
        {tab === "Bubble Map" && <BubbleMap holders={holders} tokenId={token.id} />}
        {tab === "Community" && <CommunityChat token={token} />}
        {tab === "AI Insights" && <AiInsights token={token} />}
      </div>
    </div>
  );
}

function TradesTab({
  trades,
  token,
  onlyTracked,
  isTracked,
}: {
  trades: Trade[];
  token: Token;
  onlyTracked: boolean;
  isTracked: (a: string) => boolean;
}) {
  const lastTrade = useRealtime((s) => s.lastTrade);
  const [live, setLive] = useState<Trade[]>([]);

  useEffect(() => {
    if (lastTrade && lastTrade.tokenId === token.id) {
      setLive((prev) =>
        [
          {
            id: "live:" + lastTrade.ts,
            tokenId: token.id,
            ts: lastTrade.ts,
            side: lastTrade.side,
            amountTokens: lastTrade.usd / (lastTrade.price || 1),
            amountHype: lastTrade.amountHype,
            usd: lastTrade.usd,
            price: lastTrade.price,
            wallet: lastTrade.wallet,
            tx: "0xlive",
          } as Trade,
          ...prev,
        ].slice(0, 20),
      );
    }
  }, [lastTrade, token.id]);

  const merged = [...live, ...trades];
  const rows = onlyTracked ? merged.filter((t) => isTracked(t.wallet)) : merged;
  const cols: Column<Trade>[] = [
    { key: "ts", header: "Time", render: (t) => <span className="text-white/40">{timeAgo(t.ts)}</span>, sortable: true, sortValue: (t) => t.ts },
    {
      key: "side",
      header: "Type",
      render: (t) => (
        <span className={cn("font-semibold uppercase", t.side === "buy" ? "text-gain" : "text-loss")}>{t.side}</span>
      ),
    },
    { key: "usd", header: "USD", align: "right", sortable: true, sortValue: (t) => t.usd, render: (t) => <span className="tnum">{formatUsd(t.usd)}</span> },
    { key: "hype", header: "HYPE", align: "right", render: (t) => <span className="tnum text-white/60">{formatHype(t.amountHype)}</span> },
    { key: "price", header: "Price", align: "right", render: (t) => <span className="tnum text-white/60">${t.price.toPrecision(4)}</span> },
    { key: "wallet", header: "Maker", render: (t) => <WalletLink address={t.wallet} tokenId={token.id} /> },
  ];
  return <DataTable columns={cols} rows={rows} rowKey={(t) => t.id} maxHeight="360px" emptyTitle="No trades from tracked wallets" />;
}

function HoldersTab({
  holders,
  token,
  onlyTracked,
  isTracked,
}: {
  holders: Holder[];
  token: Token;
  onlyTracked: boolean;
  isTracked: (a: string) => boolean;
}) {
  const rows = onlyTracked ? holders.filter((h) => isTracked(h.wallet)) : holders;
  const cols: Column<Holder>[] = [
    { key: "rank", header: "#", render: (h) => <span className="tnum text-white/40">{h.rank}</span>, width: "40px" },
    {
      key: "wallet",
      header: "Wallet",
      render: (h) => (
        <div className="flex items-center gap-1.5">
          <WalletLink address={h.wallet} tokenId={token.id} />
          <div className="flex gap-0.5">
            {h.badges.slice(0, 3).map((b) => (
              <Badge key={b} variant={b} className="px-1 py-0">
                {b}
              </Badge>
            ))}
          </div>
        </div>
      ),
    },
    { key: "other", header: "Tokens", align: "right", sortable: true, sortValue: (h) => h.otherTokens, render: (h) => <span className="tnum text-white/50">{h.otherTokens}</span> },
    { key: "bought", header: "Bought", align: "right", sortable: true, sortValue: (h) => h.boughtUsd, render: (h) => <span className="tnum text-gain">{formatUsd(h.boughtUsd)}</span> },
    { key: "sold", header: "Sold", align: "right", sortable: true, sortValue: (h) => h.soldUsd, render: (h) => <span className="tnum text-loss">{formatUsd(h.soldUsd)}</span> },
    {
      key: "pnl",
      header: "Unrealized",
      align: "right",
      sortable: true,
      sortValue: (h) => h.unrealizedPnl,
      render: (h) => <span className={cn("tnum", pnlColor(h.unrealizedPnl))}>{formatUsd(h.unrealizedPnl)}</span>,
    },
    { key: "rem", header: "Holds %", align: "right", sortable: true, sortValue: (h) => h.remainingPct, render: (h) => <span className="tnum text-white/70">{h.remainingPct.toFixed(2)}%</span> },
  ];
  return (
    <DataTable
      columns={cols}
      rows={rows}
      rowKey={(h) => h.wallet}
      defaultSort={{ key: "rem", dir: "desc" }}
      maxHeight="420px"
      emptyTitle="No tracked wallets hold this token"
      exportName={`${token.ticker}-holders`}
    />
  );
}

function TopTradersTab({ traders, token }: { traders: TopTrader[]; token: Token }) {
  const cols: Column<TopTrader>[] = [
    { key: "wallet", header: "Trader", render: (t) => <WalletLink address={t.address} label={t.isKol ? t.kolName : undefined} tokenId={token.id} /> },
    {
      key: "entry",
      header: "Entry",
      render: (t) => (
        <span className={cn("text-[10px] uppercase", t.entry === "sniper" ? "text-loss" : t.entry === "early" ? "text-warn" : "text-white/40")}>
          {t.entry}
        </span>
      ),
    },
    { key: "realized", header: "Realized", align: "right", sortable: true, sortValue: (t) => t.realizedPnl, render: (t) => <span className={cn("tnum", pnlColor(t.realizedPnl))}>{formatUsd(t.realizedPnl)}</span> },
    { key: "unreal", header: "Unrealized", align: "right", sortable: true, sortValue: (t) => t.unrealizedPnl, render: (t) => <span className={cn("tnum", pnlColor(t.unrealizedPnl))}>{formatUsd(t.unrealizedPnl)}</span> },
    { key: "bought", header: "Bought", align: "right", render: (t) => <span className="tnum text-white/50">{formatUsd(t.boughtUsd)}</span> },
    { key: "wins", header: "Wins", align: "right", render: (t) => <span className="tnum text-white/50">{t.wins}</span> },
    { key: "hold", header: "Avg Hold", align: "right", render: (t) => <span className="tnum text-white/50">{formatAge(t.avgHoldMs)}</span> },
  ];
  return <DataTable columns={cols} rows={traders} rowKey={(t) => t.address} defaultSort={{ key: "realized", dir: "desc" }} maxHeight="420px" />;
}

function DevTokensTab({ token }: { token: Token }) {
  const rugged = token.devTokens.filter((d) => d.outcome === "rugged").length;
  const rate = token.devTokens.length ? (rugged / token.devTokens.length) * 100 : 0;
  if (token.devTokens.length === 0) {
    return <EmptyState title="First launch from this deployer" hint="No prior token history found for this wallet." icon="🚀" />;
  }
  const cols: Column<(typeof token.devTokens)[number]>[] = [
    { key: "name", header: "Token", render: (d) => <span className="font-medium">{d.ticker}</span> },
    { key: "date", header: "Launched", render: (d) => <span className="text-white/40">{timeAgo(d.launchedAt)}</span> },
    { key: "peak", header: "Peak MC", align: "right", sortable: true, sortValue: (d) => d.peakMcap, render: (d) => <span className="tnum text-white/60">{formatUsd(d.peakMcap)}</span> },
    { key: "cur", header: "Now MC", align: "right", sortable: true, sortValue: (d) => d.currentMcap, render: (d) => <span className="tnum text-white/60">{formatUsd(d.currentMcap)}</span> },
    {
      key: "outcome",
      header: "Outcome",
      align: "right",
      render: (d) => (
        <span
          className={cn(
            "text-[10px] font-semibold uppercase",
            d.outcome === "rugged" ? "text-loss" : d.outcome === "migrated" ? "text-gain" : d.outcome === "active" ? "text-mint" : "text-white/40",
          )}
        >
          {d.outcome}
        </span>
      ),
    },
  ];
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 rounded-lg bg-white/3 px-3 py-2 text-xs">
        <span className="text-white/50">Deployer rug rate:</span>
        <span className={cn("tnum font-semibold", rate > 30 ? "text-loss" : rate > 0 ? "text-warn" : "text-gain")}>
          {rate.toFixed(0)}%
        </span>
        <span className="text-white/40">({rugged}/{token.devTokens.length} rugged)</span>
      </div>
      <DataTable columns={cols} rows={token.devTokens} rowKey={(d) => d.ticker} maxHeight="360px" />
    </div>
  );
}

function PositionsTab({ token }: { token: Token }) {
  const connected = useAppStore((s) => s.wallets.length > 0);
  if (!connected) {
    return <EmptyState title="Connect a wallet to view positions" hint="Your entry, PnL, and quick-close controls appear here." icon="💼" />;
  }
  return (
    <div className="grid gap-2 sm:grid-cols-4">
      <PosCard label="Entry Avg" value={`$${(token.price * 0.7).toPrecision(4)}`} />
      <PosCard label="Current Value" value={formatUsd(1240)} />
      <PosCard label="Unrealized PnL" value={formatUsd(312)} color="text-gain" />
      <PosCard label="Realized PnL" value={formatUsd(88)} color="text-gain" />
      <div className="col-span-full flex gap-2">
        {[25, 50, 100].map((p) => (
          <button key={p} className="flex-1 rounded-lg border border-loss/30 bg-loss/10 py-2 text-sm font-semibold text-loss hover:bg-loss/20">
            Close {p}%
          </button>
        ))}
      </div>
    </div>
  );
}

function PosCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg border border-white/6 bg-white/3 p-3">
      <div className="text-[10px] uppercase text-white/40">{label}</div>
      <div className={cn("tnum text-base font-semibold", color)}>{value}</div>
    </div>
  );
}

