import { ApplicationsTable } from "@/components/ApplicationsTable";
import type { ParsedChip } from "@/components/ApplicationsTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useApplications,
  useDeleteApplication,
  useUpdateApplicationStatus,
} from "@/hooks/useApplications";
import { useAppStore } from "@/store/useAppStore";
import type { Application, ApplicationStatus } from "@/types";
import { Loader2, Sparkles, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";

const PAGE_SIZE = 20;

// ── Natural language search parser ───────────────────────────────────────────

function parseSearchQuery(query: string): {
  chips: ParsedChip[];
  textParts: string[];
} {
  const chips: ParsedChip[] = [];
  const textParts: string[] = [];
  const q = query.toLowerCase();

  const statusMap: Record<string, ApplicationStatus> = {
    applied: "Applied",
    interview: "Interviewing",
    interviewing: "Interviewing",
    offer: "Offer",
    rejected: "Rejected",
    archived: "Archived",
  };
  for (const [kw, status] of Object.entries(statusMap)) {
    if (q.includes(kw)) {
      chips.push({ label: status, type: "status" });
    }
  }

  if (q.includes("remote")) {
    chips.push({ label: "Remote", type: "remote" });
  }

  const salaryMatch = q.match(/(?:over|above|>)\s*\$?(\d+)k?/);
  if (salaryMatch) {
    const raw = Number(salaryMatch[1]);
    const amount = raw < 1000 ? raw * 1000 : raw;
    chips.push({
      label: `Salary > $${(amount / 1000).toFixed(0)}k`,
      type: "salary",
    });
  }

  const cities = [
    "new york",
    "san francisco",
    "nyc",
    "chicago",
    "seattle",
    "austin",
  ];
  for (const city of cities) {
    if (q.includes(city)) {
      chips.push({
        label: city.replace(/\b\w/g, (c) => c.toUpperCase()),
        type: "location",
      });
    }
  }

  const remaining = query
    .replace(/\b(over|above|>)\s*\$?\d+k?\b/gi, "")
    .replace(
      /\b(remote|applied|interview|interviewing|offer|rejected|archived)\b/gi,
      "",
    )
    .trim();

  if (remaining) {
    textParts.push(remaining.toLowerCase());
  }

  return { chips, textParts };
}

function filterApplications(
  apps: Application[],
  query: string,
  statusFilter: ApplicationStatus | "all",
): Application[] {
  let result = apps;

  if (statusFilter !== "all") {
    result = result.filter((a) => a.status === statusFilter);
  }

  if (!query.trim()) return result;

  const q = query.toLowerCase();
  const { chips, textParts } = parseSearchQuery(query);

  return result.filter((app) => {
    for (const chip of chips) {
      if (chip.type === "status" && app.status !== chip.label) return false;
      if (chip.type === "remote" && !app.remote) return false;
      if (chip.type === "salary" && app.salary) {
        const match = app.salary.match(/\$?(\d+)/);
        if (match) {
          const salaryNum = Number(match[1]) * 1000;
          const threshMatch = q.match(/(?:over|above|>)\s*\$?(\d+)k?/);
          if (threshMatch) {
            const threshold = Number(threshMatch[1]) * 1000;
            if (salaryNum < threshold) return false;
          }
        }
      }
    }

    const searchable = [
      app.company,
      app.jobTitle,
      app.location,
      app.source,
      app.notes ?? "",
      ...app.tags,
    ]
      .join(" ")
      .toLowerCase();

    for (const part of textParts) {
      if (!searchable.includes(part)) return false;
    }

    if (chips.length === 0 && textParts.length === 0) {
      return searchable.includes(q);
    }

    return true;
  });
}

// ── Bulk action bar ────────────────────────────────────────────────────────────

const ALL_STATUSES: ApplicationStatus[] = [
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
  "Archived",
];

function BulkActionBar({
  count,
  onBulkStatus,
  onBulkDelete,
  onClear,
}: {
  count: number;
  onBulkStatus: (status: ApplicationStatus) => void;
  onBulkDelete: () => void;
  onClear: () => void;
}) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
      data-ocid="bulk-action-bar"
    >
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-border shadow-2xl">
        <span className="text-sm font-medium text-foreground">
          {count} selected
        </span>
        <div className="w-px h-5 bg-border" />
        <Select onValueChange={(v) => onBulkStatus(v as ApplicationStatus)}>
          <SelectTrigger
            className="h-8 w-32 text-xs"
            data-ocid="bulk-status-select"
          >
            <SelectValue placeholder="Set Status" />
          </SelectTrigger>
          <SelectContent>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="text-xs">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="destructive"
          size="sm"
          className="h-8 gap-1.5"
          onClick={onBulkDelete}
          data-ocid="bulk-delete-btn"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClear}
          aria-label="Clear selection"
          data-ocid="bulk-clear-btn"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function ApplicationsPage() {
  const { data, isLoading } = useApplications();
  const statusMutation = useUpdateApplicationStatus();
  const deleteMutation = useDeleteApplication();

  const { searchQuery, setSearchQuery } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">(
    "all",
  );
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAiSearching, setIsAiSearching] = useState(false);

  const allApps = data?.applications ?? [];
  const total = data?.total ?? 0;

  const filtered = useMemo(
    () => filterApplications(allApps, searchQuery, statusFilter),
    [allApps, searchQuery, statusFilter],
  );

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const { chips } = useMemo(() => parseSearchQuery(searchQuery), [searchQuery]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      setPage(1);
      if (value.length > 3) {
        setIsAiSearching(true);
        setTimeout(() => setIsAiSearching(false), 600);
      }
    },
    [setSearchQuery],
  );

  const handleSelectId = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginated.map((a) => a.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleBulkStatus = (status: ApplicationStatus) => {
    for (const id of selectedIds) {
      statusMutation.mutate({ id, status });
    }
    setSelectedIds(new Set());
  };

  const handleBulkDelete = () => {
    for (const id of selectedIds) {
      deleteMutation.mutate(id);
    }
    setSelectedIds(new Set());
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page header */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-border bg-card">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Applications
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isLoading
                ? "Loading…"
                : `${total} total · ${filtered.length} shown`}
            </p>
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {(
              ["all", "Applied", "Interviewing", "Offer", "Rejected"] as const
            ).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-smooth ${
                  statusFilter === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                data-ocid={`status-filter-${s.toLowerCase()}`}
              >
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>
        </div>

        {/* AI Search bar */}
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
            {isAiSearching ? (
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-primary/60" />
            )}
          </div>
          <Input
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder='Try: "remote jobs over 130k in interview stage" or a company name...'
            className="pl-9 pr-10 h-11 bg-background border-input text-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary/40"
            data-ocid="applications-search"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
              data-ocid="search-clear"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table area */}
      <div className="flex-1 overflow-hidden p-6">
        <ApplicationsTable
          applications={paginated}
          isLoading={isLoading}
          searchChips={chips}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          selectedIds={selectedIds}
          onSelectId={handleSelectId}
          onSelectAll={handleSelectAll}
        />
      </div>

      {/* Bulk action bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <BulkActionBar
            count={selectedIds.size}
            onBulkStatus={handleBulkStatus}
            onBulkDelete={handleBulkDelete}
            onClear={() => setSelectedIds(new Set())}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
