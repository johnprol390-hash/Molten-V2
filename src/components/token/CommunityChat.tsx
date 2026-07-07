"use client";

import { useEffect, useRef, useState } from "react";
import type { Token } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";
import { timeAgo } from "@/lib/format";
import { Send } from "lucide-react";

interface Msg {
  id: string;
  author: string;
  text: string;
  ts: string;
}

export function CommunityChat({ token }: { token: Token }) {
  const connected = useAppStore((s) => s.wallets.length > 0);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const load = () =>
    fetch(`/api/tokens/${token.id}/messages`)
      .then((r) => r.json())
      .then((d) => setMessages(d.messages ?? []))
      .catch(() => {});

  useEffect(() => {
    load();
    const poll = setInterval(load, 5000);
    return () => clearInterval(poll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async () => {
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    setText("");
    try {
      const res = await fetch(`/api/tokens/${token.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: t }),
      });
      const d = await res.json();
      if (d.message) setMessages((m) => [...m, d.message]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {["100 holders reached", "50% bonded", token.status === "graduated" ? "Graduated 🎓" : "Climbing the curve"].map((m) => (
          <span key={m} className="rounded-full bg-mint/10 px-2.5 py-1 text-[11px] text-mint">
            🏆 {m}
          </span>
        ))}
      </div>

      <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-white/6 bg-base-950/40 p-3">
        {messages.length === 0 ? (
          <div className="py-8 text-center text-xs text-white/30">Be the first to post in the {token.ticker} community.</div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="flex items-start gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mint/15 text-xs text-mint">
                {m.author[2]?.toUpperCase() ?? m.author[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="tnum text-xs font-medium text-mint">{m.author}</span>
                  <span className="text-[10px] text-white/30">{timeAgo(new Date(m.ts).getTime())}</span>
                </div>
                <p className="text-sm text-white/70">{m.text}</p>
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={connected ? "Message the community…" : "Connect a wallet to post"}
          disabled={!connected}
          className="flex-1 rounded-lg border border-white/8 bg-white/3 px-3 py-2 text-sm outline-none placeholder:text-white/30 disabled:opacity-50"
        />
        <button
          onClick={send}
          disabled={!connected || sending}
          className="flex items-center gap-1.5 rounded-lg bg-mint px-4 text-sm font-semibold text-base-900 disabled:opacity-40"
        >
          <Send size={14} /> Send
        </button>
      </div>
    </div>
  );
}
