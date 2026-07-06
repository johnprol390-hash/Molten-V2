// ── Bonding curve math (pure functions) ─────────────────────────────────────
// Constant-product virtual bonding curve with virtual HYPE + virtual token
// reserves. This is the single source of truth for price / quotes / progress.
// UI and (future) API both import from here — never duplicate the math.
//
// SPEC: constant-product (x*y=k) with virtual reserves, matching Pump.fun-style
// launch economics adapted for HYPE as the quote asset.

export interface CurveParams {
  /** Virtual HYPE reserve at launch (shifts starting price). */
  virtualHype: number;
  /** Virtual token reserve at launch. */
  virtualTokens: number;
  /** Real HYPE collected so far on the curve. */
  realHype: number;
  /** Real tokens sold out of the curve so far. */
  tokensSold: number;
  /** HYPE that must be collected for the token to graduate. */
  graduationHype: number;
  /** Total token supply allocated to the curve. */
  curveSupply: number;
}

export function defaultCurve(overrides: Partial<CurveParams> = {}): CurveParams {
  return {
    virtualHype: 30,
    virtualTokens: 1_073_000_000,
    realHype: 0,
    tokensSold: 0,
    graduationHype: 420,
    curveSupply: 800_000_000,
    ...overrides,
  };
}

/** Current effective reserves (virtual + real). */
function reserves(c: CurveParams) {
  return {
    hype: c.virtualHype + c.realHype,
    tokens: c.virtualTokens - c.tokensSold,
  };
}

/** Instantaneous spot price in HYPE per token. */
export function spotPrice(c: CurveParams): number {
  const r = reserves(c);
  return r.hype / r.tokens;
}

/** Constant product k. */
export function invariant(c: CurveParams): number {
  const r = reserves(c);
  return r.hype * r.tokens;
}

export interface BuyQuote {
  hypeIn: number;
  tokensOut: number;
  avgPrice: number;
  spotBefore: number;
  spotAfter: number;
  priceImpactPct: number;
}

/** Quote buying `hypeIn` HYPE worth of tokens off the curve. */
export function quoteBuy(c: CurveParams, hypeIn: number): BuyQuote {
  const r = reserves(c);
  const k = r.hype * r.tokens;
  const newHype = r.hype + hypeIn;
  const newTokens = k / newHype;
  const tokensOut = Math.max(0, r.tokens - newTokens);
  const spotBefore = r.hype / r.tokens;
  const spotAfter = newHype / newTokens;
  const avgPrice = tokensOut > 0 ? hypeIn / tokensOut : spotBefore;
  return {
    hypeIn,
    tokensOut,
    avgPrice,
    spotBefore,
    spotAfter,
    priceImpactPct: spotBefore > 0 ? ((spotAfter - spotBefore) / spotBefore) * 100 : 0,
  };
}

export interface SellQuote {
  tokensIn: number;
  hypeOut: number;
  avgPrice: number;
  spotBefore: number;
  spotAfter: number;
  priceImpactPct: number;
}

/** Quote selling `tokensIn` tokens back into the curve. */
export function quoteSell(c: CurveParams, tokensIn: number): SellQuote {
  const r = reserves(c);
  const k = r.hype * r.tokens;
  const newTokens = r.tokens + tokensIn;
  const newHype = k / newTokens;
  const hypeOut = Math.max(0, r.hype - newHype);
  const spotBefore = r.hype / r.tokens;
  const spotAfter = newHype / newTokens;
  const avgPrice = tokensIn > 0 ? hypeOut / tokensIn : spotBefore;
  return {
    tokensIn,
    hypeOut,
    avgPrice,
    spotBefore,
    spotAfter,
    priceImpactPct: spotBefore > 0 ? ((spotBefore - spotAfter) / spotBefore) * 100 : 0,
  };
}

/** Apply a buy, returning a new curve state (immutable). */
export function applyBuy(c: CurveParams, hypeIn: number): { curve: CurveParams; quote: BuyQuote } {
  const quote = quoteBuy(c, hypeIn);
  return {
    quote,
    curve: {
      ...c,
      realHype: c.realHype + hypeIn,
      tokensSold: c.tokensSold + quote.tokensOut,
    },
  };
}

/** Apply a sell, returning a new curve state (immutable). */
export function applySell(c: CurveParams, tokensIn: number): { curve: CurveParams; quote: SellQuote } {
  const quote = quoteSell(c, tokensIn);
  return {
    quote,
    curve: {
      ...c,
      realHype: Math.max(0, c.realHype - quote.hypeOut),
      tokensSold: Math.max(0, c.tokensSold - tokensIn),
    },
  };
}

/** Graduation progress in [0, 1]. */
export function graduationProgress(c: CurveParams): number {
  return Math.max(0, Math.min(1, c.realHype / c.graduationHype));
}

/** HYPE still required to reach graduation. */
export function hypeToGraduate(c: CurveParams): number {
  return Math.max(0, c.graduationHype - c.realHype);
}

export function hasGraduated(c: CurveParams): boolean {
  return c.realHype >= c.graduationHype;
}

/** Projected spot price at the moment of graduation. */
export function priceAtGraduation(c: CurveParams): number {
  const needed = hypeToGraduate(c);
  const { curve } = applyBuy(c, needed);
  return spotPrice(curve);
}

/** Fully-diluted market cap in HYPE terms given a total supply. */
export function marketCapHype(c: CurveParams, totalSupply: number): number {
  return spotPrice(c) * totalSupply;
}

/** Sample points along the curve for visualization (tokensSold -> price). */
export function curveSamples(c: CurveParams, points = 60): { sold: number; price: number }[] {
  const out: { sold: number; price: number }[] = [];
  const k = (c.virtualHype) * c.virtualTokens;
  for (let i = 0; i <= points; i++) {
    const frac = i / points;
    const sold = c.curveSupply * frac;
    const tokens = c.virtualTokens - sold;
    const hype = k / tokens;
    out.push({ sold, price: hype / tokens });
  }
  return out;
}
