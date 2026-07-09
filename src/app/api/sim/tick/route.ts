import { NextResponse } from "next/server";
import { runSimulationTick } from "@/lib/sim";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

let lastTick = 0;
const TICK_INTERVAL = 5000; // 5 seconds

export async function GET() {
  const now = Date.now();

  if (now - lastTick >= TICK_INTERVAL) {
    lastTick = now;
    try {
      const result = await runSimulationTick();
      return NextResponse.json({ ticked: true, ...result, timestamp: now });
    } catch (error) {
      console.error("Sim tick error:", error);
      return NextResponse.json({ ticked: false, error: "Tick failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ ticked: false, timestamp: now });
}

export async function POST() {
  return GET();
}
