"use client";

import { useMemo } from "react";
import { BarChart3 } from "lucide-react";

interface ChartPanelProps {
  columns: string[];
  rows: Record<string, unknown>[];
}

function detectCategoricalNumeric(
  columns: string[],
  rows: Record<string, unknown>[]
): { categorical: string; numeric: string } | null {
  if (columns.length < 2 || rows.length === 0) return null;

  for (const col of columns) {
    const val = rows[0][col];
    if (typeof val === "number") {
      for (const catCol of columns) {
        if (catCol === col) continue;
        const catVal = rows[0][catCol];
        if (typeof catVal === "string" || typeof catVal === "number") {
          return { categorical: catCol, numeric: col };
        }
      }
    }
  }
  return null;
}

const GRADIENT_COLORS = [
  "from-violet-500 to-indigo-500",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-cyan-500 to-blue-500",
  "from-indigo-500 to-purple-500",
  "from-pink-500 to-rose-500",
  "from-teal-500 to-emerald-500",
  "from-orange-500 to-amber-500",
];

export function ChartPanel({ columns, rows }: ChartPanelProps) {
  const chartData = useMemo(() => {
    const detection = detectCategoricalNumeric(columns, rows);
    if (!detection) return null;

    const { categorical, numeric } = detection;
    const data = rows
      .map((row) => ({
        label: String(row[categorical] || "Unknown"),
        value: typeof row[numeric] === "number" ? row[numeric] : 0,
      }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    if (data.length === 0) return null;

    const maxVal = Math.max(...data.map((d) => d.value));

    return { categorical, numeric, data, maxVal };
  }, [columns, rows]);

  if (!chartData) return null;

  return (
    <div className="glass rounded-3xl overflow-hidden">
      <div className="flex items-center gap-2 dark:border-white/[0.08] border-gray-200 border-b px-5 py-3">
        <BarChart3 className="h-4 w-4 dark:text-violet-400 text-violet-600" />
        <span className="text-sm font-medium dark:text-white text-gray-900">
          {chartData.numeric} by {chartData.categorical}
        </span>
      </div>
      <div className="p-5">
        <div className="space-y-3">
          {chartData.data.map((d, i) => (
            <div key={d.label} className="flex items-center gap-3">
              <div className="w-36 shrink-0 truncate text-sm dark:text-white/40 text-gray-500" title={d.label}>
                {d.label}
              </div>
              <div className="flex-1">
                <div className="relative h-7 rounded-md dark:bg-white/[0.04] bg-gray-100">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-md bg-gradient-to-r ${GRADIENT_COLORS[i % GRADIENT_COLORS.length]} transition-all duration-500`}
                    style={{
                      width: `${Math.max((d.value / chartData.maxVal) * 100, 2)}%`,
                    }}
                  />
                  <span className="relative z-10 flex h-full items-center px-2.5 text-xs font-medium text-white mix-blend-difference">
                    {typeof d.value === "number"
                      ? d.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                      : d.value}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
