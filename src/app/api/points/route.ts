import { NextResponse } from "next/server";
import { queryPointsSummary } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await queryPointsSummary();
  return NextResponse.json(data);
}
