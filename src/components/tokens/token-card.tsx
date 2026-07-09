"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Crown, MessageCircle } from "lucide-react";
import { cn, formatMarketCap, timeAgo, truncateAddress, formatPercent } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useFlashStore } from "@/lib/stores";

interface TokenCardProps {
  token: {
    id: string;
    name: string;
    ticker: string;
    description: string;
    imageUrl: string;
    marketCap: number;
    bondingProgress: number;
    replyCount: number;
    change24h: number;
    createdAt: string;
    sparkline?: number[];
    creator: { walletAddress: string; username?: string | null };
  };
}

function MiniSparkline({ data }: { data: number[] }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const isUp = data[data.length - 1] >= data[0];

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 60;
      const y = 20 - ((v - min) / range) * 16;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width="60" height="24" className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={isUp ? "#22C55E" : "#EF4444"}
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function TokenCard({ token }: TokenCardProps) {
  const { flashedTokens, clearFlash } = useFlashStore();
  const flash = flashedTokens[token.id];

  useEffect(() => {
    if (flash) {
      const timer = setTimeout(() => clearFlash(token.id), 600);
      return () => clearTimeout(timer);
    }
  }, [flash, token.id, clearFlash]);

  return (
    <Link href={`/token/${token.id}`}>
      <div
        className={cn(
          "group relative rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5",
          flash === "green" && "animate-flash-green",
          flash === "red" && "animate-flash-red"
        )}
      >
        <div className="flex items-start gap-3">
          <img
            src={token.imageUrl}
            alt={token.name}
            className="w-12 h-12 rounded-full bg-muted shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold truncate">{token.name}</h3>
                <p className="text-xs text-muted-foreground">${token.ticker}</p>
              </div>
              <MiniSparkline data={token.sparkline || []} />
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {token.description}
            </p>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">MCap</span>
            <span className="font-medium">{formatMarketCap(token.marketCap)}</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Bonding</span>
              <span>{token.bondingProgress.toFixed(1)}%</span>
            </div>
            <Progress value={token.bondingProgress} className="h-1.5" />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>{truncateAddress(token.creator.walletAddress)}</span>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                token.change24h >= 0 ? "text-positive" : "text-negative"
              )}
            >
              {formatPercent(token.change24h)}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {token.replyCount}
            </span>
            <span>{timeAgo(token.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function KingOfHillCard({ token }: TokenCardProps) {
  if (!token) return null;

  return (
    <Link href={`/token/${token.id}`}>
      <div className="relative rounded-xl border-2 border-primary/50 bg-card p-5 animate-pulse-glow overflow-hidden">
        <div className="absolute top-2 right-2 flex items-center gap-1 text-primary">
          <Crown className="h-5 w-5" />
          <span className="text-xs font-bold uppercase">King of the Hill</span>
        </div>

        <div className="flex items-center gap-4">
          <img
            src={token.imageUrl}
            alt={token.name}
            className="w-16 h-16 rounded-full bg-muted ring-2 ring-primary/30"
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold">{token.name}</h2>
            <p className="text-primary font-medium">${token.ticker}</p>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
              {token.description}
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-2xl font-bold">{formatMarketCap(token.marketCap)}</p>
            <p className="text-sm text-primary font-medium">
              {token.bondingProgress.toFixed(1)}% bonded
            </p>
          </div>
        </div>

        <div className="mt-4">
          <Progress value={token.bondingProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1 text-center">
            {(100 - token.bondingProgress).toFixed(1)}% until graduation 🎓
          </p>
        </div>
      </div>
    </Link>
  );
}

export function TokenCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-2/3" />
          <div className="h-3 bg-muted rounded w-1/3" />
          <div className="h-3 bg-muted rounded w-full" />
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-3 bg-muted rounded" />
        <div className="h-1.5 bg-muted rounded" />
      </div>
    </div>
  );
}
