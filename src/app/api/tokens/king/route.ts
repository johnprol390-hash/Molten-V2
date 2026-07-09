export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const token = await prisma.token.findFirst({
    where: { isGraduated: false, bondingProgress: { gte: 50 } },
    orderBy: { bondingProgress: "desc" },
    include: {
      creator: { select: { walletAddress: true, username: true } },
    },
  });

  return NextResponse.json(token);
}
