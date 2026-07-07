"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { WalletButton } from "@/components/wallet/WalletButton";
import { WalletLink } from "@/components/wallet/WalletLink";
import { formatUsd, truncateAddress, timeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Copy, Bell, Trash2, Users } from "lucide-react";

interface CopyConfig {
  id: string;
  sourceAddress: string;
  sourceName?: string | null;
  ratio: number;
  maxPerTradeHype: number;
  dailyCapHype: number;
  maxRisk: number;
  active: boolean;
}
interface AlertConfig {
  id: string;
  sourceAddress: string;
  sourceName?: string | null;
  onBuy: boolean;
  onSell: boolean;
  minUsd: number;
}
interface LogRow {
  id: string;
  sourceName?: string | null;
  sourceAddress: string;
  ticker: string;
  side: string;
  usd: number;
  execPrice: number;
  ts: string;
}

export default function CopyTradingPage() {
  const connected = useAppStore((s) => s.wallets.length > 0);
  const [configs, setConfigs] = useState<CopyConfig[]>([]);
  const [alerts, setAlerts] = useState<AlertConfig[]>([]);
  const [log, setLog] = useState<LogRow[]>([]);

  const load = () => {
    fetch("/api/copy-trade").then((r) => r.json()).then((d) => {
      setConfigs(d.configs ?? []);
      setLog(d.log ?? []);
    });
    fetch("/api/alerts").then((r) => r.json()).then((d) => setAlerts(d.configs ?? []));
  };

  useEffect(() => {
    if (connected) load();
    const i = setInterval(() => connected && load(), 15000);
    return () => clearInterval(i);
  }, [connected]);

  const removeCopy = async (address: string) => {
    await fetch(`/api/copy-trade?address=${encodeURIComponent(address)}`, { method: "DELETE" });
    load();
  };
  const removeAlert = async (address: string) => {
    await fetch(`/api/alerts?address=${encodeURIComponent(address)}`, { method: "DELETE" });
    load();
  };

  if (!connected) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-mint">
          <Copy size={24} />
        </div>
        <h1 className="text-xl font-bold">Copy trading & alerts</h1>
        <p className="mt-2 text-sm text-white/50">
          Connect a wallet, then mirror KOLs and smart money automatically. Open any wallet and hit
          Copy Trade or Set Alert.
        </p>
        <div className="mt-5 flex justify-center">
          <WalletButton />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-5">
      <div className="mb-4 flex items-center gap-2">
        <Users size={20} className="text-mint" />
        <h1 className="text-xl font-bold">Copy Trading & Alerts</h1>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="panel-flat">
          <div className="flex items-center gap-1.5 border-b border-white/6 px-3 py-2.5 text-sm font-semibold">
            <Copy size={14} /> Active copies
          </div>
          {configs.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-white/30">
              No copy configs. Open a KOL and hit “Copy Trade”.
            </div>
          ) : (
            <div className="divide-y divide-white/4">
              {configs.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-3 py-2.5 text-xs">
                  <div>
                    <div className="font-medium">{c.sourceName ?? truncateAddress(c.sourceAddress, 5)}</div>
                    <div className="text-[10px] text-white/40">
                      {(c.ratio * 100).toFixed(0)}% size · max {c.maxPerTradeHype} HYPE · cap {c.dailyCapHype} · risk ≤ {c.maxRisk}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", c.active ? "bg-gain" : "bg-white/30")} />
                    <button onClick={() => removeCopy(c.sourceAddress)} className="text-white/30 hover:text-loss">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel-flat">
          <div className="flex items-center gap-1.5 border-b border-white/6 px-3 py-2.5 text-sm font-semibold">
            <Bell size={14} /> Buy alerts
          </div>
          {alerts.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-white/30">
              No alerts. Open a wallet and hit “Set Alert”.
            </div>
          ) : (
            <div className="divide-y divide-white/4">
              {alerts.map((a) => (
                <div key={a.id} className="flex items-center justify-between px-3 py-2.5 text-xs">
                  <div>
                    <div className="font-medium">{a.sourceName ?? truncateAddress(a.sourceAddress, 5)}</div>
                    <div className="text-[10px] text-white/40">
                      {a.onBuy ? "buys" : ""}{a.onBuy && a.onSell ? " + " : ""}{a.onSell ? "sells" : ""} · min ${a.minUsd}
                    </div>
                  </div>
                  <button onClick={() => removeAlert(a.sourceAddress)} className="text-white/30 hover:text-loss">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="panel-flat mt-3">
        <div className="border-b border-white/6 px-3 py-2.5 text-sm font-semibold">Copy trade log</div>
        {log.length === 0 ? (
          <div className="px-3 py-8 text-center text-xs text-white/30">
            No mirrored trades yet. The engine fires when a copied wallet trades.
          </div>
        ) : (
          <table className="w-full text-xs">
            <tbody>
              {log.map((l) => (
                <tr key={l.id} className="border-b border-white/4">
                  <td className="px-3 py-2 text-white/50">{l.sourceName ?? truncateAddress(l.sourceAddress, 4)}</td>
                  <td className="px-3 py-2 text-white/30">→</td>
                  <td className="px-3 py-2 font-medium">{l.ticker}</td>
                  <td className={cn("px-3 py-2 uppercase", l.side === "buy" ? "text-gain" : "text-loss")}>{l.side}</td>
                  <td className="tnum px-3 py-2 text-right">{formatUsd(l.usd)}</td>
                  <td className="tnum px-3 py-2 text-right text-white/40">${l.execPrice.toPrecision(4)}</td>
                  <td className="px-3 py-2 text-right text-white/30">{timeAgo(new Date(l.ts).getTime())}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
