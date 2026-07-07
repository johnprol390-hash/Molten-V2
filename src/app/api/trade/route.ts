import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { executeTrade } from "@/lib/trade-engine";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const tokenId = String(body?.tokenId ?? "");
  const side = body?.side === "sell" ? "sell" : "buy";
  const amount = Number(body?.amount);

  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "no session" }, { status: 401 });

  try {
    const result = await executeTrade(user.id, user.address, tokenId, side, amount);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.error === "token not found" ? 404 : 400 });
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("[trade] failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "trade failed" }, { status: 503 });
  }
}
