import Link from "next/link";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    emoji: "🚀",
    title: "Launch",
    description:
      "Connect your wallet and create a memecoin in seconds. Pick a name, ticker, upload a logo, and hit launch. No code, no hassle — your token goes live instantly on the Molten board.",
  },
  {
    emoji: "📈",
    title: "Bond",
    description:
      "Your token starts on the bonding curve. As the community engages, market cap grows and bonding progress advances. Watch live charts, holder counts, and activity — all simulated for now, real Hyperliquid data coming soon.",
  },
  {
    emoji: "🎓",
    title: "Graduate",
    description:
      "When your token hits the graduation target ($69K market cap), it graduates to Hyperliquid as a full spot market token. King of the Hill tokens get featured — race to the top!",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-12">
        <p className="text-5xl mb-4">🌋</p>
        <h1 className="text-4xl font-bold mb-3">How Molten Works</h1>
        <p className="text-lg text-muted-foreground">
          Launch memecoins on Hyperliquid in three simple steps
        </p>
      </div>

      <div className="space-y-8">
        {STEPS.map((step, i) => (
          <div
            key={step.title}
            className="relative rounded-xl border border-border bg-card p-6 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl shrink-0">{step.emoji}</div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    STEP {i + 1}
                  </span>
                  <h2 className="text-xl font-bold">{step.title}</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
        <h3 className="text-lg font-bold mb-2">No Trading Yet</h3>
        <p className="text-muted-foreground mb-4">
          Molten is a launchpad — not a DEX. You can launch tokens, browse the board, watch charts,
          and engage with the community. Trading will come later when we integrate with Hyperliquid spot markets.
        </p>
        <Button variant="molten" asChild>
          <Link href="/launch">Launch Your First Token</Link>
        </Button>
      </div>
    </div>
  );
}
