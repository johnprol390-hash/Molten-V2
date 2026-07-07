import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Cast (or update) a vote on a proposal. Uses the demo user as the voter and a
// fixed voting power for the simulation; persists to the DB and returns tallies.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const support = Boolean(body?.support);
  const power = 8400;

  const user = await prisma.user.findFirst();
  if (!user) return NextResponse.json({ error: "no user" }, { status: 400 });

  const proposal = await prisma.governanceProposal.findUnique({ where: { id: params.id } });
  if (!proposal) return NextResponse.json({ error: "not found" }, { status: 404 });

  const existing = await prisma.governanceVote.findUnique({
    where: { proposalId_userId: { proposalId: params.id, userId: user.id } },
  });

  await prisma.$transaction(async (tx) => {
    if (existing) {
      // revert previous tally
      await tx.governanceProposal.update({
        where: { id: params.id },
        data: existing.support
          ? { votesFor: { decrement: existing.power } }
          : { votesAgainst: { decrement: existing.power } },
      });
      await tx.governanceVote.update({
        where: { id: existing.id },
        data: { support, power },
      });
    } else {
      await tx.governanceVote.create({
        data: { proposalId: params.id, userId: user.id, support, power },
      });
    }
    await tx.governanceProposal.update({
      where: { id: params.id },
      data: support ? { votesFor: { increment: power } } : { votesAgainst: { increment: power } },
    });
  });

  const updated = await prisma.governanceProposal.findUnique({ where: { id: params.id } });
  return NextResponse.json({ proposal: updated, voted: support });
}
