import { cn, daysSince, formatDate } from "@/lib/utils";
import type { Application } from "@/types";
import { Link } from "@tanstack/react-router";

interface ApplicationCardProps {
  application: Application;
  className?: string;
}

// Status text — monochrome only, no colors
function StatusText({ status }: { status: Application["status"] }) {
  const opacity =
    status === "Rejected"
      ? 0.3
      : status === "Archived"
        ? 0.25
        : status === "Offer"
          ? 0.9
          : 0.6;

  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "1.17px",
        textTransform: "uppercase",
        color: `rgba(240,240,250,${opacity})`,
      }}
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
    application.status !== "Rejected" &&
    application.status !== "Archived";

  return (
    <Link
      to="/applications"
      data-ocid={`app-card-${application.id}`}
      className={cn("group block", className)}
      style={{
        padding: "1.5rem 0",
        borderBottom: "1px solid rgba(240,240,250,0.06)",
        textDecoration: "none",
        display: "block",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "2rem",
        }}
      >
        {/* Left: company + role */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{ display: "flex", alignItems: "baseline", gap: "1.5rem" }}
          >
            <p
              style={{
                fontSize: "clamp(1rem, 2vw, 1.25rem)",
                fontWeight: 700,
                letterSpacing: "0.96px",
                color: "#f0f0fa",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                transition: "opacity 0.3s",
              }}
              className="group-hover:opacity-70"
            >
              {application.company}
            </p>
            <p
              style={{
                fontSize: 13,
                fontWeight: 400,
                letterSpacing: "1.17px",
                color: "rgba(240,240,250,0.5)",
                textTransform: "uppercase",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {application.jobTitle}
            </p>
          </div>

          {/* Meta row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              marginTop: "0.4rem",
            }}
          >
            {application.location && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "1.17px",
                  color: "rgba(240,240,250,0.25)",
                  textTransform: "uppercase",
                }}
              >
                {application.location}
              </span>
            )}
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "1.17px",
                color: "rgba(240,240,250,0.2)",
                textTransform: "uppercase",
              }}
            >
              {formatDate(application.appliedAt)}
            </span>
            {isStalled && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "1.17px",
                  color: "rgba(240,240,250,0.35)",
                  textTransform: "uppercase",
                  borderBottom: "1px solid rgba(240,240,250,0.2)",
                }}
              >
                Stalled — {days}d
              </span>
            )}
          </div>
        </div>

        {/* Right: status */}
        <div style={{ flexShrink: 0, textAlign: "right" }}>
          <StatusText status={application.status} />
          {application.fitScore !== undefined && (
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "1.17px",
                color: "rgba(240,240,250,0.3)",
                marginTop: "0.3rem",
              }}
            >
              {application.fitScore}% Fit
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
