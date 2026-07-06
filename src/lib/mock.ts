import { Rand } from "./rng";
import { computeRisk, type SafetyInputs } from "./safety";
import { defaultCurve, graduationProgress, spotPrice, marketCapHype } from "./curve";
import type {
  Token,
  Trade,
  Holder,
  Wallet,
  Candle,
  DevToken,
  HolderBadge,
  TokenStatus,
} from "./types";

const HYPE_USD = 32; // simulated HYPE price in USD

const TOKEN_DEFS: { name: string; ticker: string; logo: string; category: string; blurb: string }[] = [
  { name: "Molten Doge", ticker: "MDOGE", logo: "🐕", category: "Animals", blurb: "The hottest dog on Hyperliquid." },
  { name: "HyperPepe", ticker: "HPEPE", logo: "🐸", category: "Memes", blurb: "Rare pepe, native to HL." },
  { name: "Liquid Cat", ticker: "LCAT", logo: "🐱", category: "Animals", blurb: "9 lives, infinite liquidity." },
  { name: "Neuron", ticker: "NRN", logo: "🧠", category: "AI", blurb: "AI-picked degen index." },
  { name: "Rocket Fuel", ticker: "FUEL", logo: "🚀", category: "Memes", blurb: "To the moon, natively." },
  { name: "GigaChad", ticker: "GIGA", logo: "💪", category: "Memes", blurb: "Only chads allowed." },
  { name: "Solaris", ticker: "SOL8", logo: "☀️", category: "Culture", blurb: "Sun-powered gains." },
  { name: "VoltEdge", ticker: "VOLT", logo: "⚡", category: "Tech", blurb: "High-voltage volatility." },
  { name: "Mintress", ticker: "MINT", logo: "🌿", category: "Culture", blurb: "Fresh mint energy." },
  { name: "Bonkers", ticker: "BONK2", logo: "🔨", category: "Memes", blurb: "Absolutely bonkers." },
  { name: "Frostbyte", ticker: "FRST", logo: "❄️", category: "Tech", blurb: "Cool under pressure." },
  { name: "Golden Ape", ticker: "GAPE", logo: "🦍", category: "Animals", blurb: "Apes together strong." },
  { name: "PlasmaX", ticker: "PLZ", logo: "🌀", category: "Tech", blurb: "Fourth state of degen." },
  { name: "MoonPig", ticker: "MPIG", logo: "🐷", category: "Animals", blurb: "This little piggy went to the moon." },
  { name: "Quasar", ticker: "QSAR", logo: "✨", category: "Culture", blurb: "Brightest object in the sky." },
  { name: "TurboToad", ticker: "TOAD", logo: "🐸", category: "Memes", blurb: "Turbocharged amphibian." },
  { name: "IroncladDAO", ticker: "IRON", logo: "🛡️", category: "AI", blurb: "Governed by steel." },
  { name: "NebulaFi", ticker: "NEB", logo: "🌌", category: "Tech", blurb: "Cosmic yield." },
  { name: "Wagmi Whale", ticker: "WHALE", logo: "🐋", category: "Animals", blurb: "We're all gonna make it." },
  { name: "EmberFox", ticker: "FOX", logo: "🦊", category: "Culture", blurb: "Sly and fiery." },
];

const KOL_NAMES = [
  "0xMachi", "GainzGandalf", "MoonBoyMike", "AlphaAnna", "DegenDoctor",
  "WhaleWatcher", "SniperSue", "ChartChad", "LiquidLarry", "VaultVicky",
];

function makeWallet(seed: string, opts: Partial<Wallet> = {}): Wallet {
  const r = new Rand(seed);
  const isKol = opts.isKol ?? r.bool(0.12);
  const pnlUsd = r.range(-40000, 220000) * (isKol ? 1.8 : 1);
  return {
    address: opts.address ?? r.address(),
    ageMs: r.range(1000 * 60 * 5, 1000 * 60 * 60 * 24 * 400),
    balanceHype: r.range(0.2, 320),
    isKol,
    kolName: isKol ? r.pick(KOL_NAMES) : undefined,
    twitter: isKol ? "@" + r.pick(KOL_NAMES).toLowerCase() : undefined,
    credibility: isKol ? Math.round(r.range(52, 97)) : undefined,
    pnlUsd,
    pnlPct: r.range(-60, 480),
    winRate: r.range(28, 82),
    trades: r.int(12, 1800),
    avgRoi: r.range(-20, 140),
    avgHoldMs: r.range(1000 * 60 * 3, 1000 * 60 * 60 * 30),
    badges: [],
    tracked: false,
    ...opts,
  };
}

function makeCandles(seed: string, basePrice: number, change24h: number): Candle[] {
  const r = new Rand(seed + ":candles");
  const now = Math.floor(Date.now() / 1000);
  const step = 60; // 1m candles
  const count = 240;
  const start = now - count * step;
  const candles: Candle[] = [];
  // Reconstruct a path that ends near basePrice with roughly change24h behavior.
  let price = basePrice / (1 + change24h / 100);
  for (let i = 0; i < count; i++) {
    const drift = (change24h / 100) / count;
    const vol = r.range(-0.05, 0.05) + drift;
    const open = price;
    const close = Math.max(1e-9, open * (1 + vol));
    const high = Math.max(open, close) * (1 + r.range(0, 0.03));
    const low = Math.min(open, close) * (1 - r.range(0, 0.03));
    const volume = r.range(200, 9000);
    candles.push({ time: start + i * step, open, high, low, close, volume });
    price = close;
  }
  return candles;
}

function makeDevTokens(seed: string, count: number): DevToken[] {
  const r = new Rand(seed + ":dev");
  const outcomes: DevToken["outcome"][] = ["rugged", "migrated", "dead", "active"];
  const out: DevToken[] = [];
  for (let i = 0; i < count; i++) {
    const peak = r.range(20000, 4000000);
    const outcome = r.pick(outcomes);
    out.push({
      name: r.pick(TOKEN_DEFS).name + " " + (i + 1),
      ticker: r.pick(TOKEN_DEFS).ticker + i,
      launchedAt: Date.now() - r.range(1000 * 60 * 60 * 24 * 3, 1000 * 60 * 60 * 24 * 200),
      peakMcap: peak,
      currentMcap: outcome === "rugged" || outcome === "dead" ? peak * r.range(0.001, 0.05) : peak * r.range(0.3, 1.4),
      outcome,
    });
  }
  return out;
}

function statusFromProgress(p: number): TokenStatus {
  if (p >= 1) return "graduated";
  if (p >= 0.7) return "graduating";
  return "new";
}

export function makeToken(index: number): Token {
  const def = TOKEN_DEFS[index % TOKEN_DEFS.length];
  const seed = `token:${index}:${def.ticker}`;
  const r = new Rand(seed);

  const progress = r.range(0.03, 1.15);
  const grad = 420;
  const realHype = Math.min(grad * 1.0, progress * grad);
  const totalSupply = 1_000_000_000;

  const curve = defaultCurve({
    graduationHype: grad,
    realHype,
    tokensSold: 0,
  });
  // Derive tokensSold from realHype by simulating the invariant.
  {
    const k = curve.virtualHype * curve.virtualTokens;
    const newHype = curve.virtualHype + curve.realHype;
    curve.tokensSold = curve.virtualTokens - k / newHype;
  }

  const price = spotPrice(curve) * HYPE_USD;
  const mcapHype = marketCapHype(curve, totalSupply);
  const mcap = mcapHype * HYPE_USD;
  const bondingPct = Math.min(100, graduationProgress(curve) * 100);
  const status = statusFromProgress(graduationProgress(curve));

  const deployerPrev = r.int(0, 12);
  const deployerRugs = deployerPrev === 0 ? 0 : r.int(0, deployerPrev);

  const safety: SafetyInputs = {
    top10Pct: r.range(8, 62),
    devHoldingsPct: r.range(0, 18),
    snipersPct: r.range(0, 34),
    insidersPct: r.range(0, 22),
    bundlersPct: r.range(0, 26),
    lpBurnedPct: r.bool(0.6) ? 100 : r.range(0, 90),
    holders: r.int(28, 4200),
    freshWalletPct: r.range(4, 48),
    mintRevoked: r.bool(0.7),
    freezeRevoked: r.bool(0.75),
    dexPaid: r.bool(0.55),
    sellable: r.bool(0.92),
    deployerPrevTokens: deployerPrev,
    deployerRugCount: deployerRugs,
  };
  const risk = computeRisk(safety);

  const change24h = r.range(-72, 340);
  const candles = makeCandles(seed, spotPrice(curve) * HYPE_USD, change24h);

  return {
    id: def.ticker.toLowerCase(),
    name: def.name,
    ticker: def.ticker,
    logo: def.logo,
    description: def.blurb,
    category: def.category,
    createdAt: Date.now() - r.range(1000 * 60 * 2, 1000 * 60 * 60 * 24 * 20),
    status,
    price,
    change24h,
    volume24h: r.range(4000, 2_800_000),
    mcap,
    holders: safety.holders,
    totalSupply,
    curve,
    bondingPct,
    deployer: new Rand(seed + ":dep").address(),
    contract: new Rand(seed + ":ca").address(),
    safety,
    risk,
    kolCount: r.int(0, 6),
    proTraders: r.int(0, 24),
    candles,
    devTokens: makeDevTokens(seed, deployerPrev),
    socials: {
      x: r.bool(0.8) ? "https://x.com/" + def.ticker.toLowerCase() : undefined,
      tg: r.bool(0.7) ? "https://t.me/" + def.ticker.toLowerCase() : undefined,
      site: r.bool(0.5) ? "https://" + def.ticker.toLowerCase() + ".fun" : undefined,
    },
  };
}

let _tokens: Token[] | null = null;
export function getTokens(): Token[] {
  if (_tokens) return _tokens;
  _tokens = Array.from({ length: TOKEN_DEFS.length }, (_, i) => makeToken(i));
  return _tokens;
}

export function getToken(id: string): Token | undefined {
  return getTokens().find((t) => t.id === id);
}

const BADGE_POOL: HolderBadge[] = ["Sniper", "Insider", "Bundler", "Whale", "Fresh", "Pro", "Tracked", "KOL"];

export function getHolders(token: Token, count = 60): Holder[] {
  const r = new Rand(token.id + ":holders");
  const holders: Holder[] = [];
  let remaining = 100;
  for (let i = 0; i < count; i++) {
    const badges: HolderBadge[] = [];
    if (i === 0) badges.push("LP");
    if (i === 1) badges.push("Dev");
    for (const b of BADGE_POOL) if (r.bool(0.12)) badges.push(b);
    const pct = i === 0 ? r.range(6, 14) : Math.max(0.02, remaining * r.range(0.01, 0.14));
    remaining = Math.max(0, remaining - pct);
    const boughtUsd = r.range(50, 90000);
    const soldUsd = r.range(0, boughtUsd * 0.9);
    holders.push({
      wallet: new Rand(token.id + ":h:" + i).address(),
      rank: i + 1,
      badges: Array.from(new Set(badges)),
      otherTokens: r.int(1, 240),
      boughtUsd,
      boughtTokens: r.range(1000, 5_000_000),
      buys: r.int(1, 40),
      avgBuy: token.price * r.range(0.3, 1.1),
      soldUsd,
      soldTokens: r.range(0, 3_000_000),
      sells: r.int(0, 20),
      avgSell: token.price * r.range(0.5, 1.6),
      unrealizedPnl: r.range(-8000, 60000),
      remainingPct: pct,
    });
  }
  return holders;
}

export function getTrades(token: Token, count = 40): Trade[] {
  const r = new Rand(token.id + ":trades");
  const now = Date.now();
  const trades: Trade[] = [];
  for (let i = 0; i < count; i++) {
    const side: "buy" | "sell" = r.bool(0.58) ? "buy" : "sell";
    const amountHype = r.range(0.05, 40);
    const usd = amountHype * HYPE_USD;
    trades.push({
      id: token.id + ":t:" + i,
      tokenId: token.id,
      ts: now - i * r.range(1500, 40000),
      side,
      amountTokens: usd / token.price,
      amountHype,
      usd,
      price: token.price * r.range(0.96, 1.04),
      wallet: new Rand(token.id + ":tw:" + i).address(),
      tx: "0x" + new Rand(token.id + ":tx:" + i).hex(64),
    });
  }
  return trades.sort((a, b) => b.ts - a.ts);
}

export interface TopTrader extends Wallet {
  realizedPnl: number;
  unrealizedPnl: number;
  boughtUsd: number;
  soldUsd: number;
  wins: number;
  entry: "sniper" | "early" | "late";
}

export function getTopTraders(token: Token, count = 25): TopTrader[] {
  const r = new Rand(token.id + ":top");
  const out: TopTrader[] = [];
  for (let i = 0; i < count; i++) {
    const w = makeWallet(token.id + ":topw:" + i);
    out.push({
      ...w,
      realizedPnl: r.range(-5000, 180000) * (1 - i / count),
      unrealizedPnl: r.range(-4000, 90000),
      boughtUsd: r.range(500, 200000),
      soldUsd: r.range(0, 180000),
      wins: r.int(1, 60),
      entry: r.pick(["sniper", "early", "late"]),
    });
  }
  return out.sort((a, b) => b.realizedPnl - a.realizedPnl);
}

export function getWallet(address: string): Wallet {
  return makeWallet("wallet:" + address, { address });
}

export interface Kol extends Wallet {
  followers: number;
  volume: number;
  bestTrade: number;
  worstTrade: number;
}

export function getKols(count = 10): Kol[] {
  const r = new Rand("kols");
  const out: Kol[] = [];
  for (let i = 0; i < count; i++) {
    const w = makeWallet("kol:" + i, { isKol: true, kolName: KOL_NAMES[i % KOL_NAMES.length] });
    out.push({
      ...w,
      followers: r.int(1200, 240000),
      volume: r.range(200000, 12_000_000),
      bestTrade: r.range(20000, 400000),
      worstTrade: -r.range(2000, 60000),
    });
  }
  return out.sort((a, b) => b.pnlUsd - a.pnlUsd);
}

export const constants = { HYPE_USD };

// KOL activity + graduation feed for the live ticker / feeds.
export function getKolActivity(count = 30) {
  const r = new Rand("kolact");
  const kols = getKols();
  const tokens = getTokens();
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const k = r.pick(kols);
    const t = r.pick(tokens);
    return {
      id: "ka:" + i,
      ts: now - i * r.range(4000, 90000),
      kol: k,
      token: t,
      side: r.bool(0.7) ? ("buy" as const) : ("sell" as const),
      usd: r.range(500, 60000),
    };
  }).sort((a, b) => b.ts - a.ts);
}
