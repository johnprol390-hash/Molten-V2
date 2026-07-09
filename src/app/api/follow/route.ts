export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { followerId, followingId } = body;

    if (!followerId || !followingId) {
      return NextResponse.json({ error: "Missing IDs" }, { status: 400 });
    }

    const follow = await prisma.follow.create({
      data: { followerId, followingId },
    });

    return NextResponse.json(follow, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Already following" }, { status: 409 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const followerId = searchParams.get("followerId");
  const followingId = searchParams.get("followingId");

  if (!followerId || !followingId) {
    return NextResponse.json({ error: "Missing IDs" }, { status: 400 });
  }

  await prisma.follow.deleteMany({
    where: { followerId, followingId },
  });

  return NextResponse.json({ success: true });
}
