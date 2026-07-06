export function Sparkline({
  data,
  width = 120,
  height = 32,
  color,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (data.length < 2) return <svg width={width} height={height} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data
    .map((d, i) => `${(i * step).toFixed(1)},${(height - ((d - min) / range) * height).toFixed(1)}`)
    .join(" ");
  const up = data[data.length - 1] >= data[0];
  const stroke = color ?? (up ? "#3BE38A" : "#FF5C6C");
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
