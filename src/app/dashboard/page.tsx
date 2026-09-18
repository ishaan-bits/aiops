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
    <div className="space-y-8">
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
          <h1 className="text-3xl font-bold tracking-tight dark:text-white text-gray-900">
            Dashboard
          </h1>
          <p className="dark:text-white/50 text-gray-500 mt-1">
            AI Operations Command Center
          </p>
        </div>
        <p className="text-sm dark:text-white/50 text-gray-500 mt-2 sm:mt-0">{today}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: i * 0.1,
              type: "spring",
              stiffness: 300,
              damping: 24,
            }}
            whileHover={{ y: -4, scale: 1.01, transition: { type: "spring", stiffness: 300, damping: 24 } }}
            className="group relative glass noise rounded-3xl p-6 transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium dark:text-white/50 text-gray-500">
                  {kpi.title}
                </p>
                <p className="text-3xl font-bold tracking-tight dark:text-white text-gray-900">
                  {kpi.value}
                </p>
              </div>
              <div className="rounded-xl dark:bg-white/[0.04] bg-gray-100 p-2.5 transition-colors group-hover:bg-white/[0.08]">
                <kpi.icon className="h-5 w-5 dark:text-white/50 text-gray-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5">
              <span className="text-sm font-medium text-emerald-500 dark:text-emerald-400">
                {kpi.change}
              </span>
              <span className="text-sm dark:text-white/50 text-gray-500">
                from last month
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Middle Section: Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.4,
            type: "spring",
            stiffness: 300,
            damping: 24,
          }}
          className="lg:col-span-2 glass rounded-3xl"
        >
          <div className="flex items-center justify-between border-b dark:border-white/[0.08] border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold dark:text-white text-gray-900">
              Recent Activity
            </h2>
            <button className="text-sm font-medium dark:text-white/50 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              View all
            </button>
          </div>
          <div className="divide-y dark:divide-white/[0.08] divide-gray-200">
            {activities.map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.5 + i * 0.05,
                  type: "spring",
                  stiffness: 300,
                  damping: 24,
                }}
                className="flex items-start gap-4 px-6 py-4 transition-colors dark:hover:bg-white/[0.03] hover:bg-gray-50"
              >
                <div className={`mt-0.5 rounded-lg p-2 ${activity.bgColor}`}>
                  <activity.icon className={`h-4 w-4 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium dark:text-white text-gray-900">
                    {activity.title}
                  </p>
                  <p className="text-sm dark:text-white/50 text-gray-500 mt-0.5">
                    {activity.description}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs dark:text-white/50 text-gray-400 whitespace-nowrap mt-0.5">
                  <Clock className="h-3 w-3" />
                  {activity.time}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.5,
            type: "spring",
            stiffness: 300,
            damping: 24,
          }}
          className="glass rounded-3xl"
        >
          <div className="border-b dark:border-white/[0.08] border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold dark:text-white text-gray-900">
              Quick Actions
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {quickActions.map((action) => (
              <motion.button
                key={action.title}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (action.title === "Upload Documents") {
                    fileInputRef.current?.click();
                  }
                }}
                disabled={action.title === "Upload Documents" && isUploading}
                className={`w-full flex items-center gap-4 rounded-xl px-5 py-4 text-left text-white shadow-sm transition-shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${action.color}`}
              >
                <div className="rounded-lg bg-white/20 p-2.5">
                  {action.title === "Upload Documents" && isUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <action.icon className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">
                    {action.title === "Upload Documents" && isUploading
                      ? "Uploading..."
                      : action.title}
                  </p>
                  <p className="text-sm text-white/80">{action.description}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-white/60" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Assistant Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.6,
          type: "spring",
          stiffness: 300,
          damping: 24,
        }}
        className="glass rounded-3xl overflow-hidden"
      >
        <div className="flex items-center justify-between border-b dark:border-white/[0.08] border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-500/15 p-2">
              <Bot className="h-5 w-5 text-violet-500 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold dark:text-white text-gray-900">
                AI Assistant
              </h2>
              <p className="text-sm dark:text-white/50 text-gray-500">
                Powered by AIOps Intelligence
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-500 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Online
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* User Message */}
          <div className="flex gap-3">
            <div className="rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 p-2 h-fit">
              <User className="h-4 w-4 dark:text-white/60 text-gray-500" />
            </div>
            <div className="rounded-2xl rounded-tl-md dark:bg-white/[0.06] bg-gray-100 px-5 py-3 max-w-2xl">
              <p className="text-sm font-medium dark:text-white/50 text-gray-500 mb-1">You</p>
              <p className="text-sm dark:text-white/80 text-gray-800 leading-relaxed">
                &quot;Summarize all vendor contracts expiring this month.&quot;
              </p>
            </div>
          </div>

          {/* AI Response */}
          <div className="flex gap-3">
            <div className="rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 p-2 h-fit">
              <Bot className="h-4 w-4 text-violet-500 dark:text-violet-400" />
            </div>
            <div className="rounded-2xl rounded-tl-md bg-violet-500/10 border border-violet-500/20 px-5 py-3 max-w-2xl">
              <p className="text-sm font-medium text-violet-500 dark:text-violet-400 mb-1">
                AIOps
              </p>
              <p className="text-sm dark:text-white/80 text-gray-800 leading-relaxed">
                I found <span className="font-semibold">12 contracts</span>.
                Three expire within 30 days. The highest-value contract belongs
                to{" "}
                <span className="font-semibold">Acme Logistics</span> worth{" "}
                <span className="font-semibold">₹18.4L</span>.
              </p>
            </div>
          </div>

          {/* View Sources */}
          <div className="flex justify-start pl-11">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 glass-subtle rounded-xl px-5 py-2.5 text-sm font-medium dark:text-white text-gray-900 transition-shadow hover:shadow-md"
            >
              <ExternalLink className="h-4 w-4" />
              View Sources
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
