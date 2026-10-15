"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Bot, Database, FileBarChart, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/ishaan-bits/aiops";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: BookOpen,
    title: "Knowledge Base",
    text: "Upload PDFs and DOCX files, then ask questions in plain language — answers cite the exact source document and page.",
  },
  {
    icon: Database,
    title: "SQL Analyst",
    text: "Turn natural-language questions into SQL, run them instantly, and explore results as tables and charts.",
  },
  {
    icon: FileBarChart,
    title: "Reports",
    text: "AI-generated executive, vendor, payable, and risk reports with KPIs, charts, and PDF export.",
  },
  {
    icon: Sparkles,
    title: "AI Command Center",
    text: "A unified operations dashboard where documents, data, and AI assistance come together.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05060A] text-gray-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[480px] rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[320px] w-[420px] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <header className="relative z-10 flex h-16 items-center justify-between px-6 lg:px-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-white">AIOps</span>
        </div>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[13px] text-gray-300 transition-colors hover:bg-white/[0.08] hover:text-white"
        >
          <GithubIcon className="h-3.5 w-3.5" />
          GitHub
        </a>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-16 lg:pt-24">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.45 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/25 bg-indigo-500/10 px-3.5 py-1.5 text-[12px] font-medium text-indigo-300"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            AI Operations Command Center
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Your operations,
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent">
              {" "}answered by AI
            </span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="mt-5 max-w-2xl text-[15px] leading-relaxed text-gray-400"
          >
            AIOps turns your documents, vendor data, and operational metrics into a single
            intelligent workspace. Ask questions in natural language, generate SQL, and produce
            executive reports — all in one place.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Link
              href="/login"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:brightness-110"
            >
              View Demo
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-medium text-gray-200 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              <GithubIcon className="h-4 w-4" />
              Go to GitHub
            </a>
          </motion.div>
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.36 }}
          className="mt-20 grid gap-4 sm:grid-cols-2"
        >
          {FEATURES.map((feature) => (
            <GlassCard
              key={feature.title}
              variant="subtle"
              className="group p-5 text-left transition-colors hover:border-white/10"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-300 transition-colors group-hover:from-indigo-500/30 group-hover:to-violet-500/30">
                <feature.icon className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-[14px] font-medium text-white">{feature.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-gray-400">{feature.text}</p>
            </GlassCard>
          ))}
        </motion.div>
      </main>

      <footer className="relative z-10 border-t border-white/[0.06] py-6 text-center text-[12px] text-gray-500">
        Built with Next.js &amp; FastAPI · Deployed on Vercel &amp; Render
      </footer>
    </div>
  );
}
