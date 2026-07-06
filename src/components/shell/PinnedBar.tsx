"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRecent } from "@/store/useRecent";
import { Clock } from "lucide-react";

export function PinnedBar() {
  const { recent, hydrate } = useRecent();
  const pathname = usePathname();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Hide on the landing page for a cleaner hero.
  if (pathname === "/" || recent.length === 0) return null;

  return (
    <div className="border-b border-white/6 bg-base-950/50">
      <div className="mx-auto flex max-w-[1600px] items-center gap-2 overflow-x-auto px-4 py-1.5">
        <span className="flex shrink-0 items-center gap-1 text-[10px] uppercase tracking-wide text-white/30">
          <Clock size={11} /> Recent
        </span>
        {recent.map((t) => (
          <Link
            key={t.id}
            href={`/token/${t.id}`}
            className="flex shrink-0 items-center gap-1 rounded-md border border-white/8 bg-white/3 px-2 py-0.5 text-xs hover:border-mint/30"
          >
            <span>{t.logo}</span>
            <span className="tnum font-medium">{t.ticker}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
