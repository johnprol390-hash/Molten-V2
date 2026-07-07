"use client";

import { cn } from "@/lib/cn";
import { truncateAddress } from "@/lib/format";
import { useAppStore } from "@/store/useAppStore";

// Every wallet address rendered anywhere is a WalletLink that opens the global
// Trader Quick-View modal.
export function WalletLink({
  address,
  label,
  tokenId,
  className,
  size = 4,
}: {
  address: string;
  label?: string;
  tokenId?: string;
  className?: string;
  size?: number;
}) {
  const openTraderModal = useAppStore((s) => s.openTraderModal);
  const streamer = useAppStore((s) => s.streamerMode);
  const display = streamer ? "0x•••••" : label ?? truncateAddress(address, size);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        openTraderModal(address, tokenId);
      }}
      className={cn(
        "tnum rounded px-1 text-left text-mint/90 transition-colors hover:bg-mint/10 hover:text-mint",
        className,
      )}
    >
      {display}
    </button>
  );
}
