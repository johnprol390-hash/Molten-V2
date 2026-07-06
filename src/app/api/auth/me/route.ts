import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const id = getSessionUserId();
  if (!id) return NextResponse.json({ user: null });
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, address: true, username: true, points: true, paper: true },
  });
  return NextResponse.json({ user });
}
