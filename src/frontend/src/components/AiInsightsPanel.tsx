import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { AiInsight } from "@/types";
import {
  AlertTriangle,
  ArrowRight,
  Lightbulb,
  Sparkles,
  Zap,
} from "lucide-react";

const TYPE_CONFIG = {
  opportunity: {
    icon: Zap,
    badge: "Opportunity",
    badgeClass: "bg-chart-3/10 text-chart-3 border-chart-3/20",
    iconClass: "text-chart-3",
  },
  tip: {
    icon: Lightbulb,
    badge: "Strategy",
    badgeClass: "bg-primary/10 text-primary border-primary/20",
    iconClass: "text-primary",
  },
  warning: {
    icon: AlertTriangle,
    badge: "Timing",
    badgeClass: "bg-chart-2/10 text-chart-2 border-chart-2/20",
    iconClass: "text-chart-2",
  },
} as const;

interface AiInsightsPanelProps {
  insights: AiInsight[];
  recommendations?: string[];
  isLoading?: boolean;
  className?: string;
}

export function AiInsightsPanel({
  insights,
  recommendations,
  isLoading,
  className,
}: AiInsightsPanelProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl overflow-hidden",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">AI Insights</h3>
          <p className="text-xs text-muted-foreground">
            Personalized analysis based on your pipeline
          </p>
        </div>
      </div>

      <div className="p-5 space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </>
        ) : (
          insights.map((insight) => {
            const cfg = TYPE_CONFIG[insight.type];
            const Icon = cfg.icon;
            return (
              <div
                key={insight.id}
                data-ocid={`insight-${insight.id}`}
                className="group flex gap-3.5 p-4 rounded-lg bg-muted/40 border border-border/50 transition-smooth hover:bg-muted/70 hover:border-border"
              >
                <div className={cn("mt-0.5 shrink-0", cfg.iconClass)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground leading-snug">
                      {insight.title}
                    </p>
                    <span
                      className={cn(
                        "shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                        cfg.badgeClass,
                      )}
                    >
                      {cfg.badge}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {insight.message}
                  </p>
                  {insight.metric && (
                    <p className="mt-1.5 text-xs font-medium text-primary/80 tabular-nums">
                      {insight.metric}
                    </p>
                  )}
                  {insight.action && (
                    <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-smooth">
                      <ArrowRight className="w-3 h-3" />
                      {insight.action}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Actionable recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="mx-5 mb-5 p-4 rounded-lg bg-primary/5 border border-primary/10">
          <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
            Recommended Next Steps
          </h4>
          <ol className="space-y-2">
            {recommendations.map((rec, i) => (
              <li
                key={rec}
                className="flex items-start gap-2.5 text-sm text-foreground"
              >
                <span className="shrink-0 w-5 h-5 rounded-full bg-primary/15 text-primary text-[11px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
