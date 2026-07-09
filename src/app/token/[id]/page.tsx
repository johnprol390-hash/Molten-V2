"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy, Check, Share2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { CandleChart } from "@/components/charts/candle-chart";
import { TradingWaitlistPanel } from "@/components/trading/waitlist-panel";
import { useWalletStore } from "@/lib/stores";
import {
  formatMarketCap,
  formatPrice,
  formatPercent,
  timeAgo,
  truncateAddress,
} from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const TIMEFRAMES = ["1m", "5m", "15m", "1h", "1d"];

interface Holder {
  id: string;
  wallet: string;
  balance: number;
  percentage: number;
  isDev: boolean;
  isEarly: boolean;
}

interface Activity {
  id: string;
  type: string;
  amount: number;
  price: number;
  wallet: string;
  createdAt: string;
}

interface CommentUser {
  id: string;
  walletAddress: string;
  username?: string | null;
}

interface TokenComment {
  id: string;
  content: string;
  createdAt: string;
  user: CommentUser;
}

interface TokenData {
  id: string;
  name: string;
  ticker: string;
  description: string;
  imageUrl: string;
  contractAddress: string;
  website?: string | null;
  twitter?: string | null;
  price: number;
  marketCap: number;
  bondingProgress: number;
  holderCount: number;
  replyCount: number;
  change24h: number;
  isGraduated: boolean;
  createdAt: string;
  creator: CommentUser;
  holders?: Holder[];
  activities?: Activity[];
  comments?: TokenComment[];
}

export default function TokenPage({ params }: { params: { id: string } }) {
  const { userId, isConnected } = useWalletStore();
  const queryClient = useQueryClient();
  const [timeframe, setTimeframe] = useState("5m");
  const [showMarketCap, setShowMarketCap] = useState(false);
  const [copied, setCopied] = useState(false);
  const [comment, setComment] = useState("");

  const { data: token, isLoading, error } = useQuery<TokenData>({
    queryKey: ["token", params.id],
    queryFn: () => fetch(`/api/tokens/${params.id}`).then((r) => {
      if (!r.ok) throw new Error("Not found");
      return r.json();
    }),
    refetchInterval: 10000,
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) =>
      fetch(`/api/tokens/${params.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, content }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["token", params.id] });
      setComment("");
    },
  });

  const copyAddress = () => {
    if (!token) return;
    navigator.clipboard.writeText(token.contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToken = () => {
    if (!token) return;
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    if (navigator.share) {
      navigator.share({ title: `${token.name} ($${token.ticker})`, url });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-[400px] w-full mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">🌋</p>
        <h1 className="text-2xl font-bold mb-2">Token not found</h1>
        <p className="text-muted-foreground mb-4">This token doesn&apos;t exist or has been removed.</p>
        <Button asChild><Link href="/">Back to Board</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <img src={token.imageUrl} alt={token.name} className="w-16 h-16 rounded-full bg-muted" />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{token.name}</h1>
            <span className="text-primary font-medium">${token.ticker}</span>
            {token.isGraduated && (
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Graduated 🎓</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <code className="text-xs">{truncateAddress(token.contractAddress, 6)}</code>
            <button onClick={copyAddress} className="hover:text-primary">
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </button>
            <span>·</span>
            <Link href={`/profile/${token.creator.walletAddress}`} className="hover:text-primary">
              {token.creator.username || truncateAddress(token.creator.walletAddress)}
            </Link>
            <span>·</span>
            <span>{timeAgo(token.createdAt)}</span>
          </div>
          <div className="flex gap-2 mt-2">
            {token.twitter && (
              <a href={`https://twitter.com/${token.twitter.replace("@", "")}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </a>
            )}
            {token.website && (
              <a href={token.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </a>
            )}
            <button onClick={shareToken} className="hover:text-primary">
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Chart */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <Tabs value={timeframe} onValueChange={setTimeframe}>
                <TabsList className="h-8">
                  {TIMEFRAMES.map((tf) => (
                    <TabsTrigger key={tf} value={tf} className="text-xs px-2 h-6">{tf}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <div className="flex gap-1">
                <Button
                  variant={showMarketCap ? "ghost" : "secondary"}
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setShowMarketCap(false)}
                >
                  Price
                </Button>
                <Button
                  variant={showMarketCap ? "secondary" : "ghost"}
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setShowMarketCap(true)}
                >
                  Market Cap
                </Button>
              </div>
            </div>
            <CandleChart
              tokenId={token.id}
              timeframe={timeframe}
              showMarketCap={showMarketCap}
              height={350}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Market Cap", value: formatMarketCap(token.marketCap) },
              { label: "Price", value: formatPrice(token.price) },
              { label: "Holders", value: token.holderCount.toLocaleString() },
              { label: "24h Change", value: formatPercent(token.change24h), colored: true },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border border-border bg-card p-3">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className={cn("text-lg font-bold", stat.colored && (token.change24h >= 0 ? "text-positive" : "text-negative"))}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Bonding curve */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-semibold mb-3">Bonding Curve Progress</h3>
            <Progress value={token.bondingProgress} className="h-3 mb-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{token.bondingProgress.toFixed(1)}% complete</span>
              <span>{(100 - token.bondingProgress).toFixed(1)}% to graduation</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Graduation target: $69,000 market cap on Hyperliquid
            </p>
          </div>

          {/* Holders */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-semibold mb-3">Top Holders</h3>
            <div className="space-y-2">
              {token.holders?.map((holder, i) => (
                <div key={holder.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-4">#{i + 1}</span>
                    <span>{truncateAddress(holder.wallet)}</span>
                    {holder.isDev && (
                      <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">Dev</span>
                    )}
                    {holder.isEarly && (
                      <span className="text-xs bg-molten-orange/20 text-molten-orange px-1.5 py-0.5 rounded">Early</span>
                    )}
                  </div>
                  <span className="font-medium">{holder.percentage.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity feed (read-only) */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-semibold mb-3">Recent Activity</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {token.activities?.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs font-medium px-1.5 py-0.5 rounded",
                      activity.type === "buy" ? "bg-positive/20 text-positive" : "bg-negative/20 text-negative"
                    )}>
                      {activity.type.toUpperCase()}
                    </span>
                    <span className="text-muted-foreground">{truncateAddress(activity.wallet)}</span>
                  </div>
                  <div className="text-right">
                    <p>{activity.amount.toFixed(2)} tokens</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(activity.createdAt)}</p>
                  </div>
                </div>
              ))}
              {(!token.activities || token.activities.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-semibold mb-3">Thread ({token.replyCount})</h3>
            {isConnected ? (
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && comment && commentMutation.mutate(comment)}
                />
                <Button
                  size="sm"
                  onClick={() => comment && commentMutation.mutate(comment)}
                  disabled={!comment || commentMutation.isPending}
                >
                  Post
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">Connect wallet to comment</p>
            )}
            <div className="space-y-3">
              {token.comments?.map((c) => (
                <div key={c.id} className="border-b border-border/50 pb-3 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {c.user.username || truncateAddress(c.user.walletAddress)}
                    </span>
                    {c.user.walletAddress === token.creator.walletAddress && (
                      <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">Creator</span>
                    )}
                    <span className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="text-sm">{c.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trading waitlist panel (replaces buy/sell) */}
        <div>
          <TradingWaitlistPanel tokenId={token.id} tokenTicker={token.ticker} />
        </div>
      </div>
    </div>
  );
}
