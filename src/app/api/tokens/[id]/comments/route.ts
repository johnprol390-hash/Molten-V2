export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { userId, content, parentId, imageUrl } = body;

    if (!userId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const token = await prisma.token.findFirst({
      where: { OR: [{ id: params.id }, { contractAddress: params.id }] },
    });

    if (!token) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        tokenId: token.id,
        userId,
        content,
        parentId,
        imageUrl,
      },
      include: {
        user: { select: { id: true, walletAddress: true, username: true, avatar: true } },
      },
    });

    await prisma.token.update({
      where: { id: token.id },
      data: { replyCount: { increment: 1 } },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Comment error:", error);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
