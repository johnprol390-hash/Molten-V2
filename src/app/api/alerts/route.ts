import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ configs: [] });
  try {
    const configs = await prisma.walletAlertConfig.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ configs });
  } catch {
    return NextResponse.json({ configs: [] });
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
    onBuy: b?.onBuy !== false,
    onSell: Boolean(b?.onSell),
    minUsd: Number.isFinite(Number(b?.minUsd)) ? Number(b?.minUsd) : 0,
    firstBuyOnly: Boolean(b?.firstBuyOnly),
    active: b?.active !== false,
  };
  try {
    const config = await prisma.walletAlertConfig.upsert({
      where: { userId_sourceAddress: { userId: user.id, sourceAddress } },
      update: data,
      create: { userId: user.id, sourceAddress, ...data },
    });
    return NextResponse.json({ config });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 503 });
  }
}

export async function DELETE(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "no session" }, { status: 401 });
  const address = new URL(req.url).searchParams.get("address");
  if (address) await prisma.walletAlertConfig.deleteMany({ where: { userId: user.id, sourceAddress: address.toLowerCase() } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
