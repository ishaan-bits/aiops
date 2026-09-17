"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Brain,
  Bot,
  FileBarChart,
  AlertCircle,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import {
  generateAIReport,
  type AIReportResponse,
  type ReportResponse,
  type KPI,
} from "@/services/reports";
import { ReportChart } from "@/components/reports/report-charts";
import { ReportTable } from "@/components/reports/report-table";
import dynamic from "next/dynamic";

const ReportPDFExport = dynamic(
  () => import("@/components/reports/report-pdf").then((m) => m.ReportPDFExport),
  { ssr: false, loading: () => <div className="h-10 w-32 animate-pulse rounded-xl bg-muted" /> }
);

const EXAMPLE_PROMPTS = [
  { text: "Generate a Q4 executive report", icon: FileBarChart },
  { text: "Which vendors are highest risk?", icon: AlertCircle },
  { text: "Show overdue payment analysis", icon: Clock },
  { text: "Department spending summary", icon: TrendingUp },
];

function KPICard({ kpi, index }: { kpi: KPI; index: number }) {
  const changeIcon =
    kpi.changeType === "positive" ? (
      <TrendingUp className="h-3.5 w-3.5" />
    ) : kpi.changeType === "negative" ? (
      <TrendingDown className="h-3.5 w-3.5" />
    ) : (
      <Minus className="h-3.5 w-3.5" />
    );

  const changeColor =
    kpi.changeType === "positive"
      ? "text-emerald-600 bg-emerald-50"
      : kpi.changeType === "negative"
        ? "text-rose-600 bg-rose-50"
        : "text-muted-foreground bg-muted";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative rounded-2xl border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
        <p className="text-3xl font-bold tracking-tight text-foreground">{kpi.value}</p>
      </div>
      {kpi.change && (
        <div className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${changeColor}`}>
          {changeIcon}
          {kpi.change}
        </div>
      )}
    </motion.div>
  );
}

function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-24"
    >
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-violet-400/20" />
        <div className="relative rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 p-6 shadow-lg shadow-violet-500/25">
          <Brain className="h-10 w-10 text-white animate-pulse" />
        </div>
      </div>
      <h3 className="mt-6 text-lg font-semibold text-foreground">AI is preparing your report...</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm text-center">
        Classifying your request, gathering data, and generating insights
      </p>
      <div className="mt-4 flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-bounce [animation-delay:-0.3s]" />
        <div className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-bounce [animation-delay:-0.15s]" />
        <div className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-bounce" />
      </div>
    </motion.div>
  );
}

export default function ReportsPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerate = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setAiResult(null);
    try {
      const result = await generateAIReport(trimmed);
      setAiResult(result);
      toast.success("Report generated successfully");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to generate report";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerate(prompt);
  };

  const handleChipClick = (text: string) => {
    setPrompt(text);
    handleGenerate(text);
  };

  const handleBack = () => {
    setAiResult(null);
    setPrompt("");
    setError(null);
  };

  const report: ReportResponse | null = aiResult?.report ?? null;

  return (
    <div className="space-y-8">
      <Toaster position="top-right" richColors />

      <AnimatePresence mode="wait">
        {!report && !loading ? (
          <motion.div
            key="prompt-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Reports</h1>
              <p className="text-muted-foreground mt-1">
                AI-powered executive reports from natural language
              </p>
            </div>

            {/* Prompt Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden"
            >
              <div className="flex items-center gap-3 border-b border-border px-6 py-4">
                <div className="rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 p-2.5">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">Executive AI Reports</h2>
                  <p className="text-xs text-muted-foreground">Powered by AIOps Intelligence</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    placeholder="Ask AI to generate an executive report..."
                    rows={3}
                    className="w-full resize-none rounded-xl border border-border bg-muted/30 px-5 py-4 pr-36 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-500/20"
                  />
                  <button
                    type="submit"
                    disabled={!prompt.trim() || loading}
                    className="absolute right-3 bottom-3 inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-violet-600 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate
                  </button>
                </div>
              </form>

              {/* Example Chips */}
              <div className="border-t border-border px-6 py-4">
                <p className="text-xs font-medium text-muted-foreground mb-3">Try an example</p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_PROMPTS.map((example) => (
                    <button
                      key={example.text}
                      onClick={() => handleChipClick(example.text)}
                      disabled={loading}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-medium text-muted-foreground transition-all hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <example.icon className="h-3.5 w-3.5" />
                      {example.text}
                    </button>
                  ))}
                </div>
              </div>
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
          </motion.div>
        ) : loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoadingState />
          </motion.div>
        ) : report ? (
          <motion.div
            key="report-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Report Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className="rounded-xl border border-border bg-white p-2.5 shadow-sm transition-all hover:shadow-md hover:bg-muted/50"
                >
                  <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {report.title}
                  </h1>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700">
                      <Brain className="h-3 w-3" />
                      {aiResult?.detected_template?.charAt(0).toUpperCase() + (aiResult?.detected_template?.slice(1) || "")} Report
                    </span>
                    {aiResult?.confidence !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        {Math.round(aiResult.confidence * 100)}% confidence
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(report.generated_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <ReportPDFExport report={report} />
            </div>

            {/* AI Context Summary */}
            {aiResult?.ai_summary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-6 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-violet-100 p-2">
                    <Sparkles className="h-4 w-4 text-violet-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm font-semibold text-violet-900 mb-2">AI Analysis</h2>
                    <p className="text-sm text-violet-800 leading-relaxed whitespace-pre-line">
                      {aiResult.ai_summary}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Full Executive Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="rounded-2xl border border-border bg-white p-6 shadow-sm"
            >
              <h2 className="text-sm font-semibold text-foreground mb-3">Executive Summary</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {report.summary}
              </p>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.kpis.map((kpi, i) => (
                <KPICard key={kpi.label} kpi={kpi} index={i} />
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {report.charts.map((chart) => (
                <ReportChart key={chart.id} chart={chart} />
              ))}
            </div>

            {/* Tables */}
            <div className="space-y-6">
              {report.tables.map((table, i) => (
                <ReportTable key={i} table={table} />
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
