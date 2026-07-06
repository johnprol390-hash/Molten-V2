"use client";

import { create } from "zustand";
import { useEffect } from "react";
import { useAppStore } from "./useAppStore";

// Simulated WebSocket layer. A single ticker drives all "live" values in the
// UI so everything updates in lockstep, mimicking a fan-out event bus.
interface RealtimeState {
  tick: number;
  now: number;
  bump: () => void;
}

export const useRealtime = create<RealtimeState>((set) => ({
  tick: 0,
  now: Date.now(),
  bump: () => set((s) => ({ tick: s.tick + 1, now: Date.now() })),
}));

let started = false;

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const bump = useRealtime((s) => s.bump);
  const setConnection = useAppStore((s) => s.setConnection);

  useEffect(() => {
    if (started) return;
    started = true;
    const interval = setInterval(() => bump(), 1200);
    // Occasional connection blips + auto-reconnect, so the footer indicator is real.
    const blip = setInterval(() => {
      if (Math.random() < 0.06) {
        setConnection("reconnecting");
        setTimeout(() => setConnection("connected"), 1600);
      }
    }, 9000);
    return () => {
      clearInterval(interval);
      clearInterval(blip);
      started = false;
    };
  }, [bump, setConnection]);

  return <>{children}</>;
}

// Deterministic per-key jitter driven by the tick, for pseudo-live numbers.
export function useLiveValue(base: number, key: string, amplitude = 0.01): number {
  const tick = useRealtime((s) => s.tick);
  let h = 0;
  const str = key + ":" + tick;
  for (let i = 0; i < str.length; i++) h = (Math.imul(h, 31) + str.charCodeAt(i)) | 0;
  const noise = ((h >>> 0) / 4294967296 - 0.5) * 2 * amplitude;
  return base * (1 + noise);
}
