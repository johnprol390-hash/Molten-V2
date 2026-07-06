"use client";

import type { Token } from "@/lib/types";
import { curveSamples, graduationProgress, hypeToGraduate, priceAtGraduation } from "@/lib/curve";
import { constants } from "@/lib/mock";
import { BondingBar } from "@/components/ui/BondingBar";
import { formatHype, formatUsd } from "@/lib/format";

export function CurveViz({ token }: { token: Token }) {
  const samples = curveSamples(token.curve, 48);
  const progress = graduationProgress(token.curve);
  const remaining = hypeToGraduate(token.curve);
  const gradPrice = priceAtGraduation(token.curve) * constants.HYPE_USD;

  const maxP = Math.max(...samples.map((s) => s.price));
  const w = 260;
  const h = 90;
  const path = samples
    .map((s, i) => `${(i / (samples.length - 1)) * w},${h - (s.price / maxP) * h}`)
    .join(" ");
  const curX = Math.min(1, progress) * w;

  return (
    <div className="panel-flat p-3">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-medium text-white/50">Bonding Curve</span>
        {token.status === "graduated" ? (
          <span className="text-mint">Graduated 🎓</span>
        ) : (
          <span className="tnum text-white/40">{(progress * 100).toFixed(1)}%</span>
        )}
      </div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
        <defs>
          <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#97FCE4" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#97FCE4" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,${h} ${path} ${w},${h}`} fill="url(#curveFill)" />
        <polyline points={path} fill="none" stroke="#97FCE4" strokeWidth={1.5} />
        <line x1={curX} y1={0} x2={curX} y2={h} stroke="#FFB84D" strokeWidth={1} strokeDasharray="3 3" />
        <circle cx={curX} cy={h - (token.curve.realHype > 0 ? 0.4 : 0.2) * h} r={3} fill="#FFB84D" />
      </svg>
      <div className="mt-2">
        <BondingBar pct={progress * 100} showLabel={false} />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
        <div>
          <div className="text-white/40">Remaining to graduate</div>
          <div className="tnum font-semibold text-white/80">{formatHype(remaining)} HYPE</div>
        </div>
        <div className="text-right">
          <div className="text-white/40">Price at graduation</div>
          <div className="tnum font-semibold text-mint">{formatUsd(gradPrice, { decimals: 6 })}</div>
        </div>
      </div>
    </div>
  );
}
