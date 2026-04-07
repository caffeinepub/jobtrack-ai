import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Application } from "@/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Clock,
  DollarSign,
  GripVertical,
  MapPin,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface Props {
  app: Application;
  accent: string;
  isDragging?: boolean;
}

const AI_SUGGESTIONS: Record<string, string> = {
  "1": "Recommended: Send follow-up email today",
  "2": "Tip: Connect with an employee on LinkedIn",
  "6": "Reminder: Interview prep for 2nd round",
};

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

function FitBadge({ score }: { score: number }) {
  const colorClass =
    score >= 85
      ? "bg-chart-3/10 text-chart-3 border-chart-3/30"
      : score >= 70
        ? "bg-chart-2/10 text-chart-2 border-chart-2/30"
        : "bg-destructive/10 text-destructive border-destructive/30";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded border",
        colorClass,
      )}
    >
      <TrendingUp className="h-2.5 w-2.5" />
      {score}%
    </span>
  );
}

export function KanbanCard({ app, accent, isDragging }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: app.id });

  const days = daysSince(app.updatedAt);
  const isStalled =
    (app.status === "Applied" || app.status === "Interviewing") && days >= 14;
  const suggestion = AI_SUGGESTIONS[app.id];

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      data-ocid={`kanban-card-${app.id}`}
      className={cn(
        "group relative rounded-xl border border-border bg-card",
        "border-l-4 transition-all duration-200 cursor-grab active:cursor-grabbing",
        "hover:shadow-md hover:-translate-y-0.5",
        accent,
        isSortableDragging && "opacity-30 scale-95",
        isDragging && "shadow-xl",
        isStalled && "ring-1 ring-chart-2/50",
      )}
    >
      {/* Stalled amber tint overlay */}
      {isStalled && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ background: "oklch(0.68 0.16 55 / 0.05)" }}
        />
      )}

      {/* Drag handle */}
      <div
        {...listeners}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-40 transition-opacity cursor-grab active:cursor-grabbing p-1"
      >
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
      </div>

      <div className="p-3.5 space-y-2.5">
        {/* Company + fit score */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-display font-semibold text-sm text-foreground truncate leading-tight">
              {app.company}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {app.jobTitle}
            </p>
          </div>
          {app.fitScore !== undefined && <FitBadge score={app.fitScore} />}
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {app.location && (
            <span className="inline-flex items-center gap-1 truncate max-w-[110px]">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{app.location}</span>
            </span>
          )}
          {app.salary && (
            <span className="inline-flex items-center gap-1">
              <DollarSign className="h-3 w-3 flex-shrink-0" />
              {app.salary}
            </span>
          )}
        </div>

        {/* Aging row */}
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs",
              isStalled ? "text-chart-2 font-medium" : "text-muted-foreground",
            )}
          >
            <Clock className="h-3 w-3 flex-shrink-0" />
            {isStalled ? (
              <span className="inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-chart-2 animate-pulse" />
                Stalled {days}d
              </span>
            ) : (
              `${days}d ago`
            )}
          </span>

          {app.remote && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              Remote
            </Badge>
          )}
        </div>

        {/* AI suggestion — visible on hover */}
        {suggestion && (
          <div
            className={cn(
              "overflow-hidden transition-all duration-300",
              "max-h-0 group-hover:max-h-20",
            )}
          >
            <div className="pt-2 border-t border-border/60">
              <p className="inline-flex items-start gap-1.5 text-xs text-primary font-medium leading-snug">
                <Sparkles className="h-3 w-3 mt-0.5 flex-shrink-0 text-accent" />
                {suggestion}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
