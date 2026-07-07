import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { queryProposals } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const proposals = await queryProposals();
  return NextResponse.json({ proposals });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.title || !body?.description) {
    return NextResponse.json({ error: "title and description required" }, { status: 400 });
  }
  const proposal = await prisma.governanceProposal.create({
    data: {
      title: String(body.title).slice(0, 140),
      description: String(body.description).slice(0, 2000),
      category: body.category ?? "General",
      status: "active",
      quorum: 1_000_000,
      endsAt: new Date(Date.now() + 7 * 86400000),
    },
  });
  return NextResponse.json({ proposal }, { status: 201 });
}
