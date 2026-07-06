"use client";

import { useEffect, useRef } from "react";
import { usePrefs } from "@/store/usePrefs";
import { useRealtime } from "@/store/useRealtime";

// Applies user preferences globally and plays sound alerts on live fills.
export function PrefsEffects() {
  const hydrate = usePrefs((s) => s.hydrate);
  const hydrated = usePrefs((s) => s.hydrated);
  const reducedMotion = usePrefs((s) => s.reducedMotion);
  const liteMode = usePrefs((s) => s.liteMode);
  const accent = usePrefs((s) => s.accent);
  const soundAlerts = usePrefs((s) => s.soundAlerts);
  const lastTrade = useRealtime((s) => s.lastTrade);
  const audioCtx = useRef<AudioContext | null>(null);
  const seen = useRef<number>(0);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.classList.toggle("reduce-motion", reducedMotion);
    root.classList.toggle("lite", liteMode);
    root.style.setProperty("--accent", accent);
  }, [hydrated, reducedMotion, liteMode, accent]);

  // Sound alert on new trade (#42).
  useEffect(() => {
    if (!soundAlerts || !lastTrade || lastTrade.ts === seen.current) return;
    seen.current = lastTrade.ts;
    try {
      audioCtx.current ??= new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = lastTrade.side === "buy" ? 660 : 440;
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {
      /* audio unavailable */
    }
  }, [lastTrade, soundAlerts]);

  return null;
}
