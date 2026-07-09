"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFeedStore } from "@/lib/stores";
import { formatMarketCap, timeAgo, truncateAddress } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewCoinsPage() {
  const { paused, setPaused } = useFeedStore();
  const [filter, setFilter] = useState("all");
  const [tokens, setTokens] = useState<Array<Record<string, unknown>>>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["new-tokens", filter],
    queryFn: () => fetch(`/api/tokens/new?filter=${filter}&limit=50`).then((r) => r.json()),
    refetchInterval: paused ? false : 5000,
  });

  useEffect(() => {
    if (data?.tokens && !paused) {
      setTokens((prev) => {
        const newIds = new Set(data.tokens.map((t: { id: string }) => t.id));
        const existing = prev.filter((t) => newIds.has(t.id as string));
        const brandNew = data.tokens.filter(
          (t: { id: string }) => !prev.some((p) => p.id === t.id)
        );
        return [...brandNew, ...existing.length ? existing : data.tokens];
      });
    } else if (data?.tokens && paused) {
      setTokens(data.tokens);
    }
  }, [data, paused]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">New Coins</h1>
          <p className="text-sm text-muted-foreground">Fresh launches, updating live</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPaused(!paused)}
          className="gap-2"
        >
          {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          {paused ? "Resume" : "Pause"} Feed
        </Button>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList>
          <TabsTrigger value="hour">Last Hour</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : tokens.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-4xl mb-4">🚀</p>
          <p>No new launches yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-1">
          {tokens.map((token, i) => (
            <Link
              key={token.id as string}
              href={`/token/${token.id}`}
              className={`flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-all ${
                i === 0 && !paused ? "animate-slide-in bg-primary/5" : ""
              }`}
            >
              <img
                src={token.imageUrl as string}
                alt={token.ticker as string}
                className="w-10 h-10 rounded-full bg-muted shrink-0"
              />
              <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-5 gap-2 items-center">
                <div>
                  <p className="font-semibold">${token.ticker as string}</p>
                  <p className="text-xs text-muted-foreground truncate">{token.name as string}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {timeAgo(token.createdAt as string)}
                </div>
                <div className="text-sm font-medium hidden sm:block">
                  {formatMarketCap(token.marketCap as number)}
                </div>
                <div className="hidden sm:block">
                  <Progress value={token.bondingProgress as number} className="h-1.5" />
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {(token.bondingProgress as number).toFixed(1)}%
                  </p>
                </div>
                <div className="text-xs text-muted-foreground hidden sm:block">
                  {truncateAddress(
                    (token.creator as { walletAddress: string })?.walletAddress || ""
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
