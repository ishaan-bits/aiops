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
    <header className="flex h-14 items-center gap-4 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-xl px-4 lg:px-6 dark:border-white/[0.06] border-border">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-white/60 hover:text-white hover:bg-white/[0.06] dark:text-white/60 text-muted-foreground"
        onClick={onMenuToggle}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <div className="flex-1 flex items-center gap-2">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 dark:text-white/30 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search..."
            className="h-9 w-full rounded-xl border border-white/[0.06] dark:border-white/[0.06] border-border bg-white/[0.04] dark:bg-white/[0.04] bg-muted/50 pl-8 pr-3 text-sm text-white/80 dark:text-white/80 text-foreground placeholder:text-white/30 dark:placeholder:text-white/30 placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all"
          />
        </div>
      </div>

      <div className="h-6 w-px bg-white/[0.08] dark:bg-white/[0.08] bg-border" />

      <Button
        variant="ghost"
        size="icon"
        className="relative text-white/50 hover:text-white hover:bg-white/[0.06] dark:text-white/50 text-muted-foreground"
      >
        <Bell className="h-4 w-4" />
        <span className="sr-only">Notifications</span>
      </Button>

      <ThemeToggle />

      <Avatar className="h-8 w-8 border border-white/[0.1] dark:border-white/[0.1] border-border bg-gradient-to-br from-indigo-500/20 to-violet-500/20">
        <AvatarFallback className="text-xs font-medium text-white/70 bg-transparent">
          U
        </AvatarFallback>
      </Avatar>
    </header>
  );
}
