"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Token } from "@/lib/types";
import { PriceChart } from "@/components/token/PriceChart";
import { formatUsd, formatPct, pnlColor } from "@/lib/format";
import { LayoutGrid } from "lucide-react";

export default function MultiChartPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [slots, setSlots] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/tokens")
      .then((r) => r.json())
      .then((d) => {
        setTokens(d.tokens ?? []);
        setSlots((d.tokens ?? []).slice(0, 4).map((t: Token) => t.id));
      });
  }, []);

  const setSlot = (i: number, id: string) => setSlots((s) => s.map((v, idx) => (idx === i ? id : v)));

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-5">
      <div className="mb-4 flex items-center gap-2">
        <LayoutGrid size={20} className="text-mint" />
        <h1 className="text-xl font-bold">Multi-Chart</h1>
        <span className="text-xs text-white/40">Watch up to 4 tokens at once</span>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {slots.map((id, i) => {
          const t = tokens.find((x) => x.id === id);
          return (
            <div key={i} className="panel-flat flex h-[340px] flex-col">
              <div className="flex items-center justify-between border-b border-white/6 px-3 py-2">
                <select
                  value={id}
                  onChange={(e) => setSlot(i, e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm outline-none"
                >
                  {tokens.map((tk) => (
                    <option key={tk.id} value={tk.id}>
                      {tk.logo} {tk.ticker}
                    </option>
                  ))}
                </select>
                {t && (
                  <div className="flex items-center gap-3 text-xs">
                    <span className="tnum">{formatUsd(t.price, { decimals: 6 })}</span>
                    <span className={`tnum ${pnlColor(t.change24h)}`}>{formatPct(t.change24h)}</span>
                    <Link href={`/token/${t.id}`} className="text-mint hover:underline">
                      Trade
                    </Link>
                  </div>
                )}
              </div>
              <div className="flex-1">{t && <PriceChart key={t.id} candles={t.candles} />}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
