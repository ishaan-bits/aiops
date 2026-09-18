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
      <div className="flex h-16 items-center gap-3 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-bold tracking-tight bg-gradient-to-r dark:from-white dark:via-indigo-200 dark:to-violet-200 from-gray-900 via-indigo-800 to-violet-800 bg-clip-text text-transparent">
          AIOps
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                    isActive
                      ? "glow-active dark:text-white text-gray-900"
                      : "dark:text-white/40 text-gray-500 dark:hover:text-white/70 hover:text-gray-700 dark:hover:bg-white/[0.04] hover:bg-gray-100"
                  )}
                >
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: -3 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                  </motion.div>
                  <span className="truncate">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      <div className="mx-3 mb-3 rounded-xl border dark:border-white/[0.06] border-gray-200 dark:bg-white/[0.02] bg-gray-50 p-3">
        <p className="text-[10px] uppercase tracking-widest dark:text-white/20 text-gray-400 mb-0.5">
          Version
        </p>
        <p className="text-[11px] font-medium dark:text-white/40 text-gray-500">v0.1.0</p>
      </div>
    </>
  );
}

export function Sidebar() {
  return (
    <aside className="flex flex-col w-60 h-full border-r dark:border-white/[0.06] border-gray-200 dark:bg-white/[0.02] bg-white backdrop-blur-xl">
      <SidebarContent />
    </aside>
  );
}
