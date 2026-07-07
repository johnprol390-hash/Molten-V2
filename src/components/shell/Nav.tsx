"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { Flame, Search, Command, Bell, ChevronDown } from "lucide-react";
import { WalletButton } from "@/components/wallet/WalletButton";
import { useCommandPalette } from "@/components/shell/CommandPalette";

const LINKS = [
  { href: "/discover", label: "Discover" },
  { href: "/launch", label: "Launch" },
  { href: "/kols", label: "KOLs" },
  { href: "/leaderboards", label: "Leaderboards" },
  { href: "/dashboard", label: "Dashboard" },
];

const MORE_LINKS = [
  { href: "/ai", label: "AI Studio" },
  { href: "/copy-trading", label: "Copy Trading" },
  { href: "/multichart", label: "Multi-Chart" },
  { href: "/compare", label: "Compare Tokens" },
  { href: "/narratives", label: "Narratives" },
  { href: "/governance", label: "Governance" },
  { href: "/treasury", label: "Treasury" },
  { href: "/analytics", label: "Analytics" },
  { href: "/points", label: "Points & Achievements" },
  { href: "/referrals", label: "Referrals" },
  { href: "/admin", label: "Admin" },
  { href: "/features", label: "Feature Registry" },
  { href: "/status", label: "System Status" },
  { href: "/settings", label: "Settings" },
];

export function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const openPalette = useCommandPalette((s) => s.open);

  return (
    <header className="sticky top-0 z-40 border-b border-white/6 bg-base-900/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-mint/15 text-mint shadow-glow">
            <Flame size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Molten<span className="text-mint">.</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active ? "bg-white/8 text-white" : "text-white/55 hover:bg-white/5 hover:text-white/90",
                )}
              >
                {l.label}
              </Link>
            );
          })}
          <div className="relative">
            <button
              onClick={() => setMoreOpen((o) => !o)}
              className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-white/55 transition-colors hover:bg-white/5 hover:text-white/90"
            >
              More <ChevronDown size={13} className={cn("transition-transform", moreOpen && "rotate-180")} />
            </button>
            {moreOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
                <div className="absolute left-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-base-850 py-1 shadow-panel">
                  {MORE_LINKS.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setMoreOpen(false)}
                      className="block px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={openPalette}
            className="hidden items-center gap-2 rounded-lg border border-white/8 bg-white/4 px-3 py-1.5 text-xs text-white/50 transition-colors hover:border-mint/30 hover:text-white/80 sm:flex"
          >
            <Search size={13} />
            <span>Search tokens, wallets…</span>
            <kbd className="ml-2 flex items-center gap-0.5 rounded bg-white/8 px-1.5 py-0.5 text-[10px] text-white/60">
              <Command size={9} />K
            </kbd>
          </button>
          <Link
            href="/notifications"
            className="relative rounded-lg border border-white/8 bg-white/4 p-2 text-white/60 transition-colors hover:border-mint/30 hover:text-white"
            aria-label="Notifications"
          >
            <Bell size={15} />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-mint" />
          </Link>
          <WalletButton />
          <button
            className="rounded-md p-2 text-white/60 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
          >
            <div className="flex h-4 w-5 flex-col justify-between">
              <span className="h-0.5 w-full bg-current" />
              <span className="h-0.5 w-full bg-current" />
              <span className="h-0.5 w-full bg-current" />
            </div>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-white/6 px-4 py-3 md:hidden">
          {[...LINKS, ...MORE_LINKS].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/5"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
