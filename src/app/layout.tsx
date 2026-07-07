import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/shell/AppShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Molten — Hyperliquid Launchpad & Trading Terminal",
  description:
    "Launch, discover, trade and analyze meme tokens on Hyperliquid with institutional-grade safety analytics.",
  metadataBase: new URL("https://molten.fun"),
  applicationName: "Molten",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Molten" },
  icons: {
    icon: "/icon-512.png",
    apple: "/icon-512.png",
  },
  openGraph: {
    title: "Molten — Hyperliquid Launchpad & Trading Terminal",
    description:
      "Launch the next viral token on Hyperliquid with pro-grade safety analytics built in.",
    type: "website",
    images: ["/icon-512.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} dark`}>
      <body className="min-h-screen bg-base-900 text-white/90 antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
