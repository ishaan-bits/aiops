"use client";

import { useState } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";

interface SQLInputProps {
  onGenerate: (question: string) => void;
  loading: boolean;
}

const SUGGESTIONS = [
  "What is the total spend by vendor?",
  "Show overdue payments",
  "Average payment by department",
  "Top 5 largest invoices",
  "Count payments by status",
];

export function SQLInput({ onGenerate, loading }: SQLInputProps) {
  const [question, setQuestion] = useState("");

  const handleSubmit = () => {
    if (question.trim() && !loading) {
      onGenerate(question.trim());
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Sparkles className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 dark:text-white/30 text-muted-foreground" />
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Ask a question about your data..."
          disabled={loading}
          className="h-14 w-full rounded-xl border dark:border-white/[0.08] border-border dark:bg-white/[0.04] bg-muted/50 pl-12 pr-28 text-base dark:text-white/80 text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-violet-500/40 dark:focus:bg-white/[0.06] focus:bg-muted focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <button
            onClick={handleSubmit}
            disabled={!question.trim() || loading}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Generate SQL
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => {
              setQuestion(s);
              onGenerate(s);
            }}
            disabled={loading}
            className="glass-subtle rounded-lg px-3 py-1.5 text-xs font-medium dark:text-white/40 text-muted-foreground transition-colors hover:text-white/70 disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
