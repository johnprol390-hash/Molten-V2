import "server-only";
import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "./db";

const COOKIE = "molten_session";
const SECRET = process.env.SESSION_SECRET ?? "molten-dev-secret-change-me";

// Signed cookie value: userId.signature — a lightweight stand-in for iron-session.
// SPEC: real deployment uses SIWE (EIP-4361) + iron-session; the signature guard
// here keeps the demo session tamper-evident without external deps.
function sign(userId: string): string {
  const sig = crypto.createHmac("sha256", SECRET).update(userId).digest("hex").slice(0, 32);
  return `${userId}.${sig}`;
}

function verify(value: string | undefined): string | null {
  if (!value) return null;
  const [userId, sig] = value.split(".");
  if (!userId || !sig) return null;
  const expected = crypto.createHmac("sha256", SECRET).update(userId).digest("hex").slice(0, 32);
  return sig === expected ? userId : null;
}

export function setSession(userId: string) {
  cookies().set(COOKIE, sign(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSession() {
  cookies().delete(COOKIE);
}

const NONCE_COOKIE = "molten_nonce";

/** Issue a SIWE nonce and stash it (httpOnly) so /verify can check it. */
export function issueNonce(): string {
  const nonce = crypto.randomBytes(16).toString("hex");
  cookies().set(NONCE_COOKIE, nonce, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });
  return nonce;
}

export function readNonce(): string | null {
  return cookies().get(NONCE_COOKIE)?.value ?? null;
}

export function clearNonce() {
  cookies().delete(NONCE_COOKIE);
}

export function getSessionUserId(): string | null {
  return verify(cookies().get(COOKIE)?.value);
}

/** Resolve the current user, or fall back to the seeded demo user. Never throws. */
export async function currentUser() {
  if (!process.env.DATABASE_URL) return null;
  try {
    const id = getSessionUserId();
    if (id) {
      const u = await prisma.user.findUnique({ where: { id } });
      if (u) return u;
    }
    return await prisma.user.findFirst();
  } catch (err) {
    console.error("[session] currentUser failed:", err instanceof Error ? err.message : err);
    return null;
  }
}
