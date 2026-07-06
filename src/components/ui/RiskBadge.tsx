import { cn } from "@/lib/cn";
import { riskBg, type RiskResult } from "@/lib/safety";

export function RiskBadge({ risk, className }: { risk: RiskResult; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-bold tnum",
        riskBg(risk.level),
        className,
      )}
      title={`Risk score ${risk.score}/100 (${risk.level})`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {risk.score}
    </span>
  );
}
