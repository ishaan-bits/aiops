"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  FileText,
  Database,
  MessageSquare,
  FileBarChart,
  Upload,
  Brain,
  Play,
  Clock,
  ArrowUpRight,
  Bot,
  User,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { uploadDocument } from "@/services/api";
import { Toaster } from "sonner";

const kpiCards = [
  {
    title: "Documents Indexed",
    value: "248",
    icon: FileText,
    change: "+12%",
  },
  {
    title: "Knowledge Base",
    value: "1.2 GB",
    icon: Database,
    change: "+8%",
  },
  {
    title: "AI Queries",
    value: "942",
    icon: MessageSquare,
    change: "+23%",
  },
  {
    title: "Reports Generated",
    value: "37",
    icon: FileBarChart,
    change: "+5%",
  },
];

const activities = [
  {
    icon: Upload,
    title: "Contract.pdf uploaded",
    description: "Vendor agreement added to knowledge base",
    time: "2 minutes ago",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: FileBarChart,
    title: "Vendor report generated",
    description: "Q4 spending analysis completed",
    time: "18 minutes ago",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: Database,
    title: "Knowledge synced",
    description: "142 documents re-indexed",
    time: "1 hour ago",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
  },
  {
    icon: FileText,
    title: "Invoice analyzed",
    description: "INV-2024-0847 processed and categorized",
    time: "2 hours ago",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: Play,
    title: "SQL query executed",
    description: "Vendor payment reconciliation query run",
    time: "3 hours ago",
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
  },
  {
    icon: FileBarChart,
    title: "Weekly report exported",
    description: "Ops summary for week 48 delivered",
    time: "5 hours ago",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
  },
];

const quickActions = [
  {
    title: "Upload Documents",
    description: "Add files to your knowledge base",
    icon: Upload,
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    title: "Ask AI",
    description: "Query your data with natural language",
    icon: Brain,
    color: "bg-violet-500 hover:bg-violet-600",
  },
  {
    title: "Run SQL Analysis",
    description: "Execute queries on your datasets",
    icon: Play,
    color: "bg-emerald-500 hover:bg-emerald-600",
  },
];

export default function DashboardPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleUploadFile(file: File) {
    setIsUploading(true);
    try {
      const result = await uploadDocument(file);
      toast.success(`${result.filename} uploaded successfully`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadFile(file);
      e.target.value = "";
    }
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <Toaster position="top-right" richColors />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.csv"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-white text-gray-900">
            Dashboard
          </h1>
          <p className="text-[13px] dark:text-white/40 text-gray-500 mt-0.5">
            AI Operations Command Center
          </p>
        </div>
        <p className="text-[13px] dark:text-white/30 text-gray-400 mt-2 sm:mt-0">{today}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: i * 0.08,
              type: "spring",
              stiffness: 400,
              damping: 28,
            }}
            whileHover={{ y: -2, transition: { type: "spring", stiffness: 400, damping: 28 } }}
            className="group relative glass noise rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-wider dark:text-white/35 text-gray-400">
                  {kpi.title}
                </p>
                <p className="text-2xl font-bold tracking-tight dark:text-white text-gray-900">
                  {kpi.value}
                </p>
              </div>
              <div className="rounded-lg dark:bg-white/[0.04] bg-gray-100 p-2 transition-colors group-hover:bg-white/[0.08]">
                <kpi.icon className="h-4 w-4 dark:text-white/40 text-gray-500" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1">
              <span className="text-xs font-semibold text-emerald-500 dark:text-emerald-400">
                {kpi.change}
              </span>
              <span className="text-[11px] dark:text-white/30 text-gray-400">
                vs last month
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Middle Section: Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.35,
            type: "spring",
            stiffness: 400,
            damping: 28,
          }}
          className="lg:col-span-2 glass rounded-2xl"
        >
          <div className="flex items-center justify-between border-b dark:border-white/[0.06] border-gray-200 px-5 py-3.5">
            <h2 className="text-sm font-semibold dark:text-white text-gray-900">
              Recent Activity
            </h2>
            <button className="text-[11px] font-medium dark:text-white/30 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              View all
            </button>
          </div>
          <div className="divide-y dark:divide-white/[0.06] divide-gray-100">
            {activities.map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.4 + i * 0.04,
                  type: "spring",
                  stiffness: 400,
                  damping: 28,
                }}
                className="flex items-start gap-3 px-5 py-3 transition-colors dark:hover:bg-white/[0.02] hover:bg-gray-50"
              >
                <div className={`mt-0.5 rounded-md p-1.5 ${activity.bgColor}`}>
                  <activity.icon className={`h-3.5 w-3.5 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium dark:text-white text-gray-900">
                    {activity.title}
                  </p>
                  <p className="text-[12px] dark:text-white/35 text-gray-500 mt-0.5">
                    {activity.description}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] dark:text-white/30 text-gray-400 whitespace-nowrap mt-0.5">
                  <Clock className="h-3 w-3" />
                  {activity.time}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.4,
            type: "spring",
            stiffness: 400,
            damping: 28,
          }}
          className="glass rounded-2xl"
        >
          <div className="border-b dark:border-white/[0.06] border-gray-200 px-5 py-3.5">
            <h2 className="text-sm font-semibold dark:text-white text-gray-900">
              Quick Actions
            </h2>
          </div>
          <div className="p-3 space-y-2">
            {quickActions.map((action) => (
              <motion.button
                key={action.title}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (action.title === "Upload Documents") {
                    fileInputRef.current?.click();
                  }
                }}
                disabled={action.title === "Upload Documents" && isUploading}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left text-white transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${action.color}`}
              >
                <div className="rounded-lg bg-white/20 p-2">
                  {action.title === "Upload Documents" && isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <action.icon className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold">
                    {action.title === "Upload Documents" && isUploading
                      ? "Uploading..."
                      : action.title}
                  </p>
                  <p className="text-[11px] text-white/70">{action.description}</p>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-white/50" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Assistant Preview */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.5,
          type: "spring",
          stiffness: 400,
          damping: 28,
        }}
        className="glass rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between border-b dark:border-white/[0.06] border-gray-200 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-violet-500/10 p-1.5">
              <Bot className="h-4 w-4 text-violet-500 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold dark:text-white text-gray-900">
                AI Assistant
              </h2>
              <p className="text-[11px] dark:text-white/30 text-gray-400">
                Powered by AIOps Intelligence
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-500 dark:text-emerald-400">
            <span className="h-1 w-1 rounded-full bg-emerald-500" />
            Online
          </span>
        </div>

        <div className="p-5 space-y-4">
          {/* User Message */}
          <div className="flex gap-3">
            <div className="rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 p-1.5 h-fit">
              <User className="h-3.5 w-3.5 dark:text-white/50 text-gray-500" />
            </div>
            <div className="rounded-xl rounded-tl-md dark:bg-white/[0.05] bg-gray-100 px-4 py-2.5 max-w-2xl">
              <p className="text-[11px] font-medium dark:text-white/30 text-gray-400 mb-0.5">You</p>
              <p className="text-[13px] dark:text-white/80 text-gray-800 leading-relaxed">
                &quot;Summarize all vendor contracts expiring this month.&quot;
              </p>
            </div>
          </div>

          {/* AI Response */}
          <div className="flex gap-3">
            <div className="rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 p-1.5 h-fit">
              <Bot className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
            </div>
            <div className="rounded-xl rounded-tl-md bg-violet-500/10 border border-violet-500/20 px-4 py-2.5 max-w-2xl">
              <p className="text-[11px] font-medium text-violet-500 dark:text-violet-400 mb-0.5">
                AIOps
              </p>
              <p className="text-[13px] dark:text-white/80 text-gray-800 leading-relaxed">
                I found <span className="font-semibold">12 contracts</span>.
                Three expire within 30 days. The highest-value contract belongs
                to{" "}
                <span className="font-semibold">Acme Logistics</span> worth{" "}
                <span className="font-semibold">₹18.4L</span>.
              </p>
            </div>
          </div>

          {/* View Sources */}
          <div className="flex justify-start pl-10">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-1.5 glass-subtle rounded-lg px-4 py-2 text-[13px] font-medium dark:text-white/60 text-gray-600 transition-all hover:shadow-md"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View Sources
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
