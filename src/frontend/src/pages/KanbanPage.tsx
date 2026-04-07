import { KanbanBoard } from "@/components/KanbanBoard";
import { Skeleton } from "@/components/ui/skeleton";
import { useApplications } from "@/hooks/useApplications";
import { LayoutGrid } from "lucide-react";

export function KanbanPage() {
  const { data, isLoading } = useApplications();

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Page Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border bg-card flex-shrink-0">
        <div className="p-2 rounded-lg bg-primary/10">
          <LayoutGrid className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-display font-semibold text-foreground">
            Pipeline
          </h1>
          <p className="text-sm text-muted-foreground">
            Drag applications between stages to update their status
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent/70" />
            Stalled &gt; 14 days
          </span>
        </div>
      </div>

      {/* Board Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {isLoading ? (
          <div className="flex gap-4 p-6 h-full">
            {(["a", "b", "c", "d", "e"] as const).map((key) => (
              <div key={key} className="flex flex-col gap-3 w-72 flex-shrink-0">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <KanbanBoard applications={data?.applications ?? []} />
        )}
      </div>
    </div>
  );
}
