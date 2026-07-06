"use client";

import { useMemo, useState } from "react";
import { TokenCard } from "@/components/token/TokenCard";
import { cn } from "@/lib/cn";
import { Search, SlidersHorizontal, Flame, Rocket, GraduationCap } from "lucide-react";
import type { Token } from "@/lib/types";

type SortKey = "trending" | "new" | "volume" | "holders";

export function DiscoverClient({ tokens }: { tokens: Token[] }) {
  const all = tokens;
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("trending");
  const [lpOnly, setLpOnly] = useState(false);
  const [dexPaid, setDexPaid] = useState(false);
  const [maxSnipers, setMaxSnipers] = useState(100);

  const filtered = useMemo(() => {
    let list = all.filter((t) => {
      if (query && !t.name.toLowerCase().includes(query.toLowerCase()) && !t.ticker.toLowerCase().includes(query.toLowerCase()) && !t.contract.includes(query))
        return false;
      if (lpOnly && t.safety.lpBurnedPct < 99) return false;
      if (dexPaid && !t.safety.dexPaid) return false;
      if (t.safety.snipersPct > maxSnipers) return false;
      return true;
    });
    const cmp: Record<SortKey, (a: Token, b: Token) => number> = {
      trending: (a, b) => b.volume24h * (1 + b.change24h / 100) - a.volume24h * (1 + a.change24h / 100),
      new: (a, b) => b.createdAt - a.createdAt,
      volume: (a, b) => b.volume24h - a.volume24h,
      holders: (a, b) => b.holders - a.holders,
    };
    return [...list].sort(cmp[sort]);
  }, [all, query, sort, lpOnly, dexPaid, maxSnipers]);

  const columns: { key: string; title: string; icon: React.ReactNode; tokens: Token[]; accent: string }[] = [
    {
      key: "new",
      title: "New Pairs",
      icon: <Flame size={15} />,
      accent: "text-mint",
      tokens: filtered.filter((t) => t.status === "new"),
    },
    {
      key: "grad",
      title: "About to Graduate",
      icon: <Rocket size={15} />,
      accent: "text-warn",
      tokens: filtered.filter((t) => t.status === "graduating"),
    },
    {
      key: "done",
      title: "Graduated",
      icon: <GraduationCap size={15} />,
      accent: "text-gain",
      tokens: filtered.filter((t) => t.status === "graduated"),
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-5">
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">Discover</h1>
            <p className="text-xs text-white/40">Live Pulse — tokens streaming across the bonding lifecycle</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/4 px-3 py-1.5">
              <Search size={14} className="text-white/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, ticker or CA…"
                className="w-48 bg-transparent text-sm outline-none placeholder:text-white/30"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-white/8 bg-white/4 p-0.5">
            {(["trending", "new", "volume", "holders"] as SortKey[]).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                  sort === s ? "bg-mint/15 text-mint" : "text-white/50 hover:text-white/80",
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <FilterToggle active={lpOnly} onClick={() => setLpOnly((v) => !v)} label="LP Burned" />
          <FilterToggle active={dexPaid} onClick={() => setDexPaid((v) => !v)} label="Dex Paid" />
          <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/4 px-2.5 py-1.5 text-xs text-white/50">
            <SlidersHorizontal size={13} />
            Snipers &lt; {maxSnipers}%
            <input
              type="range"
              min={0}
              max={100}
              value={maxSnipers}
              onChange={(e) => setMaxSnipers(Number(e.target.value))}
              className="w-20 accent-mint"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {columns.map((col) => (
          <div key={col.key} className="panel-flat flex flex-col">
            <div className="flex items-center justify-between border-b border-white/6 px-3 py-2.5">
              <div className={cn("flex items-center gap-2 text-sm font-semibold", col.accent)}>
                {col.icon}
                {col.title}
              </div>
              <span className="tnum rounded bg-white/8 px-1.5 py-0.5 text-[11px] text-white/50">
                {col.tokens.length}
              </span>
            </div>
            <div className="flex max-h-[calc(100vh-220px)] flex-col gap-2 overflow-y-auto p-2">
              {col.tokens.length === 0 ? (
                <div className="py-10 text-center text-xs text-white/30">No tokens match filters</div>
              ) : (
                col.tokens.map((t) => <TokenCard key={t.id} token={t} />)
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FilterToggle({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-mint/40 bg-mint/15 text-mint"
          : "border-white/8 bg-white/4 text-white/50 hover:text-white/80",
      )}
    >
      {label}
    </button>
  );
}
