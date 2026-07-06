"use client";

import { useEffect, useState } from "react";
import { useRealtime } from "@/store/useRealtime";
import { cn } from "@/lib/cn";
import { Activity } from "lucide-react";

const SERVICES = [
  { name: "Web app", uptime: 99.98 },
  { name: "REST API", uptime: 99.95 },
  { name: "WebSocket feed", uptime: 99.9 },
  { name: "Indexer", uptime: 99.87 },
  { name: "Trade engine", uptime: 99.99 },
  { name: "Database", uptime: 99.99 },
];

const INCIDENTS = [
  { date: "3d ago", title: "Elevated WebSocket latency", status: "resolved" },
  { date: "12d ago", title: "Indexer lag during launch surge", status: "resolved" },
];

export default function StatusPage() {
  const transport = useRealtime((s) => s.transport);
  const [apiOk, setApiOk] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/tokens")
      .then((r) => setApiOk(r.ok))
      .catch(() => setApiOk(false));
  }, []);

  return (
    <div className="mx-auto max-w-[900px] px-4 py-5">
      <div className="mb-4 flex items-center gap-2">
        <Activity size={20} className="text-mint" />
        <h1 className="text-xl font-bold">System Status</h1>
      </div>

      <div className="panel mb-4 flex items-center gap-3 p-4">
        <span className="h-3 w-3 animate-pulse-dot rounded-full bg-gain" />
        <span className="font-semibold text-gain">All systems operational</span>
        <span className="ml-auto text-xs text-white/40">
          Realtime transport: {transport === "ws" ? "WebSocket" : "simulated"} · API: {apiOk === null ? "…" : apiOk ? "OK" : "down"}
        </span>
      </div>

      <div className="panel-flat mb-4">
        {SERVICES.map((s) => (
          <div key={s.name} className="flex items-center justify-between border-b border-white/4 px-4 py-3 last:border-0">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gain" />
              <span className="text-sm">{s.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5">
                {Array.from({ length: 30 }).map((_, i) => (
                  <span key={i} className={cn("h-4 w-1 rounded-sm", i === 20 && s.uptime < 99.9 ? "bg-warn" : "bg-gain/60")} />
                ))}
              </div>
              <span className="tnum text-xs text-white/50">{s.uptime}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="panel-flat p-4">
        <div className="mb-3 text-sm font-semibold">Incident history</div>
        <div className="space-y-2">
          {INCIDENTS.map((i) => (
            <div key={i.title} className="flex items-center justify-between rounded-lg bg-white/3 px-3 py-2 text-sm">
              <span>{i.title}</span>
              <div className="flex items-center gap-3">
                <span className="rounded bg-gain/15 px-1.5 py-0.5 text-[10px] uppercase text-gain">{i.status}</span>
                <span className="text-[11px] text-white/40">{i.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
