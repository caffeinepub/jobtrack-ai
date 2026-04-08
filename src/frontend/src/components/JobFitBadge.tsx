import { cn } from "@/lib/utils";

interface JobFitBadgeProps {
  score: number;
  confidence?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function JobFitBadge({
  score,
  confidence,
  size = "md",
  showLabel = false,
  className,
}: JobFitBadgeProps) {
  const fontSize = size === "sm" ? "10px" : size === "lg" ? "14px" : "12px";
  const color =
    score >= 75
      ? "#f0f0fa"
      : score >= 50
        ? "rgba(240,240,250,0.7)"
        : "rgba(240,240,250,0.4)";

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <span
        style={{
          fontSize,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1.17px",
          color,
        }}
      >
        FIT: {score}%
      </span>

      {showLabel && confidence !== undefined && (
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1.17px",
            color: "rgba(240,240,250,0.35)",
          }}
        >
          · {Math.round(confidence * 100)}% CONF
        </span>
      )}
    </div>
  );
}
