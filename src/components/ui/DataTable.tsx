"use client";

import { useMemo, useState } from "react";
import { ChevronUp, ChevronDown, Download } from "lucide-react";
import { cn } from "@/lib/cn";
import { EmptyState } from "./Skeleton";
import { usePrefs } from "@/store/usePrefs";

function toCsv<T>(columns: Column<T>[], rows: T[]): string {
  const cols = columns.filter((c) => c.sortValue || typeof c.render === "function");
  const header = cols.map((c) => `"${c.header}"`).join(",");
  const lines = rows.map((r) =>
    cols
      .map((c) => {
        const v = c.sortValue ? c.sortValue(r) : "";
        return `"${String(v).replace(/"/g, '""')}"`;
      })
      .join(","),
  );
  return [header, ...lines].join("\n");
}

export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  sortValue?: (row: T) => number | string;
  render: (row: T) => React.ReactNode;
  className?: string;
  width?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  defaultSort,
  density,
  onRowClick,
  emptyTitle = "Nothing here yet",
  emptyHint,
  maxHeight,
  exportName,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  defaultSort?: { key: string; dir: "asc" | "desc" };
  density?: "compact" | "dense" | "comfortable";
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyHint?: string;
  maxHeight?: string;
  exportName?: string;
}) {
  const [sort, setSort] = useState(defaultSort ?? null);
  const prefDensity = usePrefs((s) => s.density);
  const effectiveDensity = density ?? prefDensity;

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
      return String(va).localeCompare(String(vb)) * dir;
    });
  }, [rows, sort, columns]);

  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (prev?.key !== key) return { key, dir: "desc" };
      if (prev.dir === "desc") return { key, dir: "asc" };
      return null;
    });
  };

  const pad = effectiveDensity === "compact" ? "py-1" : effectiveDensity === "comfortable" ? "py-2.5" : "py-1.5";

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} hint={emptyHint} />;
  }

  const download = () => {
    const csv = toCsv(columns, sorted);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportName ?? "molten-export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {exportName && (
        <div className="flex justify-end px-2 pt-2">
          <button
            onClick={download}
            className="flex items-center gap-1 rounded-md border border-white/8 px-2 py-1 text-[11px] text-white/50 hover:border-mint/30 hover:text-mint"
          >
            <Download size={11} /> CSV
          </button>
        </div>
      )}
      <div className="overflow-auto" style={maxHeight ? { maxHeight } : undefined}>
      <table className="w-full border-collapse text-xs">
        <thead className="sticky top-0 z-10 bg-base-850/95 backdrop-blur">
          <tr className="border-b border-white/8 text-white/40">
            {columns.map((c) => (
              <th
                key={c.key}
                style={c.width ? { width: c.width } : undefined}
                className={cn(
                  "px-2.5 py-2 text-[10px] font-medium uppercase tracking-wide",
                  c.align === "right" && "text-right",
                  c.align === "center" && "text-center",
                  !c.align && "text-left",
                  c.sortable && "cursor-pointer select-none hover:text-white/80",
                )}
                onClick={() => c.sortable && toggleSort(c.key)}
              >
                <span className={cn("inline-flex items-center gap-1", c.align === "right" && "flex-row-reverse")}>
                  {c.header}
                  {sort?.key === c.key &&
                    (sort.dir === "asc" ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "border-b border-white/4 transition-colors hover:bg-white/4",
                onRowClick && "cursor-pointer",
              )}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    "px-2.5",
                    pad,
                    c.align === "right" && "text-right",
                    c.align === "center" && "text-center",
                    c.className,
                  )}
                >
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}
