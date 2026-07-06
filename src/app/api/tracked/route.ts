import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ tracked: [] });
  const tracked = await prisma.trackedWallet.findMany({ where: { userId: user.id } });
  return NextResponse.json({ tracked });
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "no session" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const address = String(body?.address ?? "");
  if (!address) return NextResponse.json({ error: "address required" }, { status: 400 });
  const tracked = await prisma.trackedWallet.upsert({
    where: { userId_address: { userId: user.id, address } },
    update: { name: body.name ?? "Wallet", emoji: body.emoji ?? "🎯" },
    create: { userId: user.id, address, name: body.name ?? "Wallet", emoji: body.emoji ?? "🎯" },
  });
  return NextResponse.json({ tracked });
}

export async function DELETE(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "no session" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");
  if (address) {
    await prisma.trackedWallet.deleteMany({ where: { userId: user.id, address } });
  }
  return NextResponse.json({ ok: true });
}
