import { NextResponse } from "next/server";
import { queryHolders } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const holders = await queryHolders(params.id);
  return NextResponse.json({ holders });
}
