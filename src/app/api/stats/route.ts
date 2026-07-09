export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const count = await prisma.token.count();
  return NextResponse.json({ count });
}
