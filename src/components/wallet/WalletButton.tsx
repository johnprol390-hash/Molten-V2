"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { truncateAddress } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Wallet as WalletIcon, ChevronDown, Plus, LogOut, Eye } from "lucide-react";
import { WalletConnectModal } from "./WalletConnectModal";

export function WalletButton() {
  const { wallets, activeWallet, guest, setActiveWallet, disconnect } = useAppStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const connected = wallets.length > 0;

  if (!connected) {
    return (
      <>
        <button
          onClick={() => setModalOpen(true)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all",
            guest
              ? "border border-white/10 bg-white/5 text-white/80 hover:border-mint/40"
              : "bg-mint text-base-900 shadow-glow hover:bg-mint-400",
          )}
        >
          {guest ? <Eye size={14} /> : <WalletIcon size={14} />}
          {guest ? "Guest" : "Connect"}
        </button>
        <WalletConnectModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setDropOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm hover:border-mint/30"
      >
        <span className="h-2 w-2 rounded-full bg-gain" />
        <span className="tnum">{truncateAddress(activeWallet ?? "")}</span>
        <ChevronDown size={13} className="text-white/40" />
      </button>

      {dropOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDropOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-white/10 bg-base-850 shadow-panel">
            <div className="border-b border-white/6 px-3 py-2 text-[11px] uppercase tracking-wide text-white/40">
              Connected wallets
            </div>
            {wallets.map((w) => (
              <div
                key={w.address}
                className={cn(
                  "flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-white/5",
                  w.address === activeWallet && "bg-mint/5",
                )}
              >
                <button className="flex flex-1 flex-col items-start" onClick={() => setActiveWallet(w.address)}>
                  <span className="text-xs text-white/50">{w.label}</span>
                  <span className="tnum text-xs">{truncateAddress(w.address)}</span>
                </button>
                <button
                  onClick={() => disconnect(w.address)}
                  className="rounded p-1 text-white/30 hover:text-loss"
                  aria-label="Disconnect"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                setDropOpen(false);
                setModalOpen(true);
              }}
              className="flex w-full items-center gap-2 border-t border-white/6 px-3 py-2.5 text-sm text-mint hover:bg-mint/5"
            >
              <Plus size={14} /> Add another wallet
            </button>
          </div>
        </>
      )}
      <WalletConnectModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
