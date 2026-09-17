"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileBarChart,
  Building2,
  Users,
  Receipt,
  ShieldAlert,
  Loader2,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import {
  fetchReportTemplates,
  generateReport,
  type ReportTemplate,
  type ReportResponse,
  type KPI,
} from "@/services/reports";
import { ReportChart } from "@/components/reports/report-charts";
import { ReportTable } from "@/components/reports/report-table";
import { ReportPDFExport } from "@/components/reports/report-pdf";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Users,
  Receipt,
  ShieldAlert,
  FileBarChart,
};

const TEMPLATE_GRADIENTS = [
  "from-indigo-500 to-violet-500",
  "from-teal-500 to-emerald-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
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

export default function ReportsPage() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [report, setReport] = useState<ReportResponse | null>(null);

  useEffect(() => {
    fetchReportTemplates()
      .then(setTemplates)
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to load templates");
      })
      .finally(() => setLoadingTemplates(false));
  }, []);

  const handleGenerate = async (templateId: string) => {
    setGenerating(templateId);
    try {
      const result = await generateReport(templateId);
      setReport(result);
      toast.success("Report generated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setGenerating(null);
    }
  };

  const handleBack = () => {
    setReport(null);
  };

  return (
    <div className="space-y-8">
      <Toaster position="top-right" richColors />

      <AnimatePresence mode="wait">
        {!report ? (
          <motion.div
            key="templates"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Reports</h1>
              <p className="text-muted-foreground mt-1">
                Generate AI-powered operational and financial reports
              </p>
            </div>

            {loadingTemplates ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {templates.map((template, i) => {
                  const Icon = ICON_MAP[template.icon] || FileBarChart;
                  const isGenerating = generating === template.id;
                  return (
                    <motion.button
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleGenerate(template.id)}
                      disabled={generating !== null}
                      className="group relative rounded-2xl border border-border bg-white p-6 text-left shadow-sm transition-shadow hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
                    >
                      <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${TEMPLATE_GRADIENTS[i % TEMPLATE_GRADIENTS.length]}`} />
                      <div className="flex items-start gap-4">
                        <div className={`rounded-xl bg-gradient-to-br ${TEMPLATE_GRADIENTS[i % TEMPLATE_GRADIENTS.length]} p-3 text-white shadow-sm`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground group-hover:text-violet-600 transition-colors">
                            {template.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {template.description}
                          </p>
                        </div>
                        {isGenerating && (
                          <Loader2 className="h-5 w-5 animate-spin text-violet-500 shrink-0" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="report"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
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
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(report.generated_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
              <ReportPDFExport report={report} />
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-foreground mb-3">AI Executive Summary</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {report.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.kpis.map((kpi, i) => (
                <KPICard key={kpi.label} kpi={kpi} index={i} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {report.charts.map((chart) => (
                <ReportChart key={chart.id} chart={chart} />
              ))}
            </div>

            <div className="space-y-6">
              {report.tables.map((table, i) => (
                <ReportTable key={i} table={table} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
