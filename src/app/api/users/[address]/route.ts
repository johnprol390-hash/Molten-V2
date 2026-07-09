export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: { address: string } }
) {
  const user = await prisma.user.findUnique({
    where: { walletAddress: params.address.toLowerCase() },
    include: {
      tokens: { orderBy: { createdAt: "desc" }, take: 20 },
      comments: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          token: { select: { id: true, name: true, ticker: true, imageUrl: true } },
        },
      },
      followers: { include: { follower: true } },
      following: { include: { following: true } },
      _count: {
        select: {
          followers: true,
          following: true,
          tokens: true,
          comments: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const body = await request.json();
    const { username, bio, avatar } = body;

    const user = await prisma.user.update({
      where: { walletAddress: params.address.toLowerCase() },
      data: {
        ...(username !== undefined && { username }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar }),
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
