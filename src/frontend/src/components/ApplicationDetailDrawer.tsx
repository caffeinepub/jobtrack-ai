import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteApplication,
  useUpdateApplicationStatus,
} from "@/hooks/useApplications";
import { daysSince, formatDate } from "@/lib/utils";
import type { Application, ApplicationStatus } from "@/types";
import {
  Calendar,
  ExternalLink,
  MapPin,
  Sparkles,
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

// Fit score as a simple numeric display — no ring, no color
function FitScoreDisplay({ score }: { score: number }) {
  return (
    <div className="flex flex-col">
      <span
        className="display-text"
        style={{
          fontSize: "2.5rem",
          lineHeight: 1,
          color: "#f0f0fa",
          opacity: score >= 85 ? 1 : score >= 70 ? 0.7 : 0.45,
        }}
      >
        {score}
      </span>
      <span
        className="nav-text"
        style={{ fontSize: 10, opacity: 0.4, marginTop: 4 }}
      >
        Fit Score
      </span>
    </div>
  );
}

function AiSuggestion({ app }: { app: Application }) {
  const days = daysSince(app.updatedAt);
  const isStalled = days > 7 && app.status === "Applied";

  let text = "";
  if (isStalled) {
    text = `No update in ${days} days. Consider sending a brief follow-up to express continued interest.`;
  } else if (app.status === "Interviewing") {
    text =
      "In interview stage — prepare STAR stories and research recent company news.";
  } else if (app.status === "Offer") {
    text =
      "Congratulations on the offer. Research market rates and prepare to negotiate — most offers have 10–20% flexibility.";
  } else if (app.fitScore && app.fitScore >= 85) {
    text =
      "High fit score. Prioritize this application and tailor your cover letter to highlight relevant experience.";
  } else {
    text =
      "Keep materials updated and follow up if you haven't heard back within 2 weeks.";
  }

  return (
    <div
      style={{
        borderLeft: "1px solid rgba(240,240,250,0.2)",
        paddingLeft: 16,
        marginTop: 4,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles
          className="w-3 h-3"
          style={{ color: "rgba(240,240,250,0.5)", flexShrink: 0 }}
        />
        <span className="nav-text" style={{ fontSize: 10, opacity: 0.5 }}>
          AI Suggestion
        </span>
      </div>
      <p
        className="nav-text"
        style={{ fontWeight: 400, fontSize: 12, opacity: 0.7, lineHeight: 1.7 }}
      >
        {text}
      </p>
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
          {/* Backdrop — blurred photography */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(2px)",
              zIndex: 40,
            }}
            onClick={onClose}
          />

          {/* Drawer — dark semi-transparent panel */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              height: "100%",
              width: "100%",
              maxWidth: 480,
              background: "rgba(0,0,0,0.88)",
              backdropFilter: "blur(20px)",
              borderLeft: "1px solid rgba(240,240,250,0.12)",
              zIndex: 50,
              display: "flex",
              flexDirection: "column",
            }}
            data-ocid="detail-drawer"
          >
            {/* Header */}
            <div
              style={{
                padding: "28px 32px 24px",
                borderBottom: "1px solid rgba(240,240,250,0.1)",
                flexShrink: 0,
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="display-text" style={{ fontSize: "1.5rem" }}>
                    {application?.jobTitle ?? (
                      <Skeleton
                        className="h-6 w-48"
                        style={{ background: "rgba(240,240,250,0.08)" }}
                      />
                    )}
                  </h2>
                  <p
                    className="nav-text mt-1"
                    style={{ fontWeight: 400, opacity: 0.5, fontSize: 12 }}
                  >
                    {application?.company}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="ghost-button flex-shrink-0"
                  style={{
                    borderRadius: "50%",
                    padding: 0,
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: -4,
                  }}
                  aria-label="Close drawer"
                  data-ocid="drawer-close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Fit score + meta row */}
              {application && (
                <div className="flex items-end gap-8 mt-6">
                  {application.fitScore !== undefined && (
                    <FitScoreDisplay score={application.fitScore} />
                  )}
                  <div className="flex flex-col gap-2">
                    {application.location && (
                      <div className="flex items-center gap-2">
                        <MapPin
                          className="w-3 h-3"
                          style={{
                            color: "rgba(240,240,250,0.35)",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          className="nav-text"
                          style={{
                            fontWeight: 400,
                            fontSize: 11,
                            opacity: 0.55,
                          }}
                        >
                          {application.location}
                          {application.remote && " · Remote"}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar
                        className="w-3 h-3"
                        style={{
                          color: "rgba(240,240,250,0.35)",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        className="nav-text"
                        style={{ fontWeight: 400, fontSize: 11, opacity: 0.55 }}
                      >
                        Applied {formatDate(application.appliedAt)}
                      </span>
                    </div>
                    {application.salary && (
                      <div className="flex items-center gap-2">
                        <TrendingUp
                          className="w-3 h-3"
                          style={{
                            color: "rgba(240,240,250,0.35)",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          className="nav-text"
                          style={{
                            fontWeight: 400,
                            fontSize: 11,
                            opacity: 0.55,
                          }}
                        >
                          {application.salary}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Body */}
            <div
              className="flex-1 overflow-y-auto"
              style={{ padding: "28px 32px" }}
            >
              {application && (
                <div className="flex flex-col gap-8">
                  {/* AI Suggestion */}
                  <AiSuggestion app={application} />

                  {/* Pipeline timeline — clickable stage markers */}
                  <div>
                    <p
                      className="nav-text mb-4"
                      style={{ fontSize: 10, opacity: 0.4 }}
                    >
                      Pipeline Stage
                    </p>
                    <div className="flex items-stretch gap-0">
                      {TIMELINE_STATUSES.map((s, i) => {
                        const statusOrder = TIMELINE_STATUSES.indexOf(
                          application.status,
                        );
                        const isPast = i <= statusOrder;
                        const isCurrent = s === application.status;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleStatusChange(s)}
                            className="flex-1 flex flex-col items-center gap-2 transition-smooth"
                            style={{
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              padding: "4px 4px",
                            }}
                            data-ocid={`timeline-stage-${s.toLowerCase()}`}
                          >
                            <div
                              style={{
                                width: "100%",
                                height: 2,
                                background: isPast
                                  ? isCurrent
                                    ? "rgba(240,240,250,0.9)"
                                    : "rgba(240,240,250,0.45)"
                                  : "rgba(240,240,250,0.12)",
                                borderRadius: 2,
                                transition: "background 0.3s ease",
                              }}
                            />
                            <span
                              className="nav-text"
                              style={{
                                fontSize: 9,
                                opacity: isCurrent ? 1 : isPast ? 0.5 : 0.25,
                                letterSpacing: "var(--tracking-nav)",
                              }}
                            >
                              {s}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Job URL */}
                  {application.url && (
                    <a
                      href={application.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 transition-smooth"
                      style={{
                        color: "#f0f0fa",
                        opacity: 0.55,
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.opacity = "1";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.opacity = "0.55";
                      }}
                      data-ocid="job-url-link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span
                        className="nav-text"
                        style={{ fontSize: 11, fontWeight: 400 }}
                      >
                        View Job Posting
                      </span>
                    </a>
                  )}

                  {/* Divider */}
                  <div
                    style={{ height: 1, background: "rgba(240,240,250,0.08)" }}
                  />

                  {/* Notes */}
                  <div>
                    <p
                      className="nav-text mb-3"
                      style={{ fontSize: 10, opacity: 0.4 }}
                    >
                      Notes
                    </p>
                    {application.notes ? (
                      <p
                        className="nav-text"
                        style={{
                          fontWeight: 400,
                          fontSize: 13,
                          opacity: 0.7,
                          lineHeight: 1.8,
                        }}
                      >
                        {application.notes}
                      </p>
                    ) : (
                      <p
                        className="nav-text"
                        style={{ fontWeight: 400, fontSize: 12, opacity: 0.3 }}
                      >
                        No notes added yet.
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  {application.tags.length > 0 && (
                    <div>
                      <p
                        className="nav-text mb-3"
                        style={{ fontSize: 10, opacity: 0.4 }}
                      >
                        Tags
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {application.tags.map((tag) => (
                          <span
                            key={tag}
                            className="nav-text"
                            style={{
                              fontSize: 10,
                              border: "1px solid rgba(240,240,250,0.2)",
                              borderRadius: 32,
                              padding: "3px 10px",
                              opacity: 0.65,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Meta — plain text grid, no panel */}
                  <div>
                    <p
                      className="nav-text mb-3"
                      style={{ fontSize: 10, opacity: 0.4 }}
                    >
                      Details
                    </p>
                    <div className="flex flex-col gap-2">
                      {[
                        { label: "Source", value: application.source },
                        { label: "Job Type", value: application.jobType },
                        {
                          label: "Remote",
                          value: application.remote ? "Yes" : "No",
                        },
                        {
                          label: "Last Updated",
                          value: formatDate(application.updatedAt),
                        },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          className="flex justify-between items-baseline"
                        >
                          <span
                            className="nav-text"
                            style={{
                              fontSize: 11,
                              opacity: 0.35,
                              fontWeight: 400,
                            }}
                          >
                            {label}
                          </span>
                          <span
                            className="nav-text"
                            style={{
                              fontSize: 11,
                              opacity: 0.7,
                              fontWeight: 700,
                            }}
                          >
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div
              style={{
                padding: "20px 32px",
                borderTop: "1px solid rgba(240,240,250,0.1)",
                flexShrink: 0,
                display: "flex",
                gap: 12,
              }}
            >
              {onEdit && application && (
                <button
                  type="button"
                  className="ghost-button flex-1"
                  onClick={() => onEdit(application)}
                  data-ocid="drawer-edit-btn"
                >
                  Edit Application
                </button>
              )}
              <button
                type="button"
                className="ghost-button"
                style={{
                  borderColor: "rgba(192,57,43,0.4)",
                  opacity: deleteMutation.isPending ? 0.5 : 1,
                  minWidth: 48,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                aria-label="Delete application"
                data-ocid="drawer-delete-btn"
              >
                {deleteMutation.isPending ? "…" : "Delete"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
