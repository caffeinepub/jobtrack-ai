import { Sidebar } from "@/components/Sidebar";
import { cn } from "@/lib/utils";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { BarChart3, Kanban, LayoutDashboard, Table2 } from "lucide-react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

const BOTTOM_NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/applications", label: "Apps", icon: Table2 },
  { to: "/kanban", label: "Pipeline", icon: Kanban },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Layout() {
  const location = useLocation();

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav
          data-ocid="mobile-nav"
          className="md:hidden fixed bottom-0 inset-x-0 bg-card border-t border-border z-30 pb-safe"
        >
          <div className="flex items-center">
            {BOTTOM_NAV.map(({ to, label, icon: Icon }) => {
              const isActive =
                to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-smooth",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          className: "font-body",
          duration: 4000,
        }}
        richColors
      />
    </ThemeProvider>
  );
}
