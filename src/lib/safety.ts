// ── Safety engine (pure functions) ──────────────────────────────────────────
// Each detection rule is its own function taking indexed data in and a signal
// out. They feed a composite Risk Score in [0, 100] (higher = riskier).
// SPEC: mirrors Axiom's safety panel semantics.

export interface SafetyInputs {
  top10Pct: number;
  devHoldingsPct: number;
  snipersPct: number;
  insidersPct: number;
  bundlersPct: number;
  lpBurnedPct: number;
  holders: number;
  freshWalletPct: number;
  mintRevoked: boolean;
  freezeRevoked: boolean;
  dexPaid: boolean;
  sellable: boolean; // honeypot simulation result
  deployerPrevTokens: number;
  deployerRugCount: number;
}

export interface RiskFactor {
  key: string;
  label: string;
  weight: number; // contribution to risk (0-100 scale, pre-weight)
  score: number; // 0-100 how risky this factor is
  contribution: number; // weight * score / 100
  detail: string;
}

export interface RiskResult {
  score: number; // 0-100 composite (higher = riskier)
  level: "safe" | "caution" | "danger";
  factors: RiskFactor[];
}

function clamp(n: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, n));
}

/** Concentration risk from top-10 holder %. */
export function scoreConcentration(top10Pct: number): number {
  // <15% safe, >50% very risky
  return clamp(((top10Pct - 15) / 35) * 100);
}

export function scoreDevHoldings(devPct: number): number {
  return clamp(((devPct - 2) / 15) * 100);
}

export function scoreSnipers(snipersPct: number): number {
  return clamp(((snipersPct - 3) / 25) * 100);
}

export function scoreInsiders(insidersPct: number): number {
  return clamp((insidersPct / 20) * 100);
}

export function scoreBundlers(bundlersPct: number): number {
  return clamp(((bundlersPct - 2) / 20) * 100);
}

export function scoreLp(lpBurnedPct: number): number {
  // Not burned = risky. 100% burned = safe.
  return clamp(100 - lpBurnedPct);
}

export function scoreFreshWallets(freshPct: number): number {
  return clamp(((freshPct - 10) / 40) * 100);
}

export function scoreDeployerHistory(prev: number, rugs: number): number {
  if (prev === 0) return 45; // unknown deployer, moderate
  const rugRate = rugs / prev;
  return clamp(rugRate * 100);
}

const RULES: {
  key: string;
  label: string;
  weight: number;
  score: (i: SafetyInputs) => number;
  detail: (i: SafetyInputs) => string;
}[] = [
  {
    key: "concentration",
    label: "Top 10 concentration",
    weight: 16,
    score: (i) => scoreConcentration(i.top10Pct),
    detail: (i) => `Top 10 holders control ${i.top10Pct.toFixed(1)}% of supply`,
  },
  {
    key: "dev",
    label: "Dev holdings",
    weight: 12,
    score: (i) => scoreDevHoldings(i.devHoldingsPct),
    detail: (i) => `Deployer holds ${i.devHoldingsPct.toFixed(1)}% of supply`,
  },
  {
    key: "snipers",
    label: "Snipers",
    weight: 14,
    score: (i) => scoreSnipers(i.snipersPct),
    detail: (i) => `${i.snipersPct.toFixed(1)}% held by launch snipers`,
  },
  {
    key: "insiders",
    label: "Insiders",
    weight: 14,
    score: (i) => scoreInsiders(i.insidersPct),
    detail: (i) => `${i.insidersPct.toFixed(1)}% held by wallets linked to the deployer`,
  },
  {
    key: "bundlers",
    label: "Bundlers",
    weight: 10,
    score: (i) => scoreBundlers(i.bundlersPct),
    detail: (i) => `${i.bundlersPct.toFixed(1)}% bought via bundled launch txns`,
  },
  {
    key: "lp",
    label: "LP burned",
    weight: 12,
    score: (i) => scoreLp(i.lpBurnedPct),
    detail: (i) =>
      i.lpBurnedPct >= 99 ? "LP fully burned" : `Only ${i.lpBurnedPct.toFixed(0)}% of LP burned`,
  },
  {
    key: "fresh",
    label: "Fresh wallets",
    weight: 8,
    score: (i) => scoreFreshWallets(i.freshWalletPct),
    detail: (i) => `${i.freshWalletPct.toFixed(1)}% held by wallets < 24h old`,
  },
  {
    key: "authority",
    label: "Contract authority",
    weight: 8,
    score: (i) => (i.mintRevoked ? 0 : 60) + (i.freezeRevoked ? 0 : 40),
    detail: (i) =>
      `${i.mintRevoked ? "Mint revoked" : "Mint LIVE"} · ${i.freezeRevoked ? "Freeze revoked" : "Freeze LIVE"}`,
  },
  {
    key: "honeypot",
    label: "Sellability",
    weight: 6,
    score: (i) => (i.sellable ? 0 : 100),
    detail: (i) => (i.sellable ? "Sell simulation passed" : "HONEYPOT: sell simulation failed"),
  },
  {
    key: "deployer",
    label: "Deployer history",
    weight: 10,
    score: (i) => scoreDeployerHistory(i.deployerPrevTokens, i.deployerRugCount),
    detail: (i) =>
      i.deployerPrevTokens === 0
        ? "First launch from this deployer"
        : `${i.deployerRugCount}/${i.deployerPrevTokens} previous tokens rugged`,
  },
];

export function computeRisk(i: SafetyInputs): RiskResult {
  const factors: RiskFactor[] = RULES.map((r) => {
    const score = clamp(r.score(i));
    return {
      key: r.key,
      label: r.label,
      weight: r.weight,
      score,
      contribution: (r.weight * score) / 100,
      detail: r.detail(i),
    };
  });
  const totalWeight = RULES.reduce((s, r) => s + r.weight, 0);
  const raw = factors.reduce((s, f) => s + f.contribution, 0);
  const score = clamp((raw / totalWeight) * 100);
  const level = score >= 66 ? "danger" : score >= 33 ? "caution" : "safe";
  return { score: Math.round(score), level, factors };
}

export function riskColor(level: RiskResult["level"]): string {
  return level === "safe" ? "text-gain" : level === "caution" ? "text-warn" : "text-loss";
}

export function riskBg(level: RiskResult["level"]): string {
  return level === "safe"
    ? "bg-gain/15 text-gain border-gain/30"
    : level === "caution"
      ? "bg-warn/15 text-warn border-warn/30"
      : "bg-loss/15 text-loss border-loss/30";
}
