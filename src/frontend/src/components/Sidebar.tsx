import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useLocation } from "@tanstack/react-router";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Kanban,
  LayoutDashboard,
  LogOut,
  Moon,
  Sparkles,
  Sun,
  Table2,
} from "lucide-react";
import { useTheme } from "next-themes";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/applications", label: "Applications", icon: Table2 },
  { to: "/kanban", label: "Pipeline", icon: Kanban },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Sidebar() {
  const location = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();
  const { clear, identity } = useInternetIdentity();
  const { theme, setTheme } = useTheme();

  const principalShort = identity
    ? `${identity.getPrincipal().toString().slice(0, 8)}…`
    : "";

  return (
    <aside
      data-ocid="sidebar"
      className={cn(
        "hidden md:flex flex-col h-screen sticky top-0 bg-sidebar border-r border-sidebar-border transition-smooth shrink-0 z-20",
        sidebarCollapsed ? "w-16" : "w-60",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-2.5 h-16 px-4 border-b border-sidebar-border",
          sidebarCollapsed && "justify-center px-0",
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-md">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        {!sidebarCollapsed && (
          <span className="font-display font-bold text-sm tracking-tight text-sidebar-foreground whitespace-nowrap">
            JobTrack AI
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 mt-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const isActive =
            to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              data-ocid={`nav-${label.toLowerCase()}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-smooth relative group",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                sidebarCollapsed && "justify-center px-0",
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-primary" />
              )}
              <Icon className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span>{label}</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-3 px-2 py-1 rounded-md bg-popover border border-border text-popover-foreground text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-smooth z-50 shadow-md">
                  {label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* Bottom actions */}
      <div className="p-2 space-y-1 pb-4">
        {/* Theme toggle */}
        <button
          type="button"
          data-ocid="theme-toggle"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-smooth",
            "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent",
            sidebarCollapsed && "justify-center px-0",
          )}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 shrink-0" />
          ) : (
            <Moon className="w-4 h-4 shrink-0" />
          )}
          {!sidebarCollapsed && (
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          )}
        </button>

        {/* User + logout */}
        {identity && (
          <button
            type="button"
            data-ocid="logout-btn"
            onClick={() => clear()}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-smooth",
              "text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10",
              sidebarCollapsed && "justify-center px-0",
            )}
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && (
              <span className="truncate min-w-0">{principalShort}</span>
            )}
          </button>
        )}

        {/* Collapse toggle */}
        <button
          type="button"
          data-ocid="sidebar-collapse"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm transition-smooth",
            "text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent",
            sidebarCollapsed && "justify-center px-0",
          )}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
