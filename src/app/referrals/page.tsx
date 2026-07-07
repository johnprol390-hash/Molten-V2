import { queryReferral } from "@/lib/queries";
import { formatUsd, compactNumber } from "@/lib/format";
import { Gift } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReferralsPage() {
  const referral = await queryReferral();
  const code = referral?.code ?? "MOLTEN";
  const link = `https://molten.fun/r/${code}`;

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-5">
      <div className="mb-4 flex items-center gap-2">
        <Gift size={20} className="text-mint" />
        <h1 className="text-xl font-bold">Referrals</h1>
      </div>

      <div className="panel mb-4 p-5">
        <div className="text-xs text-white/40">Your referral link</div>
        <div className="mt-2 flex items-center gap-2">
          <code className="tnum flex-1 rounded-lg border border-white/8 bg-white/3 px-3 py-2 text-sm text-mint">{link}</code>
          <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-white/8 bg-white/3 text-[8px] text-white/40">
            QR
          </div>
        </div>
        <p className="mt-2 text-[11px] text-white/40">
          Multi-tier rewards: earn from your referees and from their referrals too.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card label="Clicks" value={compactNumber(referral?.clicks ?? 0)} />
        <Card label="Signups" value={compactNumber(referral?.signups ?? 0)} accent="text-mint" />
        <Card label="Volume Generated" value={formatUsd(referral?.volumeGen ?? 0)} />
        <Card label="Rewards Earned" value={formatUsd(referral?.earned ?? 0)} accent="text-gain" />
      </div>

      <div className="panel-flat mt-4 p-5">
        <div className="mb-3 text-sm font-semibold">Reward Tiers</div>
        <div className="space-y-2">
          {[
            { tier: 1, label: "Direct referrals", rate: "30% of fees" },
            { tier: 2, label: "Second-tier referrals", rate: "10% of fees" },
            { tier: 3, label: "Third-tier referrals", rate: "5% of fees" },
          ].map((t) => (
            <div key={t.tier} className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm ${(referral?.tier ?? 1) >= t.tier ? "border-mint/30 bg-mint/5" : "border-white/8"}`}>
              <span>Tier {t.tier} — {t.label}</span>
              <span className="tnum text-mint">{t.rate}</span>
            </div>
          ))}
        </div>
        <button className="mt-4 w-full rounded-lg bg-mint py-2.5 text-sm font-semibold text-base-900 hover:bg-mint-400">
          Claim {formatUsd(referral?.earned ?? 0)}
        </button>
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
