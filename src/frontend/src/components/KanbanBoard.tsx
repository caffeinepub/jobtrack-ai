import { KanbanCard } from "@/components/KanbanCard";
import { KanbanColumn } from "@/components/KanbanColumn";
import { useUpdateApplicationStatus } from "@/hooks/useApplications";
import type { Application, ApplicationStatus } from "@/types";
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  type DropAnimation,
  PointerSensor,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

const COLUMNS: {
  id: ApplicationStatus;
  label: string;
  color: string;
  headerBg: string;
  accent: string;
}[] = [
  {
    id: "Applied",
    label: "Applied",
    color: "blue",
    headerBg: "bg-primary/5",
    accent: "border-l-primary",
  },
  {
    id: "Interviewing",
    label: "Interviewing",
    color: "purple",
    headerBg: "bg-accent/5",
    accent: "border-l-accent",
  },
  {
    id: "Offer",
    label: "Offer",
    color: "green",
    headerBg: "bg-chart-3/5",
    accent: "border-l-chart-3",
  },
  {
    id: "Rejected",
    label: "Rejected",
    color: "red",
    headerBg: "bg-destructive/5",
    accent: "border-l-destructive",
  },
  {
    id: "Archived",
    label: "Archived",
    color: "gray",
    headerBg: "bg-muted/50",
    accent: "border-l-muted-foreground/30",
  },
];

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0.4" } },
  }),
};

interface Props {
  applications: Application[];
}

export function KanbanBoard({ applications }: Props) {
  const [items, setItems] = useState<Application[]>(applications);
  const [activeId, setActiveId] = useState<string | null>(null);
  const updateStatus = useUpdateApplicationStatus();
  const undoRef = useRef<{ id: string; prevStatus: ApplicationStatus } | null>(
    null,
  );
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const activeApp = items.find((a) => a.id === activeId);

  const handleDragStart = useCallback(({ active }: DragStartEvent) => {
    setActiveId(active.id as string);
  }, []);

  const handleDragOver = useCallback(
    ({ active, over }: DragOverEvent) => {
      if (!over) return;
      const activeItem = items.find((a) => a.id === active.id);
      if (!activeItem) return;

      // Determine target column (could be a column droppable or a card)
      const overColumn = COLUMNS.find((c) => c.id === over.id);
      const overItem = items.find((a) => a.id === over.id);
      const targetStatus = overColumn?.id ?? overItem?.status;
      if (!targetStatus || targetStatus === activeItem.status) return;

      setItems((prev) =>
        prev.map((a) =>
          a.id === activeItem.id ? { ...a, status: targetStatus } : a,
        ),
      );
    },
    [items],
  );

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      setActiveId(null);
      if (!over) return;

      const activeItem = items.find((a) => a.id === active.id);
      if (!activeItem) return;

      const overColumn = COLUMNS.find((c) => c.id === over.id);
      const overItem = items.find((a) => a.id === over.id);
      const targetStatus =
        overColumn?.id ?? overItem?.status ?? activeItem.status;

      const originalApp = applications.find((a) => a.id === active.id);
      const prevStatus = originalApp?.status ?? activeItem.status;

      // Reorder within same column
      if (targetStatus === prevStatus && overItem) {
        setItems((prev) => {
          const colItems = prev.filter((a) => a.status === targetStatus);
          const oldIdx = colItems.findIndex((a) => a.id === active.id);
          const newIdx = colItems.findIndex((a) => a.id === over.id);
          if (oldIdx === -1 || newIdx === -1) return prev;
          const reordered = arrayMove(colItems, oldIdx, newIdx);
          return [
            ...prev.filter((a) => a.status !== targetStatus),
            ...reordered,
          ];
        });
        return;
      }

      if (targetStatus === prevStatus) return;

      // Optimistic update already applied in dragOver; persist to backend
      undoRef.current = { id: active.id as string, prevStatus };
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);

      updateStatus.mutate(
        { id: active.id as string, status: targetStatus },
        {
          onError: () => {
            // Rollback
            setItems((prev) =>
              prev.map((a) =>
                a.id === active.id ? { ...a, status: prevStatus } : a,
              ),
            );
            toast.error("Failed to update status");
            undoRef.current = null;
          },
        },
      );

      // Show undo toast
      toast(`Moved to ${targetStatus}`, {
        duration: 5000,
        action: {
          label: "Undo",
          onClick: () => {
            if (!undoRef.current) return;
            setItems((prev) =>
              prev.map((a) =>
                a.id === undoRef.current!.id
                  ? { ...a, status: undoRef.current!.prevStatus }
                  : a,
              ),
            );
            updateStatus.mutate({
              id: undoRef.current.id,
              status: undoRef.current.prevStatus,
            });
            undoRef.current = null;
          },
        },
      });

      undoTimerRef.current = setTimeout(() => {
        undoRef.current = null;
      }, 5000);
    },
    [items, applications, updateStatus],
  );

  const columnItems = useCallback(
    (colId: ApplicationStatus) => items.filter((a) => a.status === colId),
    [items],
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        className="flex gap-4 p-6 h-full overflow-x-auto"
        data-ocid="kanban-board"
      >
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            label={col.label}
            color={col.color}
            headerBg={col.headerBg}
            accent={col.accent}
            items={columnItems(col.id)}
            isOver={false}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={dropAnimation}>
        {activeApp ? (
          <div className="rotate-2 scale-105 opacity-95 pointer-events-none">
            <KanbanCard app={activeApp} accent="border-l-primary" isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
