import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const messages = await prisma.message.findMany({
    where: { tokenId: params.id },
    orderBy: { ts: "asc" },
    take: 100,
  });
  return NextResponse.json({ messages });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const text = String(body?.text ?? "").trim().slice(0, 500);
  if (!text) return NextResponse.json({ error: "empty message" }, { status: 400 });

  const user = await currentUser();
  const author = user?.username ?? user?.address?.slice(0, 8) ?? "anon";

  const message = await prisma.message.create({
    data: { tokenId: params.id, userId: user?.id ?? null, author, text },
  });

  return NextResponse.json({ message }, { status: 201 });
}
