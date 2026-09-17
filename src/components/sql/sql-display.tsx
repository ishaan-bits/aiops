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
    <div className="glass rounded-3xl overflow-hidden">
      <div className="flex items-center justify-between border-b dark:border-white/[0.08] border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500" />
          <span className="text-sm font-medium text-foreground">Generated SQL</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium dark:text-white/40 text-muted-foreground transition-colors dark:hover:bg-white/[0.06] hover:bg-muted hover:text-white/70"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto dark:bg-[#0d0f16] bg-gray-100 p-5 text-sm leading-relaxed">
        <code className="font-mono dark:text-white/80 text-gray-800">{sql}</code>
      </pre>
      {explanation && (
        <div className="border-t dark:border-white/[0.08] border-border px-5 py-3">
          <p className="text-sm dark:text-white/40 text-muted-foreground">{explanation}</p>
        </div>
      )}
    </div>
  );
}
