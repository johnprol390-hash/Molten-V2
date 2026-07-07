import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { QUESTS } from "@/lib/quests";

export const dynamic = "force-dynamic";

function today() {
  return new Date().toISOString().slice(0, 10);
}
function startOfDay() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function progressFor(userId: string, address: string) {
  const since = startOfDay();
  const [trades, tracked, votes, msgs, positions] = await Promise.all([
    prisma.trade.count({ where: { wallet: address, ts: { gte: since } } }),
    prisma.trackedWallet.count({ where: { userId } }),
    prisma.governanceVote.count({ where: { userId } }),
    prisma.message.count({ where: { userId, ts: { gte: since } } }),
    prisma.position.count({ where: { userId, tokensHeld: { gt: 0 } } }),
  ]);
  return { trade3: trades, track1: tracked, vote1: votes, chat1: msgs, hold1: positions } as Record<string, number>;
}

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ quests: QUESTS.map((q) => ({ ...q, progress: 0, claimed: false })) });
  try {
    const prog = await progressFor(user.id, user.address);
    const claims = await prisma.questClaim.findMany({ where: { userId: user.id, day: today() } });
    const claimed = new Set(claims.map((c) => c.questKey));
    return NextResponse.json({
      quests: QUESTS.map((q) => ({
        ...q,
        progress: Math.min(q.target, prog[q.key] ?? 0),
        claimed: claimed.has(q.key),
      })),
    });
  } catch {
    return NextResponse.json({ quests: QUESTS.map((q) => ({ ...q, progress: 0, claimed: false })) });
  }
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "no session" }, { status: 401 });
  const b = await req.json().catch(() => null);
  const quest = QUESTS.find((q) => q.key === b?.questKey);
  if (!quest) return NextResponse.json({ error: "unknown quest" }, { status: 400 });

  try {
    const prog = await progressFor(user.id, user.address);
    if ((prog[quest.key] ?? 0) < quest.target) {
      return NextResponse.json({ error: "quest not complete" }, { status: 400 });
    }
    await prisma.questClaim.create({
      data: { userId: user.id, questKey: quest.key, day: today(), points: quest.points },
    });
    await prisma.user.update({ where: { id: user.id }, data: { points: { increment: quest.points } } });
    await prisma.pointsEntry.create({ data: { userId: user.id, source: "streak", amount: quest.points } });
    return NextResponse.json({ ok: true, points: quest.points });
  } catch (e: any) {
    // Unique violation = already claimed today.
    if (e?.code === "P2002") return NextResponse.json({ error: "already claimed" }, { status: 409 });
    return NextResponse.json({ error: "failed" }, { status: 503 });
  }
}
