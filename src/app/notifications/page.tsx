"use client";

import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Bell, Check } from "lucide-react";
import { EmptyState } from "@/components/ui/Skeleton";

interface Notif {
  id: string;
  kind: string;
  title: string;
  body: string;
  read: boolean;
  ts: string;
}

const CATEGORIES = [
  "Token Launch", "Trade Executed", "Order Filled", "Whale Buy", "Dev Sell",
  "LP Pull Warning", "Token Graduated", "Tracked Wallet Trade", "Copy Trade Executed", "Price Alert",
];

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(CATEGORIES.map((c) => [c, true])),
  );

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setNotifs(d.notifications ?? []))
      .finally(() => setLoading(false));
  }, []);

  const markAll = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifs((ns) => ns.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-mint" />
          <h1 className="text-xl font-bold">Notifications</h1>
        </div>
        <button onClick={markAll} className="flex items-center gap-1.5 rounded-lg border border-white/8 px-3 py-1.5 text-sm text-white/70 hover:border-mint/30">
          <Check size={14} /> Mark all read
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_300px]">
        <div className="panel-flat">
          {loading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-white/5" />)}
            </div>
          ) : notifs.length === 0 ? (
            <EmptyState title="You're all caught up" hint="New activity will show up here." icon="🔔" />
          ) : (
            <div className="divide-y divide-white/4">
              {notifs.map((n) => (
                <div key={n.id} className={cn("flex items-start gap-3 px-4 py-3", !n.read && "bg-mint/4")}>
                  <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-white/20" : "bg-mint")} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{n.title}</span>
                      <span className="text-[10px] text-white/30">{timeAgo(new Date(n.ts).getTime())}</span>
                    </div>
                    <p className="text-xs text-white/50">{n.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel-flat h-fit p-4">
          <div className="mb-3 text-sm font-semibold">Preferences</div>
          <div className="space-y-1.5">
            {CATEGORIES.map((c) => (
              <label key={c} className="flex items-center justify-between text-xs">
                <span className="text-white/60">{c}</span>
                <button
                  onClick={() => setPrefs((p) => ({ ...p, [c]: !p[c] }))}
                  className={cn("h-4 w-7 rounded-full p-0.5 transition-colors", prefs[c] ? "bg-mint" : "bg-white/15")}
                >
                  <span className={cn("block h-3 w-3 rounded-full bg-base-900 transition-transform", prefs[c] && "translate-x-3")} />
                </button>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
