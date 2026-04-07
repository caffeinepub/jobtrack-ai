import { JobFitBadge } from "@/components/JobFitBadge";
import { cn, daysSince, formatDate } from "@/lib/utils";
import type { Application } from "@/types";
import { Link } from "@tanstack/react-router";
import { Building2, MapPin } from "lucide-react";

interface ApplicationCardProps {
  application: Application;
  className?: string;
}

function StatusPill({ status }: { status: Application["status"] }) {
  const classes: Record<string, string> = {
    Applied: "stage-applied",
    Interviewing: "stage-interview",
    Offer: "stage-offer",
    Rejected: "stage-rejected",
    Archived: "bg-muted text-muted-foreground border border-border",
  };
  return (
    <span
      className={cn(
        "fit-badge text-[10px]",
        classes[status] ?? classes.Applied,
      )}
    >
      {status}
    </span>
  );
}

export function ApplicationCard({
  application,
  className,
}: ApplicationCardProps) {
  const days = daysSince(application.updatedAt);
  const isStalled =
    days > 14 &&
    application.status !== "Offer" &&
    application.status !== "Rejected";

  return (
    <Link
      to="/applications"
      data-ocid={`app-card-${application.id}`}
      className={cn(
        "group flex items-center gap-4 px-4 py-3 rounded-lg bg-card border border-border",
        "hover:border-primary/40 hover:shadow-sm transition-smooth cursor-pointer",
        "relative overflow-hidden",
        className,
      )}
    >
      {/* Stalled indicator */}
      {isStalled && <div className="stalled-indicator opacity-100" />}

      {/* Company avatar */}
      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
        <Building2 className="w-4 h-4 text-primary" />
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground truncate">
            {application.company}
          </p>
          {isStalled && (
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-sm bg-accent/15 text-accent border border-accent/30">
              Stalled
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {application.jobTitle}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
            <MapPin className="w-2.5 h-2.5" />
            <span className="truncate max-w-[100px]">
              {application.location}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground">·</span>
          <span className="text-[10px] text-muted-foreground">
            {formatDate(application.appliedAt)}
          </span>
        </div>
      </div>

      {/* Right side: status + fit score */}
      <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
        <StatusPill status={application.status} />
        {application.fitScore !== undefined && (
          <JobFitBadge score={application.fitScore} size="sm" />
        )}
      </div>
    </Link>
  );
}
