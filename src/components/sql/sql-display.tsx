"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface SQLDisplayProps {
  sql: string;
  explanation: string;
}

export function SQLDisplay({ sql, explanation }: SQLDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500" />
          <span className="text-sm font-medium text-foreground">Generated SQL</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto bg-[#1e1e2e] p-5 text-sm leading-relaxed">
        <code className="font-mono text-[#cdd6f4]">{sql}</code>
      </pre>
      {explanation && (
        <div className="border-t border-border px-5 py-3">
          <p className="text-sm text-muted-foreground">{explanation}</p>
        </div>
      )}
    </div>
  );
}
