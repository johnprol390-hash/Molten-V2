"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, type IChartApi, type ISeriesApi } from "lightweight-charts";
import { cn } from "@/lib/utils";

interface CandleChartProps {
  tokenId: string;
  timeframe?: string;
  height?: number;
  showMarketCap?: boolean;
  marketCapMultiplier?: number;
}

interface CandleData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function CandleChart({
  tokenId,
  timeframe = "5m",
  height = 400,
  showMarketCap = false,
  marketCapMultiplier = 1_000_000_000,
}: CandleChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#A1A1AA",
      },
      grid: {
        vertLines: { color: "#1A1A1A" },
        horzLines: { color: "#1A1A1A" },
      },
      width: containerRef.current.clientWidth,
      height,
      timeScale: {
        borderColor: "#262626",
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: "#262626",
      },
    });

    const series = chart.addCandlestickSeries({
      upColor: "#22C55E",
      downColor: "#EF4444",
      borderUpColor: "#22C55E",
      borderDownColor: "#EF4444",
      wickUpColor: "#22C55E",
      wickDownColor: "#EF4444",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [height]);

  useEffect(() => {
    const fetchCandles = async () => {
      try {
        const res = await fetch(`/api/tokens/${tokenId}/candles?timeframe=${timeframe}`);
        const data: CandleData[] = await res.json();

        if (seriesRef.current && data.length > 0) {
          const multiplier = showMarketCap ? marketCapMultiplier : 1;
          const formatted = data.map((c) => ({
            time: Math.floor(new Date(c.timestamp).getTime() / 1000) as import("lightweight-charts").UTCTimestamp,
            open: c.open * multiplier,
            high: c.high * multiplier,
            low: c.low * multiplier,
            close: c.close * multiplier,
          }));
          seriesRef.current.setData(formatted);
          chartRef.current?.timeScale().fitContent();
        }
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };

    fetchCandles();
    const interval = setInterval(fetchCandles, 10000);
    return () => clearInterval(interval);
  }, [tokenId, timeframe, showMarketCap, marketCapMultiplier]);

  return (
    <div className="relative w-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/50 z-10">
          <div className="animate-pulse text-muted-foreground text-sm">Loading chart...</div>
        </div>
      )}
      <div ref={containerRef} className="w-full" />
    </div>
  );
}

export function MiniChart({ data, className }: { data: number[]; className?: string }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const isUp = data[data.length - 1] >= data[0];

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 80;
      const y = 30 - ((v - min) / range) * 26;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width="80" height="32" className={cn("shrink-0", className)}>
      <polyline
        points={points}
        fill="none"
        stroke={isUp ? "#22C55E" : "#EF4444"}
        strokeWidth="1.5"
      />
    </svg>
  );
}
