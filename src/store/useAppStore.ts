"use client";

import { create } from "zustand";

export interface ConnectedWallet {
  address: string;
  provider: string;
  label: string;
}

export interface TradePreset {
  id: number;
  name: string;
  amount: number;
  slippage: number;
  priority: number;
}

export interface TrackedWallet {
  address: string;
  name: string;
  emoji: string;
}

interface AppState {
  // Session / wallets
  guest: boolean;
  wallets: ConnectedWallet[];
  activeWallet: string | null;
  connect: (provider: string, address?: string) => void;
  disconnect: (address: string) => void;
  setActiveWallet: (address: string) => void;
  enterGuest: () => void;

  // Presets
  presets: TradePreset[];
  activePreset: number;
  setActivePreset: (id: number) => void;
  updatePreset: (id: number, patch: Partial<TradePreset>) => void;

  // Instant trade
  instantTrade: boolean;
  toggleInstant: () => void;

  // Tracked wallets
  tracked: TrackedWallet[];
  toggleTracked: (address: string, name?: string) => void;
  hydrateTracked: (list: TrackedWallet[]) => void;
  isTracked: (address: string) => boolean;

  // Trader quick-view modal
  traderModalAddress: string | null;
  traderModalToken?: string;
  openTraderModal: (address: string, tokenId?: string) => void;
  closeTraderModal: () => void;

  // Copy-trade / alert config modal
  trackingTarget: { address: string; name?: string } | null;
  trackingMode: "copy" | "alert";
  openTracking: (address: string, name: string | undefined, mode: "copy" | "alert") => void;
  closeTracking: () => void;

  // Connection
  connection: "connected" | "reconnecting" | "offline";
  setConnection: (c: AppState["connection"]) => void;

  // UX prefs
  streamerMode: boolean;
  toggleStreamer: () => void;
  density: "compact" | "dense" | "comfortable";
  setDensity: (d: AppState["density"]) => void;
}

function randomAddress() {
  const chars = "0123456789abcdef";
  let s = "0x";
  for (let i = 0; i < 40; i++) s += chars[Math.floor(Math.random() * 16)];
  return s;
}

export const useAppStore = create<AppState>((set, get) => ({
  guest: false,
  wallets: [],
  activeWallet: null,
  // Register an already-authenticated wallet in the UI (auth handled via SIWE).
  connect: (provider, address) =>
    set((s) => {
      const addr = address ?? randomAddress();
      if (s.wallets.some((w) => w.address.toLowerCase() === addr.toLowerCase())) {
        return { activeWallet: addr, guest: false };
      }
      const label = `${provider} ${s.wallets.length + 1}`;
      const wallets = [...s.wallets, { address: addr, provider, label }];
      return { wallets, activeWallet: addr, guest: false };
    }),
  disconnect: (address) =>
    set((s) => {
      const wallets = s.wallets.filter((w) => w.address !== address);
      if (typeof window !== "undefined" && wallets.length === 0) {
        fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
      }
      return {
        wallets,
        activeWallet: wallets[0]?.address ?? null,
      };
    }),
  setActiveWallet: (address) => set({ activeWallet: address }),
  enterGuest: () => set({ guest: true }),

  presets: [
    { id: 1, name: "P1", amount: 0.5, slippage: 15, priority: 0.001 },
    { id: 2, name: "P2", amount: 1, slippage: 20, priority: 0.003 },
    { id: 3, name: "P3", amount: 5, slippage: 30, priority: 0.01 },
  ],
  activePreset: 1,
  setActivePreset: (id) => set({ activePreset: id }),
  updatePreset: (id, patch) =>
    set((s) => ({
      presets: s.presets.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),

  instantTrade: false,
  toggleInstant: () => set((s) => ({ instantTrade: !s.instantTrade })),

  tracked: [],
  toggleTracked: (address, name) =>
    set((s) => {
      const exists = s.tracked.some((t) => t.address === address);
      if (typeof window !== "undefined") {
        if (exists) {
          fetch(`/api/tracked?address=${encodeURIComponent(address)}`, { method: "DELETE" }).catch(() => {});
        } else {
          fetch("/api/tracked", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address, name: name ?? "Wallet" }),
          }).catch(() => {});
        }
      }
      if (exists) return { tracked: s.tracked.filter((t) => t.address !== address) };
      return {
        tracked: [...s.tracked, { address, name: name ?? "Wallet", emoji: "🎯" }],
      };
    }),
  hydrateTracked: (list) => set({ tracked: list }),
  isTracked: (address) => get().tracked.some((t) => t.address === address),

  traderModalAddress: null,
  traderModalToken: undefined,
  openTraderModal: (address, tokenId) =>
    set({ traderModalAddress: address, traderModalToken: tokenId }),
  closeTraderModal: () => set({ traderModalAddress: null, traderModalToken: undefined }),

  trackingTarget: null,
  trackingMode: "copy",
  openTracking: (address, name, mode) => set({ trackingTarget: { address, name }, trackingMode: mode }),
  closeTracking: () => set({ trackingTarget: null }),

  connection: "connected",
  setConnection: (c) => set({ connection: c }),

  streamerMode: false,
  toggleStreamer: () => set((s) => ({ streamerMode: !s.streamerMode })),
  density: "dense",
  setDensity: (d) => set({ density: d }),
}));
