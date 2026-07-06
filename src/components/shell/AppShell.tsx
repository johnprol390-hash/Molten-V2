"use client";

import { usePathname } from "next/navigation";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { CommandPalette } from "./CommandPalette";
import { TraderModal } from "@/components/wallet/TraderModal";
import { RealtimeProvider } from "@/store/useRealtime";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <RealtimeProvider>
      <div className="flex min-h-screen flex-col">
        <Nav />
        <main className={isLanding ? "flex-1" : "flex-1"}>{children}</main>
        <Footer />
      </div>
      <CommandPalette />
      <TraderModal />
    </RealtimeProvider>
  );
}
