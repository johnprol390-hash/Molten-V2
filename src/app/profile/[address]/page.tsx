"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useWalletStore } from "@/lib/stores";
import { truncateAddress, getAvatarUrl, timeAgo, formatMarketCap } from "@/lib/utils";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage({ params }: { params: { address: string } }) {
  const { address: myAddress, userId } = useWalletStore();
  const queryClient = useQueryClient();
  const isOwnProfile = myAddress?.toLowerCase() === params.address.toLowerCase();
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", bio: "" });

  const { data: user, isLoading } = useQuery({
    queryKey: ["profile", params.address],
    queryFn: () => fetch(`/api/users/${params.address}`).then((r) => {
      if (!r.ok) throw new Error("Not found");
      return r.json();
    }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { username?: string; bio?: string }) =>
      fetch(`/api/users/${params.address}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", params.address] });
      setEditing(false);
    },
  });

  const followMutation = useMutation({
    mutationFn: () =>
      fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId: userId, followingId: user?.id }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile", params.address] }),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
        <Skeleton className="h-6 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">👤</p>
        <h1 className="text-2xl font-bold mb-2">Profile not found</h1>
        <Button asChild><Link href="/">Back to Board</Link></Button>
      </div>
    );
  }

  const isFollowing = user.followers?.some(
    (f: { followerId: string }) => f.followerId === userId
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <Avatar className="h-24 w-24 mx-auto mb-4">
          <AvatarImage src={user.avatar || getAvatarUrl(user.walletAddress)} />
          <AvatarFallback>{user.walletAddress.slice(2, 4)}</AvatarFallback>
        </Avatar>

        {editing ? (
          <div className="space-y-3 max-w-sm mx-auto">
            <Input
              value={editForm.username}
              onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              placeholder="Username"
            />
            <Textarea
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              placeholder="Bio"
              rows={2}
            />
            <div className="flex gap-2 justify-center">
              <Button size="sm" onClick={() => updateMutation.mutate(editForm)}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold">{user.username || truncateAddress(user.walletAddress)}</h1>
            <p className="text-sm text-muted-foreground">{truncateAddress(user.walletAddress, 6)}</p>
            {user.bio && <p className="text-sm mt-2">{user.bio}</p>}
          </>
        )}

        <div className="flex items-center justify-center gap-4 mt-4 text-sm">
          <span><strong>{user._count?.tokens || 0}</strong> coins</span>
          <span><strong>{user._count?.followers || 0}</strong> followers</span>
          <span><strong>{user._count?.following || 0}</strong> following</span>
        </div>

        <div className="flex gap-2 justify-center mt-4">
          {isOwnProfile && !editing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditForm({ username: user.username || "", bio: user.bio || "" });
                setEditing(true);
              }}
            >
              Edit Profile
            </Button>
          )}
          {!isOwnProfile && userId && (
            <Button
              variant={isFollowing ? "outline" : "default"}
              size="sm"
              onClick={() => followMutation.mutate()}
              disabled={followMutation.isPending}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="coins">
        <TabsList className="w-full">
          <TabsTrigger value="coins" className="flex-1">Coins Created</TabsTrigger>
          <TabsTrigger value="comments" className="flex-1">Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="coins" className="mt-4 space-y-2">
          {user.tokens?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No tokens created yet</p>
          ) : (
            user.tokens?.map((token: Record<string, unknown>) => (
              <Link
                key={token.id as string}
                href={`/token/${token.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <img src={token.imageUrl as string} alt="" className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <p className="font-semibold">${token.ticker as string}</p>
                  <p className="text-xs text-muted-foreground">{token.name as string}</p>
                </div>
                <div className="text-right text-sm">
                  <p>{formatMarketCap(token.marketCap as number)}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(token.createdAt as string)}</p>
                </div>
              </Link>
            ))
          )}
        </TabsContent>

        <TabsContent value="comments" className="mt-4 space-y-2">
          {user.comments?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No comments yet</p>
          ) : (
            user.comments?.map((comment: Record<string, unknown>) => (
              <div key={comment.id as string} className="p-3 rounded-lg border border-border">
                <p className="text-sm">{comment.content as string}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>on ${(comment.token as { ticker: string })?.ticker}</span>
                  <span>·</span>
                  <span>{timeAgo(comment.createdAt as string)}</span>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
