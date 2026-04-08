import type { Application } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SelectedView = "table" | "kanban";

interface AppStore {
  // View
  selectedView: SelectedView;
  setSelectedView: (view: SelectedView) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Column visibility for table view
  columnVisibility: Record<string, boolean>;
  setColumnVisibility: (cols: Record<string, boolean>) => void;
  toggleColumn: (col: string) => void;

  // Selected application (detail panel / edit)
  selectedApplication: Application | null;
  setSelectedApplication: (app: Application | null) => void;

  // Sidebar collapse
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Grok API Key
  grokApiKey: string;
  setGrokApiKey: (key: string) => void;
  clearGrokApiKey: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      selectedView: "table",
      setSelectedView: (view) => set({ selectedView: view }),

      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),

      columnVisibility: {
        company: true,
        jobTitle: true,
        location: true,
        status: true,
        source: true,
        salary: true,
        appliedAt: true,
        fitScore: true,
        actions: true,
      },
      setColumnVisibility: (cols) => set({ columnVisibility: cols }),
      toggleColumn: (col) =>
        set({
          columnVisibility: {
            ...get().columnVisibility,
            [col]: !get().columnVisibility[col],
          },
        }),

      selectedApplication: null,
      setSelectedApplication: (app) => set({ selectedApplication: app }),

      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      grokApiKey: "",
      setGrokApiKey: (key) => set({ grokApiKey: key }),
      clearGrokApiKey: () => set({ grokApiKey: "" }),
    }),
    {
      name: "jobtrack-app-store",
      partialize: (state) => ({
        selectedView: state.selectedView,
        columnVisibility: state.columnVisibility,
        sidebarCollapsed: state.sidebarCollapsed,
        grokApiKey: state.grokApiKey,
      }),
    },
  ),
);
