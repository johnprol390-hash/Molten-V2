"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/cn";
import { Target, Check } from "lucide-react";

interface Quest {
  key: string;
  title: string;
  target: number;
  points: number;
  progress: number;
  claimed: boolean;
}

export function QuestsPanel() {
  const connected = useAppStore((s) => s.wallets.length > 0);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => fetch("/api/quests").then((r) => r.json()).then((d) => setQuests(d.quests ?? []));

  useEffect(() => {
    load();
  }, [connected]);

  const claim = async (key: string) => {
    setBusy(key);
    try {
      const res = await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questKey: key }),
      });
      if (res.ok) await load();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="panel-flat p-4">
      <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
        <Target size={15} className="text-mint" /> Daily Quests
      </div>
      <div className="space-y-2">
        {quests.map((q) => {
          const complete = q.progress >= q.target;
          return (
            <div key={q.key} className="rounded-lg border border-white/6 bg-white/3 p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{q.title}</span>
                <span className="tnum text-[10px] text-mint">+{q.points}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full bg-mint" style={{ width: `${Math.min(100, (q.progress / q.target) * 100)}%` }} />
                </div>
                <span className="tnum w-8 text-right text-[10px] text-white/40">
                  {q.progress}/{q.target}
                </span>
                <button
                  disabled={!connected || !complete || q.claimed || busy === q.key}
                  onClick={() => claim(q.key)}
                  className={cn(
                    "flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold",
                    q.claimed
                      ? "bg-gain/15 text-gain"
                      : complete
                        ? "bg-mint text-base-900 hover:bg-mint-400"
                        : "bg-white/8 text-white/30",
                  )}
                >
                  {q.claimed ? <Check size={11} /> : null}
                  {q.claimed ? "Claimed" : complete ? "Claim" : "Locked"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {!connected && <p className="mt-2 text-center text-[10px] text-white/30">Connect a wallet to earn quest rewards.</p>}
    </div>
  );
}
