"use client";

import { useState } from "react";
import { SidebarContent } from "./sidebar";
import { TopNav } from "./top-nav";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 shrink-0 border-r border-white/[0.06] dark:border-white/[0.06] border-border bg-white/[0.03] dark:bg-white/[0.03] bg-sidebar backdrop-blur-xl text-sidebar-foreground">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-64 p-0 border-0 bg-white/[0.06] dark:bg-white/[0.06] bg-background backdrop-blur-2xl text-sidebar-foreground"
        >
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav onMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
