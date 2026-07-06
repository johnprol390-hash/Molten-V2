"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { defaultCurve, priceAtGraduation, spotPrice } from "@/lib/curve";
import { constants } from "@/lib/mock";
import { formatUsd } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Check, Sparkles, ChevronLeft, ChevronRight, Rocket } from "lucide-react";

const STEPS = ["Identity", "Tokenomics", "Curve & Liquidity", "Socials", "Safety", "Review"];

const EMOJIS = ["🚀", "🐕", "🐸", "🌙", "🔥", "💎", "🦍", "👑", "⚡", "🌊"];

export default function LaunchPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    ticker: "",
    description: "",
    category: "Memes",
    logo: "🚀",
    supply: 1_000_000_000,
    launchType: "Standard",
    graduationHype: 420,
    virtualHype: 30,
    antiSnipe: true,
    maxBuy: 1,
    website: "",
    twitter: "",
    telegram: "",
    lpBurn: true,
    mintRevoke: true,
    freezeRevoke: true,
    devLock: false,
  });
  const [deployed, setDeployed] = useState(false);

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const aiGenerate = () => {
    const names = ["Molten Moon", "HyperShiba", "Liquid Gold", "Neon Ape", "Plasma Pump"];
    const n = names[Math.floor(Math.random() * names.length)];
    set({
      name: n,
      ticker: n.split(" ").map((w) => w[0]).join("").toUpperCase() + "X",
      description: `${n} — the most degenerate, community-driven token native to Hyperliquid. Fair launch, LP burned, straight to the moon.`,
      logo: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    });
  };

  const curve = defaultCurve({ graduationHype: form.graduationHype, virtualHype: form.virtualHype });
  const startPrice = spotPrice(curve) * constants.HYPE_USD;
  const gradPrice = priceAtGraduation(curve) * constants.HYPE_USD;

  if (deployed) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-mint/15 text-4xl shadow-glow">
          {form.logo}
        </div>
        <h1 className="text-2xl font-bold">{form.name || "Your token"} is live!</h1>
        <p className="mt-2 text-sm text-white/50">
          ${form.ticker} has been deployed to its bonding curve. Share it and watch it climb toward graduation.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/token/mdoge" className="rounded-lg bg-mint px-5 py-2.5 text-sm font-semibold text-base-900 hover:bg-mint-400">
            Open Terminal
          </Link>
          <Link href="/discover" className="rounded-lg border border-white/12 bg-white/5 px-5 py-2.5 text-sm font-semibold hover:border-mint/40">
            Discover
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-1 flex items-center gap-2">
        <Rocket size={20} className="text-mint" />
        <h1 className="text-xl font-bold">Launch a Token</h1>
      </div>
      <p className="mb-5 text-xs text-white/40">Deploy a bonding-curve token on Hyperliquid in six steps.</p>

      {/* Stepper */}
      <div className="mb-6 flex items-center gap-1 overflow-x-auto">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <button
              onClick={() => i < step && setStep(i)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium",
                i === step ? "bg-mint/15 text-mint" : i < step ? "text-white/60" : "text-white/25",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px]",
                  i < step ? "bg-mint text-base-900" : i === step ? "border border-mint text-mint" : "border border-white/15",
                )}
              >
                {i < step ? <Check size={11} /> : i + 1}
              </span>
              {s}
            </button>
            {i < STEPS.length - 1 && <ChevronRight size={13} className="text-white/20" />}
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="panel-flat p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }}
            >
              {step === 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Identity</h2>
                    <button onClick={aiGenerate} className="flex items-center gap-1.5 rounded-lg border border-ai/30 bg-ai/10 px-2.5 py-1 text-xs text-ai hover:bg-ai/20">
                      <Sparkles size={12} /> AI Generate
                    </button>
                  </div>
                  <Field label="Token Name">
                    <input value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Molten Doge" className={inputCls} />
                  </Field>
                  <Field label="Ticker">
                    <input value={form.ticker} onChange={(e) => set({ ticker: e.target.value.toUpperCase() })} placeholder="MDOGE" className={inputCls} />
                  </Field>
                  <Field label="Description">
                    <textarea value={form.description} onChange={(e) => set({ description: e.target.value })} rows={3} placeholder="What makes this token special?" className={cn(inputCls, "resize-none")} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Category">
                      <select value={form.category} onChange={(e) => set({ category: e.target.value })} className={inputCls}>
                        {["Memes", "Animals", "AI", "Culture", "Tech"].map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </Field>
                    <Field label="Logo">
                      <div className="flex flex-wrap gap-1">
                        {EMOJIS.map((e) => (
                          <button key={e} onClick={() => set({ logo: e })} className={cn("h-8 w-8 rounded-lg text-lg", form.logo === e ? "bg-mint/20 ring-1 ring-mint" : "bg-white/5")}>
                            {e}
                          </button>
                        ))}
                      </div>
                    </Field>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold">Tokenomics</h2>
                  <Field label="Total Supply">
                    <input type="number" value={form.supply} onChange={(e) => set({ supply: Number(e.target.value) })} className={inputCls} />
                  </Field>
                  <Field label="Launch Type">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {["Fair Launch", "Standard", "Presale", "Community", "AI Generated"].map((t) => (
                        <button key={t} onClick={() => set({ launchType: t })} className={cn("rounded-lg border px-3 py-2 text-xs", form.launchType === t ? "border-mint/40 bg-mint/10 text-mint" : "border-white/8 text-white/60")}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold">Curve & Liquidity</h2>
                  <Field label={`Graduation Threshold: ${form.graduationHype} HYPE`}>
                    <input type="range" min={100} max={1000} step={10} value={form.graduationHype} onChange={(e) => set({ graduationHype: Number(e.target.value) })} className="w-full accent-mint" />
                  </Field>
                  <Field label={`Initial Virtual Liquidity: ${form.virtualHype} HYPE`}>
                    <input type="range" min={10} max={100} step={5} value={form.virtualHype} onChange={(e) => set({ virtualHype: Number(e.target.value) })} className="w-full accent-mint" />
                  </Field>
                  <label className="flex items-center justify-between rounded-lg border border-white/8 bg-white/3 px-3 py-2 text-sm">
                    <span>Anti-snipe protection</span>
                    <input type="checkbox" checked={form.antiSnipe} onChange={(e) => set({ antiSnipe: e.target.checked })} className="accent-mint" />
                  </label>
                  {form.antiSnipe && (
                    <Field label={`Max buy per wallet (first 30s): ${form.maxBuy} HYPE`}>
                      <input type="range" min={0.1} max={5} step={0.1} value={form.maxBuy} onChange={(e) => set({ maxBuy: Number(e.target.value) })} className="w-full accent-mint" />
                    </Field>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold">Socials</h2>
                  <Field label="Website"><input value={form.website} onChange={(e) => set({ website: e.target.value })} placeholder="https://" className={inputCls} /></Field>
                  <Field label="Twitter / X"><input value={form.twitter} onChange={(e) => set({ twitter: e.target.value })} placeholder="@handle" className={inputCls} /></Field>
                  <Field label="Telegram"><input value={form.telegram} onChange={(e) => set({ telegram: e.target.value })} placeholder="t.me/" className={inputCls} /></Field>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold">Safety Commitments</h2>
                  {[
                    { k: "lpBurn" as const, label: "Burn LP on graduation", desc: "Liquidity locked forever — shown as a public badge." },
                    { k: "mintRevoke" as const, label: "Revoke mint authority", desc: "No new tokens can ever be minted." },
                    { k: "freezeRevoke" as const, label: "Revoke freeze authority", desc: "Holders can never be frozen." },
                    { k: "devLock" as const, label: "Dev-lock creator tokens (30d)", desc: "Your allocation is time-locked." },
                  ].map((o) => (
                    <label key={o.k} className="flex items-start justify-between gap-3 rounded-lg border border-white/8 bg-white/3 px-3 py-2.5">
                      <div>
                        <div className="text-sm font-medium">{o.label}</div>
                        <div className="text-[11px] text-white/40">{o.desc}</div>
                      </div>
                      <input type="checkbox" checked={form[o.k]} onChange={(e) => set({ [o.k]: e.target.checked } as any)} className="mt-1 accent-mint" />
                    </label>
                  ))}
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold">Review & Deploy</h2>
                  <div className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/3 p-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-2xl">{form.logo}</div>
                    <div>
                      <div className="font-semibold">{form.name || "Unnamed"} <span className="text-white/40">${form.ticker || "???"}</span></div>
                      <div className="text-xs text-white/40">{form.category} · {form.launchType}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <ReviewRow label="Supply" value={form.supply.toLocaleString()} />
                    <ReviewRow label="Graduation" value={`${form.graduationHype} HYPE`} />
                    <ReviewRow label="Start price" value={formatUsd(startPrice, { decimals: 8 })} />
                    <ReviewRow label="Grad price" value={formatUsd(gradPrice, { decimals: 8 })} />
                    <ReviewRow label="LP Burn" value={form.lpBurn ? "Yes" : "No"} />
                    <ReviewRow label="Mint Revoked" value={form.mintRevoke ? "Yes" : "No"} />
                  </div>
                  <div className="rounded-lg border border-white/8 bg-white/3 p-3 text-xs">
                    <div className="flex justify-between"><span className="text-white/40">Launch fee</span><span className="tnum">2 HYPE</span></div>
                    <div className="mt-1 flex justify-between"><span className="text-white/40">Est. network fee</span><span className="tnum">~0.01 HYPE</span></div>
                  </div>
                  <button onClick={() => setDeployed(true)} className="flex w-full items-center justify-center gap-2 rounded-lg bg-mint py-3 text-sm font-bold text-base-900 shadow-glow hover:bg-mint-400">
                    <Rocket size={16} /> Deploy Token
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Nav */}
          <div className="mt-6 flex items-center justify-between border-t border-white/6 pt-4">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex items-center gap-1 rounded-lg border border-white/8 px-3 py-1.5 text-sm text-white/60 disabled:opacity-30"
            >
              <ChevronLeft size={15} /> Back
            </button>
            {step < STEPS.length - 1 && (
              <button
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                className="flex items-center gap-1 rounded-lg bg-mint px-4 py-1.5 text-sm font-semibold text-base-900 hover:bg-mint-400"
              >
                Continue <ChevronRight size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Live preview / simulator */}
        <div className="panel-flat h-fit p-4">
          <div className="mb-3 text-xs font-medium text-white/50">Launch Simulator</div>
          <div className="flex items-center gap-2.5 rounded-lg bg-white/3 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-xl">{form.logo}</div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{form.name || "Your Token"}</div>
              <div className="tnum text-xs text-white/40">${form.ticker || "TICKER"}</div>
            </div>
          </div>
          <div className="mt-3 space-y-2 text-[11px]">
            <ReviewRow label="Start MCap" value={formatUsd(startPrice * form.supply)} />
            <ReviewRow label="Grad MCap" value={formatUsd(gradPrice * form.supply)} />
            <ReviewRow label="Multiple to grad" value={`${(gradPrice / startPrice).toFixed(1)}x`} />
          </div>
          <p className="mt-3 text-[10px] text-white/30">
            Preview updates live as you change curve parameters. Deploying is simulated.
          </p>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/8 bg-white/3 px-3 py-2 text-sm outline-none focus:border-mint/40 placeholder:text-white/25";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-white/50">{label}</label>
      {children}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-white/3 px-2.5 py-1.5">
      <span className="text-white/40">{label}</span>
      <span className="tnum font-medium">{value}</span>
    </div>
  );
}
