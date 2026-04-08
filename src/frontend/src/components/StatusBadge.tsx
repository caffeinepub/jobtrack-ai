import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/types";

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
  size?: "sm" | "md";
}

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  Applied: "APPLIED",
  Interviewing: "INTERVIEWING",
  Offer: "OFFER",
  Rejected: "REJECTED",
  Archived: "ARCHIVED",
};

const STATUS_OPACITY: Record<ApplicationStatus, string> = {
  Applied: "rgba(240,240,250,0.7)",
  Interviewing: "rgba(240,240,250,0.85)",
  Offer: "#f0f0fa",
  Rejected: "rgba(240,240,250,0.35)",
  Archived: "rgba(240,240,250,0.25)",
};

export function StatusBadge({
  status,
  className,
  size = "md",
}: StatusBadgeProps) {
  const label = STATUS_LABELS[status] ?? "APPLIED";
  const color = STATUS_OPACITY[status] ?? STATUS_OPACITY.Applied;

  return (
    <span
      className={cn("inline-flex items-center", className)}
      style={{
        fontSize: size === "sm" ? "10px" : "11px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "1.17px",
        color,
        backgroundColor: "rgba(240,240,250,0.05)",
        border: "1px solid rgba(240,240,250,0.2)",
        borderRadius: "32px",
        padding: size === "sm" ? "2px 10px" : "3px 12px",
        lineHeight: 1.4,
      }}
    >
      {label}
    </span>
  );
}

export { STATUS_LABELS as STATUS_CONFIG };
