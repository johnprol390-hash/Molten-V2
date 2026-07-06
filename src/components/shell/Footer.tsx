"use client";

import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/cn";
import { Activity } from "lucide-react";
import { constants } from "@/lib/mock";

export function Footer() {
  const connection = useAppStore((s) => s.connection);
  const label =
    connection === "connected"
      ? "Connection is stable"
      : connection === "reconnecting"
        ? "Reconnecting…"
        : "Offline";
  const color =
    connection === "connected" ? "text-gain" : connection === "reconnecting" ? "text-warn" : "text-loss";

  return (
    <footer className="border-t border-white/6 bg-base-950/60">
      <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-2 px-4 py-3 text-[11px] text-white/40 sm:flex-row">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Activity size={12} className="text-mint" />
            Hyperliquid
          </span>
          <span className="tnum">HYPE ${constants.HYPE_USD.toFixed(2)}</span>
          <span className="tnum">Block #24,183,204</span>
        </div>
        <div className={cn("flex items-center gap-1.5 font-medium", color)}>
          <span className={cn("h-1.5 w-1.5 rounded-full bg-current", connection === "connected" && "animate-pulse-dot")} />
          {label}
        </div>
      </div>
    </footer>
  );
}
