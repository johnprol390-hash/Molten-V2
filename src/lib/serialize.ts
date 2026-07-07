import type { Token, Trade, Holder, Candle } from "./types";
import type { RiskResult } from "./safety";

// Map a flattened Prisma Token row into the rich domain Token used by the UI.
export function dbTokenToDomain(t: any): Token {
  return {
    id: t.id,
    name: t.name,
    ticker: t.ticker,
    logo: t.logo,
    description: t.description,
    category: t.category,
    createdAt: new Date(t.createdAt).getTime(),
    status: t.status,
    price: t.price,
    change24h: t.change24h,
    volume24h: t.volume24h,
    mcap: t.mcap,
    holders: t.holdersCount,
    totalSupply: t.totalSupply,
    bondingPct: t.bondingPct,
    curve: {
      virtualHype: t.virtualHype,
      virtualTokens: t.virtualTokens,
      realHype: t.realHype,
      tokensSold: t.tokensSold,
      graduationHype: t.graduationHype,
      curveSupply: t.curveSupply,
    },
    deployer: t.deployer,
    contract: t.contract,
    safety: {
      top10Pct: t.top10Pct,
      devHoldingsPct: t.devHoldingsPct,
      snipersPct: t.snipersPct,
      insidersPct: t.insidersPct,
      bundlersPct: t.bundlersPct,
      lpBurnedPct: t.lpBurnedPct,
      holders: t.holdersCount,
      freshWalletPct: t.freshWalletPct,
      mintRevoked: t.mintRevoked,
      freezeRevoked: t.freezeRevoked,
      dexPaid: t.dexPaid,
      sellable: t.sellable,
      deployerPrevTokens: t.deployerPrevTokens,
      deployerRugCount: t.deployerRugCount,
    },
    risk: {
      score: t.riskScore,
      level: t.riskLevel as RiskResult["level"],
      factors: [],
    },
    kolCount: t.kolCount,
    proTraders: t.proTraders,
    candles: (JSON.parse(t.candles || "[]") as Candle[]),
    devTokens: (t.devTokens ?? []).map((d: any) => ({
      name: d.name,
      ticker: d.ticker,
      launchedAt: new Date(d.launchedAt).getTime(),
      peakMcap: d.peakMcap,
      currentMcap: d.currentMcap,
      outcome: d.outcome,
    })),
    socials: JSON.parse(t.socials || "{}"),
  };
}

export function dbTradeToDomain(tr: any): Trade {
  return {
    id: tr.id,
    tokenId: tr.tokenId,
    ts: new Date(tr.ts).getTime(),
    side: tr.side,
    amountTokens: tr.amountTokens,
    amountHype: tr.amountHype,
    usd: tr.usd,
    price: tr.price,
    wallet: tr.wallet,
    tx: tr.tx,
  };
}

export function dbHolderToDomain(h: any): Holder {
  return {
    wallet: h.wallet,
    rank: h.rank,
    badges: JSON.parse(h.badges || "[]"),
    otherTokens: h.otherTokens,
    boughtUsd: h.boughtUsd,
    boughtTokens: h.boughtTokens,
    buys: h.buys,
    avgBuy: h.avgBuy,
    soldUsd: h.soldUsd,
    soldTokens: h.soldTokens,
    sells: h.sells,
    avgSell: h.avgSell,
    unrealizedPnl: h.unrealizedPnl,
    remainingPct: h.remainingPct,
  };
}
