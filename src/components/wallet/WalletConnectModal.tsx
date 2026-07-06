"use client";

import { useAppStore } from "@/store/useAppStore";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import { Eye } from "lucide-react";

const WALLETS = [
  { name: "Phantom", icon: "👻", installed: true },
  { name: "MetaMask", icon: "🦊", installed: true },
  { name: "Rabby", icon: "🐰", installed: false },
  { name: "WalletConnect", icon: "🔗", installed: false },
  { name: "Coinbase", icon: "🔵", installed: true },
  { name: "OKX", icon: "⭕", installed: false },
  { name: "Trust", icon: "🛡️", installed: false },
  { name: "Ledger", icon: "🔐", installed: false },
  { name: "Hyperliquid", icon: "💠", installed: true },
];

export function WalletConnectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { connect, enterGuest } = useAppStore();

  return (
    <Modal open={open} onClose={onClose} title="Connect a wallet">
      <p className="mb-4 text-xs text-white/50">
        Sign in with your wallet using EIP-4361 (SIWE). Installed wallets are highlighted.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {WALLETS.map((w) => (
          <button
            key={w.name}
            onClick={() => {
              connect(w.name);
              onClose();
            }}
            className={cn(
              "flex items-center gap-2.5 rounded-lg border p-3 text-left text-sm transition-all",
              w.installed
                ? "border-mint/25 bg-mint/5 hover:border-mint/50 hover:bg-mint/10"
                : "border-white/8 bg-white/3 hover:border-white/20",
            )}
          >
            <span className="text-xl">{w.icon}</span>
            <div className="flex flex-col">
              <span className="font-medium">{w.name}</span>
              {w.installed && <span className="text-[10px] text-mint">Detected</span>}
            </div>
          </button>
        ))}
      </div>
      <button
        onClick={() => {
          enterGuest();
          onClose();
        }}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/8 bg-white/3 p-3 text-sm text-white/70 hover:border-white/20"
      >
        <Eye size={14} /> Continue as Guest (read-only)
      </button>
      <p className="mt-3 text-center text-[10px] text-white/30">
        Simulation mode — connecting generates a demo wallet. No real signatures required.
      </p>
    </Modal>
  );
}
