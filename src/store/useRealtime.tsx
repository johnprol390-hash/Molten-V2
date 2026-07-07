"use client";

import { create } from "zustand";
import { useEffect } from "react";
import { useAppStore } from "./useAppStore";
import type { WsEvent } from "@/lib/ws-events";

// Realtime layer. Connects to the standalone ws-server when available and
// falls back to a local simulated ticker so the UI is always "live".
interface LiveTrade {
  tokenId: string;
  ticker: string;
  side: "buy" | "sell";
  amountHype: number;
  usd: number;
  price: number;
  wallet: string;
  ts: number;
}

interface RealtimeState {
  tick: number;
  now: number;
  prices: Record<string, number>;
  lastTrade: LiveTrade | null;
  transport: "ws" | "sim";
  bump: () => void;
  applyEvent: (e: WsEvent) => void;
  setTransport: (t: "ws" | "sim") => void;
}

export const useRealtime = create<RealtimeState>((set) => ({
  tick: 0,
  now: Date.now(),
  prices: {},
  lastTrade: null,
  transport: "sim",
  bump: () => set((s) => ({ tick: s.tick + 1, now: Date.now() })),
  applyEvent: (e) =>
    set((s) => {
      if (e.type === "tick") {
        return { tick: s.tick + 1, now: e.ts, prices: { ...s.prices, ...e.prices } };
      }
      if (e.type === "trade") {
        return { lastTrade: { ...e.trade, ts: e.ts } };
      }
      return {};
    }),
  setTransport: (t) => set({ transport: t }),
}));

let started = false;

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const applyEvent = useRealtime((s) => s.applyEvent);
  const bump = useRealtime((s) => s.bump);
  const setTransport = useRealtime((s) => s.setTransport);
  const setConnection = useAppStore((s) => s.setConnection);

  useEffect(() => {
    if (started) return;
    started = true;

    let ws: WebSocket | null = null;
    let simInterval: ReturnType<typeof setInterval> | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let closed = false;

    const startSim = () => {
      if (simInterval) return;
      setTransport("sim");
      simInterval = setInterval(() => bump(), 1200);
    };
    const stopSim = () => {
      if (simInterval) clearInterval(simInterval);
      simInterval = null;
    };

    const connect = () => {
      const url = process.env.NEXT_PUBLIC_WS_URL;
      if (!url || typeof window === "undefined") {
        startSim();
        return;
      }
      try {
        ws = new WebSocket(url);
      } catch {
        startSim();
        return;
      }
      ws.onopen = () => {
        stopSim();
        setTransport("ws");
        setConnection("connected");
      };
      ws.onmessage = (ev) => {
        try {
          applyEvent(JSON.parse(ev.data) as WsEvent);
        } catch {
          /* ignore malformed */
        }
      };
      ws.onclose = () => {
        if (closed) return;
        setConnection("reconnecting");
        startSim();
        reconnectTimer = setTimeout(connect, 3000);
      };
      ws.onerror = () => {
        ws?.close();
      };
    };

    // Try ws first; sim runs until (and unless) ws connects.
    startSim();
    connect();

    return () => {
      closed = true;
      stopSim();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
      started = false;
    };
  }, [applyEvent, bump, setTransport, setConnection]);

  return <>{children}</>;
}

// Deterministic per-key jitter driven by the tick, for pseudo-live numbers.
// When the ws-server supplies a real price for a token, that is used instead.
export function useLiveValue(base: number, key: string, amplitude = 0.01): number {
  const tick = useRealtime((s) => s.tick);
  let h = 0;
  const str = key + ":" + tick;
  for (let i = 0; i < str.length; i++) h = (Math.imul(h, 31) + str.charCodeAt(i)) | 0;
  const noise = ((h >>> 0) / 4294967296 - 0.5) * 2 * amplitude;
  return base * (1 + noise);
}
