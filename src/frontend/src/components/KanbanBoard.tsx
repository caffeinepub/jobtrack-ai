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
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const COLUMNS: { id: ApplicationStatus; label: string }[] = [
  { id: "Applied", label: "APPLIED" },
  { id: "Interviewing", label: "INTERVIEWING" },
  { id: "Offer", label: "OFFER" },
  { id: "Rejected", label: "REJECTED" },
  { id: "Archived", label: "ARCHIVED" },
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

  // Sync local items whenever the applications prop changes (e.g. after a new
  // application is added and React Query re-fetches the list).
  useEffect(() => {
    setItems(applications);
  }, [applications]);

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

      undoRef.current = { id: active.id as string, prevStatus };
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);

      updateStatus.mutate(
        { id: active.id as string, status: targetStatus },
        {
          onError: () => {
            setItems((prev) =>
              prev.map((a) =>
                a.id === active.id ? { ...a, status: prevStatus } : a,
              ),
            );
            toast.error("FAILED TO UPDATE STATUS");
            undoRef.current = null;
          },
        },
      );

      toast(`MOVED TO ${targetStatus.toUpperCase()}`, {
        duration: 5000,
        action: {
          label: "UNDO",
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
        className="flex gap-5 px-8 pb-8 h-full overflow-x-auto"
        data-ocid="kanban-board"
        style={{ alignItems: "flex-start" }}
      >
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            label={col.label}
            items={columnItems(col.id)}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={dropAnimation}>
        {activeApp ? (
          <div className="rotate-1 scale-105 opacity-90 pointer-events-none">
            <KanbanCard app={activeApp} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
