import { NextResponse } from "next/server";
import { queryAnalytics } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const metrics = await queryAnalytics();
  return NextResponse.json({ metrics });
}
