"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Database, Play, Download, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Toaster, toast } from "sonner";
import { SQLInput } from "@/components/sql/sql-input";
import { SQLDisplay } from "@/components/sql/sql-display";
import { ResultsTable } from "@/components/sql/results-table";
import { ChartPanel } from "@/components/sql/chart-panel";
import { generateSQL, executeSQL, type SQLExecuteResponse } from "@/services/sql";

interface QueryState {
  question: string;
  sql: string;
  explanation: string;
  results: SQLExecuteResponse | null;
}

export default function SQLAnalystPage() {
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [query, setQuery] = useState<QueryState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (question: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await generateSQL(question);
      setQuery({ question, sql: res.sql, explanation: res.explanation, results: null });
      toast.success("SQL generated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
      toast.error("Failed to generate SQL");
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!query) return;
    setExecuting(true);
    setError(null);
    try {
      const results = await executeSQL(query.sql);
      setQuery((prev) => (prev ? { ...prev, results } : null));
      toast.success(`Query returned ${results.row_count} rows`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Execution failed");
      toast.error("Failed to execute SQL");
    } finally {
      setExecuting(false);
    }
  };

  const handleExportCSV = () => {
    if (!query?.results) return;
    const { columns, rows } = query.results;
    const header = columns.join(",");
    const csvRows = rows.map((row) =>
      columns
        .map((col) => {
          const val = row[col];
          if (val === null || val === undefined) return "";
          const str = String(val);
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(",")
    );
    const csv = [header, ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aiops-query-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  return (
    <div className="space-y-8">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">SQL Analyst</h1>
            <p className="mt-1 text-muted-foreground">
              Ask questions in natural language — get SQL answers instantly
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              SQLite Connected
            </span>
          </div>
        </div>
      </motion.div>

      {/* Schema Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass rounded-3xl p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <Database className="h-4 w-4 text-violet-400" />
          <span className="text-sm font-medium text-foreground">vendor_payments</span>
          <span className="text-xs text-white/40">24 records</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "vendor_name", type: "TEXT" },
            { name: "invoice_number", type: "TEXT" },
            { name: "amount", type: "REAL" },
            { name: "category", type: "TEXT" },
            { name: "department", type: "TEXT" },
            { name: "status", type: "TEXT" },
            { name: "payment_date", type: "TEXT" },
            { name: "due_date", type: "TEXT" },
          ].map((col) => (
            <div
              key={col.name}
              className="flex items-center gap-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 text-xs"
            >
              <span className="font-medium text-white/80">{col.name}</span>
              <span className="text-white/30">{col.type}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Query Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <SQLInput onGenerate={handleGenerate} loading={loading} />
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Generated SQL */}
      {query && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <SQLDisplay sql={query.sql} explanation={query.explanation} />

          {/* Execute + Export */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleExecute}
              disabled={executing}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:shadow-violet-500/25 disabled:opacity-50"
            >
              {executing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Execute Query
            </button>
            {query.results && (
              <button
                onClick={handleExportCSV}
                className="glass-subtle inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white/80 transition-all hover:text-white"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Results */}
      {query?.results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-6"
        >
          {query.results.row_count > 0 ? (
            <>
              <ResultsTable
                columns={query.results.columns}
                rows={query.results.rows}
              />
              <ChartPanel
                columns={query.results.columns}
                rows={query.results.rows}
              />
            </>
          ) : (
            <div className="glass rounded-3xl p-10 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-white/20" />
              <p className="mt-3 text-sm text-white/40">No results found for this query.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
