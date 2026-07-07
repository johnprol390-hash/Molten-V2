"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Modal } from "@/components/ui/Modal";
import { truncateAddress } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Copy, Bell, Check } from "lucide-react";

export function TrackingConfigModal() {
  const { trackingTarget, trackingMode, closeTracking } = useAppStore();
  const [mode, setMode] = useState<"copy" | "alert">("copy");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  // Copy config
  const [ratio, setRatio] = useState(0.1);
  const [maxPerTrade, setMaxPerTrade] = useState(1);
  const [dailyCap, setDailyCap] = useState(10);
  const [maxRisk, setMaxRisk] = useState(66);
  const [requireLp, setRequireLp] = useState(false);
  const [copySell, setCopySell] = useState(true);

  // Alert config
  const [onBuy, setOnBuy] = useState(true);
  const [onSell, setOnSell] = useState(false);
  const [minUsd, setMinUsd] = useState(0);
  const [firstBuyOnly, setFirstBuyOnly] = useState(false);

  useEffect(() => {
    if (trackingTarget) {
      setMode(trackingMode);
      setDone(false);
    }
  }, [trackingTarget, trackingMode]);

  if (!trackingTarget) return null;
  const { address, name } = trackingTarget;

  const save = async () => {
    setSaving(true);
    try {
      if (mode === "copy") {
        await fetch("/api/copy-trade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceAddress: address,
            sourceName: name,
            ratio,
            maxPerTradeHype: maxPerTrade,
            dailyCapHype: dailyCap,
            maxRisk,
            requireLpBurned: requireLp,
            copySell,
          }),
        });
      } else {
        await fetch("/api/alerts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sourceAddress: address, sourceName: name, onBuy, onSell, minUsd, firstBuyOnly }),
        });
      }
      setDone(true);
      setTimeout(closeTracking, 900);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={!!trackingTarget} onClose={closeTracking} title={`Track ${name ?? truncateAddress(address, 5)}`} bottomSheetOnMobile>
      <div className="mb-4 flex rounded-lg bg-white/5 p-0.5">
        <Tab active={mode === "copy"} onClick={() => setMode("copy")} icon={<Copy size={13} />} label="Copy Trade" />
        <Tab active={mode === "alert"} onClick={() => setMode("alert")} icon={<Bell size={13} />} label="Buy Alert" />
      </div>

      {mode === "copy" ? (
        <div className="space-y-3">
          <Range label={`Copy size: ${(ratio * 100).toFixed(0)}% of their trade`} min={1} max={200} value={ratio * 100} onChange={(v) => setRatio(v / 100)} />
          <Num label="Max per trade (HYPE)" value={maxPerTrade} onChange={setMaxPerTrade} step={0.1} />
          <Num label="Daily budget cap (HYPE)" value={dailyCap} onChange={setDailyCap} step={1} />
          <Range label={`Skip if Risk Score > ${maxRisk}`} min={10} max={100} value={maxRisk} onChange={setMaxRisk} />
          <Toggle label="Only copy LP-burned tokens" value={requireLp} onChange={setRequireLp} />
          <Toggle label="Copy sells too" value={copySell} onChange={setCopySell} />
        </div>
      ) : (
        <div className="space-y-3">
          <Toggle label="Alert on buys" value={onBuy} onChange={setOnBuy} />
          <Toggle label="Alert on sells" value={onSell} onChange={setOnSell} />
          <Num label="Minimum trade size ($)" value={minUsd} onChange={setMinUsd} step={100} />
          <Toggle label="First-buy only (new tokens)" value={firstBuyOnly} onChange={setFirstBuyOnly} />
        </div>
      )}

      <button
        onClick={save}
        disabled={saving || done}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-mint py-2.5 text-sm font-bold text-base-900 hover:bg-mint-400 disabled:opacity-60"
      >
        {done ? <Check size={15} /> : null}
        {done ? "Saved" : saving ? "Saving…" : mode === "copy" ? "Start Copy Trading" : "Enable Alert"}
      </button>
      <p className="mt-2 text-center text-[10px] text-white/30">
        The tracking engine mirrors {name ?? "this wallet"}'s activity in near-real-time.
      </p>
    </Modal>
  );
}

function Tab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-semibold",
        active ? "bg-mint/20 text-mint" : "text-white/40 hover:text-white/70",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function Range({ label, min, max, value, onChange }: { label: string; min: number; max: number; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] text-white/50">{label}</label>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-mint" />
    </div>
  );
}

function Num({ label, value, onChange, step }: { label: string; value: number; onChange: (v: number) => void; step: number }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="text-[11px] text-white/50">{label}</label>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="tnum w-28 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-right text-sm outline-none"
      />
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-white/50">{label}</span>
      <button onClick={() => onChange(!value)} className={cn("h-5 w-9 rounded-full p-0.5 transition-colors", value ? "bg-mint" : "bg-white/15")}>
        <span className={cn("block h-4 w-4 rounded-full bg-base-900 transition-transform", value && "translate-x-4")} />
      </button>
    </div>
  );
}
