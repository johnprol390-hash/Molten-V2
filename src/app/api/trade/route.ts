import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { publish } from "@/lib/publish";
import {
  applyBuy,
  applySell,
  spotPrice,
  graduationProgress,
  marketCapHype,
  type CurveParams,
} from "@/lib/curve";

export const dynamic = "force-dynamic";

const HYPE_USD = 32;

// Execute a trade against the bonding curve: applies the math, persists the
// Trade + updated Token + user Position, and broadcasts over the realtime layer.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const tokenId = String(body?.tokenId ?? "");
  const side = body?.side === "sell" ? "sell" : "buy";
  const amount = Number(body?.amount);
  if (!tokenId || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "tokenId and positive amount required" }, { status: 400 });
  }

  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "no session" }, { status: 401 });

  const token = await prisma.token.findUnique({ where: { id: tokenId } });
  if (!token) return NextResponse.json({ error: "token not found" }, { status: 404 });

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

  const newSpot = spotPrice(next);
  const newPriceUsd = newSpot * HYPE_USD;
  const progress = graduationProgress(next);
  const bondingPct = Math.min(100, progress * 100);
  const status = progress >= 1 ? "graduated" : progress >= 0.7 ? "graduating" : "new";
  const mcapUsd = marketCapHype(next, token.totalSupply) * HYPE_USD;

  const trade = await prisma.trade.create({
    data: {
      id: `${tokenId}:u:${Date.now()}`,
      tokenId,
      ts: new Date(),
      side,
      amountTokens: Math.abs(tokensDelta),
      amountHype: Math.abs(hypeDelta),
      usd,
      price: newPriceUsd,
      wallet: user.address,
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

  // Upsert the user's position for this token.
  const existing = await prisma.position.findUnique({
    where: { userId_tokenId: { userId: user.id, tokenId } },
  });
  if (side === "buy") {
    const prevHeld = existing?.tokensHeld ?? 0;
    const prevCostHype = (existing?.avgEntry ?? 0) * prevHeld;
    const newHeld = prevHeld + tokensDelta;
    const newAvg = newHeld > 0 ? (prevCostHype + hypeDelta) / newHeld : 0;
    await prisma.position.upsert({
      where: { userId_tokenId: { userId: user.id, tokenId } },
      update: { tokensHeld: newHeld, boughtHype: { increment: hypeDelta }, avgEntry: newAvg },
      create: { userId: user.id, tokenId, tokensHeld: newHeld, boughtHype: hypeDelta, avgEntry: newAvg },
    });
  } else if (existing) {
    const soldTokens = Math.abs(tokensDelta);
    const proceeds = Math.abs(hypeDelta);
    const costBasis = (existing.avgEntry ?? 0) * soldTokens;
    await prisma.position.update({
      where: { userId_tokenId: { userId: user.id, tokenId } },
      data: {
        tokensHeld: Math.max(0, existing.tokensHeld - soldTokens),
        soldHype: { increment: proceeds },
        realizedPnl: { increment: (proceeds - costBasis) * HYPE_USD },
      },
    });
  }

  // Award points for trading.
  await prisma.pointsEntry.create({ data: { userId: user.id, source: "trade", amount: 10 } });
  await prisma.user.update({ where: { id: user.id }, data: { points: { increment: 10 } } });

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
      wallet: user.address.slice(0, 8) + "…",
    },
  });

  return NextResponse.json({
    trade,
    price: newPriceUsd,
    bondingPct,
    status,
    avgPrice: avgPrice * HYPE_USD,
    priceImpact,
    tokensDelta,
  });
}
