import { queryTreasury } from "@/lib/queries";
import { formatUsd, timeAgo } from "@/lib/format";
import { Landmark } from "lucide-react";

export const dynamic = "force-dynamic";

const KIND_COLORS: Record<string, string> = {
  fee: "text-mint",
  revenue: "text-gain",
  buyback: "text-ai",
  burn: "text-loss",
  investment: "text-warn",
};

export default async function TreasuryPage() {
  const { txns, totals } = await queryTreasury();
  const allocation = Object.entries(totals).filter(([k]) => k !== "all");
  const totalAll = totals.all || 1;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-5">
      <div className="mb-4 flex items-center gap-2">
        <Landmark size={20} className="text-mint" />
        <h1 className="text-xl font-bold">Treasury</h1>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card label="Total Value" value={formatUsd(totals.all ?? 0)} accent="text-mint" />
        <Card label="Fees Collected" value={formatUsd(totals.fee ?? 0)} />
        <Card label="Buybacks" value={formatUsd(totals.buyback ?? 0)} accent="text-ai" />
        <Card label="Burns" value={formatUsd(totals.burn ?? 0)} accent="text-loss" />
      </div>

      <div className="grid gap-3 lg:grid-cols-[320px_1fr]">
        <div className="panel-flat p-4">
          <div className="mb-3 text-sm font-semibold">Allocation</div>
          <div className="space-y-2">
            {allocation.map(([kind, usd]) => {
              const pct = (usd / totalAll) * 100;
              return (
                <div key={kind}>
                  <div className="flex justify-between text-[11px]">
                    <span className={`capitalize ${KIND_COLORS[kind] ?? "text-white/60"}`}>{kind}</span>
                    <span className="tnum text-white/50">{pct.toFixed(1)}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/8">
                    <div className="h-full rounded-full bg-mint" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel-flat">
          <div className="border-b border-white/6 px-3 py-2.5 text-sm font-semibold">On-chain Transaction Log</div>
          <div className="max-h-[520px] overflow-y-auto">
            <table className="w-full text-xs">
              <tbody>
                {txns.map((t) => (
                  <tr key={t.id} className="border-b border-white/4 hover:bg-white/4">
                    <td className="px-3 py-2">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${KIND_COLORS[t.kind] ?? "text-white/60"}`}>
                        {t.kind}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-white/50">{t.note}</td>
                    <td className="tnum px-3 py-2 text-right">{formatUsd(t.usd)}</td>
                    <td className="px-3 py-2 text-right text-white/30">{timeAgo(new Date(t.ts).getTime())}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="panel-flat p-3">
      <div className="text-[10px] uppercase text-white/40">{label}</div>
      <div className={`tnum text-lg font-bold ${accent ?? ""}`}>{value}</div>
    </div>
  );
}
