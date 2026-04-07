import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/types";

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; class: string }
> = {
  Applied: {
    label: "Applied",
    class: "stage-applied",
  },
  Interviewing: {
    label: "Interviewing",
    class: "stage-interview",
  },
  Offer: {
    label: "Offer",
    class: "stage-offer",
  },
  Rejected: {
    label: "Rejected",
    class: "stage-rejected",
  },
  Archived: {
    label: "Archived",
    class: "bg-muted text-muted-foreground border border-border",
  },
};

export function StatusBadge({
  status,
  className,
  size = "md",
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.Applied;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold tracking-wide",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        config.class,
        className,
      )}
    >
      {config.label}
    </span>
  );
}

export { STATUS_CONFIG };
