"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Token } from "@/lib/types";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { formatUsd, formatPct, compactNumber, pnlColor } from "@/lib/format";
import { cn } from "@/lib/cn";
import { GitCompareArrows } from "lucide-react";

const ROWS: { label: string; get: (t: Token) => string; danger?: (t: Token) => boolean }[] = [
  { label: "Price", get: (t) => formatUsd(t.price, { decimals: 6 }) },
  { label: "Market Cap", get: (t) => formatUsd(t.mcap) },
  { label: "24h Volume", get: (t) => formatUsd(t.volume24h) },
  { label: "Holders", get: (t) => compactNumber(t.holders) },
  { label: "Bonding %", get: (t) => `${t.bondingPct.toFixed(1)}%` },
  { label: "Top 10 %", get: (t) => `${t.safety.top10Pct.toFixed(1)}%`, danger: (t) => t.safety.top10Pct > 40 },
  { label: "Dev %", get: (t) => `${t.safety.devHoldingsPct.toFixed(1)}%`, danger: (t) => t.safety.devHoldingsPct > 8 },
  { label: "Snipers %", get: (t) => `${t.safety.snipersPct.toFixed(1)}%`, danger: (t) => t.safety.snipersPct > 15 },
  { label: "Insiders %", get: (t) => `${t.safety.insidersPct.toFixed(1)}%`, danger: (t) => t.safety.insidersPct > 10 },
  { label: "LP Burned %", get: (t) => `${t.safety.lpBurnedPct.toFixed(0)}%`, danger: (t) => t.safety.lpBurnedPct < 99 },
  { label: "Mint", get: (t) => (t.safety.mintRevoked ? "Revoked" : "LIVE"), danger: (t) => !t.safety.mintRevoked },
  { label: "Dex Paid", get: (t) => (t.safety.dexPaid ? "Yes" : "No"), danger: (t) => !t.safety.dexPaid },
];

export default function ComparePage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [a, setA] = useState<string>("");
  const [b, setB] = useState<string>("");

  useEffect(() => {
    fetch("/api/tokens")
      .then((r) => r.json())
      .then((d) => {
        setTokens(d.tokens ?? []);
        setA(d.tokens?.[0]?.id ?? "");
        setB(d.tokens?.[1]?.id ?? "");
      });
  }, []);

  const ta = tokens.find((t) => t.id === a);
  const tb = tokens.find((t) => t.id === b);

  return (
    <div className="mx-auto max-w-[900px] px-4 py-5">
      <div className="mb-4 flex items-center gap-2">
        <GitCompareArrows size={20} className="text-mint" />
        <h1 className="text-xl font-bold">Token Comparison</h1>
      </div>

      <div className="panel-flat overflow-hidden">
        <div className="grid grid-cols-3 border-b border-white/6">
          <div className="p-3 text-xs text-white/40">Metric</div>
          {[
            { val: a, set: setA },
            { val: b, set: setB },
          ].map((col, i) => (
            <div key={i} className="border-l border-white/6 p-3">
              <select
                value={col.val}
                onChange={(e) => col.set(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm outline-none"
              >
                {tokens.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.logo} {t.ticker}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {ta && tb && (
          <>
            <div className="grid grid-cols-3 border-b border-white/6 bg-white/3">
              <div className="p-3 text-xs text-white/40">Risk Score</div>
              {[ta, tb].map((t) => (
                <div key={t.id} className="flex items-center justify-center border-l border-white/6 p-3">
                  <RiskBadge risk={t.risk} />
                </div>
              ))}
            </div>
            {ROWS.map((row) => (
              <div key={row.label} className="grid grid-cols-3 border-b border-white/4 last:border-0">
                <div className="p-2.5 text-xs text-white/50">{row.label}</div>
                {[ta, tb].map((t) => (
                  <div
                    key={t.id}
                    className={cn("tnum border-l border-white/6 p-2.5 text-center text-sm", row.danger?.(t) ? "text-loss" : "text-white/80")}
                  >
                    {row.get(t)}
                  </div>
                ))}
              </div>
            ))}
            <div className="grid grid-cols-3 p-3">
              <div />
              {[ta, tb].map((t) => (
                <Link key={t.id} href={`/token/${t.id}`} className="mx-2 rounded-lg bg-mint/15 py-1.5 text-center text-xs font-semibold text-mint hover:bg-mint/25">
                  Open {t.ticker}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
