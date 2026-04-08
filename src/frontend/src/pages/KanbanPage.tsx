import { KanbanBoard } from "@/components/KanbanBoard";
import { useApplications } from "@/hooks/useApplications";

export function KanbanPage() {
  const { data, isLoading } = useApplications();

  return (
    <div
      className="full-bleed-section flex flex-col"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1920&q=80)",
      }}
      data-ocid="kanban-page"
    >
      {/* Dark overlay */}
      <div className="image-overlay" />

      {/* Content above overlay */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Page Header */}
        <div className="flex items-end justify-between px-8 pt-10 pb-6 flex-shrink-0">
          <div>
            <p
              className="nav-text mb-2"
              style={{ color: "rgba(240,240,250,0.5)" }}
            >
              JOB TRACK AI
            </p>
            <h1
              className="display-text"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              PIPELINE
            </h1>
          </div>

          <div
            className="nav-text"
            style={{ color: "rgba(240,240,250,0.45)" }}
            data-ocid="kanban-stall-legend"
          >
            ● STALLED &gt; 14 DAYS
          </div>
        </div>

        {/* Board Area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {isLoading ? (
            <div className="flex gap-5 px-8 pb-8 h-full overflow-x-auto">
              {(["a", "b", "c", "d", "e"] as const).map((key) => (
                <div
                  key={key}
                  className="flex flex-col gap-3 w-64 flex-shrink-0"
                >
                  <div
                    className="h-8 w-full"
                    style={{
                      borderBottom: "1px solid rgba(240,240,250,0.15)",
                    }}
                  />
                  <div
                    className="h-24 w-full"
                    style={{ border: "1px solid rgba(240,240,250,0.1)" }}
                  />
                  <div
                    className="h-20 w-full"
                    style={{ border: "1px solid rgba(240,240,250,0.1)" }}
                  />
                  <div
                    className="h-24 w-full"
                    style={{ border: "1px solid rgba(240,240,250,0.1)" }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <KanbanBoard applications={data?.applications ?? []} />
          )}
        </div>
      </div>
    </div>
  );
}
