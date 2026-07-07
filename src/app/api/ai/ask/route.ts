import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Templated AI assistant. Answers questions grounded in real token data from the
// DB. In production this is an LLM with tool access; here it's rule-based over
// the indexed data so the feature works end-to-end.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const q = String(body?.question ?? "").toLowerCase();

  const tokens = await prisma.token.findMany();
  if (tokens.length === 0) return NextResponse.json({ answer: "No token data indexed yet." });

  let answer = "";

  if (q.includes("safest") || q.includes("lowest risk")) {
    const t = [...tokens].sort((a, b) => a.riskScore - b.riskScore)[0];
    answer = `The safest token right now is ${t.name} (${t.ticker}) with a Risk Score of ${t.riskScore}/100 — ${t.lpBurnedPct >= 99 ? "LP fully burned" : "LP partially burned"}, ${t.mintRevoked ? "mint revoked" : "mint still live"}.`;
  } else if (q.includes("riskiest") || q.includes("highest risk") || q.includes("avoid")) {
    const t = [...tokens].sort((a, b) => b.riskScore - a.riskScore)[0];
    answer = `Be careful with ${t.name} (${t.ticker}) — Risk Score ${t.riskScore}/100, snipers ${t.snipersPct.toFixed(0)}%, insiders ${t.insidersPct.toFixed(0)}%, top-10 concentration ${t.top10Pct.toFixed(0)}%.`;
  } else if (q.includes("volume") || q.includes("hottest") || q.includes("trending")) {
    const t = [...tokens].sort((a, b) => b.volume24h - a.volume24h)[0];
    answer = `${t.name} (${t.ticker}) leads on volume with $${Math.round(t.volume24h).toLocaleString()} in 24h and ${t.change24h.toFixed(0)}% price change.`;
  } else if (q.includes("graduat")) {
    const closest = tokens.filter((t) => t.status !== "graduated").sort((a, b) => b.bondingPct - a.bondingPct)[0];
    answer = closest
      ? `${closest.name} (${closest.ticker}) is closest to graduation at ${closest.bondingPct.toFixed(0)}% of its bonding curve.`
      : "All tracked tokens have already graduated.";
  } else if (q.includes("holder")) {
    const t = [...tokens].sort((a, b) => b.holdersCount - a.holdersCount)[0];
    answer = `${t.name} (${t.ticker}) has the most holders: ${t.holdersCount.toLocaleString()}.`;
  } else {
    const avgRisk = Math.round(tokens.reduce((s, t) => s + t.riskScore, 0) / tokens.length);
    const graduated = tokens.filter((t) => t.status === "graduated").length;
    answer = `There are ${tokens.length} tokens indexed with an average Risk Score of ${avgRisk}/100; ${graduated} have graduated. Try asking about the safest token, the highest volume, or what's closest to graduating.`;
  }

  return NextResponse.json({ answer });
}
