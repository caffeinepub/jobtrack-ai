import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useLocation } from "@tanstack/react-router";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard" },
  { to: "/applications", label: "Applications" },
  { to: "/kanban", label: "Pipeline" },
  { to: "/analytics", label: "Analytics" },
];

export function Sidebar() {
  const location = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();
  const { clear, identity } = useInternetIdentity();

  const principalShort = identity
    ? `${identity.getPrincipal().toString().slice(0, 8)}…`
    : "";

  return (
    <aside
      data-ocid="sidebar"
      className={cn(
        "hidden md:flex flex-col h-screen sticky top-0 transition-smooth shrink-0 z-20",
        sidebarCollapsed ? "w-14" : "w-52",
      )}
      style={{ backgroundColor: "#000000" }}
    >
      {/* Wordmark */}
      <div
        className={cn(
          "flex items-center h-16 px-5",
          sidebarCollapsed && "justify-center px-0",
        )}
        style={{ borderBottom: "1px solid rgba(240,240,250,0.08)" }}
      >
        {!sidebarCollapsed ? (
          <span
            className="nav-text tracking-nav whitespace-nowrap"
            style={{
              color: "#f0f0fa",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "1.17px",
            }}
          >
            JOBTRACK AI
          </span>
        ) : (
          <span
            style={{
              color: "#f0f0fa",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "1.17px",
            }}
          >
            JT
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0 mt-4">
        {NAV_ITEMS.map(({ to, label }) => {
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
                "flex items-center px-2 py-2.5 transition-smooth relative",
                sidebarCollapsed && "justify-center px-0",
              )}
              style={{
                fontSize: "13px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1.17px",
                color: isActive ? "#f0f0fa" : "rgba(240,240,250,0.45)",
              }}
            >
              {isActive && !sidebarCollapsed && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-4"
                  style={{ backgroundColor: "#f0f0fa" }}
                />
              )}
              {!sidebarCollapsed ? (
                <span className={cn(isActive && "pl-3")}>{label}</span>
              ) : (
                <span style={{ fontSize: "10px" }}>{label.slice(0, 2)}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div
        className="px-3 pb-6 space-y-1"
        style={{
          borderTop: "1px solid rgba(240,240,250,0.08)",
          paddingTop: "1rem",
        }}
      >
        {/* User + logout */}
        {identity && (
          <button
            type="button"
            data-ocid="logout-btn"
            onClick={() => clear()}
            className={cn(
              "flex items-center w-full px-2 py-2.5 transition-smooth",
              sidebarCollapsed && "justify-center px-0",
            )}
            style={{
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1.17px",
              color: "rgba(240,240,250,0.4)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
            aria-label="Log out"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color =
                "rgba(240,240,250,0.8)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color =
                "rgba(240,240,250,0.4)";
            }}
          >
            {!sidebarCollapsed ? (
              <span className="truncate min-w-0">
                {principalShort} · SIGN OUT
              </span>
            ) : (
              <span>→</span>
            )}
          </button>
        )}

        {/* Collapse toggle */}
        <button
          type="button"
          data-ocid="sidebar-collapse"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={cn(
            "flex items-center w-full px-2 py-2 transition-smooth",
            sidebarCollapsed && "justify-center px-0",
          )}
          style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1.17px",
            color: "rgba(240,240,250,0.25)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color =
              "rgba(240,240,250,0.6)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color =
              "rgba(240,240,250,0.25)";
          }}
        >
          {!sidebarCollapsed ? <span>← Collapse</span> : <span>→</span>}
        </button>
      </div>
    </aside>
  );
}
