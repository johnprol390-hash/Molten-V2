import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { runEngineForUser } from "@/lib/engine";

export const dynamic = "force-dynamic";

// Drives the tracking layer: emits buy alerts and executes copy trades for the
// current user. Called periodically by the client (or a Vercel Cron).
export async function POST() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ alerts: 0, copies: 0, messages: [] });
  try {
    const result = await runEngineForUser(user.id, user.address);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[engine] tick failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ alerts: 0, copies: 0, messages: [] });
  }
}
