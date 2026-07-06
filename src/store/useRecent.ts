"use client";

import { create } from "zustand";

export interface RecentToken {
  id: string;
  ticker: string;
  logo: string;
}

const KEY = "molten:recent";

function load(): RecentToken[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

interface RecentState {
  recent: RecentToken[];
  hydrate: () => void;
  add: (t: RecentToken) => void;
}

export const useRecent = create<RecentState>((set, get) => ({
  recent: [],
  hydrate: () => set({ recent: load() }),
  add: (t) =>
    set(() => {
      const next = [t, ...get().recent.filter((x) => x.id !== t.id)].slice(0, 12);
      if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(next));
      return { recent: next };
    }),
}));
