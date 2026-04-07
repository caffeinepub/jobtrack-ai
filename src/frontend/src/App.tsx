import { Layout } from "@/components/Layout";
import { LoginPage } from "@/components/LoginPage";
import { Skeleton } from "@/components/ui/skeleton";
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

// ── Auth guard wrapper ────────────────────────────────────────────────────────
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loginStatus, identity } = useInternetIdentity();

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

  if (!identity) {
    return <LoginPage />;
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

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  applicationsRoute,
  kanbanRoute,
  analyticsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
