import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { SimTickProvider } from "@/components/providers/sim-tick-provider";
import { Navbar } from "@/components/layout/navbar";
import { LiveTicker } from "@/components/layout/live-ticker";
import { Footer } from "@/components/layout/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Molten V2 — Hyperliquid Memecoin Launchpad",
  description: "Launch, bond, and graduate memecoins on Hyperliquid. No trading yet — pure launchpad energy.",
  openGraph: {
    title: "Molten V2",
    description: "The memecoin launchpad for Hyperliquid",
    siteName: "Molten V2",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <QueryProvider>
          <SimTickProvider />
          <Navbar />
          <LiveTicker />
          <main className="flex-1">{children}</main>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
