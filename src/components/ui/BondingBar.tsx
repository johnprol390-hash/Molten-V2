import { cn } from "@/lib/cn";

export function BondingBar({
  pct,
  className,
  showLabel = true,
}: {
  pct: number;
  className?: string;
  showLabel?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  const graduated = clamped >= 100;
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
            graduated ? "bg-mint" : "bg-gradient-to-r from-mint-600 to-mint",
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="tnum w-10 shrink-0 text-right text-[11px] text-white/60">
          {clamped.toFixed(0)}%
        </span>
      )}
    </div>
  );
}
