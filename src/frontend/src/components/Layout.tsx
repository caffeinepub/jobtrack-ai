import { Sidebar } from "@/components/Sidebar";
import { cn } from "@/lib/utils";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

const BOTTOM_NAV = [
  { to: "/", label: "Dashboard" },
  { to: "/applications", label: "Apps" },
  { to: "/kanban", label: "Pipeline" },
  { to: "/analytics", label: "Analytics" },
  { to: "/settings", label: "Settings" },
];

export function Layout() {
  const location = useLocation();

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div
        className="flex h-screen overflow-hidden"
        style={{ backgroundColor: "#000000" }}
      >
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
          className="md:hidden fixed bottom-0 inset-x-0 z-30 pb-safe"
          style={{
            backgroundColor: "#000000",
            borderTop: "1px solid rgba(240,240,250,0.15)",
          }}
        >
          <div className="flex items-center">
            {BOTTOM_NAV.map(({ to, label }) => {
              const isActive =
                to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  data-ocid={`mobile-nav-${label.toLowerCase()}`}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center py-3 nav-text tracking-nav transition-smooth",
                    isActive
                      ? "text-foreground"
                      : "text-foreground/50 hover:text-foreground/80",
                  )}
                  style={{ fontSize: "10px" }}
                >
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
          className: "font-body nav-text",
          duration: 4000,
          style: {
            backgroundColor: "#000000",
            border: "1px solid rgba(240,240,250,0.35)",
            color: "#f0f0fa",
          },
        }}
      />
    </ThemeProvider>
  );
}
