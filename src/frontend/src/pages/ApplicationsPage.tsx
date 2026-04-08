import { ApplicationsTable } from "@/components/ApplicationsTable";
import type { ParsedChip } from "@/components/ApplicationsTable";
import {
  useApplications,
  useDeleteApplication,
  useUpdateApplicationStatus,
} from "@/hooks/useApplications";
import { useAppStore } from "@/store/useAppStore";
import type { Application, ApplicationStatus } from "@/types";
import { Loader2, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";

const PAGE_SIZE = 20;

const BG_URL =
  "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=1920&q=80";

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
    if (q.includes(kw)) chips.push({ label: status, type: "status" });
  }
  if (q.includes("remote")) chips.push({ label: "Remote", type: "remote" });

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
    if (q.includes(city))
      chips.push({
        label: city.replace(/\b\w/g, (c) => c.toUpperCase()),
        type: "location",
      });
  }

  const remaining = query
    .replace(/\b(over|above|>)\s*\$?\d+k?\b/gi, "")
    .replace(
      /\b(remote|applied|interview|interviewing|offer|rejected|archived)\b/gi,
      "",
    )
    .trim();
  if (remaining) textParts.push(remaining.toLowerCase());

  return { chips, textParts };
}

function filterApplications(
  apps: Application[],
  query: string,
  statusFilter: ApplicationStatus | "all",
): Application[] {
  let result = apps;
  if (statusFilter !== "all")
    result = result.filter((a) => a.status === statusFilter);
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
    if (chips.length === 0 && textParts.length === 0)
      return searchable.includes(q);
    return true;
  });
}

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
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3"
      style={{
        background: "rgba(0,0,0,0.85)",
        border: "1px solid rgba(240,240,250,0.35)",
        borderRadius: "32px",
      }}
      data-ocid="bulk-action-bar"
    >
      <span className="nav-text opacity-70">{count} Selected</span>
      <div
        style={{ width: 1, height: 20, background: "rgba(240,240,250,0.2)" }}
      />
      <select
        onChange={(e) => onBulkStatus(e.target.value as ApplicationStatus)}
        className="ghost-button py-1 px-3 text-xs bg-transparent appearance-none cursor-pointer"
        defaultValue=""
        data-ocid="bulk-status-select"
        style={{ background: "rgba(240,240,250,0.08)" }}
      >
        <option value="" disabled>
          Set Status
        </option>
        {ALL_STATUSES.map((s) => (
          <option
            key={s}
            value={s}
            style={{ background: "#000", color: "#f0f0fa" }}
          >
            {s}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onBulkDelete}
        className="ghost-button py-1 px-3 text-xs"
        style={{
          borderColor: "rgba(192,57,43,0.5)",
          color: "rgba(240,240,250,0.8)",
        }}
        data-ocid="bulk-delete-btn"
      >
        Delete
      </button>
      <button
        type="button"
        onClick={onClear}
        className="ghost-button py-1 px-3 text-xs"
        aria-label="Clear selection"
        data-ocid="bulk-clear-btn"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

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
    if (checked) setSelectedIds(new Set(paginated.map((a) => a.id)));
    else setSelectedIds(new Set());
  };

  const handleBulkStatus = (status: ApplicationStatus) => {
    for (const id of selectedIds) statusMutation.mutate({ id, status });
    setSelectedIds(new Set());
  };

  const handleBulkDelete = () => {
    for (const id of selectedIds) deleteMutation.mutate(id);
    setSelectedIds(new Set());
  };

  return (
    <div
      className="full-bleed-section flex flex-col"
      style={{
        backgroundImage: `url('${BG_URL}')`,
        minHeight: "100vh",
        height: "auto",
      }}
    >
      {/* Dark overlay */}
      <div className="image-overlay" style={{ position: "fixed" }} />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col h-full"
        style={{ minHeight: "100vh" }}
      >
        {/* Hero header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex-shrink-0 px-8 pt-10 pb-6"
        >
          <div className="flex items-end justify-between gap-8 mb-8">
            <div>
              <h1
                className="display-text"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
                data-ocid="page-title"
              >
                Applications
              </h1>
              <p
                className="nav-text mt-2"
                style={{ opacity: 0.5, fontWeight: 400 }}
              >
                {isLoading
                  ? "Loading…"
                  : `${total} Total · ${filtered.length} Shown`}
              </p>
            </div>

            {/* Status filter — ghost text only, no pill backgrounds */}
            <div className="flex items-center gap-4 flex-wrap justify-end">
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
                  className="nav-text transition-smooth"
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    opacity: statusFilter === s ? 1 : 0.4,
                    borderBottom:
                      statusFilter === s
                        ? "1px solid rgba(240,240,250,0.8)"
                        : "1px solid transparent",
                    paddingBottom: "2px",
                  }}
                  data-ocid={`status-filter-${s.toLowerCase()}`}
                >
                  {s === "all" ? "All" : s}
                </button>
              ))}
            </div>
          </div>

          {/* Search — ghost style on photography */}
          <div className="relative" style={{ maxWidth: 640 }}>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-10">
              {isAiSearching ? (
                <Loader2
                  className="w-4 h-4 animate-spin"
                  style={{ color: "rgba(240,240,250,0.6)" }}
                />
              ) : (
                <Search
                  className="w-4 h-4"
                  style={{ color: "rgba(240,240,250,0.4)" }}
                />
              )}
            </div>
            <input
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder='Search: "remote offer over 130k" or company name…'
              className="w-full h-12 pl-11 pr-10 transition-smooth"
              style={{
                background: "rgba(240,240,250,0.07)",
                border: "1px solid rgba(240,240,250,0.25)",
                borderRadius: "32px",
                color: "#f0f0fa",
                fontSize: 13,
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 400,
                letterSpacing: "var(--tracking-nav)",
                textTransform: "uppercase",
                outline: "none",
              }}
              data-ocid="applications-search"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setPage(1);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-smooth"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(240,240,250,0.5)",
                  cursor: "pointer",
                }}
                aria-label="Clear search"
                data-ocid="search-clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter chips — plain text, no badge containers */}
          <AnimatePresence>
            {chips.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-4 flex-wrap mt-4"
              >
                <span
                  className="nav-text"
                  style={{ opacity: 0.4, fontSize: 10 }}
                >
                  Active Filters:
                </span>
                {chips.map((chip) => (
                  <span
                    key={`${chip.type}-${chip.label}`}
                    className="nav-text"
                    style={{
                      fontSize: 11,
                      opacity: 0.8,
                      borderBottom: "1px solid rgba(240,240,250,0.4)",
                      paddingBottom: 1,
                    }}
                  >
                    {chip.label}
                  </span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Table area — transparent, on photography */}
        <div className="flex-1 overflow-hidden px-4 pb-8">
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
