export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createUserToken } from "@/lib/sim";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await prisma.token.findFirst({
    where: {
      OR: [{ id: params.id }, { contractAddress: params.id }],
    },
    include: {
      creator: { select: { id: true, walletAddress: true, username: true, avatar: true } },
      holders: { orderBy: { balance: "desc" }, take: 20 },
      comments: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          user: { select: { id: true, walletAddress: true, username: true, avatar: true } },
          replies: {
            include: {
              user: { select: { id: true, walletAddress: true, username: true, avatar: true } },
            },
          },
        },
      },
      activities: { orderBy: { createdAt: "desc" }, take: 30 },
    },
  });

  if (!token) {
    return NextResponse.json({ error: "Token not found" }, { status: 404 });
  }

  return NextResponse.json(token);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { creatorId, name, ticker, description, imageUrl, website, twitter, telegram } = body;

    if (!creatorId || !name || !ticker || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const token = await createUserToken(creatorId, {
      name,
      ticker,
      description,
      imageUrl: imageUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${ticker}`,
      website,
      twitter,
      telegram,
    });

    return NextResponse.json(token, { status: 201 });
  } catch (error) {
    console.error("Create token error:", error);
    return NextResponse.json({ error: "Failed to create token" }, { status: 500 });
  }
}
