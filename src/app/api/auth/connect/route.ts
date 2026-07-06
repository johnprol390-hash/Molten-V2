import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { setSession } from "@/lib/session";

export const dynamic = "force-dynamic";

// Simulated sign-in-with-wallet: upsert the user by address and set a session.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const address = String(body?.address ?? "").toLowerCase();
  if (!/^0x[0-9a-f]{6,}$/.test(address)) {
    return NextResponse.json({ error: "invalid address" }, { status: 400 });
  }
  const user = await prisma.user.upsert({
    where: { address },
    update: {},
    create: { address, username: address.slice(0, 8) },
  });
  setSession(user.id);
  return NextResponse.json({ user: { id: user.id, address: user.address, points: user.points, paper: user.paper } });
}
