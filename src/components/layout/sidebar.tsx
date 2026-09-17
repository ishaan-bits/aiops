"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Database,
  FileBarChart,
  Settings,
  Sparkles,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Knowledge", href: "/knowledge", icon: BookOpen },
  { label: "SQL Analyst", href: "/sql-analyst", icon: Database },
  { label: "Reports", href: "/reports", icon: FileBarChart },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function SidebarContent() {
  const pathname = usePathname();

  return (
    <>
      <div className="flex h-14 items-center gap-2.5 px-5 font-semibold text-lg tracking-tight">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          AIOps
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "glow-active text-white"
                      : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
                  )}
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                  </motion.div>
                  <span className="truncate">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      <div className="mx-3 mb-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
        <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">
          Version
        </p>
        <p className="text-xs font-medium text-white/60">v0.1.0</p>
      </div>
    </>
  );
}

export function Sidebar() {
  return (
    <aside className="flex flex-col w-64 h-full border-r border-white/[0.06] bg-white/[0.03] backdrop-blur-xl text-sidebar-foreground">
      <SidebarContent />
    </aside>
  );
}
