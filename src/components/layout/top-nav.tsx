"use client";

import { Menu, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface TopNavProps {
  onMenuToggle?: () => void;
}

export function TopNav({ onMenuToggle }: TopNavProps) {
  return (
    <header className="flex h-14 items-center gap-3 border-b dark:border-white/[0.06] border-gray-200 dark:bg-white/[0.02] bg-white backdrop-blur-xl px-4 lg:px-5">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden dark:text-white/50 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06]"
        onClick={onMenuToggle}
      >
        <Menu className="h-4 w-4" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <div className="flex-1 flex items-center gap-2">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 dark:text-white/20 text-gray-400" />
          <input
            type="search"
            placeholder="Search..."
            className="h-8 w-full rounded-lg border dark:border-white/[0.06] border-gray-200 dark:bg-white/[0.03] bg-gray-50 pl-9 pr-3 text-[13px] dark:text-white/70 text-gray-700 dark:placeholder:text-white/25 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all"
          />
        </div>
      </div>

      <div className="h-5 w-px dark:bg-white/[0.06] bg-gray-200" />

      <Button
        variant="ghost"
        size="icon"
        className="relative h-8 w-8 dark:text-white/40 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06]"
      >
        <Bell className="h-3.5 w-3.5" />
        <span className="sr-only">Notifications</span>
      </Button>

      <ThemeToggle />

      <Avatar className="h-7 w-7 border dark:border-white/[0.08] border-gray-200 bg-gradient-to-br from-indigo-500 to-violet-500">
        <AvatarFallback className="text-[10px] font-semibold text-white bg-transparent">
          U
        </AvatarFallback>
      </Avatar>
    </header>
  );
}
