"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, type IChartApi, type ISeriesApi, CrosshairMode } from "lightweight-charts";
import type { Candle } from "@/lib/types";
import { cn } from "@/lib/cn";

const TIMEFRAMES = ["1s", "15s", "1m", "3m", "5m", "15m", "1h", "4h", "1d"];

export function PriceChart({ candles }: { candles: Candle[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const [tf, setTf] = useState("1m");
  const [mode, setMode] = useState<"price" | "mcap">("price");

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(255,255,255,0.5)",
        fontFamily: "var(--font-mono)",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.03)" },
        horzLines: { color: "rgba(255,255,255,0.03)" },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.06)" },
      timeScale: { borderColor: "rgba(255,255,255,0.06)", timeVisible: true, secondsVisible: false },
      autoSize: true,
    });
    chartRef.current = chart;

    const series = chart.addCandlestickSeries({
      upColor: "#3BE38A",
      downColor: "#FF5C6C",
      borderVisible: false,
      wickUpColor: "#3BE38A",
      wickDownColor: "#FF5C6C",
    });
    seriesRef.current = series;

    const vol = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "vol",
    });
    chart.priceScale("vol").applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } });
    volRef.current = vol;

    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    const mult = mode === "mcap" ? 1_000_000_000 : 1;
    seriesRef.current?.setData(
      candles.map((c) => ({
        time: c.time as never,
        open: c.open * mult,
        high: c.high * mult,
        low: c.low * mult,
        close: c.close * mult,
      })),
    );
    volRef.current?.setData(
      candles.map((c) => ({
        time: c.time as never,
        value: c.volume,
        color: c.close >= c.open ? "rgba(59,227,138,0.35)" : "rgba(255,92,108,0.35)",
      })),
    );
    chartRef.current?.timeScale().fitContent();
  }, [candles, mode]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/6 px-3 py-2">
        <div className="flex items-center gap-0.5">
          {TIMEFRAMES.map((t) => (
            <button
              key={t}
              onClick={() => setTf(t)}
              className={cn(
                "tnum rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors",
                tf === t ? "bg-mint/15 text-mint" : "text-white/40 hover:text-white/70",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1 rounded-md border border-white/8 p-0.5">
          {(["price", "mcap"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "rounded px-2 py-0.5 text-[11px] font-medium uppercase transition-colors",
                mode === m ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70",
              )}
            >
              {m === "price" ? "Price" : "MCap"}
            </button>
          ))}
        </div>
      </div>
      <div ref={containerRef} className="min-h-[320px] flex-1" />
    </div>
  );
}
