"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, FolderOpen, Search, AlertTriangle,
  Lightbulb, ClipboardCheck, CalendarDays, FileText, MessageSquare,
  Settings, LogOut, Menu, X, ChevronRight, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/data-room", label: "Data Room", icon: FolderOpen },
  { href: "/analysis", label: "Analysis", icon: Search },
  { href: "/findings", label: "Findings", icon: Activity },
  { href: "/risks", label: "Risks", icon: AlertTriangle },
  { href: "/recommendations", label: "Recommendations", icon: Lightbulb },
  { href: "/decision-center", label: "Decision Center", icon: ClipboardCheck },
  { href: "/action-plans", label: "Action Plans", icon: CalendarDays },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/ai-advisor", label: "AI Advisor", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ userName, currentClient }: { userName?: string; currentClient?: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-background border-r flex flex-col",
          "lg:translate-x-0 transition-transform",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="p-6 border-b">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-foreground rounded-sm flex items-center justify-center">
              <span className="text-background font-bold text-sm">SL</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight">SL Consulting AI</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Business Intelligence</span>
            </div>
          </Link>
        </div>

        {/* Current Client */}
        {currentClient && (
          <div className="px-4 py-3 border-b bg-muted/30">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Current Client</span>
            <div className="flex items-center gap-1 mt-1">
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm font-medium truncate">{currentClient}</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-foreground text-background font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs font-medium">{userName?.charAt(0) || "U"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName || "User"}</p>
              <p className="text-xs text-muted-foreground">Consultant</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </motion.aside>
    </>
  );
}
