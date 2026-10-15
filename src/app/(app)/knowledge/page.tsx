"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "sonner";
import {
  Upload,
  FileText,
  MoreVertical,
  Search,
  CheckCircle2,
  Clock,
  HardDrive,
  Files,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { uploadDocument, fetchDocuments, DocumentItem } from "@/services/api";
import { indexDocument } from "@/services/rag";
import { AskAI } from "@/components/knowledge/ask-ai";

interface Document {
  name: string;
  size: string;
  date: string;
  status: "indexed" | "uploaded";
  tag: string;
  id: number;
}

interface RecentRow {
  name: string;
  size: string;
  uploadedBy: string;
  time: string;
  status: "indexed" | "uploaded";
}

const filters = ["All", "PDF", "Contracts", "Invoices", "SOP"];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getTag(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes("contract")) return "contracts";
  if (lower.includes("invoice") || lower.includes("order")) return "invoices";
  if (lower.includes("sop")) return "sop";
  return "pdf";
}

function apiDocToDoc(d: DocumentItem): Document {
  const date = d.created_at
    ? new Date(d.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Unknown";
  return {
    name: d.filename,
    size: formatFileSize(d.file_size),
    date,
    status: d.status === "indexed" ? "indexed" : "uploaded",
    tag: getTag(d.filename),
    id: d.id,
  };
}

export default function KnowledgePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [isDragOver, setIsDragOver] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [recentlyUploaded, setRecentlyUploaded] = useState<RecentRow[]>([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [indexedDocs, setIndexedDocs] = useState(0);
  const [storageUsed, setStorageUsed] = useState(0);
  const [showAskAI, setShowAskAI] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      const items = await fetchDocuments();
      const docs = items.map(apiDocToDoc);
      setDocuments(docs);
      setTotalDocs(items.length);
      setIndexedDocs(items.filter((d) => d.status === "indexed").length);
      setStorageUsed(items.reduce((sum, d) => sum + d.file_size, 0) / (1024 * 1024 * 1024));
      setRecentlyUploaded(
        docs.slice(0, 5).map((d) => ({
          name: d.name,
          size: d.size,
          uploadedBy: "You",
          time: d.date,
          status: d.status,
        }))
      );
    } catch {
      toast.error("Failed to load documents");
    }
  }

  const filteredDocuments = documents.filter((doc) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "PDF") return true;
    if (activeFilter === "Contracts") return doc.tag === "contracts";
    if (activeFilter === "Invoices") return doc.tag === "invoices";
    if (activeFilter === "SOP") return doc.tag === "sop";
    return true;
  });

  async function handleFile(file: File) {
    setIsUploading(true);
    try {
      const result = await uploadDocument(file);
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

      const newDoc: Document = {
        name: result.filename,
        size: formatFileSize(result.file_size),
        date: dateStr,
        status: "uploaded",
        tag: getTag(result.filename),
        id: result.id,
      };

      const newRecent: RecentRow = {
        name: result.filename,
        size: formatFileSize(result.file_size),
        uploadedBy: "You",
        time: "Just now",
        status: "uploaded",
      };

      setDocuments((prev) => [newDoc, ...prev]);
      setRecentlyUploaded((prev) => [newRecent, ...prev]);
      setTotalDocs((prev) => prev + 1);
      setStorageUsed((prev) => prev + result.file_size / (1024 * 1024 * 1024));

      toast.success(`${result.filename} uploaded successfully`);

      if (result.id) {
        toast.info("Indexing document for AI search...");
        try {
          await indexDocument(result.id);
          toast.success(`${result.filename} indexed for AI search`);
          loadDocuments();
        } catch {
          toast.warning("Upload succeeded but indexing failed. You can retry later.");
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
      e.target.value = "";
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

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
            Knowledge Base
          </h1>
          <p className="dark:text-white/50 text-gray-500 mt-1">
            Upload and manage company documents
          </p>
        </div>
        <button
          onClick={() => setShowAskAI(!showAskAI)}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium shadow-sm transition-all ${
            showAskAI
              ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500"
               : "glass dark:text-white text-gray-900 dark:hover:bg-white/[0.08] hover:bg-gray-100"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          {showAskAI ? "Close AI" : "Ask AI"}
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`glass-subtle rounded-3xl border-2 border-dashed p-10 text-center transition-all ${
                isDragOver
                  ? "border-violet-500/40 bg-violet-500/10"
                   : "dark:border-white/[0.12] border-gray-200 dark:hover:border-white/[0.2]"
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-2xl dark:bg-white/[0.04] bg-gray-100 p-4">
                  <Upload className="h-8 w-8 dark:text-white/50 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium dark:text-white text-gray-900">
                    Drag & drop files here, or{" "}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-violet-400 hover:text-violet-300 font-semibold"
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-xs dark:text-white/50 text-gray-500 mt-1.5">
                    PDF, DOCX and CSV supported
                  </p>
                  <p className="text-xs dark:text-white/50 text-gray-500 mt-0.5">
                    Max file size: 50 MB
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:from-violet-500 hover:to-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Document
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Filter Chips + Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    activeFilter === filter
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                       : "glass-subtle dark:text-white/50 text-gray-500 dark:hover:bg-white/[0.06] hover:bg-gray-100"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-white/50 text-gray-500" />
              <input
                type="search"
                placeholder="Search documents..."
                className="h-9 w-full sm:w-64 rounded-lg dark:border-white/[0.08] border-gray-200 dark:bg-white/[0.04] bg-gray-100 pl-8 pr-3 text-sm dark:text-white text-gray-900 outline-none focus:ring-1 focus:ring-violet-500/40 placeholder:text-gray-400"
              />
            </div>
          </motion.div>

          {/* Document Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc, i) => (
              <motion.div
                key={doc.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.15 + i * 0.05 }}
                whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                className="group glass rounded-3xl p-5 transition-shadow hover:shadow-lg hover:shadow-violet-500/5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="rounded-xl bg-red-500/10 p-3">
                    <FileText className="h-6 w-6 text-red-400" />
                  </div>
                  <button className="rounded-lg p-1.5 dark:text-white/50 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity dark:hover:bg-white/[0.06] hover:bg-gray-100">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold dark:text-white text-gray-900 truncate">
                    {doc.name}
                  </p>
                  <p className="text-xs dark:text-white/50 text-gray-500">
                    {doc.size} &middot; {doc.date}
                  </p>
                </div>
                <div className="mt-3">
                  {doc.status === "indexed" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Indexed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium dark:text-amber-400 text-amber-600">
                      <Clock className="h-3 w-3" />
                      Uploaded
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recently Uploaded Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.5 }}
            className="glass rounded-3xl shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between dark:border-white/[0.08] border-gray-200 border-b px-6 py-4">
              <h2 className="text-lg font-semibold dark:text-white text-gray-900">
                Recently Uploaded
              </h2>
              <button className="text-sm font-medium dark:text-white/50 text-gray-500 hover:text-white transition-colors">
                View all
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                    <tr className="dark:border-white/[0.08] border-gray-200 border-b">
                    <th className="px-6 py-3 text-left text-xs font-medium dark:text-white/60 text-gray-500 uppercase tracking-wider">
                      File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium dark:text-white/60 text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium dark:text-white/60 text-gray-500 uppercase tracking-wider">
                      Uploaded By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium dark:text-white/60 text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium dark:text-white/60 text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="dark:divide-white/[0.06] divide-gray-200">
                  {recentlyUploaded.map((row) => (
                    <tr key={row.name} className="transition-colors dark:hover:bg-white/[0.03] hover:bg-gray-50">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-red-500/10 p-2">
                            <FileText className="h-4 w-4 text-red-400" />
                          </div>
                          <span className="text-sm font-medium dark:text-white text-gray-900">
                            {row.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-sm dark:text-white/50 text-gray-500">
                        {row.size}
                      </td>
                      <td className="px-6 py-3.5 text-sm dark:text-white/50 text-gray-500">
                        {row.uploadedBy}
                      </td>
                      <td className="px-6 py-3.5 text-sm dark:text-white/50 text-gray-500">
                        {row.time}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          Indexed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Right Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
          className="xl:w-80 shrink-0"
        >
          <div className="xl:sticky xl:top-6">
            {showAskAI ? (
              <AskAI />
            ) : (
              <div className="space-y-4">
            <div className="glass rounded-3xl shadow-sm">
              <div className="dark:border-white/[0.08] border-gray-200 border-b px-5 py-4">
                <h2 className="text-base font-semibold dark:text-white text-gray-900">
                  Summary
                </h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-500/10 p-2.5">
                    <Files className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs dark:text-white/50 text-gray-500">Total Documents</p>
                    <p className="text-lg font-bold dark:text-white text-gray-900">{totalDocs}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-500/10 p-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs dark:text-white/50 text-gray-500">Indexed</p>
                    <p className="text-lg font-bold dark:text-white text-gray-900">{indexedDocs}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-amber-500/10 p-2.5">
                    <Clock className="h-4 w-4 dark:text-amber-400 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs dark:text-white/50 text-gray-500">Pending</p>
                    <p className="text-lg font-bold dark:text-white text-gray-900">{totalDocs - indexedDocs}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-violet-500/10 p-2.5">
                    <HardDrive className="h-4 w-4 dark:text-violet-400 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-xs dark:text-white/50 text-gray-500">Storage Used</p>
                    <p className="text-lg font-bold dark:text-white text-gray-900">{storageUsed.toFixed(1)} GB</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Storage Bar */}
            <div className="glass rounded-3xl p-5 shadow-sm">
              <p className="text-sm font-medium dark:text-white text-gray-900 mb-3">Storage</p>
              <div className="h-2 rounded-full dark:bg-white/[0.06] bg-gray-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((storageUsed / 2) * 100, 100)}%` }}
                  transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                />
              </div>
              <p className="text-xs dark:text-white/50 text-gray-500 mt-2">
                {storageUsed.toFixed(1)} GB of 2 GB used
              </p>
            </div>

            {/* Health Status */}
            <div className="glass rounded-3xl p-5 shadow-sm">
              <p className="text-sm font-medium dark:text-white text-gray-900 mb-3">
                Index Health
              </p>
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-emerald-500/10 p-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold dark:text-white text-gray-900">
                    {((indexedDocs / totalDocs) * 100).toFixed(1)}% indexed
                  </p>
                  <p className="text-xs dark:text-white/50 text-gray-500">
                    {totalDocs - indexedDocs} files pending
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div className="rounded-lg bg-amber-500/10 p-2">
                  <AlertCircle className="h-4 w-4 dark:text-amber-400 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold dark:text-white text-gray-900">
                    3 re-indexing
                  </p>
                  <p className="text-xs dark:text-white/50 text-gray-500">
                    Updated within 24h
                  </p>
                </div>
              </div>
            </div>
          </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
