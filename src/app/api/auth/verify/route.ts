import { NextResponse } from "next/server";
import { verifyMessage, isAddress } from "viem";
import { prisma } from "@/lib/db";
import { setSession, readNonce, clearNonce } from "@/lib/session";

export const dynamic = "force-dynamic";

// Verify a Sign-In-With-Ethereum (EIP-4361) signature and open a session.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const address = String(body?.address ?? "");
  const message = String(body?.message ?? "");
  const signature = body?.signature as `0x${string}` | undefined;

  if (!isAddress(address) || !message || !signature) {
    return NextResponse.json({ error: "address, message and signature are required" }, { status: 400 });
  }

  // The signed message must embed the nonce we issued.
  const nonce = readNonce();
  if (!nonce || !message.includes(nonce)) {
    return NextResponse.json({ error: "invalid or expired nonce" }, { status: 401 });
  }

  let valid = false;
  try {
    valid = await verifyMessage({ address: address as `0x${string}`, message, signature });
  } catch {
    valid = false;
  }
  if (!valid) {
    return NextResponse.json({ error: "signature verification failed" }, { status: 401 });
  }

  const lower = address.toLowerCase();
  const user = await prisma.user.upsert({
    where: { address: lower },
    update: {},
    create: { address: lower, username: lower.slice(0, 8) },
  });

  clearNonce();
  setSession(user.id);
  return NextResponse.json({ user: { id: user.id, address: user.address, points: user.points } });
}
