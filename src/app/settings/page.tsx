"use client";

import { useEffect } from "react";
import { usePrefs, type Currency, type Density } from "@/store/usePrefs";
import { cn } from "@/lib/cn";
import { Settings2 } from "lucide-react";

const ACCENTS = ["#97FCE4", "#B98CFF", "#3BE38A", "#FFB84D", "#5FA8FF", "#FF7AC6"];

export default function SettingsPage() {
  const prefs = usePrefs();

  useEffect(() => {
    if (!prefs.hydrated) prefs.hydrate();
  }, [prefs]);

  return (
    <div className="mx-auto max-w-[800px] px-4 py-5">
      <div className="mb-4 flex items-center gap-2">
        <Settings2 size={20} className="text-mint" />
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      <Section title="Display">
        <Row label="Currency" hint="Show all values in your preferred currency (#40)">
          <select
            value={prefs.currency}
            onChange={(e) => prefs.set("currency", e.target.value as Currency)}
            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm outline-none"
          >
            {(["USD", "HYPE", "EUR", "AED"] as Currency[]).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Row>
        <Row label="Table density" hint="Compact / dense / comfortable rows (#118)">
          <select
            value={prefs.density}
            onChange={(e) => prefs.set("density", e.target.value as Density)}
            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm capitalize outline-none"
          >
            {(["compact", "dense", "comfortable"] as Density[]).map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </Row>
        <Row label="Accent color" hint="Theme customization (#41)">
          <div className="flex gap-1.5">
            {ACCENTS.map((a) => (
              <button
                key={a}
                onClick={() => prefs.set("accent", a)}
                className={cn("h-6 w-6 rounded-full border-2", prefs.accent === a ? "border-white" : "border-transparent")}
                style={{ background: a }}
                aria-label={`Accent ${a}`}
              />
            ))}
          </div>
        </Row>
        <Toggle label="Lite mode" hint="Simplified UI for beginners (#26)" value={prefs.liteMode} onChange={(v) => prefs.set("liteMode", v)} />
        <Toggle label="Streamer mode" hint="Hide balances & addresses for screen sharing (#43)" value={usePrefsStreamer()} onChange={setStreamer} />
      </Section>

      <Section title="Trading">
        <Toggle label="Paper trading" hint="Practice with a simulated balance (#28)" value={prefs.paperTrading} onChange={(v) => prefs.set("paperTrading", v)} />
        <Row label="Daily loss cap" hint="Lock trading after losing this much (#144). 0 = off">
          <input
            type="number"
            value={prefs.dailyLossCap}
            onChange={(e) => prefs.set("dailyLossCap", Number(e.target.value) || 0)}
            className="tnum w-28 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-right text-sm outline-none"
          />
        </Row>
      </Section>

      <Section title="Alerts & Accessibility">
        <Toggle label="Sound alerts" hint="Play a sound on trade fills & whale buys (#42)" value={prefs.soundAlerts} onChange={(v) => prefs.set("soundAlerts", v)} />
        <Toggle label="Reduced motion" hint="Minimize animations (#50)" value={prefs.reducedMotion} onChange={(v) => prefs.set("reducedMotion", v)} />
      </Section>
    </div>
  );
}

// Streamer mode lives in the app store (used by WalletLink); bridge it here.
import { useAppStore } from "@/store/useAppStore";
function usePrefsStreamer() {
  return useAppStore((s) => s.streamerMode);
}
function setStreamer() {
  useAppStore.getState().toggleStreamer();
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="panel-flat mb-3 p-4">
      <div className="mb-3 text-sm font-semibold">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm">{label}</div>
        {hint && <div className="text-[11px] text-white/40">{hint}</div>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ label, hint, value, onChange }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Row label={label} hint={hint}>
      <button
        onClick={() => onChange(!value)}
        className={cn("h-5 w-9 shrink-0 rounded-full p-0.5 transition-colors", value ? "bg-mint" : "bg-white/15")}
      >
        <span className={cn("block h-4 w-4 rounded-full bg-base-900 transition-transform", value && "translate-x-4")} />
      </button>
    </Row>
  );
}
