import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteApplication,
  useUpdateApplicationStatus,
} from "@/hooks/useApplications";
import { cn, daysSince, formatDate } from "@/lib/utils";
import type { Application, ApplicationStatus } from "@/types";
import {
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface ApplicationDetailDrawerProps {
  application: Application | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (app: Application) => void;
}

const TIMELINE_STATUSES: ApplicationStatus[] = [
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
];

function FitScoreRing({ score }: { score: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (score / 100) * circumference;
  const color =
    score >= 85
      ? "oklch(var(--chart-3))"
      : score >= 70
        ? "oklch(var(--chart-2))"
        : "oklch(var(--chart-5))";

  return (
    <div className="relative w-20 h-20 flex-shrink-0">
      <svg
        className="w-full h-full -rotate-90"
        viewBox="0 0 72 72"
        role="img"
        aria-label={`Fit score ${score} out of 100`}
      >
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke="oklch(var(--border))"
          strokeWidth="5"
        />
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          aria-label={`Fit score: ${score}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold text-foreground">{score}</span>
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
          Fit
        </span>
      </div>
    </div>
  );
}

function AiSuggestionCard({ app }: { app: Application }) {
  const days = daysSince(app.updatedAt);
  const isStalled = days > 7 && app.status === "Applied";
  const isInterview = app.status === "Interviewing";

  let suggestion = "";
  if (isStalled) {
    suggestion = `No update in ${days} days. Consider sending a brief follow-up to the hiring team to express continued interest.`;
  } else if (isInterview) {
    suggestion =
      "You're in interview stage — prepare STAR stories for behavioral questions and research recent company news.";
  } else if (app.status === "Offer") {
    suggestion =
      "Congratulations on the offer! Research market rates and prepare to negotiate — most offers have 10–20% flexibility.";
  } else if (app.fitScore && app.fitScore >= 85) {
    suggestion =
      "High fit score! Prioritize this application and tailor your cover letter to highlight your most relevant experience.";
  } else {
    suggestion =
      "Keep your application materials updated and follow up if you haven't heard back within 2 weeks.";
  }

  return (
    <div className="rounded-xl border border-[oklch(var(--primary)/0.2)] bg-[oklch(var(--primary)/0.05)] p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
        <span className="text-xs font-semibold text-primary uppercase tracking-wide">
          AI Suggestion
        </span>
      </div>
      <p className="text-sm text-foreground leading-relaxed">{suggestion}</p>
    </div>
  );
}

export function ApplicationDetailDrawer({
  application,
  open,
  onClose,
  onEdit,
}: ApplicationDetailDrawerProps) {
  const deleteMutation = useDeleteApplication();
  const statusMutation = useUpdateApplicationStatus();

  const handleDelete = async () => {
    if (!application) return;
    await deleteMutation.mutateAsync(application.id);
    onClose();
  };

  const handleStatusChange = (status: ApplicationStatus) => {
    if (!application) return;
    statusMutation.mutate({ id: application.id, status });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-foreground/10 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-card border-l border-border shadow-2xl z-50 flex flex-col"
            data-ocid="detail-drawer"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-border">
              <div className="space-y-1 min-w-0 flex-1 pr-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-semibold text-foreground truncate">
                    {application?.jobTitle ?? <Skeleton className="h-5 w-40" />}
                  </h2>
                  {application?.fitScore && application.fitScore >= 85 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[oklch(var(--accent)/0.15)] text-[oklch(var(--accent))] border border-[oklch(var(--accent)/0.3)]">
                      <Sparkles className="w-2.5 h-2.5" />
                      High Potential
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{application?.company}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="flex-shrink-0 -mr-2 -mt-2"
                aria-label="Close drawer"
                data-ocid="drawer-close"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {application && (
                <>
                  {/* Hero row: fit score + status + quick meta */}
                  <div className="flex items-start gap-4">
                    {application.fitScore !== undefined && (
                      <FitScoreRing score={application.fitScore} />
                    )}
                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={application.status} />
                        <span className="text-xs text-muted-foreground">
                          {daysSince(application.updatedAt)} days ago
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">
                            {application.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{formatDate(application.appliedAt)}</span>
                        </div>
                        {application.salary && (
                          <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
                            <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{application.salary}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AI Suggestion */}
                  <AiSuggestionCard app={application} />

                  {/* Job URL */}
                  {application.url && (
                    <a
                      href={application.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                      data-ocid="job-url-link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Job Posting
                    </a>
                  )}

                  <Separator />

                  {/* Timeline */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      Pipeline Stage
                    </h3>
                    <div className="flex items-center gap-1">
                      {TIMELINE_STATUSES.map((s, i) => {
                        const statusOrder = TIMELINE_STATUSES.indexOf(
                          application.status,
                        );
                        const isPast = i <= statusOrder;
                        const isCurrent = s === application.status;
                        return (
                          <button
                            type="button"
                            key={s}
                            onClick={() => handleStatusChange(s)}
                            className={cn(
                              "flex-1 flex flex-col items-center gap-1.5 group",
                              "transition-smooth",
                            )}
                            data-ocid={`timeline-stage-${s.toLowerCase()}`}
                          >
                            <div
                              className={cn(
                                "w-full h-1.5 rounded-full transition-smooth",
                                isPast ? "bg-primary" : "bg-muted",
                                isCurrent &&
                                  "ring-2 ring-primary ring-offset-1 ring-offset-card",
                              )}
                            />
                            <span
                              className={cn(
                                "text-[9px] font-medium uppercase tracking-wide",
                                isCurrent
                                  ? "text-primary"
                                  : isPast
                                    ? "text-foreground/70"
                                    : "text-muted-foreground",
                              )}
                            >
                              {s}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Separator />

                  {/* Notes */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Notes
                    </h3>
                    {application.notes ? (
                      <p className="text-sm text-foreground leading-relaxed">
                        {application.notes}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No notes added yet.
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  {application.tags.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {application.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="rounded-lg bg-muted/40 p-4 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Source</span>
                      <span className="text-foreground font-medium">
                        {application.source}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Job Type</span>
                      <span className="text-foreground font-medium">
                        {application.jobType}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Remote</span>
                      <span className="text-foreground font-medium">
                        {application.remote ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        Last Updated
                      </span>
                      <span className="text-foreground font-medium">
                        {formatDate(application.updatedAt)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer actions */}
            <div className="p-4 border-t border-border flex items-center gap-3">
              {onEdit && application && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onEdit(application)}
                  data-ocid="drawer-edit-btn"
                >
                  Edit Application
                </Button>
              )}
              <Button
                variant="destructive"
                size="icon"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                aria-label="Delete application"
                data-ocid="drawer-delete-btn"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
