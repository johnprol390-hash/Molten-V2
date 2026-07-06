import { queryPointsSummary } from "@/lib/queries";
import { compactNumber } from "@/lib/format";
import { Trophy, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

const SOURCE_LABELS: Record<string, string> = {
  trade: "Trading",
  launch: "Launching",
  referral: "Referrals",
  governance: "Governance",
  community: "Community",
  streak: "Daily Streaks",
};

export default async function PointsPage() {
  const { points, bySource, achievements } = await queryPointsSummary();
  const level = Math.floor(points / 5000) + 1;
  const progress = ((points % 5000) / 5000) * 100;

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-5">
      <div className="mb-4 flex items-center gap-2">
        <Zap size={20} className="text-mint" />
        <h1 className="text-xl font-bold">Points & Achievements</h1>
      </div>

      <div className="panel mb-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-white/40">Total Points</div>
            <div className="tnum text-3xl font-bold text-mint">{compactNumber(points)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/40">Level</div>
            <div className="tnum text-3xl font-bold">{level}</div>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
          <div className="h-full rounded-full bg-mint" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-1 text-[11px] text-white/40">{(5000 - (points % 5000)).toLocaleString()} points to level {level + 1}</div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="panel-flat p-4">
          <div className="mb-3 text-sm font-semibold">Points by Source</div>
          <div className="space-y-2">
            {Object.entries(SOURCE_LABELS).map(([key, label]) => {
              const val = bySource[key] ?? 0;
              const max = Math.max(1, ...Object.values(bySource));
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">{label}</span>
                    <span className="tnum text-white/50">{compactNumber(val)}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/8">
                    <div className="h-full rounded-full bg-mint" style={{ width: `${(val / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel-flat p-4">
          <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
            <Trophy size={15} className="text-warn" /> Achievements
          </div>
          <div className="grid grid-cols-2 gap-2">
            {achievements.map((a) => (
              <div key={a.id} className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/3 p-2.5">
                <span className="text-xl">{a.icon}</span>
                <div>
                  <div className="text-xs font-medium">{a.title}</div>
                  <div className="text-[10px] text-white/40">+{a.points} pts</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
