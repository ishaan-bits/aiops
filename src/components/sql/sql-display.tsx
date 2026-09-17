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
      <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500" />
          <span className="text-sm font-medium text-foreground">Generated SQL</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/70"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto bg-[#0d0f16] p-5 text-sm leading-relaxed">
        <code className="font-mono text-white/80">{sql}</code>
      </pre>
      {explanation && (
        <div className="border-t border-white/[0.08] px-5 py-3">
          <p className="text-sm text-white/40">{explanation}</p>
        </div>
      )}
    </div>
  );
}
