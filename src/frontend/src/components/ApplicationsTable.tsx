import { ApplicationDetailDrawer } from "@/components/ApplicationDetailDrawer";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
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
  Edit3,
  Eye,
  Layers,
  MoreHorizontal,
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

function FitScorePill({ score }: { score: number }) {
  const color =
    score >= 85
      ? "text-[oklch(var(--chart-3))] bg-[oklch(var(--chart-3)/0.1)] border-[oklch(var(--chart-3)/0.25)]"
      : score >= 70
        ? "text-[oklch(var(--chart-2))] bg-[oklch(var(--chart-2)/0.1)] border-[oklch(var(--chart-2)/0.25)]"
        : "text-[oklch(var(--chart-5))] bg-[oklch(var(--chart-5)/0.1)] border-[oklch(var(--chart-5)/0.25)]";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border",
        color,
      )}
    >
      {score}
    </span>
  );
}

function InlineStatusDropdown({
  appId,
  current,
}: {
  appId: string;
  current: ApplicationStatus;
}) {
  const [open, setOpen] = useState(false);
  const statusMutation = useUpdateApplicationStatus();

  return (
    <Select
      open={open}
      onOpenChange={setOpen}
      value={current}
      onValueChange={(val) => {
        statusMutation.mutate({ id: appId, status: val as ApplicationStatus });
        setOpen(false);
      }}
    >
      <SelectTrigger
        className="border-0 bg-transparent p-0 h-auto shadow-none focus:ring-0 hover:bg-transparent w-auto gap-1.5"
        data-ocid="inline-status-trigger"
        aria-label="Change status"
      >
        <StatusBadge status={current} />
        <ChevronDown className="w-3 h-3 text-muted-foreground opacity-60" />
      </SelectTrigger>
      <SelectContent align="start" className="min-w-[140px]">
        {ALL_STATUSES.map((s) => (
          <SelectItem
            key={s}
            value={s}
            data-ocid={`status-option-${s.toLowerCase()}`}
          >
            <StatusBadge status={s} size="sm" />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ColumnVisibilityPopover() {
  const { columnVisibility, toggleColumn } = useAppStore();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="Toggle column visibility"
          data-ocid="column-visibility-trigger"
        >
          <Settings2 className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-48 p-2"
        data-ocid="column-visibility-popover"
      >
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 pb-2">
          Columns
        </p>
        {TOGGLE_COLUMNS.map(({ key, label }) => (
          <label
            key={key}
            htmlFor={`col-${key}`}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-muted/60 cursor-pointer"
          >
            <Checkbox
              id={`col-${key}`}
              checked={columnVisibility[key] !== false}
              onCheckedChange={() => toggleColumn(key)}
              data-ocid={`column-toggle-${key}`}
            />
            <span className="text-sm flex-1">{label}</span>
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
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Layers className="w-8 h-8 text-primary/60" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {hasSearch ? "No matching applications" : "No applications yet"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
        {hasSearch
          ? "Try adjusting your search query or clearing some filters to see more results."
          : "Add your first job application to start tracking your job search journey."}
      </p>
    </motion.div>
  );
}

function SortIndicator({ colKey, sort }: { colKey: SortKey; sort: SortState }) {
  if (sort.key !== colKey) {
    return <ArrowUpDown className="w-3 h-3 opacity-30" />;
  }
  return sort.dir === "asc" ? (
    <ChevronUp className="w-3.5 h-3.5 text-primary" />
  ) : (
    <ChevronDown className="w-3.5 h-3.5 text-primary" />
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
      className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer select-none whitespace-nowrap"
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
      <div className="flex items-center gap-1.5">
        {label}
        <SortIndicator colKey={colKey} sort={sort} />
      </div>
    </th>
  );
}

export function ApplicationsTable({
  applications,
  isLoading,
  searchChips = [],
  onEditApplication,
  page,
  totalPages,
  onPageChange,
  selectedIds,
  onSelectId,
  onSelectAll,
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
      {/* Search chips */}
      <AnimatePresence>
        {searchChips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 flex-wrap px-4 pb-3"
          >
            <span className="text-xs text-muted-foreground">Filters:</span>
            {searchChips.map((chip) => (
              <Badge
                key={`${chip.type}-${chip.label}`}
                variant="secondary"
                className="text-xs gap-1 bg-primary/10 text-primary border border-primary/20 rounded-full"
              >
                {chip.label}
              </Badge>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table wrapper */}
      <div className="flex-1 overflow-auto rounded-xl border border-border">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-muted/40 border-b border-border sticky top-0 z-10">
              <th className="w-10 pl-4 pr-2 py-3">
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
                  label="Fit Score"
                  sort={sort}
                  onSort={handleSort}
                />
              )}

              {isVisible("appliedAt") && (
                <SortableTh
                  colKey="appliedAt"
                  label="Date Applied"
                  sort={sort}
                  onSort={handleSort}
                />
              )}

              {isVisible("salary") && (
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
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

              <th className="text-right px-4 py-3">
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
                <tr key={i} className="border-b border-border/50">
                  <td className="pl-4 pr-2 py-4">
                    <Skeleton className="h-4 w-4 rounded" />
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <Skeleton className="h-4 w-36" />
                  </td>
                  <td className="px-3 py-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </td>
                  <td className="px-3 py-4">
                    <Skeleton className="h-6 w-10 rounded-full" />
                  </td>
                  <td className="px-3 py-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-3 py-4">
                    <Skeleton className="h-4 w-28" />
                  </td>
                  <td className="px-3 py-4">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-3 py-4">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-4 py-4" />
                </tr>
              ))
            ) : sortedApps.length === 0 ? (
              <tr>
                <td colSpan={10}>
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
                      className={cn(
                        "border-b border-border/50 cursor-pointer transition-colors duration-150",
                        isSelected
                          ? "bg-primary/5"
                          : isHovered
                            ? "bg-muted/50"
                            : "bg-transparent",
                      )}
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
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary"
                            aria-hidden="true"
                          >
                            {app.company.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-medium text-foreground truncate">
                                {app.company}
                              </span>
                              {isHighPotential && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-[oklch(var(--accent)/0.15)] text-[oklch(var(--accent))] border border-[oklch(var(--accent)/0.3)] whitespace-nowrap">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  High Potential
                                </span>
                              )}
                            </div>
                            {isStalled && (
                              <span className="text-[10px] text-[oklch(var(--accent))] font-medium">
                                Stalled {stalledDays}d
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Position */}
                      {isVisible("jobTitle") && (
                        <td className="px-3 py-3.5">
                          <span className="text-foreground/90 truncate max-w-[180px] block">
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
                            <FitScorePill score={app.fitScore} />
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              —
                            </span>
                          )}
                        </td>
                      )}

                      {/* Date Applied */}
                      {isVisible("appliedAt") && (
                        <td className="px-3 py-3.5 text-muted-foreground whitespace-nowrap">
                          {formatDate(app.appliedAt)}
                        </td>
                      )}

                      {/* Salary */}
                      {isVisible("salary") && (
                        <td className="px-3 py-3.5 text-muted-foreground whitespace-nowrap font-mono text-xs">
                          {app.salary || "—"}
                        </td>
                      )}

                      {/* Location */}
                      {isVisible("location") && (
                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <span className="truncate max-w-[120px]">
                              {app.location}
                            </span>
                            {app.remote && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary/80 rounded-full"
                              >
                                Remote
                              </Badge>
                            )}
                          </div>
                        </td>
                      )}

                      {/* Source */}
                      {isVisible("source") && (
                        <td className="px-3 py-3.5 text-muted-foreground text-xs whitespace-nowrap">
                          {app.source}
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => openDrawer(app)}
                            aria-label="View details"
                            data-ocid={`view-btn-${app.id}`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          {onEditApplication && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-primary"
                              onClick={() => onEditApplication(app)}
                              aria-label="Edit application"
                              data-ocid={`edit-btn-${app.id}`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteMutation.mutate(app.id)}
                            aria-label="Delete application"
                            data-ocid={`delete-btn-${app.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <div
                          className={cn(
                            "flex justify-end",
                            isHovered && "hidden",
                          )}
                        >
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground/30" />
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
        <div className="flex items-center justify-between pt-4 px-1">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              data-ocid="pagination-prev"
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = i + 1;
              return (
                <Button
                  key={p}
                  variant={p === page ? "default" : "ghost"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => onPageChange(p)}
                  data-ocid={`pagination-page-${p}`}
                >
                  {p}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              data-ocid="pagination-next"
            >
              Next
            </Button>
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
