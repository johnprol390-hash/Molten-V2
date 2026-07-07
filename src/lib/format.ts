// Presentation helpers. Money is displayed here only; core math uses precise numbers.

export function formatUsd(n: number, opts: { compact?: boolean; decimals?: number } = {}): string {
  const { compact = true, decimals } = opts;
  if (!isFinite(n)) return "$0";
  const abs = Math.abs(n);
  if (compact && abs >= 1000) {
    return "$" + compactNumber(n);
  }
  if (abs > 0 && abs < 0.01) {
    return "$" + n.toPrecision(2);
  }
  return "$" + n.toLocaleString("en-US", {
    minimumFractionDigits: decimals ?? 2,
    maximumFractionDigits: decimals ?? 2,
  });
}

export function compactNumber(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e9) return sign + (abs / 1e9).toFixed(2) + "B";
  if (abs >= 1e6) return sign + (abs / 1e6).toFixed(2) + "M";
  if (abs >= 1e3) return sign + (abs / 1e3).toFixed(1) + "K";
  return sign + abs.toFixed(0);
}

export function formatHype(n: number, decimals = 3): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPrice(n: number): string {
  if (n === 0) return "0";
  if (n < 0.00001) return n.toExponential(2);
  if (n < 1) return n.toPrecision(4);
  return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

export function formatPct(n: number, withSign = true): string {
  const sign = withSign && n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

export function truncateAddress(addr: string, size = 4): string {
  if (!addr) return "";
  if (addr.length <= size * 2 + 2) return addr;
  return `${addr.slice(0, size + 2)}…${addr.slice(-size)}`;
}

export function formatAge(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo`;
  return `${Math.floor(mo / 12)}y`;
}

export function timeAgo(ts: number, now = Date.now()): string {
  return formatAge(now - ts) + " ago";
}

export function pnlColor(n: number): string {
  if (n > 0) return "text-gain";
  if (n < 0) return "text-loss";
  return "text-white/60";
}
