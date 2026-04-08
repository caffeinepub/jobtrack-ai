import { Layout } from "@/components/Layout";
import { LoginPage } from "@/components/LoginPage";
import { BackendProvider } from "@/contexts/BackendContext";
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

// ── Auth guard — only gates on identity, NEVER on backend readiness ───────────
// The backend actor initializes asynchronously in the background.
// Pages render immediately; mutations check actorRef at call time.
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loginStatus, identity } = useInternetIdentity();

  // Identity is still initializing — show nothing (avoids flash of login page)
  if (loginStatus === "initializing") {
    return null;
  }

  // Not logged in — show login page
  if (!identity) {
    return <LoginPage />;
  }

  return <>{children}</>;
}

// ── Page suspense wrapper ─────────────────────────────────────────────────────
function PageSuspense({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
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
// so useActor() can access the identity context.
function AppWithBackend() {
  return (
    <BackendProvider>
      <RouterProvider router={router} />
    </BackendProvider>
  );
}

export default AppWithBackend;
