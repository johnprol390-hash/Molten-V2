import { NextResponse } from "next/server";
import { queryWalletActivity } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { address: string } }) {
  const data = await queryWalletActivity(params.address);
  return NextResponse.json(data);
}
