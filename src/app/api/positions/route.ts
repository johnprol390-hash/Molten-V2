import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { queryPositions } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ positions: [] });
  const all = await queryPositions(user.id);
  const url = new URL(req.url);
  const tokenId = url.searchParams.get("tokenId");
  const positions = tokenId ? all.filter((p) => p.tokenId === tokenId) : all;
  const totalValue = all.reduce((s, p) => s + p.value, 0);
  const totalUnrealized = all.reduce((s, p) => s + p.unrealized, 0);
  return NextResponse.json({ positions, totalValue, totalUnrealized });
}
