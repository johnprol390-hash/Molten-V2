export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, tokenId } = body;

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const capture = await prisma.emailCapture.upsert({
      where: { email },
      update: { tokenId },
      create: { email, tokenId, source: "trading_waitlist" },
    });

    return NextResponse.json({ success: true, id: capture.id });
  } catch (error) {
    console.error("Email capture error:", error);
    return NextResponse.json({ error: "Failed to save email" }, { status: 500 });
  }
}
