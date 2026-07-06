"use client";

import { useState } from "react";
import type { Token } from "@/lib/types";
import { riskColor } from "@/lib/safety";
import { WalletLink } from "@/components/wallet/WalletLink";
import { formatUsd, truncateAddress, compactNumber } from "@/lib/format";
import { cn } from "@/lib/cn";
import {
  Copy,
  ExternalLink,
  Check,
  ChevronDown,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "safe" | "caution" | "danger" | "neutral";
}) {
  const color =
    tone === "safe" ? "text-gain" : tone === "caution" ? "text-warn" : tone === "danger" ? "text-loss" : "text-white/70";
  return (
    <div className="rounded-md bg-white/3 px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-white/35">{label}</div>
      <div className={cn("tnum text-sm font-semibold", color)}>{value}</div>
    </div>
  );
}

function tone(v: number, warn: number, danger: number): "safe" | "caution" | "danger" {
  if (v >= danger) return "danger";
  if (v >= warn) return "caution";
  return "safe";
}

export function SafetyPanel({ token }: { token: Token }) {
  const [copied, setCopied] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const s = token.safety;
  const risk = token.risk;

  const copy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Risk score header */}
      <div className="panel-flat p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-white/50">Risk Score</span>
          <span className={cn("flex items-center gap-1 text-xs font-semibold", riskColor(risk.level))}>
            {risk.level === "safe" ? <ShieldCheck size={13} /> : risk.level === "caution" ? <AlertTriangle size={13} /> : <ShieldAlert size={13} />}
            {risk.level.toUpperCase()}
          </span>
        </div>
        <div className="mt-2 flex items-end gap-2">
          <span className={cn("tnum text-3xl font-bold", riskColor(risk.level))}>{risk.score}</span>
          <span className="mb-1 text-xs text-white/30">/ 100</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8">
          <div
            className={cn(
              "h-full rounded-full",
              risk.level === "safe" ? "bg-gain" : risk.level === "caution" ? "bg-warn" : "bg-loss",
            )}
            style={{ width: `${risk.score}%` }}
          />
        </div>
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-2 flex w-full items-center justify-between text-[11px] text-white/40 hover:text-white/70"
        >
          Breakdown
          <ChevronDown size={13} className={cn("transition-transform", expanded && "rotate-180")} />
        </button>
        {expanded && (
          <div className="mt-2 space-y-1.5">
            {risk.factors.map((f) => (
              <div key={f.key} className="text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">{f.label}</span>
                  <span className={cn("tnum", f.score > 60 ? "text-loss" : f.score > 30 ? "text-warn" : "text-gain")}>
                    +{f.contribution.toFixed(1)}
                  </span>
                </div>
                <div className="text-[10px] text-white/30">{f.detail}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Metric grid */}
      <div className="panel-flat p-3">
        <div className="mb-2 text-xs font-medium text-white/50">Token Info</div>
        <div className="grid grid-cols-2 gap-1.5">
          <Metric label="Top 10" value={`${s.top10Pct.toFixed(1)}%`} tone={tone(s.top10Pct, 25, 40)} />
          <Metric label="Dev" value={`${s.devHoldingsPct.toFixed(1)}%`} tone={tone(s.devHoldingsPct, 5, 10)} />
          <Metric label="Snipers" value={`${s.snipersPct.toFixed(1)}%`} tone={tone(s.snipersPct, 10, 20)} />
          <Metric label="Insiders" value={`${s.insidersPct.toFixed(1)}%`} tone={tone(s.insidersPct, 8, 15)} />
          <Metric label="Bundlers" value={`${s.bundlersPct.toFixed(1)}%`} tone={tone(s.bundlersPct, 8, 15)} />
          <Metric label="Fresh" value={`${s.freshWalletPct.toFixed(1)}%`} tone={tone(s.freshWalletPct, 25, 40)} />
          <Metric label="LP Burned" value={`${s.lpBurnedPct.toFixed(0)}%`} tone={s.lpBurnedPct >= 99 ? "safe" : s.lpBurnedPct > 50 ? "caution" : "danger"} />
          <Metric label="Holders" value={compactNumber(s.holders)} tone="neutral" />
          <Metric label="Pro Traders" value={String(token.proTraders)} tone="neutral" />
          <Metric label="Dex Paid" value={s.dexPaid ? "Yes" : "No"} tone={s.dexPaid ? "safe" : "caution"} />
          <Metric label="Mint" value={s.mintRevoked ? "Revoked" : "LIVE"} tone={s.mintRevoked ? "safe" : "danger"} />
          <Metric label="Freeze" value={s.freezeRevoked ? "Revoked" : "LIVE"} tone={s.freezeRevoked ? "safe" : "danger"} />
        </div>
        <div className="mt-2 flex items-center gap-1.5 rounded-md bg-white/3 px-2 py-1.5 text-[11px]">
          {s.sellable ? (
            <span className="flex items-center gap-1 text-gain">
              <ShieldCheck size={12} /> Sell simulation passed — token is sellable
            </span>
          ) : (
            <span className="flex items-center gap-1 text-loss">
              <ShieldAlert size={12} /> HONEYPOT — sell simulation failed
            </span>
          )}
        </div>
      </div>

      {/* Addresses */}
      <div className="panel-flat p-3 text-xs">
        <AddressRow
          label="Contract (CA)"
          value={token.contract}
          copied={copied === "ca"}
          onCopy={() => copy(token.contract, "ca")}
        />
        <div className="my-2 border-t border-white/6" />
        <div className="flex items-center justify-between">
          <span className="text-white/40">Deployer (DA)</span>
          <div className="flex items-center gap-1">
            <WalletLink address={token.deployer} tokenId={token.id} />
            <button onClick={() => copy(token.deployer, "da")} className="text-white/30 hover:text-white">
              {copied === "da" ? <Check size={12} className="text-gain" /> : <Copy size={12} />}
            </button>
            <ExternalLink size={12} className="text-white/30" />
          </div>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-white/40">
          <span>Prev tokens</span>
          <span className="tnum">
            {s.deployerPrevTokens}{" "}
            {s.deployerPrevTokens > 0 && (
              <span className={s.deployerRugCount > 0 ? "text-loss" : "text-gain"}>
                ({((s.deployerRugCount / Math.max(1, s.deployerPrevTokens)) * 100).toFixed(0)}% rug)
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

function AddressRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/40">{label}</span>
      <div className="flex items-center gap-1">
        <span className="tnum text-white/70">{truncateAddress(value, 5)}</span>
        <button onClick={onCopy} className="text-white/30 hover:text-white">
          {copied ? <Check size={12} className="text-gain" /> : <Copy size={12} />}
        </button>
        <ExternalLink size={12} className="text-white/30" />
      </div>
    </div>
  );
}
