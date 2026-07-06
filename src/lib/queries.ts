import "server-only";
import { prisma } from "./db";
import { computeRisk } from "./safety";
import { dbTokenToDomain, dbTradeToDomain, dbHolderToDomain } from "./serialize";
import type { Token } from "./types";

// Recompute the risk factor breakdown from stored safety inputs (kept out of
// the DB since it's derivable — single source of truth is the safety engine).
function withRiskFactors(token: Token): Token {
  const risk = computeRisk(token.safety);
  return { ...token, risk };
}

export async function queryTokens(): Promise<Token[]> {
  const rows = await prisma.token.findMany({
    include: { devTokens: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(dbTokenToDomain).map(withRiskFactors);
}

export async function queryToken(id: string): Promise<Token | null> {
  const row = await prisma.token.findUnique({
    where: { id },
    include: { devTokens: true },
  });
  if (!row) return null;
  return withRiskFactors(dbTokenToDomain(row));
}

export async function queryTrades(tokenId: string, take = 60) {
  const rows = await prisma.trade.findMany({
    where: { tokenId },
    orderBy: { ts: "desc" },
    take,
  });
  return rows.map(dbTradeToDomain);
}

export async function queryHolders(tokenId: string, take = 80) {
  const rows = await prisma.holder.findMany({
    where: { tokenId },
    orderBy: { rank: "asc" },
    take,
  });
  return rows.map(dbHolderToDomain);
}

export async function queryKols() {
  const rows = await prisma.kolProfile.findMany({
    include: { wallet: true },
    orderBy: { volume: "desc" },
  });
  return rows.map((k) => ({
    address: k.address,
    kolName: k.name,
    twitter: k.twitter ?? undefined,
    followers: k.followers,
    credibility: k.credibility,
    volume: k.volume,
    bestTrade: k.bestTrade,
    worstTrade: k.worstTrade,
    pnlUsd: k.wallet.pnlUsd,
    pnlPct: k.wallet.pnlPct,
    winRate: k.wallet.winRate,
    avgRoi: k.wallet.avgRoi,
    avgHoldMs: k.wallet.avgHoldMs,
    trades: k.wallet.trades,
    isKol: true as const,
  }));
}

export async function queryProposals() {
  return prisma.governanceProposal.findMany({ orderBy: { createdAt: "desc" } });
}

export async function queryTreasury() {
  const txns = await prisma.treasuryTransaction.findMany({ orderBy: { ts: "desc" }, take: 60 });
  const totals = txns.reduce(
    (acc, t) => {
      acc.all += t.usd;
      acc[t.kind] = (acc[t.kind] ?? 0) + t.usd;
      return acc;
    },
    { all: 0 } as Record<string, number>,
  );
  return { txns, totals };
}

export async function queryReferral() {
  return prisma.referral.findFirst();
}

export async function queryAnalytics() {
  const rows = await prisma.analyticsPoint.findMany({ orderBy: { day: "asc" } });
  const byMetric: Record<string, { day: number; value: number }[]> = {};
  for (const r of rows) {
    (byMetric[r.metric] ??= []).push({ day: new Date(r.day).getTime(), value: r.value });
  }
  return byMetric;
}

export async function queryNotifications() {
  const user = await prisma.user.findFirst();
  if (!user) return [];
  return prisma.notification.findMany({ where: { userId: user.id }, orderBy: { ts: "desc" }, take: 30 });
}

export async function queryPointsSummary() {
  const user = await prisma.user.findFirst();
  if (!user) return { points: 0, bySource: {} as Record<string, number>, achievements: [] };
  const [entries, achievements] = await Promise.all([
    prisma.pointsEntry.findMany({ where: { userId: user.id } }),
    prisma.achievement.findMany(),
  ]);
  const bySource: Record<string, number> = {};
  for (const e of entries) bySource[e.source] = (bySource[e.source] ?? 0) + e.amount;
  return { points: user.points, bySource, achievements };
}

const HYPE_USD = 32;

export async function queryPositions(userId: string) {
  const positions = await prisma.position.findMany({
    where: { userId, tokensHeld: { gt: 0 } },
    orderBy: { updatedAt: "desc" },
  });
  const tokenIds = positions.map((p) => p.tokenId);
  const tokens = await prisma.token.findMany({ where: { id: { in: tokenIds } } });
  const byId = new Map(tokens.map((t) => [t.id, t]));
  return positions.map((p) => {
    const t = byId.get(p.tokenId);
    const price = t?.price ?? 0;
    const value = p.tokensHeld * price;
    const costUsd = p.avgEntry * p.tokensHeld * HYPE_USD;
    const unrealized = value - costUsd;
    return {
      tokenId: p.tokenId,
      ticker: t?.ticker ?? "",
      name: t?.name ?? "",
      logo: t?.logo ?? "",
      tokensHeld: p.tokensHeld,
      avgEntryUsd: p.avgEntry * HYPE_USD,
      value,
      unrealized,
      unrealizedPct: costUsd > 0 ? (unrealized / costUsd) * 100 : 0,
      realized: p.realizedPnl,
      boughtUsd: p.boughtHype * HYPE_USD,
      soldUsd: p.soldHype * HYPE_USD,
    };
  });
}

export async function queryAdminStats() {
  const [users, tokens, trades, proposals, graduated, highRisk] = await Promise.all([
    prisma.user.count(),
    prisma.token.count(),
    prisma.trade.count(),
    prisma.governanceProposal.count(),
    prisma.token.count({ where: { status: "graduated" } }),
    prisma.token.count({ where: { riskScore: { gte: 66 } } }),
  ]);
  const flagged = await prisma.token.findMany({
    where: { riskScore: { gte: 60 } },
    orderBy: { riskScore: "desc" },
    take: 12,
    select: { id: true, name: true, ticker: true, logo: true, riskScore: true, riskLevel: true, deployer: true },
  });
  return { users, tokens, trades, proposals, graduated, highRisk, flagged };
}
