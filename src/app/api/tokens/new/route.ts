export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") || "all";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "30");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  const now = new Date();

  if (filter === "hour") {
    where.createdAt = { gte: new Date(now.getTime() - 3600000) };
  } else if (filter === "today") {
    where.createdAt = { gte: new Date(now.setHours(0, 0, 0, 0)) };
  }

  const [tokens, total] = await Promise.all([
    prisma.token.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        creator: { select: { walletAddress: true, username: true } },
      },
    }),
    prisma.token.count({ where }),
  ]);

  return NextResponse.json({ tokens, total, page, hasMore: skip + limit < total });
}
