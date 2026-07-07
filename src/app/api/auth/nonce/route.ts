import { NextResponse } from "next/server";
import { issueNonce } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const nonce = issueNonce();
  return NextResponse.json({ nonce });
}
