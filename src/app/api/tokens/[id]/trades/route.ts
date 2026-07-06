import { NextResponse } from "next/server";
import { queryTrades } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const trades = await queryTrades(params.id);
  return NextResponse.json({ trades });
}
