"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/wallet/wallet-button";
import { useFeedStore } from "@/lib/stores";

const NAV_ITEMS = [
  { href: "/", label: "Board" },
  { href: "/new", label: "New" },
  { href: "/trending", label: "Trending" },
  { href: "/how-it-works", label: "How it Works" },
];

export function Navbar() {
  const pathname = usePathname();
  const { searchQuery, setSearchQuery } = useFeedStore();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
          <span className="text-2xl">🌋</span>
          <span className="hidden sm:inline bg-molten-gradient bg-clip-text text-transparent">
            Molten
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                pathname === item.href
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1 max-w-xs hidden sm:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tokens..."
              className="pl-9 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Link href="/launch">
            <Button variant="molten" size="sm" className="gap-1.5">
              <Rocket className="h-4 w-4" />
              <span className="hidden sm:inline">Launch</span>
            </Button>
          </Link>
          <WalletButton />
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex border-t border-border overflow-x-auto">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 text-center px-3 py-2 text-xs font-medium whitespace-nowrap",
              pathname === item.href ? "text-primary" : "text-muted-foreground"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
