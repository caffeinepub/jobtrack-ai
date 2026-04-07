import { cn } from "@/lib/utils";

interface JobFitBadgeProps {
  score: number;
  confidence?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

function getScoreColor(score: number) {
  if (score >= 75)
    return {
      ring: "var(--color-chart-3)",
      text: "var(--color-chart-3)",
      bg: "color-mix(in oklch, var(--color-chart-3) 12%, transparent)",
    };
  if (score >= 50)
    return {
      ring: "var(--color-chart-2)",
      text: "var(--color-chart-2)",
      bg: "color-mix(in oklch, var(--color-chart-2) 12%, transparent)",
    };
  return {
    ring: "var(--color-muted-foreground)",
    text: "var(--color-muted-foreground)",
    bg: "color-mix(in oklch, var(--color-muted-foreground) 10%, transparent)",
  };
}

export function JobFitBadge({
  score,
  confidence,
  size = "md",
  showLabel = false,
  className,
}: JobFitBadgeProps) {
  const { ring, text, bg } = getScoreColor(score);
  const sizes = {
    sm: { outer: 36, stroke: 3, r: 14, font: "9px", offset: 88 },
    md: { outer: 48, stroke: 3.5, r: 19, font: "11px", offset: 119 },
    lg: { outer: 72, stroke: 4, r: 29, font: "15px", offset: 182 },
  };
  const s = sizes[size];
  const circumference = 2 * Math.PI * s.r;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: s.outer, height: s.outer }}
      >
        <svg
          width={s.outer}
          height={s.outer}
          viewBox={`0 0 ${s.outer} ${s.outer}`}
          style={{ transform: "rotate(-90deg)" }}
          aria-label={`Job fit score: ${score}%`}
          role="img"
        >
          <title>Job fit score: {score}%</title>
          {/* Track */}
          <circle
            cx={s.outer / 2}
            cy={s.outer / 2}
            r={s.r}
            fill={bg}
            stroke="var(--color-border)"
            strokeWidth={s.stroke}
          />
          {/* Progress arc */}
          <circle
            cx={s.outer / 2}
            cy={s.outer / 2}
            r={s.r}
            fill="none"
            stroke={ring}
            strokeWidth={s.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </svg>
        {/* Score label in center */}
        <span
          className="absolute font-semibold font-display leading-none"
          style={{ fontSize: s.font, color: text }}
        >
          {score}
        </span>
      </div>

      {showLabel && (
        <div className="flex flex-col">
          <span className="text-xs font-semibold" style={{ color: text }}>
            {score}% fit
          </span>
          {confidence !== undefined && (
            <span className="text-[10px] text-muted-foreground">
              {Math.round(confidence * 100)}% confidence
            </span>
          )}
        </div>
      )}
    </div>
  );
}
