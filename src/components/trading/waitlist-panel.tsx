"use client";

import { useState } from "react";
import { Lock, Bell, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TradingWaitlistPanelProps {
  tokenId?: string;
  tokenTicker?: string;
}

export function TradingWaitlistPanel({ tokenId, tokenTicker }: TradingWaitlistPanelProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      await fetch("/api/email-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tokenId }),
      });
      setSubmitted(true);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6 sticky top-20">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>

        <div>
          <h3 className="text-lg font-bold">Trading launches soon on Molten</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {tokenTicker
              ? `Be the first to trade $${tokenTicker} when trading goes live.`
              : "Be the first to know when trading goes live on Hyperliquid."}
          </p>
        </div>

        <div className="w-full space-y-3">
          <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
            <p>🔒 No trading available yet</p>
            <p>📊 View charts & stats freely</p>
            <p>💬 Comment and engage with community</p>
            <p>🚀 Launch your own tokens today</p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                <Bell className="h-4 w-4" />
                {loading ? "Saving..." : "Notify Me"}
              </Button>
            </form>
          ) : (
            <div className="rounded-md bg-primary/10 p-3 text-sm text-primary">
              ✅ You&apos;re on the list! We&apos;ll notify you when trading launches.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
