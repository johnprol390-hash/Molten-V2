import Link from "next/link";
import { LiveStats } from "@/components/landing/LiveStats";
import { TrendingCarousel } from "@/components/landing/TrendingCarousel";
import { Reveal } from "@/components/ui/Reveal";
import { queryTokens } from "@/lib/queries";
import {
  Zap,
  Droplets,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Radar,
  BarChart3,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  { icon: Zap, title: "Lightning Fast Launches", desc: "Deploy a token in under 60 seconds with a 6-step wizard and AI-assisted branding.", color: "text-mint" },
  { icon: Droplets, title: "Native Hyperliquid Liquidity", desc: "Graduated tokens migrate straight onto the Hyperliquid spot orderbook via HIP-1/HIP-2.", color: "text-mint" },
  { icon: TrendingUp, title: "Bonding Curve Trading", desc: "Constant-product virtual curve with live price impact and graduation progress.", color: "text-mint" },
  { icon: ShieldCheck, title: "Pro Safety Analytics", desc: "Sniper, insider, bundler & honeypot detection feeding a composite Risk Score on every token.", color: "text-warn" },
  { icon: Sparkles, title: "AI Token Generator", desc: "Generate name, ticker, description, logo and banner from a single prompt.", color: "text-ai" },
  { icon: Radar, title: "Wallet Tracking & Copy Trading", desc: "Follow KOLs and smart money, get instant buy alerts, and mirror trades automatically.", color: "text-mint" },
  { icon: BarChart3, title: "Creator Analytics", desc: "Holder retention curves, buyer sources, and real-time creator fee streaming.", color: "text-mint" },
];

const ROADMAP = [
  { q: "Phase 1", title: "Foundation", items: ["Wallet connect + SIWE", "Design system", "Seeded simulation"], done: true },
  { q: "Phase 2", title: "Core Terminal", items: ["Axiom-grade token page", "Live trade widget", "Safety panel"], done: true },
  { q: "Phase 3", title: "Launch & Curve", items: ["Bonding curve engine", "6-step launch wizard", "Discover Pulse"], done: true },
  { q: "Phase 4", title: "Tracking Layer", items: ["KOL directory", "Copy trading", "Buy alerts"], done: true },
  { q: "Phase 5", title: "Ecosystem", items: ["Governance", "Points & quests", "Referrals"], done: true },
  { q: "Phase 6", title: "Pro & Polish", items: ["AI features", "Admin suite", "Mobile PWA"], done: true },
];

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const tokens = await queryTokens();
  return (
    <div className="grid-noise">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-mint/10 blur-[120px]" />
        <div className="relative mx-auto max-w-[1100px] px-4 pb-16 pt-20 text-center sm:pt-28">
          <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-mint/25 bg-mint/5 px-3 py-1 text-xs text-mint">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-mint" />
            Live on Hyperliquid
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Launch the Next Viral Token on{" "}
            <span className="text-mint text-glow">Hyperliquid</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-white/55 sm:text-lg">
            Create, trade, and grow meme coins with native Hyperliquid liquidity — with pro-grade
            safety analytics built in.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/launch"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-mint px-6 py-3 text-sm font-semibold text-base-900 shadow-glow transition-all hover:bg-mint-400 sm:w-auto"
            >
              Launch Token <ArrowRight size={16} />
            </Link>
            <Link
              href="/discover"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/12 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 transition-all hover:border-mint/40 sm:w-auto"
            >
              Explore Tokens
            </Link>
            <Link
              href="/token/mdoge"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/12 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 transition-all hover:border-mint/40 sm:w-auto"
            >
              Open Terminal
            </Link>
          </div>
        </div>
      </section>

      <LiveStats />
      <TrendingCarousel tokens={tokens} />

      {/* Features */}
      <section className="mx-auto max-w-[1600px] px-4 py-16">
        <Reveal>
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Everything a degen needs, done right</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-white/50">
            50% Axiom Pro terminal density, 30% Hyperliquid precision, 15% Pump.fun energy.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.06}>
              <div className="panel group h-full p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-mint/25 hover:shadow-glow">
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 transition-transform duration-300 group-hover:scale-110 ${f.color}`}>
                  <f.icon size={20} />
                </div>
                <h3 className="text-base font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-white/50">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section className="border-y border-white/6 bg-base-950/40 py-16">
        <div className="mx-auto max-w-[1600px] px-4">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Roadmap</h2>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ROADMAP.map((r, i) => (
              <Reveal key={r.q} delay={(i % 3) * 0.06} className="h-full">
              <div className="panel-flat h-full p-5 transition-colors hover:border-mint/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-mint">{r.q}</span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                      r.done ? "bg-gain/15 text-gain" : "bg-white/8 text-white/40"
                    }`}
                  >
                    {r.done ? "Shipped" : "Planned"}
                  </span>
                </div>
                <h3 className="mt-1 text-lg font-semibold">{r.title}</h3>
                <ul className="mt-3 space-y-1.5">
                  {r.items.map((it) => (
                    <li key={it} className="flex items-center gap-2 text-sm text-white/55">
                      <span className={`h-1 w-1 rounded-full ${r.done ? "bg-mint" : "bg-white/30"}`} />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Footer band */}
      <section className="mx-auto max-w-[1600px] px-4 py-16 text-center">
        <div className="panel mx-auto max-w-3xl overflow-hidden p-10">
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to launch?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/50">
            Deploy your token, or dive into the terminal and start trading the freshest launches on
            Hyperliquid.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/launch" className="rounded-lg bg-mint px-6 py-3 text-sm font-semibold text-base-900 hover:bg-mint-400">
              Launch a Token
            </Link>
            <Link href="/discover" className="rounded-lg border border-white/12 bg-white/5 px-6 py-3 text-sm font-semibold hover:border-mint/40">
              Explore the Terminal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
