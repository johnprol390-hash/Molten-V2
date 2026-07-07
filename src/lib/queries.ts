import "server-only";
import { prisma, dbConfigured } from "./db";
import { computeRisk } from "./safety";
import { dbTokenToDomain, dbTradeToDomain, dbHolderToDomain } from "./serialize";
import type { Token } from "./types";

// Every read is wrapped so a missing/unreachable database degrades to empty
// data (rendering skeleton/empty states) instead of throwing — which on Vercel
// would surface as a 500/404. The app renders with only DATABASE_URL set, and
// renders empty-but-alive if the DB is momentarily unavailable.
async function safe<T>(fn: () => Promise<T>, fallback: T, label: string): Promise<T> {
  if (!dbConfigured()) return fallback;
  try {
    return await fn();
  } catch (err) {
    console.error(`[queries] ${label} failed:`, err instanceof Error ? err.message : err);
    return fallback;
  }
}

function withRiskFactors(token: Token): Token {
  return { ...token, risk: computeRisk(token.safety) };
}

export function queryTokens(): Promise<Token[]> {
  return safe(
    async () => {
      const rows = await prisma.token.findMany({ include: { devTokens: true }, orderBy: { createdAt: "desc" } });
      return rows.map(dbTokenToDomain).map(withRiskFactors);
    },
    [],
    "queryTokens",
  );
}

export function queryToken(id: string): Promise<Token | null> {
  return safe(
    async () => {
      const row = await prisma.token.findUnique({ where: { id }, include: { devTokens: true } });
      return row ? withRiskFactors(dbTokenToDomain(row)) : null;
    },
    null,
    "queryToken",
  );
}

export function queryTrades(tokenId: string, take = 60) {
  return safe(
    async () => {
      const rows = await prisma.trade.findMany({ where: { tokenId }, orderBy: { ts: "desc" }, take });
      return rows.map(dbTradeToDomain);
    },
    [],
    "queryTrades",
  );
}

export function queryHolders(tokenId: string, take = 80) {
  return safe(
    async () => {
      const rows = await prisma.holder.findMany({ where: { tokenId }, orderBy: { rank: "asc" }, take });
      return rows.map(dbHolderToDomain);
    },
    [],
    "queryHolders",
  );
}

export function queryKols() {
  return safe(
    async () => {
      const rows = await prisma.kolProfile.findMany({ include: { wallet: true }, orderBy: { volume: "desc" } });
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
    },
    [] as any[],
    "queryKols",
  );
}

export function queryProposals() {
  return safe(() => prisma.governanceProposal.findMany({ orderBy: { createdAt: "desc" } }), [] as any[], "queryProposals");
}

export function queryTreasury() {
  return safe(
    async () => {
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
    },
    { txns: [] as any[], totals: { all: 0 } as Record<string, number> },
    "queryTreasury",
  );
}

export function queryReferral() {
  return safe(() => prisma.referral.findFirst(), null, "queryReferral");
}

export function queryAnalytics() {
  return safe(
    async () => {
      const rows = await prisma.analyticsPoint.findMany({ orderBy: { day: "asc" } });
      const byMetric: Record<string, { day: number; value: number }[]> = {};
      for (const r of rows) {
        (byMetric[r.metric] ??= []).push({ day: new Date(r.day).getTime(), value: r.value });
      }
      return byMetric;
    },
    {} as Record<string, { day: number; value: number }[]>,
    "queryAnalytics",
  );
}

export function queryNotifications() {
  return safe(
    async () => {
      const user = await prisma.user.findFirst();
      if (!user) return [];
      return prisma.notification.findMany({ where: { userId: user.id }, orderBy: { ts: "desc" }, take: 30 });
    },
    [] as any[],
    "queryNotifications",
  );
}

export function queryPointsSummary() {
  return safe(
    async () => {
      const user = await prisma.user.findFirst();
      if (!user) return { points: 0, bySource: {} as Record<string, number>, achievements: [] as any[] };
      const [entries, achievements] = await Promise.all([
        prisma.pointsEntry.findMany({ where: { userId: user.id } }),
        prisma.achievement.findMany(),
      ]);
      const bySource: Record<string, number> = {};
      for (const e of entries) bySource[e.source] = (bySource[e.source] ?? 0) + e.amount;
      return { points: user.points, bySource, achievements };
    },
    { points: 0, bySource: {} as Record<string, number>, achievements: [] as any[] },
    "queryPointsSummary",
  );
}

const HYPE_USD = 32;

export function queryPositions(userId: string) {
  return safe(
    async () => {
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
    },
    [] as any[],
    "queryPositions",
  );
}

export function queryAdminStats() {
  return safe(
    async () => {
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
    },
    { users: 0, tokens: 0, trades: 0, proposals: 0, graduated: 0, highRisk: 0, flagged: [] as any[] },
    "queryAdminStats",
  );
}
