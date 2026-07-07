import { queryAdminStats } from "@/lib/queries";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { WalletLink } from "@/components/wallet/WalletLink";
import { compactNumber, truncateAddress } from "@/lib/format";
import { Shield, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const stats = await queryAdminStats();

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-5">
      <div className="mb-4 flex items-center gap-2">
        <Shield size={20} className="text-loss" />
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <span className="rounded bg-loss/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-loss">Restricted</span>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Card label="Users" value={compactNumber(stats.users)} />
        <Card label="Tokens" value={compactNumber(stats.tokens)} />
        <Card label="Trades" value={compactNumber(stats.trades)} />
        <Card label="Graduated" value={compactNumber(stats.graduated)} accent="text-gain" />
        <Card label="Proposals" value={compactNumber(stats.proposals)} accent="text-ai" />
        <Card label="High Risk" value={compactNumber(stats.highRisk)} accent="text-loss" />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="panel-flat">
          <div className="flex items-center gap-1.5 border-b border-white/6 px-3 py-2.5 text-sm font-semibold">
            <AlertTriangle size={15} className="text-warn" /> Fraud Detection Queue
          </div>
          <div className="max-h-[440px] overflow-y-auto">
            <table className="w-full text-xs">
              <tbody>
                {stats.flagged.map((t) => (
                  <tr key={t.id} className="border-b border-white/4 hover:bg-white/4">
                    <td className="px-3 py-2">
                      <span className="flex items-center gap-1.5">
                        <span>{t.logo}</span>
                        <span className="font-medium">{t.ticker}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <WalletLink address={t.deployer} />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <RiskBadge risk={{ score: t.riskScore, level: t.riskLevel as any, factors: [] }} />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button className="rounded border border-loss/30 bg-loss/10 px-2 py-0.5 text-[11px] text-loss">Blacklist</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel-flat p-4">
          <div className="mb-3 text-sm font-semibold">Emergency Controls</div>
          <div className="space-y-2">
            {[
              { label: "Pause all launches", desc: "Halt new token deployments platform-wide." },
              { label: "Freeze token page", desc: "Disable trading on a specific token." },
              { label: "Global banner", desc: "Broadcast an alert to all users." },
            ].map((c) => (
              <div key={c.label} className="flex items-center justify-between rounded-lg border border-white/8 bg-white/3 px-3 py-2.5">
                <div>
                  <div className="text-sm font-medium">{c.label}</div>
                  <div className="text-[10px] text-white/40">{c.desc}</div>
                </div>
                <button className="rounded-md border border-warn/30 bg-warn/10 px-3 py-1 text-xs font-medium text-warn hover:bg-warn/20">
                  Activate
                </button>
              </div>
            ))}
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
