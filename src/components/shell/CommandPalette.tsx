"use client";

import { create } from "zustand";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, TrendingUp, Rocket, LayoutDashboard, Trophy, Users } from "lucide-react";
import { getTokens } from "@/lib/mock";
import { cn } from "@/lib/cn";

interface PaletteState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}
export const useCommandPalette = create<PaletteState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));

const PAGES = [
  { label: "Discover", href: "/discover", icon: TrendingUp },
  { label: "Launch a token", href: "/launch", icon: Rocket },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Leaderboards", href: "/leaderboards", icon: Trophy },
  { label: "KOL Directory", href: "/kols", icon: Users },
];

export function CommandPalette() {
  const { isOpen, close, toggle } = useCommandPalette();
  const [query, setQuery] = useState("");
  const router = useRouter();
  const tokens = getTokens();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, close]);

  useEffect(() => {
    if (!isOpen) setQuery("");
  }, [isOpen]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    const pageHits = PAGES.filter((p) => p.label.toLowerCase().includes(q));
    const tokenHits = tokens
      .filter((t) => !q || t.name.toLowerCase().includes(q) || t.ticker.toLowerCase().includes(q))
      .slice(0, 6);
    return { pageHits, tokenHits };
  }, [query, tokens]);

  const go = (href: string) => {
    router.push(href);
    close();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="panel relative z-10 w-full max-w-xl overflow-hidden shadow-panel"
          >
            <div className="flex items-center gap-3 border-b border-white/6 px-4 py-3">
              <Search size={16} className="text-white/40" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to a token, wallet, or page…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/30"
              />
              <kbd className="rounded bg-white/8 px-1.5 py-0.5 text-[10px] text-white/40">ESC</kbd>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {results.pageHits.length > 0 && (
                <div className="mb-1 px-2 py-1 text-[10px] uppercase tracking-wide text-white/30">Pages</div>
              )}
              {results.pageHits.map((p) => (
                <button
                  key={p.href}
                  onClick={() => go(p.href)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-white/6"
                >
                  <p.icon size={15} className="text-white/50" />
                  {p.label}
                </button>
              ))}
              {results.tokenHits.length > 0 && (
                <div className="mb-1 mt-2 px-2 py-1 text-[10px] uppercase tracking-wide text-white/30">Tokens</div>
              )}
              {results.tokenHits.map((t) => (
                <button
                  key={t.id}
                  onClick={() => go(`/token/${t.id}`)}
                  className={cn("flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-white/6")}
                >
                  <span className="text-lg">{t.logo}</span>
                  <span className="font-medium">{t.name}</span>
                  <span className="tnum text-xs text-white/40">${t.ticker}</span>
                </button>
              ))}
              {results.pageHits.length === 0 && results.tokenHits.length === 0 && (
                <div className="px-2 py-8 text-center text-sm text-white/40">No results for “{query}”</div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
