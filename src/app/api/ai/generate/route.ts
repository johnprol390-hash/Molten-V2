import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Templated AI token concept generator. In production this calls an LLM; here it
// composes deterministic-but-varied output from the prompt so the flow is real.
const THEMES: Record<string, { emojis: string[]; words: string[] }> = {
  dog: { emojis: ["🐕", "🐶", "🦴"], words: ["Doge", "Shiba", "Woof", "Bark"] },
  cat: { emojis: ["🐱", "😺", "🐈"], words: ["Cat", "Meow", "Whisker", "Purr"] },
  ai: { emojis: ["🧠", "🤖", "⚡"], words: ["Neuron", "Synapse", "Cortex", "Logic"] },
  moon: { emojis: ["🌙", "🚀", "✨"], words: ["Luna", "Orbit", "Rocket", "Comet"] },
  frog: { emojis: ["🐸", "🟢"], words: ["Pepe", "Toad", "Ribbit", "Lily"] },
  default: { emojis: ["🔥", "💎", "⚡", "🌊", "👑"], words: ["Molten", "Hyper", "Volt", "Blaze", "Prime"] },
};

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const prompt = String(body?.prompt ?? "").toLowerCase();
  const seed = Math.floor(Math.random() * 1000);

  const themeKey = Object.keys(THEMES).find((k) => prompt.includes(k)) ?? "default";
  const theme = THEMES[themeKey];
  const word = pick(theme.words, seed);
  const suffix = pick(["Fi", "X", "DAO", "Coin", "Chain", "Verse"], seed >> 2);
  const name = `${word} ${suffix}`;
  const ticker = (word.slice(0, 4) + suffix.slice(0, 1)).toUpperCase();
  const logo = pick(theme.emojis, seed >> 1);

  const descriptions = [
    `${name} is the community-first ${themeKey === "default" ? "meme" : themeKey} token native to Hyperliquid — fair launch, LP burned, and built to bond fast.`,
    `Powered by Hyperliquid's lightning liquidity, ${name} blends viral energy with pro-grade safety. Ape responsibly.`,
    `${name}: no team allocation, no presale, just pure bonding-curve degeneracy on the fastest chain in crypto.`,
  ];

  return NextResponse.json({
    name,
    ticker,
    logo,
    description: pick(descriptions, seed),
    banner: `A neon ${themeKey} mascot over a dark Hyperliquid-green gradient, cyberpunk style`,
  });
}
