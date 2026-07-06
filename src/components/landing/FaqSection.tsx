"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

const FAQ = [
  {
    q: "What is Molten?",
    a: "Molten is a Hyperliquid-native memecoin launchpad and trading terminal. It combines Pump.fun-style launch mechanics with an Axiom Pro-grade trading interface and institutional safety analytics.",
  },
  {
    q: "How does the bonding curve work?",
    a: "Every standard launch trades on a constant-product virtual bonding curve. As people buy, price rises along the curve. When the curve collects the target HYPE amount, the token graduates and liquidity migrates to the Hyperliquid spot orderbook.",
  },
  {
    q: "What is the Risk Score?",
    a: "A composite 0–100 score computed from sniper %, insider %, bundler %, holder concentration, LP burn status, contract authorities, deployer history and a honeypot simulation. Every factor is transparent and expandable.",
  },
  {
    q: "Which wallets are supported?",
    a: "Phantom, MetaMask, Rabby, WalletConnect, Coinbase, OKX, Trust, Ledger and the Hyperliquid native wallet. You can also browse in read-only Guest mode.",
  },
  {
    q: "Is this using real funds?",
    a: "This preview runs in simulation mode with deterministic seeded data so the entire terminal works end-to-end. Real Hyperliquid wiring slots in behind the same interfaces.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h2 className="text-center text-2xl font-bold sm:text-3xl">Frequently asked questions</h2>
      <div className="mt-8 space-y-2">
        {FAQ.map((item, i) => (
          <div key={i} className="panel-flat overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left"
            >
              <span className="text-sm font-medium">{item.q}</span>
              <ChevronDown
                size={16}
                className={cn("shrink-0 text-white/40 transition-transform", open === i && "rotate-180")}
              />
            </button>
            {open === i && <p className="px-4 pb-4 text-sm text-white/55">{item.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
