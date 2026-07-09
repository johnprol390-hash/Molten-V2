"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWalletStore } from "@/lib/stores";
import { truncateAddress, getAvatarUrl } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
    phantom?: {
      ethereum?: {
        request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      };
    };
  }
}

interface WalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletModal({ open, onOpenChange }: WalletModalProps) {
  const { setWallet, setConnecting, isConnecting } = useWalletStore();
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async (provider: "metamask" | "phantom") => {
    setError(null);
    setConnecting(true);

    try {
      let ethProvider: Window["ethereum"] | undefined;

      if (provider === "metamask") {
        ethProvider = window.ethereum;
        if (!ethProvider?.isMetaMask) {
          throw new Error("MetaMask not installed. Please install MetaMask extension.");
        }
      } else if (provider === "phantom") {
        ethProvider = window.phantom?.ethereum as Window["ethereum"] | undefined;
        if (!ethProvider) {
          throw new Error("Phantom not installed. Please install Phantom extension.");
        }
      }

      if (!ethProvider) {
        throw new Error("No wallet provider found");
      }

      const accounts = (await ethProvider.request({
        method: "eth_requestAccounts",
      })) as string[];

      const address = accounts[0];
      if (!address) throw new Error("No account found");

      // SIWE-style sign in message
      const message = `Sign in to Molten V2\nWallet: ${address}\nTimestamp: ${Date.now()}`;
      const signature = (await ethProvider.request({
        method: "personal_sign",
        params: [message, address],
      })) as string;

      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address, message, signature }),
      });

      if (!res.ok) throw new Error("Authentication failed");

      const { user } = await res.json();
      setWallet({
        address: user.walletAddress,
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
      setConnecting(false);
    }
  };

  const hasMetaMask = typeof window !== "undefined" && window.ethereum?.isMetaMask;
  const hasPhantom = typeof window !== "undefined" && !!window.phantom?.ethereum;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Connect your wallet to launch tokens, comment, and manage your profile.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <Button
            variant="outline"
            className="w-full h-14 justify-start gap-3 text-base"
            onClick={() => connectWallet("metamask")}
            disabled={isConnecting}
          >
            <span className="text-2xl">🦊</span>
            <div className="text-left">
              <div className="font-medium">MetaMask</div>
              <div className="text-xs text-muted-foreground">
                {hasMetaMask ? "Detected" : "Not installed"}
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full h-14 justify-start gap-3 text-base"
            onClick={() => connectWallet("phantom")}
            disabled={isConnecting}
          >
            <span className="text-2xl">👻</span>
            <div className="text-left">
              <div className="font-medium">Phantom</div>
              <div className="text-xs text-muted-foreground">
                {hasPhantom ? "Detected" : "Not installed"}
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full h-14 justify-start gap-3 text-base opacity-50"
            disabled
          >
            <span className="text-2xl">🔗</span>
            <div className="text-left">
              <div className="font-medium">WalletConnect</div>
              <div className="text-xs text-muted-foreground">Coming soon</div>
            </div>
          </Button>
        </div>

        {error && (
          <p className="text-sm text-negative text-center">{error}</p>
        )}

        {isConnecting && (
          <p className="text-sm text-muted-foreground text-center animate-pulse">
            Connecting... Please sign the message in your wallet.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function WalletButton() {
  const { address, username, avatar, isConnected, disconnect } = useWalletStore();
  const [modalOpen, setModalOpen] = useState(false);

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <a
          href={`/profile/${address}`}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-muted transition-colors"
        >
          <Avatar className="h-7 w-7">
            <AvatarImage src={avatar || getAvatarUrl(address)} />
            <AvatarFallback>{address.slice(2, 4)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden sm:inline">
            {username || truncateAddress(address)}
          </span>
        </a>
        <Button variant="ghost" size="sm" onClick={disconnect} className="text-xs">
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
        Connect
      </Button>
      <WalletModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
