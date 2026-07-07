import { describe, it, expect } from "vitest";
import {
  defaultCurve,
  spotPrice,
  quoteBuy,
  quoteSell,
  applyBuy,
  applySell,
  graduationProgress,
  hypeToGraduate,
  hasGraduated,
  invariant,
} from "../curve";

describe("bonding curve", () => {
  it("has a positive starting spot price", () => {
    const c = defaultCurve();
    expect(spotPrice(c)).toBeGreaterThan(0);
  });

  it("price increases after a buy", () => {
    const c = defaultCurve();
    const before = spotPrice(c);
    const { curve } = applyBuy(c, 10);
    expect(spotPrice(curve)).toBeGreaterThan(before);
  });

  it("price decreases after a sell", () => {
    const c = defaultCurve();
    const { curve: bought } = applyBuy(c, 20);
    const before = spotPrice(bought);
    const { curve: sold } = applySell(bought, 1_000_000);
    expect(spotPrice(sold)).toBeLessThan(before);
  });

  it("preserves the constant product (approximately) across a buy", () => {
    const c = defaultCurve();
    const k1 = invariant(c);
    const { curve } = applyBuy(c, 5);
    const k2 = invariant(curve);
    expect(Math.abs(k2 - k1) / k1).toBeLessThan(1e-6);
  });

  it("buy quote returns tokens and positive price impact", () => {
    const c = defaultCurve();
    const q = quoteBuy(c, 10);
    expect(q.tokensOut).toBeGreaterThan(0);
    expect(q.priceImpactPct).toBeGreaterThan(0);
  });

  it("sell quote returns hype and positive price impact", () => {
    const c = defaultCurve();
    const q = quoteSell(c, 1_000_000);
    expect(q.hypeOut).toBeGreaterThan(0);
    expect(q.priceImpactPct).toBeGreaterThan(0);
  });

  it("graduation progress is bounded [0,1]", () => {
    const c = defaultCurve({ realHype: 210, graduationHype: 420 });
    expect(graduationProgress(c)).toBeCloseTo(0.5, 5);
    const over = defaultCurve({ realHype: 999, graduationHype: 420 });
    expect(graduationProgress(over)).toBe(1);
  });

  it("reports graduation state and remaining hype", () => {
    const c = defaultCurve({ realHype: 100, graduationHype: 420 });
    expect(hasGraduated(c)).toBe(false);
    expect(hypeToGraduate(c)).toBe(320);
    const done = defaultCurve({ realHype: 420, graduationHype: 420 });
    expect(hasGraduated(done)).toBe(true);
  });
});
