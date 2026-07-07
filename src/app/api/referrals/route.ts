import { NextResponse } from "next/server";
import { queryReferral } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const referral = await queryReferral();
  return NextResponse.json({ referral });
}
