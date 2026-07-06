"use client";

import { useMemo, useState } from "react";
import type { Token } from "@/lib/types";
import { quoteBuy, quoteSell } from "@/lib/curve";
import { useAppStore } from "@/store/useAppStore";
import { constants } from "@/lib/mock";
import { formatHype, compactNumber, formatPct } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Zap, Settings2, ChevronDown } from "lucide-react";

const ORDER_TYPES = ["Market", "Limit", "TWAP", "Stop-Loss", "Take-Profit"] as const;
const QUICK_HYPE = [0.1, 0.5, 1, 5];
const QUICK_PCT = [25, 50, 75, 100];

export function TradeWidget({ token }: { token: Token }) {
  const { presets, activePreset, setActivePreset, updatePreset, instantTrade, toggleInstant, wallets } =
    useAppStore();
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState<(typeof ORDER_TYPES)[number]>("Market");
  const [amount, setAmount] = useState("0.5");
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const preset = presets.find((p) => p.id === activePreset)!;
  const numAmount = parseFloat(amount) || 0;
  const connected = wallets.length > 0;

  const quote = useMemo(() => {
    if (numAmount <= 0) return null;
    if (side === "buy") {
      const q = quoteBuy(token.curve, numAmount);
      return {
        received: q.tokensOut,
        receivedLabel: `${compactNumber(q.tokensOut)} ${token.ticker}`,
        impact: q.priceImpactPct,
        avg: q.avgPrice * constants.HYPE_USD,
      };
    }
    // sell: amount is in HYPE-equiv percentage handled elsewhere; treat as token amount for demo
    const tokensIn = numAmount * 1_000_000;
    const q = quoteSell(token.curve, tokensIn);
    return {
      received: q.hypeOut,
      receivedLabel: `${formatHype(q.hypeOut)} HYPE`,
      impact: q.priceImpactPct,
      avg: q.avgPrice * constants.HYPE_USD,
    };
  }, [numAmount, side, token]);

  const fire = () => {
    setToast(`${side === "buy" ? "Bought" : "Sold"} ${amount} ${side === "buy" ? "HYPE of" : ""} ${token.ticker}`);
    setTimeout(() => setToast(null), 2200);
  };

  return (
    <div className="panel-flat flex flex-col p-3">
      {/* Buy/Sell tabs */}
      <div className="flex rounded-lg bg-white/5 p-0.5">
        {(["buy", "sell"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSide(s)}
            className={cn(
              "flex-1 rounded-md py-1.5 text-sm font-semibold capitalize transition-colors",
              side === s
                ? s === "buy"
                  ? "bg-gain/20 text-gain"
                  : "bg-loss/20 text-loss"
                : "text-white/40 hover:text-white/70",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Presets */}
      <div className="mt-3 flex items-center gap-1">
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setActivePreset(p.id);
              setAmount(String(p.amount));
            }}
            className={cn(
              "flex-1 rounded-md border py-1 text-[11px] font-medium transition-colors",
              activePreset === p.id
                ? "border-mint/40 bg-mint/15 text-mint"
                : "border-white/8 text-white/50 hover:text-white/80",
            )}
            title={`${p.amount} HYPE · ${p.slippage}% slip · ${p.priority} prio`}
          >
            {p.name}
          </button>
        ))}
        <button
          onClick={() => setShowSettings((s) => !s)}
          className="rounded-md border border-white/8 p-1.5 text-white/40 hover:text-white"
        >
          <Settings2 size={13} />
        </button>
      </div>

      {showSettings && (
        <div className="mt-2 space-y-2 rounded-lg border border-white/8 bg-white/3 p-2 text-[11px]">
          <div className="text-white/50">Editing {preset.name}</div>
          <SettingRow label="Amount (HYPE)" value={preset.amount} onChange={(v) => updatePreset(preset.id, { amount: v })} step={0.1} />
          <SettingRow label="Slippage %" value={preset.slippage} onChange={(v) => updatePreset(preset.id, { slippage: v })} step={1} />
          <SettingRow label="Priority" value={preset.priority} onChange={(v) => updatePreset(preset.id, { priority: v })} step={0.001} />
        </div>
      )}

      {/* Order type */}
      <div className="mt-3 flex flex-wrap gap-1">
        {ORDER_TYPES.map((o) => (
          <button
            key={o}
            onClick={() => setOrderType(o)}
            className={cn(
              "rounded px-2 py-1 text-[10px] font-medium transition-colors",
              orderType === o ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70",
            )}
          >
            {o}
          </button>
        ))}
      </div>

      {/* Amount input */}
      <div className="mt-3">
        <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/3 px-3 py-2.5">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            className="tnum flex-1 bg-transparent text-lg font-semibold outline-none"
          />
          <span className="text-sm font-medium text-white/40">{side === "buy" ? "HYPE" : token.ticker}</span>
        </div>
        <div className="mt-1.5 flex gap-1">
          {(side === "buy" ? QUICK_HYPE : QUICK_PCT).map((q) => (
            <button
              key={q}
              onClick={() => setAmount(String(q))}
              className="flex-1 rounded-md border border-white/8 py-1 text-[11px] text-white/50 hover:border-mint/30 hover:text-mint"
            >
              {side === "buy" ? q : `${q}%`}
            </button>
          ))}
        </div>
      </div>

      {/* Quote preview */}
      {quote && (
        <div className="mt-3 space-y-1 rounded-lg border border-white/6 bg-white/3 p-2.5 text-[11px]">
          <QuoteRow label="Est. received" value={quote.receivedLabel} strong />
          <QuoteRow label="Avg price" value={`$${quote.avg.toPrecision(4)}`} />
          <QuoteRow
            label="Price impact"
            value={formatPct(side === "buy" ? quote.impact : -quote.impact, false)}
            className={quote.impact > 5 ? "text-warn" : "text-white/60"}
          />
          <QuoteRow label="Slippage" value={`${preset.slippage}%`} />
        </div>
      )}

      {/* Instant toggle */}
      <label className="mt-3 flex items-center justify-between rounded-lg border border-white/8 bg-white/3 px-2.5 py-1.5 text-[11px]">
        <span className="flex items-center gap-1.5 text-white/60">
          <Zap size={12} className="text-mint" /> Instant Trade (no confirm)
        </span>
        <button
          onClick={toggleInstant}
          className={cn("h-4 w-7 rounded-full p-0.5 transition-colors", instantTrade ? "bg-mint" : "bg-white/15")}
        >
          <span className={cn("block h-3 w-3 rounded-full bg-base-900 transition-transform", instantTrade && "translate-x-3")} />
        </button>
      </label>

      {/* Action */}
      <button
        onClick={fire}
        disabled={!connected}
        className={cn(
          "mt-3 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40",
          side === "buy" ? "bg-gain text-base-900 hover:bg-gain/90" : "bg-loss text-white hover:bg-loss/90",
        )}
      >
        {instantTrade && <Zap size={15} />}
        {!connected ? "Connect wallet to trade" : `${side === "buy" ? "Buy" : "Sell"} ${token.ticker}`}
      </button>

      {toast && (
        <div className="mt-2 rounded-md bg-gain/15 px-2 py-1.5 text-center text-[11px] text-gain">{toast}</div>
      )}
    </div>
  );
}

function SettingRow({ label, value, onChange, step }: { label: string; value: number; onChange: (v: number) => void; step: number }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-white/50">{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="tnum w-20 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-right outline-none"
      />
    </div>
  );
}

function QuoteRow({ label, value, strong, className }: { label: string; value: string; strong?: boolean; className?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/40">{label}</span>
      <span className={cn("tnum", strong ? "font-semibold text-white" : "text-white/60", className)}>{value}</span>
    </div>
  );
}
