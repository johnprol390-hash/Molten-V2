import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { queryNotifications } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const notifications = await queryNotifications();
  return NextResponse.json({ notifications });
}

// Mark all as read.
export async function PATCH() {
  const user = await prisma.user.findFirst();
  if (user) await prisma.notification.updateMany({ where: { userId: user.id }, data: { read: true } });
  return NextResponse.json({ ok: true });
}
