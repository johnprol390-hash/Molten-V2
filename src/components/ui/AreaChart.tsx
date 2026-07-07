"use client";

export function AreaChart({
  data,
  height = 120,
  color = "#97FCE4",
}: {
  data: number[];
  height?: number;
  color?: string;
}) {
  if (data.length < 2) return <div style={{ height }} />;
  const w = 600;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((d, i) => `${(i * step).toFixed(1)},${(height - ((d - min) / range) * height).toFixed(1)}`);
  const line = pts.join(" ");
  const area = `0,${height} ${line} ${w},${height}`;
  const id = "ag" + color.replace("#", "");
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${id})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
