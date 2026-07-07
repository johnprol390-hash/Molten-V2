import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-white/6", className)} />;
}

export function EmptyState({
  icon,
  title,
  hint,
}: {
  icon?: React.ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      {icon && <div className="text-3xl opacity-40">{icon}</div>}
      <p className="text-sm font-medium text-white/70">{title}</p>
      {hint && <p className="max-w-xs text-xs text-white/40">{hint}</p>}
    </div>
  );
}
