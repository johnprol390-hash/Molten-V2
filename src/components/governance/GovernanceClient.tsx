"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import { compactNumber } from "@/lib/format";
import { Check, X, Plus, Vote } from "lucide-react";

interface Proposal {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  quorum: number;
  votesFor: number;
  votesAgainst: number;
  endsAt: string;
}

export function GovernanceClient({ initial }: { initial: Proposal[] }) {
  const [proposals, setProposals] = useState<Proposal[]>(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "General" });

  const vote = async (id: string, support: boolean) => {
    setBusy(id);
    try {
      const res = await fetch(`/api/governance/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ support }),
      });
      const data = await res.json();
      if (data.proposal) setProposals((ps) => ps.map((p) => (p.id === id ? { ...p, ...data.proposal } : p)));
    } finally {
      setBusy(null);
    }
  };

  const create = async () => {
    if (!form.title || !form.description) return;
    const res = await fetch("/api/governance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.proposal) setProposals((ps) => [data.proposal, ...ps]);
    setForm({ title: "", description: "", category: "General" });
    setCreateOpen(false);
  };

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Vote size={20} className="text-ai" />
          <h1 className="text-xl font-bold">Governance</h1>
        </div>
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-1.5 rounded-lg bg-mint px-3 py-1.5 text-sm font-semibold text-base-900 hover:bg-mint-400">
          <Plus size={15} /> New Proposal
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Voting Power" value="8,400" accent="text-ai" />
        <StatCard label="Active" value={String(proposals.filter((p) => p.status === "active").length)} />
        <StatCard label="Passed" value={String(proposals.filter((p) => p.status === "passed").length)} accent="text-gain" />
        <StatCard label="Treasury" value="$12.4M" accent="text-mint" />
      </div>

      <div className="space-y-3">
        {proposals.map((p) => {
          const total = p.votesFor + p.votesAgainst;
          const forPct = total > 0 ? (p.votesFor / total) * 100 : 0;
          const quorumPct = Math.min(100, (total / p.quorum) * 100);
          return (
            <div key={p.id} className="panel-flat p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{p.title}</h3>
                    <span className="rounded bg-white/8 px-1.5 py-0.5 text-[10px] uppercase text-white/50">{p.category}</span>
                  </div>
                  <p className="mt-1 text-sm text-white/55">{p.description}</p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                    p.status === "active" ? "bg-mint/15 text-mint" : p.status === "passed" ? "bg-gain/15 text-gain" : "bg-loss/15 text-loss",
                  )}
                >
                  {p.status}
                </span>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-white/40">
                  <span className="text-gain">For {compactNumber(p.votesFor)}</span>
                  <span className="text-loss">Against {compactNumber(p.votesAgainst)}</span>
                </div>
                <div className="mt-1 flex h-2 overflow-hidden rounded-full bg-loss/30">
                  <div className="bg-gain" style={{ width: `${forPct}%` }} />
                </div>
                <div className="mt-1 text-[10px] text-white/30">
                  Quorum {quorumPct.toFixed(0)}% · {compactNumber(total)} / {compactNumber(p.quorum)}
                </div>
              </div>

              {p.status === "active" && (
                <div className="mt-3 flex gap-2">
                  <button
                    disabled={busy === p.id}
                    onClick={() => vote(p.id, true)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gain/30 bg-gain/10 py-2 text-sm font-semibold text-gain hover:bg-gain/20 disabled:opacity-50"
                  >
                    <Check size={15} /> Vote For
                  </button>
                  <button
                    disabled={busy === p.id}
                    onClick={() => vote(p.id, false)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-loss/30 bg-loss/10 py-2 text-sm font-semibold text-loss hover:bg-loss/20 disabled:opacity-50"
                  >
                    <X size={15} /> Vote Against
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Proposal">
        <div className="space-y-3">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Proposal title"
            className="w-full rounded-lg border border-white/8 bg-white/3 px-3 py-2 text-sm outline-none focus:border-mint/40"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the proposal…"
            rows={4}
            className="w-full resize-none rounded-lg border border-white/8 bg-white/3 px-3 py-2 text-sm outline-none focus:border-mint/40"
          />
          <button onClick={create} className="w-full rounded-lg bg-mint py-2.5 text-sm font-semibold text-base-900 hover:bg-mint-400">
            Submit Proposal
          </button>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="panel-flat p-3">
      <div className="text-[10px] uppercase text-white/40">{label}</div>
      <div className={cn("tnum text-lg font-bold", accent)}>{value}</div>
    </div>
  );
}
