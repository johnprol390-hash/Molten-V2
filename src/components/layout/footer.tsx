"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function Footer() {
  const [tokenCount, setTokenCount] = useState(0);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setTokenCount(d.count))
      .catch(() => {});
  }, []);

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-lg mb-2">
              <span>🌋</span>
              <span className="bg-molten-gradient bg-clip-text text-transparent">Molten</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The memecoin launchpad for Hyperliquid. Launch, bond, graduate — no trading yet.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Links</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <Link href="/how-it-works" className="block hover:text-primary">How it Works</Link>
              <Link href="/launch" className="block hover:text-primary">Launch a Token</Link>
              <a href="https://hyperliquid.xyz" target="_blank" rel="noopener noreferrer" className="block hover:text-primary">
                Hyperliquid Docs
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Community</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="block hover:text-primary">Twitter / X</a>
              <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="block hover:text-primary">Telegram</a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="block hover:text-primary">Discord</a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© 2026 Molten V2. Built for Hyperliquid.</p>
          <p className="text-primary font-medium">
            🔥 {tokenCount.toLocaleString()} tokens launched
          </p>
        </div>
      </div>
    </footer>
  );
}
