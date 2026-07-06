"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { Holder } from "@/lib/types";
import { useAppStore } from "@/store/useAppStore";
import { Rand } from "@/lib/rng";

interface Node extends d3.SimulationNodeDatum {
  id: string;
  wallet: string;
  r: number;
  pct: number;
  cluster: number;
  badge?: string;
}

const CLUSTER_COLORS = ["#97FCE4", "#B98CFF", "#FFB84D", "#FF5C6C", "#3BE38A", "#5FE9CC"];

export function BubbleMap({ holders, tokenId }: { holders: Holder[]; tokenId: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const openTraderModal = useAppStore((s) => s.openTraderModal);

  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const width = ref.current.clientWidth || 600;
    const height = 440;
    const r = new Rand("bubble:" + tokenId);

    const top = holders.slice(0, 40);
    const maxPct = Math.max(...top.map((h) => h.remainingPct), 1);
    const nodes: Node[] = top.map((h, i) => ({
      id: h.wallet,
      wallet: h.wallet,
      pct: h.remainingPct,
      r: 8 + (h.remainingPct / maxPct) * 34,
      cluster: h.badges.includes("Insider") ? 1 : h.badges.includes("Sniper") ? 3 : i % 6,
      badge: h.badges[0],
    }));

    // Links between wallets in the same cluster (simulated transfer edges).
    const links: { source: string; target: string }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      if (r.bool(0.35)) {
        const j = r.int(0, nodes.length - 1);
        if (i !== j) links.push({ source: nodes[i].id, target: nodes[j].id });
      }
    }

    const link = svg
      .append("g")
      .attr("stroke", "rgba(255,255,255,0.08)")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1);

    const node = svg
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d) => d.r)
      .attr("fill", (d) => CLUSTER_COLORS[d.cluster % CLUSTER_COLORS.length])
      .attr("fill-opacity", 0.25)
      .attr("stroke", (d) => CLUSTER_COLORS[d.cluster % CLUSTER_COLORS.length])
      .attr("stroke-width", 1.5)
      .style("cursor", "pointer")
      .on("click", (_e, d) => openTraderModal(d.wallet, tokenId));

    node.append("title").text((d) => `${d.wallet}\n${d.pct.toFixed(2)}%`);

    const label = svg
      .append("g")
      .selectAll("text")
      .data(nodes.filter((d) => d.r > 20))
      .join("text")
      .text((d) => `${d.pct.toFixed(1)}%`)
      .attr("font-size", 9)
      .attr("fill", "rgba(255,255,255,0.7)")
      .attr("text-anchor", "middle")
      .attr("font-family", "var(--font-mono)")
      .style("pointer-events", "none");

    const sim = d3
      .forceSimulation<Node>(nodes)
      .force("charge", d3.forceManyBody().strength(6))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide<Node>().radius((d) => d.r + 2))
      .force(
        "link",
        d3.forceLink<Node, any>(links).id((d: any) => d.id).distance(60).strength(0.15),
      )
      .on("tick", () => {
        link
          .attr("x1", (d: any) => d.source.x)
          .attr("y1", (d: any) => d.source.y)
          .attr("x2", (d: any) => d.target.x)
          .attr("y2", (d: any) => d.target.y);
        node.attr("cx", (d) => (d.x = Math.max(d.r, Math.min(width - d.r, d.x!)))).attr("cy", (d) => (d.y = Math.max(d.r, Math.min(height - d.r, d.y!))));
        label.attr("x", (d) => d.x!).attr("y", (d) => d.y! + 3);
      });

    return () => {
      sim.stop();
    };
  }, [holders, tokenId, openTraderModal]);

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-3 px-1 text-[11px] text-white/40">
        <span>Bubble size = holdings %</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: "#B98CFF" }} /> Insider cluster</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: "#FF5C6C" }} /> Sniper cluster</span>
        <span>Click a bubble to inspect the wallet</span>
      </div>
      <svg ref={ref} width="100%" height={440} className="rounded-lg bg-base-950/40" />
    </div>
  );
}
