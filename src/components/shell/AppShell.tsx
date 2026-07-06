"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { CommandPalette } from "./CommandPalette";
import { TraderModal } from "@/components/wallet/TraderModal";
import { RealtimeProvider } from "@/store/useRealtime";
import { useAppStore } from "@/store/useAppStore";
import { PinnedBar } from "./PinnedBar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const hydrateTracked = useAppStore((s) => s.hydrateTracked);
  const connect = useAppStore((s) => s.connect);
  const wallets = useAppStore((s) => s.wallets);

  // Restore an existing server session + tracked wallets on load.
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user?.address && wallets.length === 0) connect("Session", d.user.address);
      })
      .catch(() => {});
    fetch("/api/tracked")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.tracked)) {
          hydrateTracked(d.tracked.map((t: any) => ({ address: t.address, name: t.name, emoji: t.emoji })));
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RealtimeProvider>
      <div className="flex min-h-screen flex-col">
        <Nav />
        {!isLanding && <PinnedBar />}
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <CommandPalette />
      <TraderModal />
    </RealtimeProvider>
  );
}
