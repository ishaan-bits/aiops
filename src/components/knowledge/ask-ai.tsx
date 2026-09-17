"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, BookOpen, Sparkles } from "lucide-react";
import { askQuestion, type RAGSource } from "@/services/rag";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  sources?: RAGSource[];
  timestamp: Date;
}

const SUGGESTIONS = [
  "Which contracts expire next month?",
  "What are the key terms in the vendor agreements?",
  "Summarize the compliance requirements",
  "List all overdue payments and their vendors",
];

export function AskAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const question = (text || input).trim();
    if (!question || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await askQuestion(question);
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "ai",
        content: res.answer,
        sources: res.sources,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errMsg: Message = {
        id: crypto.randomUUID(),
        role: "ai",
        content: err instanceof Error ? err.message : "Failed to get answer",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-white shadow-sm overflow-hidden" style={{ height: "calc(100vh - 280px)", minHeight: "500px" }}>
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <div className="rounded-xl bg-violet-100 p-2">
          <Sparkles className="h-4 w-4 text-violet-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Ask AI</h3>
          <p className="text-xs text-muted-foreground">Search across your documents</p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Online
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="rounded-2xl bg-violet-50 p-4 mb-4">
              <BookOpen className="h-8 w-8 text-violet-500" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Ask anything about your documents</p>
            <p className="text-xs text-muted-foreground mb-6">Upload documents to your Knowledge Base, then ask questions here.</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "ai" && (
              <div className="rounded-full bg-violet-100 p-2 h-fit shrink-0">
                <Sparkles className="h-4 w-4 text-violet-600" />
              </div>
            )}
            <div className={`max-w-[75%] ${msg.role === "user" ? "" : ""}`}>
              <div
                className={`rounded-2xl px-5 py-3 ${
                  msg.role === "user"
                    ? "bg-violet-500 text-white rounded-br-md"
                    : "bg-slate-100 text-foreground rounded-bl-md"
                }`}
              >
                {msg.role === "ai" && (
                  <p className="text-xs font-medium text-violet-600 mb-1">AIOps</p>
                )}
                {msg.role === "user" && (
                  <p className="text-xs font-medium text-white/70 mb-1 text-right">You</p>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>

              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground px-1">Sources</p>
                  {msg.sources.map((src, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2"
                    >
                      <BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs font-medium text-foreground truncate">{src.document}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">Page {src.page}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{Math.round(src.score * 100)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="rounded-full bg-violet-100 p-2 h-fit shrink-0">
              <Sparkles className="h-4 w-4 text-violet-600" />
            </div>
            <div className="rounded-2xl rounded-bl-md bg-slate-100 px-5 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 text-violet-500 animate-spin" />
                <span className="text-sm text-muted-foreground">Reading documents with AI...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask a question about your documents..."
            rows={1}
            disabled={loading}
            className="flex-1 resize-none rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="rounded-xl bg-violet-500 p-2.5 text-white shadow-sm transition-all hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground text-center">
          Press Enter to send · Shift+Enter for newline
        </p>
      </div>
    </div>
  );
}
