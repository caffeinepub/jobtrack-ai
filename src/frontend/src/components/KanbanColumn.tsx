import { KanbanCard } from "@/components/KanbanCard";
import type { Application, ApplicationStatus } from "@/types";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface Props {
  id: ApplicationStatus;
  label: string;
  color: string;
  headerBg: string;
  accent: string;
  items: Application[];
  isOver: boolean;
}

const COUNT_COLORS: Record<string, string> = {
  blue: "bg-primary/10 text-primary",
  purple: "bg-accent/10 text-accent",
  green: "bg-chart-3/10 text-chart-3",
  red: "bg-destructive/10 text-destructive",
  gray: "bg-muted text-muted-foreground",
};

const DOT_COLORS: Record<string, string> = {
  blue: "bg-primary",
  purple: "bg-accent",
  green: "bg-chart-3",
  red: "bg-destructive",
  gray: "bg-muted-foreground/40",
};

export function KanbanColumn({
  id,
  label,
  color,
  headerBg,
  accent,
  items,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const itemIds = items.map((a) => a.id);

  return (
    <div
      className="flex flex-col w-72 flex-shrink-0 rounded-xl border border-border overflow-hidden bg-card"
      data-ocid={`kanban-column-${id.toLowerCase()}`}
      style={{ minHeight: 0 }}
    >
      {/* Column Header */}
      <div
        className={`flex items-center gap-2.5 px-3.5 py-3 border-b border-border flex-shrink-0 ${headerBg}`}
      >
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 ${DOT_COLORS[color]}`}
        />
        <span className="font-display font-semibold text-sm text-foreground flex-1 truncate">
          {label}
        </span>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full tabular-nums ${COUNT_COLORS[color]}`}
        >
          {items.length}
        </span>
      </div>

      {/* Cards list */}
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto p-2 flex flex-col gap-2 transition-colors duration-200 ${
          isOver ? "bg-primary/5" : ""
        }`}
        style={{ maxHeight: "calc(100vh - 220px)" }}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {items.map((app) => (
            <KanbanCard key={app.id} app={app} accent={accent} />
          ))}
        </SortableContext>

        {/* Empty state */}
        {items.length === 0 && (
          <div
            className={`flex-1 min-h-24 rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center transition-colors duration-200 ${
              isOver ? "border-primary/40 bg-primary/5" : ""
            }`}
            data-ocid={`kanban-empty-${id.toLowerCase()}`}
          >
            <span className="text-xs text-muted-foreground">Drop here</span>
          </div>
        )}
      </div>
    </div>
  );
}
