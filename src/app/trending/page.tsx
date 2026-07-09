"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MiniChart } from "@/components/charts/candle-chart";
import { formatMarketCap, formatPercent } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function TrendingPage() {
  const [timeframe, setTimeframe] = useState("24h");

  const { data, isLoading } = useQuery({
    queryKey: ["trending", timeframe],
    queryFn: () => fetch(`/api/tokens/trending?timeframe=${timeframe}&limit=50`).then((r) => r.json()),
    refetchInterval: 10000,
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">🔥 Trending</h1>
          <p className="text-sm text-muted-foreground">Hottest tokens right now</p>
        </div>
        <Tabs value={timeframe} onValueChange={setTimeframe}>
          <TabsList>
            <TabsTrigger value="1h">1h</TabsTrigger>
            <TabsTrigger value="6h">6h</TabsTrigger>
            <TabsTrigger value="24h">24h</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !data?.tokens?.length ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>No trending tokens yet.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {data.tokens.map((token: Record<string, unknown>) => (
            <Link
              key={token.id as string}
              href={`/token/${token.id}`}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <span
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                  (token.rank as number) <= 3
                    ? "bg-molten-gradient text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                #{token.rank as number}
              </span>
              <img
                src={token.imageUrl as string}
                alt={token.ticker as string}
                className="w-10 h-10 rounded-full bg-muted shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold">${token.ticker as string}</p>
                <p className="text-xs text-muted-foreground">{token.name as string}</p>
              </div>
              <MiniChart data={(token.sparkline as number[]) || []} />
              <div className="text-right hidden sm:block">
                <p className="font-medium">{formatMarketCap(token.marketCap as number)}</p>
                <p
                  className={cn(
                    "text-sm",
                    (token.change as number) >= 0 ? "text-positive" : "text-negative"
                  )}
                >
                  {formatPercent(token.change as number)}
                </p>
              </div>
              <div className="hidden md:block text-sm text-muted-foreground">
                {(token.bondingProgress as number).toFixed(0)}% bonded
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
