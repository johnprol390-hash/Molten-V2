import "server-only";
import { prisma } from "./db";
import { publish } from "./publish";
import { applyBuy, applySell, spotPrice, graduationProgress, marketCapHype, type CurveParams } from "./curve";

export const HYPE_USD = 32;

export interface TradeResult {
  ok: boolean;
  error?: string;
  price?: number;
  bondingPct?: number;
  status?: string;
  avgPrice?: number;
  priceImpact?: number;
  tokensDelta?: number;
  usd?: number;
}

// Executes a trade against a token's bonding curve and persists all effects
// (Trade, Token curve/price, user Position, points) + broadcasts the fill.
// Shared by the /api/trade route and the copy-trading engine.
export async function executeTrade(
  userId: string,
  userAddress: string,
  tokenId: string,
  side: "buy" | "sell",
  amount: number,
  opts: { awardPoints?: boolean } = {},
): Promise<TradeResult> {
  if (!tokenId || !Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "tokenId and positive amount required" };
  }
  const token = await prisma.token.findUnique({ where: { id: tokenId } });
  if (!token) return { ok: false, error: "token not found" };

  const curve: CurveParams = {
    virtualHype: token.virtualHype,
    virtualTokens: token.virtualTokens,
    realHype: token.realHype,
    tokensSold: token.tokensSold,
    graduationHype: token.graduationHype,
    curveSupply: token.curveSupply,
  };

  let next: CurveParams;
  let tokensDelta: number;
  let hypeDelta: number;
  let usd: number;
  let avgPrice: number;
  let priceImpact: number;

  if (side === "buy") {
    const { curve: c, quote } = applyBuy(curve, amount);
    next = c;
    tokensDelta = quote.tokensOut;
    hypeDelta = amount;
    usd = amount * HYPE_USD;
    avgPrice = quote.avgPrice;
    priceImpact = quote.priceImpactPct;
  } else {
    const tokensIn = Math.min(amount, curve.tokensSold);
    const { curve: c, quote } = applySell(curve, tokensIn);
    next = c;
    tokensDelta = -tokensIn;
    hypeDelta = -quote.hypeOut;
    usd = quote.hypeOut * HYPE_USD;
    avgPrice = quote.avgPrice;
    priceImpact = quote.priceImpactPct;
  }

  const newPriceUsd = spotPrice(next) * HYPE_USD;
  const progress = graduationProgress(next);
  const bondingPct = Math.min(100, progress * 100);
  const status = progress >= 1 ? "graduated" : progress >= 0.7 ? "graduating" : "new";
  const mcapUsd = marketCapHype(next, token.totalSupply) * HYPE_USD;

  await prisma.trade.create({
    data: {
      id: `${tokenId}:x:${Date.now()}:${Math.random().toString(16).slice(2, 6)}`,
      tokenId,
      ts: new Date(),
      side,
      amountTokens: Math.abs(tokensDelta),
      amountHype: Math.abs(hypeDelta),
      usd,
      price: newPriceUsd,
      wallet: userAddress,
      tx: "0x" + Math.random().toString(16).slice(2).padEnd(16, "0"),
    },
  });

  await prisma.token.update({
    where: { id: tokenId },
    data: {
      realHype: next.realHype,
      tokensSold: next.tokensSold,
      price: newPriceUsd,
      mcap: mcapUsd,
      bondingPct,
      status,
      volume24h: { increment: usd },
    },
  });

  const existing = await prisma.position.findUnique({ where: { userId_tokenId: { userId, tokenId } } });
  if (side === "buy") {
    const prevHeld = existing?.tokensHeld ?? 0;
    const prevCostHype = (existing?.avgEntry ?? 0) * prevHeld;
    const newHeld = prevHeld + tokensDelta;
    const newAvg = newHeld > 0 ? (prevCostHype + hypeDelta) / newHeld : 0;
    await prisma.position.upsert({
      where: { userId_tokenId: { userId, tokenId } },
      update: { tokensHeld: newHeld, boughtHype: { increment: hypeDelta }, avgEntry: newAvg },
      create: { userId, tokenId, tokensHeld: newHeld, boughtHype: hypeDelta, avgEntry: newAvg },
    });
  } else if (existing) {
    const soldTokens = Math.abs(tokensDelta);
    const proceeds = Math.abs(hypeDelta);
    const costBasis = (existing.avgEntry ?? 0) * soldTokens;
    await prisma.position.update({
      where: { userId_tokenId: { userId, tokenId } },
      data: {
        tokensHeld: Math.max(0, existing.tokensHeld - soldTokens),
        soldHype: { increment: proceeds },
        realizedPnl: { increment: (proceeds - costBasis) * HYPE_USD },
      },
    });
  }

  if (opts.awardPoints !== false) {
    await prisma.pointsEntry.create({ data: { userId, source: "trade", amount: 10 } });
    await prisma.user.update({ where: { id: userId }, data: { points: { increment: 10 } } });
  }

  await publish({
    type: "trade",
    ts: Date.now(),
    trade: {
      tokenId,
      ticker: token.ticker,
      side,
      amountHype: Math.abs(hypeDelta),
      usd,
      price: newPriceUsd,
      wallet: userAddress.slice(0, 8) + "…",
    },
  });

  return { ok: true, price: newPriceUsd, bondingPct, status, avgPrice: avgPrice * HYPE_USD, priceImpact, tokensDelta, usd };
}
