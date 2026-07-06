import { NextResponse } from "next/server";
import { queryKols } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const kols = await queryKols();
  return NextResponse.json({ kols });
}
