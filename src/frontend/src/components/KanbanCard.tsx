import { cn } from "@/lib/utils";
import type { Application } from "@/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface Props {
  app: Application;
  isDragging?: boolean;
}

const AI_SUGGESTIONS: Record<string, string> = {
  "1": "RECOMMENDED: SEND FOLLOW-UP EMAIL TODAY",
  "2": "TIP: CONNECT WITH AN EMPLOYEE ON LINKEDIN",
  "6": "REMINDER: INTERVIEW PREP FOR 2ND ROUND",
};

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

export function KanbanCard({ app, isDragging }: Props) {
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
      style={{
        ...style,
        background: "transparent",
        border: "1px solid rgba(240,240,250,0.2)",
        borderRadius: "4px",
        opacity: isSortableDragging ? 0.3 : isDragging ? 0.95 : 1,
        cursor: "grab",
      }}
      {...attributes}
      data-ocid={`kanban-card-${app.id}`}
      className={cn(
        "group relative transition-all duration-200 active:cursor-grabbing",
        isStalled && "border-opacity-40",
      )}
    >
      {/* Stalled indicator — very subtle opacity pulse on left edge */}
      {isStalled && (
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5 pointer-events-none"
          style={{
            background: "rgba(240,240,250,0.35)",
            borderRadius: "4px 0 0 4px",
            animation: "pulse 2s infinite",
          }}
        />
      )}

      {/* Drag handle */}
      <div
        {...listeners}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-30 transition-opacity cursor-grab active:cursor-grabbing p-0.5"
        aria-label="Drag to reorder"
      >
        <GripVertical
          style={{ width: "12px", height: "12px", color: "#f0f0fa" }}
        />
      </div>

      <div className="p-3 space-y-2">
        {/* Company + fit score */}
        <div className="flex items-start justify-between gap-2 pr-5">
          <div className="min-w-0 flex-1">
            <p
              className="truncate leading-tight"
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 700,
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "1.17px",
                color: "#f0f0fa",
              }}
            >
              {app.company}
            </p>
            <p
              className="truncate mt-0.5"
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 400,
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "1.17px",
                color: "rgba(240,240,250,0.6)",
              }}
            >
              {app.jobTitle}
            </p>
          </div>
          {app.fitScore !== undefined && (
            <span
              className="flex-shrink-0"
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 700,
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "1.17px",
                color: "rgba(240,240,250,0.7)",
              }}
            >
              {app.fitScore}%
            </span>
          )}
        </div>

        {/* Meta row — location / remote / salary */}
        {(app.location || app.salary || app.remote) && (
          <div
            className="flex flex-wrap gap-x-3 gap-y-0.5"
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "10px",
              fontWeight: 400,
              textTransform: "uppercase",
              letterSpacing: "1.17px",
              color: "rgba(240,240,250,0.4)",
            }}
          >
            {app.location && (
              <span className="truncate max-w-[100px]">{app.location}</span>
            )}
            {app.salary && <span>{app.salary}</span>}
            {app.remote && <span>REMOTE</span>}
          </div>
        )}

        {/* Aging indicator */}
        <div className="flex items-center justify-between">
          <span
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "1.17px",
              color: isStalled
                ? "rgba(240,240,250,0.65)"
                : "rgba(240,240,250,0.3)",
            }}
          >
            {isStalled ? `STALLED ${days} DAYS` : `${days} DAYS`}
          </span>

          {/* Ghost status pill */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "2px 8px",
              borderRadius: "32px",
              background: "rgba(240,240,250,0.07)",
              border: "1px solid rgba(240,240,250,0.2)",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              fontSize: "9px",
              textTransform: "uppercase",
              letterSpacing: "1.17px",
              color: "rgba(240,240,250,0.55)",
            }}
          >
            {app.status.toUpperCase()}
          </span>
        </div>

        {/* AI nudge — visible on hover */}
        {suggestion && (
          <div className="overflow-hidden transition-all duration-300 max-h-0 group-hover:max-h-16">
            <div
              className="pt-2"
              style={{ borderTop: "1px solid rgba(240,240,250,0.1)" }}
            >
              <p
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: 400,
                  fontSize: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "1.17px",
                  color: "rgba(240,240,250,0.5)",
                  fontStyle: "normal",
                  lineHeight: 1.5,
                }}
              >
                ◆ {suggestion}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
