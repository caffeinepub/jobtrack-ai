import { ApplicationDetailDrawer } from "@/components/ApplicationDetailDrawer";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteApplication,
  useUpdateApplicationStatus,
} from "@/hooks/useApplications";
import { cn, daysSince, formatDate } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import type { Application, ApplicationStatus } from "@/types";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Eye,
  Layers,
  Settings2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type SortKey =
  | "company"
  | "jobTitle"
  | "status"
  | "fitScore"
  | "appliedAt"
  | "salary"
  | "location"
  | "source";
type SortDir = "asc" | "desc";

interface SortState {
  key: SortKey;
  dir: SortDir;
}

interface Props {
  applications: Application[];
  isLoading: boolean;
  searchChips?: ParsedChip[];
  onEditApplication?: (app: Application) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedIds: Set<string>;
  onSelectId: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
}

export interface ParsedChip {
  label: string;
  type: "status" | "salary" | "location" | "remote" | "keyword";
}

const ALL_STATUSES: ApplicationStatus[] = [
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
  "Archived",
];

const TOGGLE_COLUMNS: { key: SortKey; label: string }[] = [
  { key: "company", label: "Company" },
  { key: "jobTitle", label: "Position" },
  { key: "status", label: "Status" },
  { key: "fitScore", label: "Fit Score" },
  { key: "appliedAt", label: "Date Applied" },
  { key: "salary", label: "Salary" },
  { key: "location", label: "Location" },
  { key: "source", label: "Source" },
];

function sortApplications(apps: Application[], sort: SortState): Application[] {
  return [...apps].sort((a, b) => {
    let va: string | number = "";
    let vb: string | number = "";
    switch (sort.key) {
      case "company":
        va = a.company.toLowerCase();
        vb = b.company.toLowerCase();
        break;
      case "jobTitle":
        va = a.jobTitle.toLowerCase();
        vb = b.jobTitle.toLowerCase();
        break;
      case "status":
        va = a.status;
        vb = b.status;
        break;
      case "fitScore":
        va = a.fitScore ?? -1;
        vb = b.fitScore ?? -1;
        break;
      case "appliedAt":
        va = new Date(a.appliedAt).getTime();
        vb = new Date(b.appliedAt).getTime();
        break;
      case "location":
        va = a.location.toLowerCase();
        vb = b.location.toLowerCase();
        break;
      case "source":
        va = a.source.toLowerCase();
        vb = b.source.toLowerCase();
        break;
    }
    if (va < vb) return sort.dir === "asc" ? -1 : 1;
    if (va > vb) return sort.dir === "asc" ? 1 : -1;
    return 0;
  });
}

// Ghost status text — no color coding, just uppercase text with opacity
function StatusText({ status }: { status: ApplicationStatus }) {
  const opacity =
    status === "Rejected" ? 0.35 : status === "Archived" ? 0.3 : 0.75;
  return (
    <span
      className="nav-text"
      style={{ fontSize: 11, opacity, color: "#f0f0fa" }}
    >
      {status}
    </span>
  );
}

function FitScoreText({ score }: { score: number }) {
  return (
    <span
      className="nav-text"
      style={{
        fontSize: 13,
        fontWeight: 700,
        color: "#f0f0fa",
        opacity: score >= 85 ? 1 : score >= 70 ? 0.7 : 0.45,
      }}
    >
      {score}
    </span>
  );
}

function InlineStatusDropdown({
  appId,
  current,
}: { appId: string; current: ApplicationStatus }) {
  const [open, setOpen] = useState(false);
  const statusMutation = useUpdateApplicationStatus();
  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex items-center gap-1.5 transition-smooth"
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
        data-ocid="inline-status-trigger"
        aria-label="Change status"
      >
        <StatusText status={current} />
        <ChevronDown
          className="w-3 h-3"
          style={{ color: "rgba(240,240,250,0.3)", flexShrink: 0 }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 z-50"
            style={{
              background: "rgba(0,0,0,0.9)",
              border: "1px solid rgba(240,240,250,0.2)",
              borderRadius: 8,
              minWidth: 140,
              backdropFilter: "blur(12px)",
            }}
          >
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  statusMutation.mutate({ id: appId, status: s });
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 transition-smooth nav-text"
                style={{
                  background:
                    s === current ? "rgba(240,240,250,0.08)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 11,
                  color: "#f0f0fa",
                  opacity: s === current ? 1 : 0.6,
                }}
                data-ocid={`status-option-${s.toLowerCase()}`}
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ColumnVisibilityPopover() {
  const { columnVisibility, toggleColumn } = useAppStore();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="ghost-button p-2 h-8 w-8"
          style={{
            borderRadius: "50%",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Toggle column visibility"
          data-ocid="column-visibility-trigger"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-48 p-2"
        style={{
          background: "rgba(0,0,0,0.92)",
          border: "1px solid rgba(240,240,250,0.2)",
          backdropFilter: "blur(16px)",
        }}
        data-ocid="column-visibility-popover"
      >
        <p
          className="nav-text px-2 pb-2"
          style={{ fontSize: 10, opacity: 0.5 }}
        >
          Columns
        </p>
        {TOGGLE_COLUMNS.map(({ key, label }) => (
          <label
            key={key}
            htmlFor={`col-${key}`}
            className="flex items-center gap-2.5 px-2 py-1.5 cursor-pointer transition-smooth"
            style={{ borderRadius: 6 }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(240,240,250,0.05)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <Checkbox
              id={`col-${key}`}
              checked={columnVisibility[key] !== false}
              onCheckedChange={() => toggleColumn(key)}
              data-ocid={`column-toggle-${key}`}
            />
            <span
              className="nav-text"
              style={{ fontSize: 11, flex: 1, opacity: 0.8 }}
            >
              {label}
            </span>
          </label>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-8 text-center"
      data-ocid="empty-state"
    >
      <Layers
        className="w-12 h-12 mb-6"
        style={{ color: "rgba(240,240,250,0.2)" }}
      />
      <h3
        className="display-text mb-3"
        style={{ fontSize: "1.5rem", opacity: 0.8 }}
      >
        {hasSearch ? "No Matching Applications" : "No Applications Yet"}
      </h3>
      <p
        className="nav-text"
        style={{
          opacity: 0.4,
          fontWeight: 400,
          maxWidth: 320,
          lineHeight: 1.7,
          textTransform: "uppercase",
        }}
      >
        {hasSearch
          ? "Try adjusting your search query or clearing filters."
          : "Add your first job application to start tracking your search."}
      </p>
    </motion.div>
  );
}

function SortIndicator({ colKey, sort }: { colKey: SortKey; sort: SortState }) {
  if (sort.key !== colKey)
    return <ArrowUpDown className="w-3 h-3" style={{ opacity: 0.25 }} />;
  return sort.dir === "asc" ? (
    <ChevronUp className="w-3.5 h-3.5" style={{ color: "#f0f0fa" }} />
  ) : (
    <ChevronDown className="w-3.5 h-3.5" style={{ color: "#f0f0fa" }} />
  );
}

function SortableTh({
  colKey,
  label,
  sort,
  onSort,
}: {
  colKey: SortKey;
  label: string;
  sort: SortState;
  onSort: (k: SortKey) => void;
}) {
  return (
    <th
      scope="col"
      className="text-left px-3 py-3 cursor-pointer select-none whitespace-nowrap"
      style={{ background: "transparent" }}
      onClick={() => onSort(colKey)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSort(colKey);
      }}
      aria-sort={
        sort.key === colKey
          ? sort.dir === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
    >
      <div
        className="flex items-center gap-1.5 nav-text"
        style={{ fontSize: 11 }}
      >
        {label}
        <SortIndicator colKey={colKey} sort={sort} />
      </div>
    </th>
  );
}

// Row divider style
const ROW_BORDER = "1px solid rgba(240,240,250,0.08)";

export function ApplicationsTable({
  applications,
  isLoading,
  page,
  totalPages,
  onPageChange,
  selectedIds,
  onSelectId,
  onSelectAll,
  onEditApplication,
}: Props) {
  const { columnVisibility, setSelectedApplication } = useAppStore();
  const deleteMutation = useDeleteApplication();

  const [sort, setSort] = useState<SortState>({
    key: "appliedAt",
    dir: "desc",
  });
  const [drawerApp, setDrawerApp] = useState<Application | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hoverRowId, setHoverRowId] = useState<string | null>(null);

  const sortedApps = sortApplications(applications, sort);
  const allSelected =
    applications.length > 0 && applications.every((a) => selectedIds.has(a.id));

  const handleSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  };

  const openDrawer = (app: Application) => {
    setDrawerApp(app);
    setSelectedApplication(app);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedApplication(null);
  };

  const isVisible = (col: string) => columnVisibility[col] !== false;

  return (
    <div className="flex flex-col h-full">
      {/* Table wrapper — transparent, no border/card */}
      <div
        className="flex-1 overflow-auto"
        style={{ background: "transparent" }}
      >
        <table
          className="w-full text-sm"
          style={{ borderCollapse: "collapse", background: "transparent" }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1px solid rgba(240,240,250,0.15)",
                background: "rgba(0,0,0,0.35)",
                backdropFilter: "blur(4px)",
                position: "sticky",
                top: 0,
                zIndex: 10,
              }}
            >
              <th
                className="w-10 pl-4 pr-2 py-3"
                style={{ background: "transparent" }}
              >
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => onSelectAll(!!checked)}
                  aria-label="Select all"
                  data-ocid="select-all-checkbox"
                />
              </th>

              <SortableTh
                colKey="company"
                label="Company"
                sort={sort}
                onSort={handleSort}
              />
              {isVisible("jobTitle") && (
                <SortableTh
                  colKey="jobTitle"
                  label="Position"
                  sort={sort}
                  onSort={handleSort}
                />
              )}
              {isVisible("status") && (
                <SortableTh
                  colKey="status"
                  label="Status"
                  sort={sort}
                  onSort={handleSort}
                />
              )}
              {isVisible("fitScore") && (
                <SortableTh
                  colKey="fitScore"
                  label="Fit"
                  sort={sort}
                  onSort={handleSort}
                />
              )}
              {isVisible("appliedAt") && (
                <SortableTh
                  colKey="appliedAt"
                  label="Applied"
                  sort={sort}
                  onSort={handleSort}
                />
              )}
              {isVisible("salary") && (
                <th
                  className="text-left px-3 py-3 nav-text whitespace-nowrap"
                  style={{ fontSize: 11, background: "transparent" }}
                >
                  Salary
                </th>
              )}
              {isVisible("location") && (
                <SortableTh
                  colKey="location"
                  label="Location"
                  sort={sort}
                  onSort={handleSort}
                />
              )}
              {isVisible("source") && (
                <SortableTh
                  colKey="source"
                  label="Source"
                  sort={sort}
                  onSort={handleSort}
                />
              )}

              <th
                className="text-right px-4 py-3"
                style={{ background: "transparent" }}
              >
                <div className="flex items-center justify-end">
                  <ColumnVisibilityPopover />
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows
                <tr key={i} style={{ borderBottom: ROW_BORDER }}>
                  <td className="pl-4 pr-2 py-4">
                    <Skeleton className="h-4 w-4 rounded" />
                  </td>
                  <td className="px-3 py-4">
                    <Skeleton
                      className="h-4 w-24"
                      style={{ background: "rgba(240,240,250,0.08)" }}
                    />
                  </td>
                  <td className="px-3 py-4">
                    <Skeleton
                      className="h-4 w-36"
                      style={{ background: "rgba(240,240,250,0.08)" }}
                    />
                  </td>
                  <td className="px-3 py-4">
                    <Skeleton
                      className="h-4 w-20"
                      style={{ background: "rgba(240,240,250,0.08)" }}
                    />
                  </td>
                  <td className="px-3 py-4">
                    <Skeleton
                      className="h-4 w-10"
                      style={{ background: "rgba(240,240,250,0.08)" }}
                    />
                  </td>
                  <td className="px-3 py-4">
                    <Skeleton
                      className="h-4 w-24"
                      style={{ background: "rgba(240,240,250,0.08)" }}
                    />
                  </td>
                  <td className="px-3 py-4">
                    <Skeleton
                      className="h-4 w-20"
                      style={{ background: "rgba(240,240,250,0.08)" }}
                    />
                  </td>
                  <td className="px-3 py-4">
                    <Skeleton
                      className="h-4 w-16"
                      style={{ background: "rgba(240,240,250,0.08)" }}
                    />
                  </td>
                  <td className="px-4 py-4" />
                </tr>
              ))
            ) : sortedApps.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ background: "transparent" }}>
                  <EmptyState hasSearch={false} />
                </td>
              </tr>
            ) : (
              <AnimatePresence initial={false}>
                {sortedApps.map((app, index) => {
                  const isSelected = selectedIds.has(app.id);
                  const isHighPotential = (app.fitScore ?? 0) >= 85;
                  const isHovered = hoverRowId === app.id;
                  const stalledDays = daysSince(app.updatedAt);
                  const isStalled =
                    stalledDays > 7 &&
                    (app.status === "Applied" || app.status === "Interviewing");

                  return (
                    <motion.tr
                      key={app.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: Math.min(index * 0.04, 0.2) }}
                      style={{
                        borderBottom: ROW_BORDER,
                        cursor: "pointer",
                        background: isSelected
                          ? "rgba(240,240,250,0.06)"
                          : isHovered
                            ? "rgba(240,240,250,0.04)"
                            : "transparent",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={() => setHoverRowId(app.id)}
                      onMouseLeave={() => setHoverRowId(null)}
                      onClick={() => openDrawer(app)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") openDrawer(app);
                      }}
                      tabIndex={0}
                      aria-selected={isSelected}
                      data-ocid={`table-row-${app.id}`}
                    >
                      {/* Checkbox */}
                      <td
                        className="pl-4 pr-2 py-3.5"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            onSelectId(app.id, !!checked)
                          }
                          aria-label={`Select ${app.company}`}
                          data-ocid={`row-checkbox-${app.id}`}
                        />
                      </td>

                      {/* Company */}
                      <td className="px-3 py-3.5">
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="nav-text truncate"
                              style={{
                                fontWeight: 700,
                                fontSize: 13,
                                color: "#f0f0fa",
                              }}
                            >
                              {app.company}
                            </span>
                            {isHighPotential && (
                              <span
                                className="nav-text flex items-center gap-0.5"
                                style={{
                                  fontSize: 9,
                                  opacity: 0.7,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <Sparkles className="w-2.5 h-2.5" />
                                High Fit
                              </span>
                            )}
                          </div>
                          {isStalled && (
                            <span
                              className="nav-text"
                              style={{
                                fontSize: 9,
                                opacity: 0.45,
                                color: "#f0f0fa",
                              }}
                            >
                              Stalled {stalledDays}d
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Position */}
                      {isVisible("jobTitle") && (
                        <td className="px-3 py-3.5">
                          <span
                            className="nav-text truncate block"
                            style={{
                              fontWeight: 400,
                              fontSize: 12,
                              opacity: 0.75,
                              maxWidth: 200,
                            }}
                          >
                            {app.jobTitle}
                          </span>
                        </td>
                      )}

                      {/* Status */}
                      {isVisible("status") && (
                        <td
                          className="px-3 py-3.5"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          <InlineStatusDropdown
                            appId={app.id}
                            current={app.status}
                          />
                        </td>
                      )}

                      {/* Fit Score */}
                      {isVisible("fitScore") && (
                        <td className="px-3 py-3.5">
                          {app.fitScore !== undefined ? (
                            <FitScoreText score={app.fitScore} />
                          ) : (
                            <span
                              className="nav-text"
                              style={{ opacity: 0.2, fontSize: 11 }}
                            >
                              —
                            </span>
                          )}
                        </td>
                      )}

                      {/* Date Applied */}
                      {isVisible("appliedAt") && (
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          <span
                            className="nav-text"
                            style={{
                              fontWeight: 400,
                              fontSize: 11,
                              opacity: 0.55,
                            }}
                          >
                            {formatDate(app.appliedAt)}
                          </span>
                        </td>
                      )}

                      {/* Salary */}
                      {isVisible("salary") && (
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          <span
                            className="nav-text"
                            style={{
                              fontWeight: 400,
                              fontSize: 11,
                              opacity: 0.55,
                            }}
                          >
                            {app.salary || "—"}
                          </span>
                        </td>
                      )}

                      {/* Location */}
                      {isVisible("location") && (
                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="nav-text truncate"
                              style={{
                                fontWeight: 400,
                                fontSize: 11,
                                opacity: 0.55,
                                maxWidth: 130,
                              }}
                            >
                              {app.location}
                            </span>
                            {app.remote && (
                              <span
                                className="nav-text"
                                style={{
                                  fontSize: 9,
                                  opacity: 0.6,
                                  border: "1px solid rgba(240,240,250,0.25)",
                                  borderRadius: 32,
                                  padding: "1px 6px",
                                }}
                              >
                                Remote
                              </span>
                            )}
                          </div>
                        </td>
                      )}

                      {/* Source */}
                      {isVisible("source") && (
                        <td className="px-3 py-3.5 whitespace-nowrap">
                          <span
                            className="nav-text"
                            style={{
                              fontWeight: 400,
                              fontSize: 11,
                              opacity: 0.45,
                            }}
                          >
                            {app.source}
                          </span>
                        </td>
                      )}

                      {/* Row Actions */}
                      <td
                        className="px-4 py-3.5"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <div
                          className={cn(
                            "flex items-center gap-1 justify-end transition-smooth",
                            isHovered ? "opacity-100" : "opacity-0",
                          )}
                        >
                          <button
                            type="button"
                            className="ghost-button p-1.5 h-7 w-7"
                            style={{
                              borderRadius: "50%",
                              padding: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            onClick={() => openDrawer(app)}
                            aria-label="View details"
                            data-ocid={`view-btn-${app.id}`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            className="ghost-button p-1.5 h-7 w-7"
                            style={{
                              borderRadius: "50%",
                              padding: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderColor: "rgba(192,57,43,0.4)",
                            }}
                            onClick={() => deleteMutation.mutate(app.id)}
                            aria-label="Delete application"
                            data-ocid={`delete-btn-${app.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-between pt-4 px-2"
          style={{ borderTop: "1px solid rgba(240,240,250,0.08)" }}
        >
          <span
            className="nav-text"
            style={{ opacity: 0.4, fontSize: 11, fontWeight: 400 }}
          >
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="ghost-button"
              style={{
                padding: "6px 16px",
                fontSize: 11,
                opacity: page <= 1 ? 0.3 : 1,
              }}
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              data-ocid="pagination-prev"
            >
              Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  type="button"
                  className="ghost-button"
                  style={{
                    padding: "6px 10px",
                    fontSize: 11,
                    background:
                      p === page
                        ? "rgba(240,240,250,0.15)"
                        : "rgba(240,240,250,0.07)",
                    borderColor:
                      p === page
                        ? "rgba(240,240,250,0.6)"
                        : "rgba(240,240,250,0.2)",
                    minWidth: 32,
                  }}
                  onClick={() => onPageChange(p)}
                  data-ocid={`pagination-page-${p}`}
                >
                  {p}
                </button>
              );
            })}
            <button
              type="button"
              className="ghost-button"
              style={{
                padding: "6px 16px",
                fontSize: 11,
                opacity: page >= totalPages ? 0.3 : 1,
              }}
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              data-ocid="pagination-next"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      <ApplicationDetailDrawer
        application={drawerApp}
        open={drawerOpen}
        onClose={closeDrawer}
        onEdit={onEditApplication}
      />
    </div>
  );
}
