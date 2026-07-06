"use client";

import { create } from "zustand";

export type Currency = "USD" | "HYPE" | "EUR" | "AED";
export type Density = "compact" | "dense" | "comfortable";

export interface Prefs {
  currency: Currency;
  liteMode: boolean;
  soundAlerts: boolean;
  reducedMotion: boolean;
  density: Density;
  paperTrading: boolean;
  accent: string;
  dailyLossCap: number; // 0 = off (responsible trading, #144)
}

const DEFAULTS: Prefs = {
  currency: "USD",
  liteMode: false,
  soundAlerts: false,
  reducedMotion: false,
  density: "dense",
  paperTrading: false,
  accent: "#97FCE4",
  dailyLossCap: 0,
};

const KEY = "molten:prefs";

function load(): Prefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    return DEFAULTS;
  }
}

interface PrefsState extends Prefs {
  hydrated: boolean;
  hydrate: () => void;
  set: <K extends keyof Prefs>(key: K, value: Prefs[K]) => void;
}

export const usePrefs = create<PrefsState>((set, get) => ({
  ...DEFAULTS,
  hydrated: false,
  hydrate: () => set({ ...load(), hydrated: true }),
  set: (key, value) => {
    set({ [key]: value } as Partial<PrefsState>);
    if (typeof window !== "undefined") {
      const { hydrated, hydrate, set: _s, ...rest } = get();
      localStorage.setItem(KEY, JSON.stringify({ ...rest, [key]: value }));
    }
  },
}));
