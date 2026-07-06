"use client";

import { usePrefs, type Currency } from "@/store/usePrefs";
import { compactNumber } from "./format";

// USD is the base unit everywhere in the app; this converts + formats for the
// user's selected display currency (#40).
const RATES: Record<Currency, { rate: number; symbol: string; hype?: boolean }> = {
  USD: { rate: 1, symbol: "$" },
  EUR: { rate: 0.92, symbol: "€" },
  AED: { rate: 3.67, symbol: "AED " },
  HYPE: { rate: 1 / 32, symbol: "", hype: true },
};

export function useMoney() {
  const currency = usePrefs((s) => s.currency);
  const meta = RATES[currency];

  const money = (usd: number, opts: { compact?: boolean; decimals?: number } = {}) => {
    const { compact = true, decimals } = opts;
    const v = usd * meta.rate;
    const suffix = meta.hype ? " HYPE" : "";
    if (!isFinite(v)) return meta.symbol + "0" + suffix;
    const abs = Math.abs(v);
    if (compact && abs >= 1000) return `${meta.symbol}${compactNumber(v)}${suffix}`;
    if (abs > 0 && abs < 0.01) return `${meta.symbol}${v.toPrecision(2)}${suffix}`;
    return (
      meta.symbol +
      v.toLocaleString("en-US", {
        minimumFractionDigits: decimals ?? 2,
        maximumFractionDigits: decimals ?? 2,
      }) +
      suffix
    );
  };

  return { money, currency };
}
