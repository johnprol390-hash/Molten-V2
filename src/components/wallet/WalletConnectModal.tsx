"use client";

import { useMemo } from "react";
import { useConnectors } from "wagmi";
import { useAppStore } from "@/store/useAppStore";
import { useSiwe } from "@/hooks/useSiwe";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import { Eye, Loader2 } from "lucide-react";

// Known injected wallets we surface as one-click options. `injected` detects
// whichever is actually installed in the browser.
const ICONS: Record<string, string> = {
  metamask: "🦊",
  phantom: "👻",
  rabby: "🐰",
  "coinbase wallet": "🔵",
  coinbase: "🔵",
  okx: "⭕",
  "okx wallet": "⭕",
  trust: "🛡️",
  "trust wallet": "🛡️",
  walletconnect: "🔗",
  injected: "🔌",
  browser: "🔌",
  ledger: "🔐",
};

function iconFor(name: string) {
  const key = name.toLowerCase();
  return ICONS[key] ?? Object.entries(ICONS).find(([k]) => key.includes(k))?.[1] ?? "👛";
}

export function WalletConnectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const enterGuest = useAppStore((s) => s.enterGuest);
  const connectors = useConnectors();
  const { signIn, status, error } = useSiwe();

  // De-dupe connectors by name (wagmi can list multiple injected shims).
  const list = useMemo(() => {
    const seen = new Set<string>();
    return connectors.filter((c) => {
      const k = c.name.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [connectors]);

  const busy = status === "connecting" || status === "signing";

  return (
    <Modal open={open} onClose={onClose} title="Connect a wallet">
      <p className="mb-4 text-xs text-white/50">
        Sign in with your wallet using EIP-4361 (Sign-In With Ethereum). You'll be asked to sign a
        message — no transaction, no gas.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {list.map((c) => (
          <button
            key={c.uid}
            disabled={busy}
            onClick={async () => {
              const ok = await signIn(c);
              if (ok) onClose();
            }}
            className={cn(
              "flex items-center gap-2.5 rounded-lg border border-mint/25 bg-mint/5 p-3 text-left text-sm transition-all hover:border-mint/50 hover:bg-mint/10 disabled:opacity-50",
            )}
          >
            <span className="text-xl">{iconFor(c.name)}</span>
            <div className="flex flex-col">
              <span className="font-medium">{c.name}</span>
              <span className="text-[10px] text-mint">Detected</span>
            </div>
          </button>
        ))}
        {list.length === 0 && (
          <div className="col-span-2 rounded-lg border border-white/8 bg-white/3 p-4 text-center text-xs text-white/50">
            No wallet extensions detected. Install MetaMask, Rabby, Phantom, or use Guest mode.
          </div>
        )}
      </div>

      {busy && (
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-mint">
          <Loader2 size={14} className="animate-spin" />
          {status === "connecting" ? "Connecting wallet…" : "Waiting for signature…"}
        </div>
      )}
      {error && <div className="mt-3 rounded-md bg-loss/15 px-2 py-1.5 text-center text-[11px] text-loss">{error}</div>}

      <button
        onClick={() => {
          enterGuest();
          onClose();
        }}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/8 bg-white/3 p-3 text-sm text-white/70 hover:border-white/20"
      >
        <Eye size={14} /> Continue as Guest (read-only)
      </button>
    </Modal>
  );
}
