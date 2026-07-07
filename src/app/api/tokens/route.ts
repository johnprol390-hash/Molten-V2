import { NextResponse } from "next/server";
import { queryTokens } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const tokens = await queryTokens();
  return NextResponse.json({ tokens });
}
