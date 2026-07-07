import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ configs: [], log: [] });
  try {
    const [configs, log] = await Promise.all([
      prisma.copyTradeConfig.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
      prisma.copyTrade.findMany({ where: { userId: user.id }, orderBy: { ts: "desc" }, take: 40 }),
    ]);
    return NextResponse.json({ configs, log });
  } catch {
    return NextResponse.json({ configs: [], log: [] });
  }
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "no session" }, { status: 401 });
  const b = await req.json().catch(() => null);
  const sourceAddress = String(b?.sourceAddress ?? "").toLowerCase();
  if (!sourceAddress) return NextResponse.json({ error: "sourceAddress required" }, { status: 400 });

  const data = {
    sourceName: b?.sourceName ?? null,
    ratio: clamp(Number(b?.ratio), 0.01, 5, 0.1),
    maxPerTradeHype: clamp(Number(b?.maxPerTradeHype), 0.01, 1000, 1),
    dailyCapHype: clamp(Number(b?.dailyCapHype), 0.1, 100000, 10),
    maxRisk: Math.round(clamp(Number(b?.maxRisk), 0, 100, 66)),
    requireLpBurned: Boolean(b?.requireLpBurned),
    copySell: b?.copySell !== false,
    active: b?.active !== false,
  };
  try {
    const config = await prisma.copyTradeConfig.upsert({
      where: { userId_sourceAddress: { userId: user.id, sourceAddress } },
      update: data,
      create: { userId: user.id, sourceAddress, ...data },
    });
    return NextResponse.json({ config });
  } catch (e) {
    return NextResponse.json({ error: "failed" }, { status: 503 });
  }
}

export async function DELETE(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "no session" }, { status: 401 });
  const address = new URL(req.url).searchParams.get("address");
  if (address) await prisma.copyTradeConfig.deleteMany({ where: { userId: user.id, sourceAddress: address.toLowerCase() } }).catch(() => {});
  return NextResponse.json({ ok: true });
}

function clamp(n: number, lo: number, hi: number, fallback: number) {
  if (!Number.isFinite(n)) return fallback;
  return Math.max(lo, Math.min(hi, n));
}
