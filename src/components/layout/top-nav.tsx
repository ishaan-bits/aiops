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
    <header className="flex h-14 items-center gap-4 border-b dark:border-white/[0.06] border-gray-200 dark:bg-white/[0.02] bg-white backdrop-blur-xl px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden dark:text-white/60 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06]"
        onClick={onMenuToggle}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <div className="flex-1 flex items-center gap-2">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 dark:text-white/30 text-gray-400" />
          <input
            type="search"
            placeholder="Search..."
            className="h-9 w-full rounded-xl border dark:border-white/[0.06] border-gray-200 dark:bg-white/[0.04] bg-gray-100 pl-8 pr-3 text-sm dark:text-white/80 text-gray-800 dark:placeholder:text-white/30 placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all"
          />
        </div>
      </div>

      <div className="h-6 w-px dark:bg-white/[0.08] bg-gray-200" />

      <Button
        variant="ghost"
        size="icon"
        className="relative dark:text-white/50 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06]"
      >
        <Bell className="h-4 w-4" />
        <span className="sr-only">Notifications</span>
      </Button>

      <ThemeToggle />

      <Avatar className="h-8 w-8 border dark:border-white/[0.1] border-gray-200 bg-gradient-to-br from-indigo-500/20 to-violet-500/20">
        <AvatarFallback className="text-xs font-medium text-white/70 bg-transparent">
          U
        </AvatarFallback>
      </Avatar>
    </header>
  );
}
