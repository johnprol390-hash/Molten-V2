export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const timeframe = searchParams.get("timeframe") || "24h";
  const limit = parseInt(searchParams.get("limit") || "50");

  const changeField =
    timeframe === "1h" ? "change1h" : timeframe === "6h" ? "change6h" : "change24h";

  const tokens = await prisma.token.findMany({
    orderBy: { trendingScore: "desc" },
    take: limit,
    include: {
      creator: { select: { walletAddress: true, username: true } },
      candles: {
        where: { timeframe: "5m" },
        orderBy: { timestamp: "desc" },
        take: 20,
      },
    },
  });

  return NextResponse.json({
    tokens: tokens.map((t, i) => ({
      ...t,
      rank: i + 1,
      change: t[changeField as keyof typeof t] as number,
      sparkline: t.candles.reverse().map((c) => c.close),
      candles: undefined,
    })),
  });
}
