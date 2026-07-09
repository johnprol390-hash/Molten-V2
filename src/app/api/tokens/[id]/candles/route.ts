export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const timeframe = searchParams.get("timeframe") || "5m";
  const limit = parseInt(searchParams.get("limit") || "200");

  const token = await prisma.token.findFirst({
    where: {
      OR: [{ id: params.id }, { contractAddress: params.id }],
    },
    select: { id: true },
  });

  if (!token) {
    return NextResponse.json({ error: "Token not found" }, { status: 404 });
  }

  const candles = await prisma.candle.findMany({
    where: { tokenId: token.id, timeframe },
    orderBy: { timestamp: "asc" },
    take: limit,
  });

  return NextResponse.json(candles);
}
