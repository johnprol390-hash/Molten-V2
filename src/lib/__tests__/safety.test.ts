import { describe, it, expect } from "vitest";
import { computeRisk, scoreLp, scoreConcentration, type SafetyInputs } from "../safety";

const safe: SafetyInputs = {
  top10Pct: 12,
  devHoldingsPct: 1,
  snipersPct: 2,
  insidersPct: 0,
  bundlersPct: 0,
  lpBurnedPct: 100,
  holders: 2000,
  freshWalletPct: 8,
  mintRevoked: true,
  freezeRevoked: true,
  dexPaid: true,
  sellable: true,
  deployerPrevTokens: 4,
  deployerRugCount: 0,
};

const risky: SafetyInputs = {
  top10Pct: 62,
  devHoldingsPct: 18,
  snipersPct: 34,
  insidersPct: 22,
  bundlersPct: 26,
  lpBurnedPct: 0,
  holders: 40,
  freshWalletPct: 48,
  mintRevoked: false,
  freezeRevoked: false,
  dexPaid: false,
  sellable: false,
  deployerPrevTokens: 5,
  deployerRugCount: 5,
};

describe("safety engine", () => {
  it("scores a clean token as safe", () => {
    const r = computeRisk(safe);
    expect(r.level).toBe("safe");
    expect(r.score).toBeLessThan(33);
  });

  it("scores a toxic token as dangerous", () => {
    const r = computeRisk(risky);
    expect(r.level).toBe("danger");
    expect(r.score).toBeGreaterThan(66);
  });

  it("keeps score within [0,100]", () => {
    const r = computeRisk(risky);
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
  });

  it("penalizes unburned LP", () => {
    expect(scoreLp(100)).toBe(0);
    expect(scoreLp(0)).toBe(100);
  });

  it("penalizes holder concentration", () => {
    expect(scoreConcentration(10)).toBeLessThan(scoreConcentration(50));
  });

  it("returns a factor per rule with contributions", () => {
    const r = computeRisk(safe);
    expect(r.factors.length).toBeGreaterThan(5);
    for (const f of r.factors) {
      expect(f.contribution).toBeGreaterThanOrEqual(0);
    }
  });
});
