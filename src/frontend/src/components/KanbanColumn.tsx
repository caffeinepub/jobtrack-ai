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
  items: Application[];
}

export function KanbanColumn({ id, label, items }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const itemIds = items.map((a) => a.id);

  return (
    <div
      className="flex flex-col w-64 flex-shrink-0"
      data-ocid={`kanban-column-${id.toLowerCase()}`}
      style={{ minHeight: 0 }}
    >
      {/* Column Header — no background, only bottom border */}
      <div
        className="flex items-baseline justify-between pb-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(240,240,250,0.15)" }}
      >
        <span
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 700,
            fontSize: "24px",
            textTransform: "uppercase",
            letterSpacing: "0.96px",
            color: "#f0f0fa",
            lineHeight: 1.1,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 700,
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "1.17px",
            color: "rgba(240,240,250,0.45)",
          }}
        >
          {items.length}
        </span>
      </div>

      {/* Cards list — transparent background */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto pt-3 flex flex-col gap-2"
        style={{
          maxHeight: "calc(100vh - 260px)",
          transition: "background 0.2s",
          background: isOver ? "rgba(240,240,250,0.03)" : "transparent",
        }}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {items.map((app) => (
            <KanbanCard key={app.id} app={app} />
          ))}
        </SortableContext>

        {/* Empty state */}
        {items.length === 0 && (
          <div
            className="flex-1 min-h-20 flex items-center justify-center"
            style={{
              border: "1px dashed rgba(240,240,250,0.12)",
              borderRadius: "4px",
            }}
            data-ocid={`kanban-empty-${id.toLowerCase()}`}
          >
            <span
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1.17px",
                color: "rgba(240,240,250,0.25)",
              }}
            >
              DROP HERE
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
