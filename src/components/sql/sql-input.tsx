"use client";

import { useState } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <Sparkles className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Ask a question about your data..."
          disabled={loading}
          className="h-14 w-full rounded-xl border border-border bg-white pl-12 pr-28 text-base shadow-sm transition-shadow focus:shadow-md focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Button
            onClick={handleSubmit}
            disabled={!question.trim() || loading}
            size="sm"
            className="gap-2 rounded-lg"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Generate SQL
          </Button>
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
            className="rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
