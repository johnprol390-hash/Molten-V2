import { NextResponse } from "next/server";
import { queryToken } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const token = await queryToken(params.id);
  if (!token) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ token });
}
