"use client";

import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { TokenCard, KingOfHillCard, TokenCardSkeleton } from "@/components/tokens/token-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFeedStore, useFlashStore } from "@/lib/stores";
import { Button } from "@/components/ui/button";

const SORT_TABS = [
  { value: "trending", label: "Trending" },
  { value: "new", label: "New" },
  { value: "aboutToGraduate", label: "About to Graduate" },
  { value: "graduated", label: "Graduated" },
  { value: "marketCap", label: "Market Cap" },
] as const;

export default function HomePage() {
  const { sortBy, setSortBy, searchQuery } = useFeedStore();
  const { setFlash } = useFlashStore();
  const [page, setPage] = useState(1);
  const [allTokens, setAllTokens] = useState<Array<Record<string, unknown>>>([]);

  const { data: kingData } = useQuery({
    queryKey: ["king"],
    queryFn: () => fetch("/api/tokens/king").then((r) => r.json()),
    refetchInterval: 10000,
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["tokens", sortBy, searchQuery, page],
    queryFn: () =>
      fetch(
        `/api/tokens?sort=${sortBy}&search=${encodeURIComponent(searchQuery)}&page=${page}&limit=20`
      ).then((r) => r.json()),
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (data?.tokens) {
      if (page === 1) {
        setAllTokens(data.tokens);
      } else {
        setAllTokens((prev) => [...prev, ...data.tokens]);
      }
    }
  }, [data, page]);

  useEffect(() => {
    setPage(1);
  }, [sortBy, searchQuery]);

  // SSE for live updates
  useEffect(() => {
    const es = new EventSource("/api/sse");
    es.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        if (update.tokens) {
          update.tokens.forEach((t: { id: string; change24h: number }) => {
            setFlash(t.id, t.change24h >= 0 ? "green" : "red");
          });
        }
      } catch {
        // ignore
      }
    };
    return () => es.close();
  }, [setFlash]);

  const loadMore = useCallback(() => {
    if (data?.hasMore) setPage((p) => p + 1);
  }, [data?.hasMore]);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* King of the Hill */}
      {kingData && kingData.id && (
        <div className="mb-6">
          <KingOfHillCard token={kingData} />
        </div>
      )}

      {/* Sort tabs */}
      <div className="mb-6 overflow-x-auto">
        <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <TabsList className="bg-muted">
            {SORT_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Token grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <TokenCardSkeleton key={i} />
          ))}
        </div>
      ) : allTokens.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🌋</p>
          <h2 className="text-xl font-bold mb-2">No tokens found</h2>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? "Try a different search term" : "Be the first to launch!"}
          </p>
          <Button variant="molten" asChild>
            <a href="/launch">Launch a Token</a>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {allTokens.map((token) => (
              <TokenCard key={token.id as string} token={token as Parameters<typeof TokenCard>[0]["token"]} />
            ))}
          </div>

          {data?.hasMore && (
            <div className="text-center mt-8">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={isFetching}
              >
                {isFetching ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
