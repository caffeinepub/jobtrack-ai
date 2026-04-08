import { Layout } from "@/components/Layout";
import { LoginPage } from "@/components/LoginPage";
import { Skeleton } from "@/components/ui/skeleton";
import { BackendProvider, useBackendReady } from "@/contexts/BackendContext";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

// ── Lazy page imports ─────────────────────────────────────────────────────────
import { Suspense, lazy } from "react";

const DashboardPage = lazy(() =>
  import("@/pages/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const ApplicationsPage = lazy(() =>
  import("@/pages/ApplicationsPage").then((m) => ({
    default: m.ApplicationsPage,
  })),
);
const KanbanPage = lazy(() =>
  import("@/pages/KanbanPage").then((m) => ({ default: m.KanbanPage })),
);
const AnalyticsPage = lazy(() =>
  import("@/pages/AnalyticsPage").then((m) => ({ default: m.AnalyticsPage })),
);
const SettingsPage = lazy(() =>
  import("@/pages/SettingsPage").then((m) => ({ default: m.SettingsPage })),
);

// ── Auth guard wrapper ────────────────────────────────────────────────────────
// Gates on BOTH identity readiness (Internet Identity) AND actor readiness
// (backend canister connection). Both must be confirmed before rendering
// interactive UI — this closes the window where users could click buttons
// before the backend actor was initialized.
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loginStatus, identity } = useInternetIdentity();
  const isBackendReady = useBackendReady();

  // Phase 1: Internet Identity is still initializing
  if (loginStatus === "initializing") {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="space-y-3 w-64">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  // Phase 2: Not logged in — show login page
  if (!identity) {
    return <LoginPage />;
  }

  // Phase 3: Logged in but backend actor not yet initialized
  // Show minimal loading state rather than interactive UI with broken buttons
  if (!isBackendReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="space-y-3 w-64">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// ── Page suspense wrapper ─────────────────────────────────────────────────────
function PageSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="p-8 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="grid grid-cols-3 gap-4 mt-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

// ── Routes ────────────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: () => (
    <AuthGuard>
      <Layout />
    </AuthGuard>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <PageSuspense>
      <DashboardPage />
    </PageSuspense>
  ),
});

const applicationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/applications",
  component: () => (
    <PageSuspense>
      <ApplicationsPage />
    </PageSuspense>
  ),
});

const kanbanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/kanban",
  component: () => (
    <PageSuspense>
      <KanbanPage />
    </PageSuspense>
  ),
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/analytics",
  component: () => (
    <PageSuspense>
      <AnalyticsPage />
    </PageSuspense>
  ),
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: () => (
    <PageSuspense>
      <SettingsPage />
    </PageSuspense>
  ),
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  applicationsRoute,
  kanbanRoute,
  analyticsRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ── AppWithBackend ─────────────────────────────────────────────────────────────
// BackendProvider must be inside InternetIdentityProvider (which is in main.tsx)
// so useActor() can access the identity context. It wraps the router so
// AuthGuard (which uses useBackendReady) has access to the context.
function AppWithBackend() {
  return (
    <BackendProvider>
      <RouterProvider router={router} />
    </BackendProvider>
  );
}

export default AppWithBackend;
