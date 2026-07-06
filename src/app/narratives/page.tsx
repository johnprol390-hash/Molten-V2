import Link from "next/link";
import { queryTokens } from "@/lib/queries";
import { TokenCard } from "@/components/token/TokenCard";
import { formatUsd } from "@/lib/format";
import { Layers } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NarrativesPage() {
  const tokens = await queryTokens();
  const groups = new Map<string, typeof tokens>();
  for (const t of tokens) {
    const arr = groups.get(t.category) ?? [];
    arr.push(t);
    groups.set(t.category, arr);
  }
  const narratives = [...groups.entries()]
    .map(([category, toks]) => ({
      category,
      toks: [...toks].sort((a, b) => b.volume24h - a.volume24h),
      volume: toks.reduce((s, t) => s + t.volume24h, 0),
      mcap: toks.reduce((s, t) => s + t.mcap, 0),
    }))
    .sort((a, b) => b.volume - a.volume);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-5">
      <div className="mb-4 flex items-center gap-2">
        <Layers size={20} className="text-mint" />
        <h1 className="text-xl font-bold">Trending Narratives</h1>
      </div>

      <div className="space-y-6">
        {narratives.map((n) => (
          <div key={n.category}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold">{n.category}</h2>
                <span className="rounded bg-white/8 px-1.5 py-0.5 text-[11px] text-white/50">{n.toks.length} tokens</span>
              </div>
              <div className="flex gap-4 text-[11px] text-white/40">
                <span className="tnum">Vol {formatUsd(n.volume)}</span>
                <span className="tnum">MC {formatUsd(n.mcap)}</span>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {n.toks.slice(0, 4).map((t) => (
                <TokenCard key={t.id} token={t} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
