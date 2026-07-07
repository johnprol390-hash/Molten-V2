"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Sparkles, Send, Wand2 } from "lucide-react";

interface Concept {
  name: string;
  ticker: string;
  logo: string;
  description: string;
  banner: string;
}

const SUGGESTIONS = [
  "What's the safest token right now?",
  "Which token has the highest volume?",
  "What's closest to graduating?",
  "Which token should I avoid?",
];

export default function AiPage() {
  const [prompt, setPrompt] = useState("");
  const [concept, setConcept] = useState<Concept | null>(null);
  const [genBusy, setGenBusy] = useState(false);

  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [askBusy, setAskBusy] = useState(false);

  const generate = async () => {
    setGenBusy(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      setConcept(await res.json());
    } finally {
      setGenBusy(false);
    }
  };

  const ask = async (qOverride?: string) => {
    const q = (qOverride ?? question).trim();
    if (!q || askBusy) return;
    setChat((c) => [...c, { role: "user", text: q }]);
    setQuestion("");
    setAskBusy(true);
    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const d = await res.json();
      setChat((c) => [...c, { role: "ai", text: d.answer }]);
    } finally {
      setAskBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-5">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles size={20} className="text-ai" />
        <h1 className="text-xl font-bold">AI Studio</h1>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {/* Token generator */}
        <div className="panel-flat p-4">
          <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ai">
            <Wand2 size={15} /> Token Generator
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={2}
            placeholder="Describe your token idea (e.g. 'a moon dog for degens')"
            className="w-full resize-none rounded-lg border border-white/8 bg-white/3 px-3 py-2 text-sm outline-none focus:border-ai/40"
          />
          <button
            onClick={generate}
            disabled={genBusy}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-ai/90 py-2.5 text-sm font-semibold text-base-900 hover:bg-ai disabled:opacity-50"
          >
            <Sparkles size={15} /> {genBusy ? "Generating…" : "Generate Concept"}
          </button>

          {concept && (
            <div className="mt-3 rounded-lg border border-ai/20 bg-ai/5 p-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-2xl">{concept.logo}</div>
                <div>
                  <div className="font-semibold">{concept.name}</div>
                  <div className="tnum text-xs text-white/40">${concept.ticker}</div>
                </div>
              </div>
              <p className="mt-2 text-sm text-white/70">{concept.description}</p>
              <p className="mt-2 text-[11px] text-white/40">Banner prompt: {concept.banner}</p>
              <Link
                href="/launch"
                className="mt-3 inline-block rounded-lg bg-mint px-3 py-1.5 text-xs font-semibold text-base-900 hover:bg-mint-400"
              >
                Launch this token →
              </Link>
            </div>
          )}
        </div>

        {/* AI assistant */}
        <div className="panel-flat flex flex-col p-4">
          <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ai">
            <Sparkles size={15} /> Ask Molten AI
          </div>
          <div className="mb-2 flex-1 space-y-2 overflow-y-auto rounded-lg border border-white/6 bg-base-950/40 p-3" style={{ minHeight: 200 }}>
            {chat.length === 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-white/40">Ask about any indexed token — grounded in live data.</p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => ask(s)} className="rounded-full border border-white/8 bg-white/3 px-2.5 py-1 text-[11px] text-white/60 hover:border-ai/30">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              chat.map((m, i) => (
                <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                      m.role === "user" ? "bg-mint/15 text-white" : "bg-ai/10 text-white/80",
                    )}
                  >
                    {m.text}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ask()}
              placeholder="Ask a question…"
              className="flex-1 rounded-lg border border-white/8 bg-white/3 px-3 py-2 text-sm outline-none focus:border-ai/40"
            />
            <button onClick={() => ask()} disabled={askBusy} className="flex items-center rounded-lg bg-ai/90 px-4 text-base-900 hover:bg-ai disabled:opacity-50">
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
