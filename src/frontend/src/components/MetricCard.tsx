import { cn } from "@/lib/utils";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  description?: string;
  colorClass?: string;
  className?: string;
  "data-ocid"?: string;
}

export function MetricCard({
  label,
  value,
  unit,
  trend,
  trendValue,
  description,
  colorClass,
  className,
  "data-ocid": dataOcid,
}: MetricCardProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const trendColor =
    trend === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : trend === "down"
        ? "text-rose-500 dark:text-rose-400"
        : "text-muted-foreground";

  return (
    <div
      data-ocid={dataOcid}
      className={cn(
        "group relative bg-card border border-border rounded-xl p-5 overflow-hidden transition-smooth",
        "hover:shadow-md hover:border-primary/20",
        className,
      )}
    >
      {/* subtle accent bar on the left */}
      <div
        className={cn(
          "absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full opacity-60",
          colorClass ?? "bg-primary",
        )}
      />

      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground pl-3 mb-3">
        {label}
      </p>

      <div className="pl-3 flex items-end gap-1.5">
        <span className="text-3xl font-bold text-foreground tabular-nums leading-none">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-muted-foreground mb-0.5">
            {unit}
          </span>
        )}
      </div>

      {(trend || trendValue || description) && (
        <div
          className={cn("pl-3 mt-2.5 flex items-center gap-1.5", trendColor)}
        >
          {trend && <TrendIcon className="w-3.5 h-3.5 shrink-0" />}
          <span className="text-xs font-medium">
            {trendValue ?? description}
          </span>
        </div>
      )}

      {/* hover glow */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-smooth pointer-events-none bg-primary/[0.02]" />
    </div>
  );
}
