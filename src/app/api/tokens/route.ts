export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort") || "trending";
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { ticker: { contains: search, mode: "insensitive" } },
      { contractAddress: { contains: search, mode: "insensitive" } },
    ];
  }

  let orderBy: Record<string, string> = { trendingScore: "desc" };

  switch (sort) {
    case "new":
      orderBy = { createdAt: "desc" };
      break;
    case "aboutToGraduate":
      where.isGraduated = false;
      where.bondingProgress = { gte: 70 };
      orderBy = { bondingProgress: "desc" };
      break;
    case "graduated":
      where.isGraduated = true;
      orderBy = { graduatedAt: "desc" };
      break;
    case "marketCap":
      orderBy = { marketCap: "desc" };
      break;
    default:
      orderBy = { trendingScore: "desc" };
  }

  const [tokens, total] = await Promise.all([
    prisma.token.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        creator: { select: { walletAddress: true, username: true, avatar: true } },
        candles: {
          where: { timeframe: "5m" },
          orderBy: { timestamp: "desc" },
          take: 20,
        },
      },
    }),
    prisma.token.count({ where }),
  ]);

  return NextResponse.json({
    tokens: tokens.map((t) => ({
      ...t,
      sparkline: t.candles.reverse().map((c) => c.close),
      candles: undefined,
    })),
    total,
    page,
    hasMore: skip + limit < total,
  });
}
