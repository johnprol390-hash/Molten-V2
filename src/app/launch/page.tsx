"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWalletStore } from "@/lib/stores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WalletButton } from "@/components/wallet/wallet-button";
import Link from "next/link";
import confetti from "canvas-confetti";

export default function LaunchPage() {
  const router = useRouter();
  const { isConnected, userId } = useWalletStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ id: string; ticker: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    ticker: "",
    description: "",
    website: "",
    twitter: "",
    telegram: "",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);

    try {
      const res = await fetch("/api/tokens/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId: userId,
          ...form,
          imageUrl: imagePreview || `https://api.dicebear.com/7.x/identicon/svg?seed=${form.ticker}`,
        }),
      });

      if (!res.ok) throw new Error("Launch failed");

      const token = await res.json();
      setSuccess({ id: token.id, ticker: token.ticker });

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#97FCE4", "#FF6B35", "#FF3366"],
      });
    } catch {
      alert("Failed to launch token. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <p className="text-6xl mb-4">🎉</p>
        <h1 className="text-3xl font-bold mb-2">${success.ticker} is Live!</h1>
        <p className="text-muted-foreground mb-8">
          Your token is now on the board. Share it with the world!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="molten" asChild>
            <Link href={`/token/${success.id}`}>View Token</Link>
          </Button>
          <Button variant="outline" asChild>
            <a
              href={`https://twitter.com/intent/tweet?text=Just launched $${success.ticker} on @MoltenV2! 🌋&url=${encodeURIComponent(typeof window !== "undefined" ? `${window.location.origin}/token/${success.id}` : "")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Share on X
            </a>
          </Button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <p className="text-6xl mb-4">🌋</p>
        <h1 className="text-3xl font-bold mb-2">Launch Your Token</h1>
        <p className="text-muted-foreground mb-8">
          Connect your wallet to create a new memecoin on Molten.
        </p>
        <WalletButton />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <div className="text-center mb-8">
        <p className="text-4xl mb-2">🌋</p>
        <h1 className="text-3xl font-bold">Launch a Token</h1>
        <p className="text-muted-foreground mt-1">Create your memecoin in seconds</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-24 h-24 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">📷</span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          <p className="text-xs text-muted-foreground">Click to upload logo</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            placeholder="HyperPepe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            maxLength={32}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ticker">Ticker *</Label>
          <Input
            id="ticker"
            placeholder="HPEPE"
            value={form.ticker}
            onChange={(e) => setForm({ ...form, ticker: e.target.value.toUpperCase() })}
            required
            maxLength={10}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            placeholder="Tell the world about your token..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            maxLength={500}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website (optional)</Label>
          <Input
            id="website"
            placeholder="https://yourtoken.xyz"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter (optional)</Label>
            <Input
              id="twitter"
              placeholder="@yourtoken"
              value={form.twitter}
              onChange={(e) => setForm({ ...form, twitter: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telegram">Telegram (optional)</Label>
            <Input
              id="telegram"
              placeholder="t.me/yourtoken"
              value={form.telegram}
              onChange={(e) => setForm({ ...form, telegram: e.target.value })}
            />
          </div>
        </div>

        <Button type="submit" variant="molten" className="w-full h-12 text-base" disabled={loading}>
          {loading ? "Launching..." : "🚀 Launch Token"}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          No transaction required. Your token appears instantly on the board.
        </p>
      </form>
    </div>
  );
}
