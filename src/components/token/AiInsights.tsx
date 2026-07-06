"use client";

import type { Token } from "@/lib/types";
import { Sparkles } from "lucide-react";

export function AiInsights({ token }: { token: Token }) {
  const s = token.safety;
  const flags: string[] = [];
  if (s.top10Pct > 40) flags.push(`Top 10 wallets control ${s.top10Pct.toFixed(0)}% of supply — high concentration risk.`);
  if (s.snipersPct > 15) flags.push(`${s.snipersPct.toFixed(0)}% held by launch snipers who may dump early.`);
  if (s.insidersPct > 10) flags.push(`${s.insidersPct.toFixed(0)}% held by wallets linked to the deployer.`);
  if (s.lpBurnedPct < 99) flags.push(`Only ${s.lpBurnedPct.toFixed(0)}% of LP is burned — rug risk elevated.`);
  if (!s.mintRevoked) flags.push("Mint authority is still live — supply can be inflated.");
  if (flags.length === 0) flags.push("No major red flags detected in current on-chain data.");

  const momentum =
    token.change24h > 50 ? "strong upward" : token.change24h > 0 ? "mild positive" : token.change24h > -30 ? "cooling" : "sharp downward";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-ai">
        <Sparkles size={15} /> AI Analysis
      </div>
      <div className="rounded-lg border border-ai/20 bg-ai/5 p-4 text-sm leading-relaxed text-white/70">
        <p>
          <span className="font-semibold text-white">{token.name}</span> ({token.ticker}) is{" "}
          {token.bondingPct >= 100 ? "graduated and trading on the Hyperliquid orderbook" : `${token.bondingPct.toFixed(0)}% along its bonding curve`}
          , with {token.holders.toLocaleString()} holders and a {momentum} 24h momentum ({token.change24h.toFixed(0)}%).
          The composite Risk Score is <span className="font-semibold text-white">{token.risk.score}/100</span> ({token.risk.level}).
        </p>
        <div className="mt-3">
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ai/80">Red flags</div>
          <ul className="space-y-1.5">
            {flags.map((f, i) => (
              <li key={i} className="flex gap-2 text-white/60">
                <span className="text-ai">•</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="text-[10px] text-white/30">
        AI insights are generated from indexed on-chain data. Not financial advice.
      </p>
    </div>
  );
}
