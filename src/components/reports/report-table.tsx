"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Table } from "lucide-react";
import type { Table as ReportTableType } from "@/services/reports";

const PAGE_SIZE = 10;

export function ReportTable({ table }: { table: ReportTableType }) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedRows = useMemo(() => {
    if (!sortKey) return table.rows;
    return [...table.rows].sort((a, b) => {
      const av = a.values[sortKey];
      const bv = b.values[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [table.rows, sortKey, sortDir]);

  const totalPages = Math.ceil(sortedRows.length / PAGE_SIZE);
  const pageRows = sortedRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="glass rounded-3xl overflow-hidden">
      <div className="flex items-center gap-2 border-b dark:border-white/[0.08] border-gray-200 px-5 py-3">
        <Table className="h-4 w-4 dark:text-violet-400 text-violet-600" />
        <span className="text-sm font-medium dark:text-white text-gray-900">{table.title}</span>
        <span className="text-xs dark:text-white/30 text-gray-500">({table.rows.length} rows)</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b dark:border-white/[0.08] border-gray-200 dark:bg-white/[0.04] bg-gray-100">
              {table.columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="cursor-pointer px-4 py-3 text-left font-medium dark:text-white/40 text-gray-500 transition-colors hover:text-white/70"
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {sortKey === col.key ? (
                      sortDir === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr
                key={i}
                className="border-b dark:border-white/[0.06] border-gray-200 transition-colors dark:hover:bg-white/[0.03] hover:bg-gray-50 last:border-b-0"
              >
                {table.columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 dark:text-white/70 text-gray-800">
                    {formatCellValue(row.values[col.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t dark:border-white/[0.08] border-gray-200 px-5 py-3">
          <span className="text-xs dark:text-white/30 text-gray-500">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="rounded-md p-1.5 dark:text-white/30 text-gray-500 transition-colors dark:hover:bg-white/[0.06] hover:bg-gray-100 hover:text-white/70 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-md p-1.5 dark:text-white/30 text-gray-500 transition-colors dark:hover:bg-white/[0.06] hover:bg-gray-100 hover:text-white/70 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatCellValue(val: string | number | undefined | null): string {
  if (val === null || val === undefined) return "—";
  if (typeof val === "number") {
    if (Number.isInteger(val)) return val.toLocaleString();
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return String(val);
}
