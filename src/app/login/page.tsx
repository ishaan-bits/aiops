"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Bot, Eye, EyeOff, Loader2 } from "lucide-react";
import { login } from "@/services/auth";

const ACCOUNTS = [
  { id: "admin@aiops.com", label: "Admin", role: "admin" },
  { id: "ops@aiops.com", label: "Operations", role: "operator" },
  { id: "viewer@aiops.com", label: "Viewer", role: "viewer" },
];

export default function LoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState(ACCOUNTS[0].id);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(userId, password);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05060A] px-4 text-gray-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[480px] w-[680px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[320px] w-[420px] rounded-full bg-violet-600/15 blur-[120px]" />
      </div>

      <Link
        href="/"
        className="absolute left-5 top-5 z-10 flex items-center gap-1.5 text-[13px] text-gray-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-sm rounded-2xl border border-white/[0.08] bg-white/[0.03] p-7 shadow-2xl shadow-black/40 backdrop-blur-xl"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/25">
            <Bot className="h-5.5 w-5.5 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-white">Sign in to AIOps</h1>
          <p className="mt-1 text-[13px] text-gray-400">AI Operations Command Center</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="user_id" className="mb-1.5 block text-[12px] font-medium text-gray-300">
              Account
            </label>
            <select
              id="user_id"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="h-10 w-full appearance-none rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-[13px] text-white outline-none transition-colors focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/20"
            >
              {ACCOUNTS.map((account) => (
                <option key={account.id} value={account.id} className="bg-[#0B0D14] text-white">
                  {account.id} — {account.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-[12px] font-medium text-gray-300">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                autoComplete="current-password"
                className="h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 pr-10 text-[13px] text-white placeholder:text-white/25 outline-none transition-colors focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/35 transition-colors hover:text-white/70"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        <p className="mt-5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-center text-[12px] text-gray-400">
          Demo accounts share one password:{" "}
          <span className="font-medium text-indigo-300">AiOps123</span>
        </p>
      </motion.div>
    </div>
  );
}
