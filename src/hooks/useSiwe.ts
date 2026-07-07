"use client";

import { useState } from "react";
import { useConnect, useSignMessage, useDisconnect, type Connector } from "wagmi";
import { useAppStore } from "@/store/useAppStore";

function buildSiweMessage(address: string, nonce: string, chainId: number) {
  const domain = typeof window !== "undefined" ? window.location.host : "molten.fun";
  const origin = typeof window !== "undefined" ? window.location.origin : "https://molten.fun";
  return [
    `${domain} wants you to sign in with your Ethereum account:`,
    address,
    "",
    "Sign in to Molten — the Hyperliquid launchpad & terminal.",
    "",
    `URI: ${origin}`,
    "Version: 1",
    `Chain ID: ${chainId}`,
    `Nonce: ${nonce}`,
    `Issued At: ${new Date().toISOString()}`,
  ].join("\n");
}

export function useSiwe() {
  const { connectAsync } = useConnect();
  const { signMessageAsync } = useSignMessage();
  const { disconnectAsync } = useDisconnect();
  const addWallet = useAppStore((s) => s.connect);
  const [status, setStatus] = useState<"idle" | "connecting" | "signing" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function signIn(connector: Connector) {
    setError(null);
    setStatus("connecting");
    try {
      const res = await connectAsync({ connector });
      const address = res.accounts[0];
      const chainId = res.chainId;
      if (!address) throw new Error("No account returned by wallet");

      setStatus("signing");
      const nonceRes = await fetch("/api/auth/nonce");
      const { nonce } = await nonceRes.json();
      const message = buildSiweMessage(address, nonce, chainId);
      const signature = await signMessageAsync({ message, account: address });

      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, message, signature }),
      });
      if (!verifyRes.ok) {
        const j = await verifyRes.json().catch(() => ({}));
        throw new Error(j.error ?? "Verification failed");
      }

      addWallet(connector.name, address);
      setStatus("idle");
      return true;
    } catch (e: any) {
      // If the user rejected the signature, drop the wallet connection too.
      await disconnectAsync().catch(() => {});
      setError(e?.shortMessage ?? e?.message ?? "Connection failed");
      setStatus("error");
      return false;
    }
  }

  return { signIn, status, error };
}
