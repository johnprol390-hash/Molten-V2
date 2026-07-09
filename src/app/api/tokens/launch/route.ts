export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createUserToken } from "@/lib/sim";

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
    console.error("Launch error:", error);
    return NextResponse.json({ error: "Failed to launch token" }, { status: 500 });
  }
}
