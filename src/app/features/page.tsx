"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FEATURES, FEATURE_GROUPS, featureCounts, type FeatureStatus } from "@/lib/features";
import { cn } from "@/lib/cn";
import { Sparkles, ArrowUpRight } from "lucide-react";

const STATUS_STYLE: Record<FeatureStatus, string> = {
  live: "bg-gain/15 text-gain border-gain/30",
  beta: "bg-warn/15 text-warn border-warn/30",
  soon: "bg-white/8 text-white/40 border-white/10",
};

export default function FeaturesPage() {
  const counts = featureCounts();
  const [status, setStatus] = useState<FeatureStatus | "all">("all");
  const [group, setGroup] = useState<string>("all");

  const rows = useMemo(
    () =>
      FEATURES.filter((f) => (status === "all" || f.status === status) && (group === "all" || f.group === group)),
    [status, group],
  );

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-5">
      <div className="mb-1 flex items-center gap-2">
        <Sparkles size={20} className="text-mint" />
        <h1 className="text-xl font-bold">Feature Registry</h1>
      </div>
      <p className="mb-4 text-xs text-white/40">
        All 150 numbered platform features and their rollout status — the live feature-flag registry.
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total" value={counts.total} onClick={() => setStatus("all")} active={status === "all"} />
        <Stat label="Live" value={counts.live} color="text-gain" onClick={() => setStatus("live")} active={status === "live"} />
        <Stat label="Beta" value={counts.beta} color="text-warn" onClick={() => setStatus("beta")} active={status === "beta"} />
        <Stat label="Planned" value={counts.soon} color="text-white/50" onClick={() => setStatus("soon")} active={status === "soon"} />
      </div>

      <div className="mb-3 flex flex-wrap gap-1">
        <GroupChip label="All" active={group === "all"} onClick={() => setGroup("all")} />
        {FEATURE_GROUPS.map((g) => (
          <GroupChip key={g} label={g} active={group === g} onClick={() => setGroup(g)} />
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((f) => {
          const inner = (
            <>
              <div className="flex items-start justify-between gap-2">
                <span className="tnum text-[10px] text-white/30">#{f.n}</span>
                <span className={cn("rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase", STATUS_STYLE[f.status])}>
                  {f.status}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1 text-sm font-medium">
                {f.title}
                {f.href && <ArrowUpRight size={12} className="text-mint" />}
              </div>
              <div className="mt-0.5 text-[10px] text-white/35">{f.group}</div>
            </>
          );
          return f.href ? (
            <Link key={f.n} href={f.href} className="rounded-lg border border-white/6 bg-white/3 p-3 transition-colors hover:border-mint/30">
              {inner}
            </Link>
          ) : (
            <div key={f.n} className="rounded-lg border border-white/6 bg-white/3 p-3">
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, color, onClick, active }: { label: string; value: number; color?: string; onClick: () => void; active: boolean }) {
  return (
    <button onClick={onClick} className={cn("panel-flat p-3 text-left transition-colors", active && "border-mint/40")}>
      <div className="text-[10px] uppercase text-white/40">{label}</div>
      <div className={cn("tnum text-2xl font-bold", color)}>{value}</div>
    </button>
  );
}

function GroupChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors",
        active ? "bg-mint/15 text-mint" : "text-white/50 hover:bg-white/5",
      )}
    >
      {label}
    </button>
  );
}
