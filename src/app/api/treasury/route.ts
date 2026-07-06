import { NextResponse } from "next/server";
import { queryTreasury } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await queryTreasury();
  return NextResponse.json(data);
}
