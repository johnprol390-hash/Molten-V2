import { cn } from "@/lib/cn";
import type { HolderBadge } from "@/lib/types";

const BADGE_STYLES: Record<string, string> = {
  LP: "bg-white/10 text-white/70",
  Dev: "bg-ai/15 text-ai border border-ai/30",
  Sniper: "bg-loss/15 text-loss border border-loss/30",
  Insider: "bg-warn/15 text-warn border border-warn/30",
  Bundler: "bg-warn/10 text-warn/90 border border-warn/20",
  Whale: "bg-mint/15 text-mint border border-mint/30",
  Fresh: "bg-white/8 text-white/60 border border-white/10",
  Pro: "bg-gain/15 text-gain border border-gain/30",
  Tracked: "bg-mint/20 text-mint border border-mint/40",
  KOL: "bg-ai/20 text-ai border border-ai/40",
};

export function Badge({
  children,
  variant,
  className,
}: {
  children: React.ReactNode;
  variant?: HolderBadge | string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        variant ? BADGE_STYLES[variant] ?? "bg-white/8 text-white/60" : "bg-white/8 text-white/60",
        className,
      )}
    >
      {children}
    </span>
  );
}
