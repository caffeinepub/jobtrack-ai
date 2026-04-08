import type { AiInsight } from "@/types";

interface AiInsightsPanelProps {
  insights: AiInsight[];
  recommendations?: string[];
  isLoading?: boolean;
  className?: string;
  "data-ocid"?: string;
}

export function AiInsightsPanel({
  insights,
  recommendations,
  isLoading,
  "data-ocid": dataOcid,
}: AiInsightsPanelProps) {
  if (isLoading) {
    return (
      <div data-ocid={dataOcid} className="space-y-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-2 opacity-40 animate-pulse">
            <div
              style={{
                height: 13,
                width: "30%",
                background: "rgba(240,240,250,0.15)",
              }}
            />
            <div
              style={{
                height: 16,
                width: "80%",
                background: "rgba(240,240,250,0.1)",
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div data-ocid={dataOcid} className="space-y-10">
      {/* Live Insights */}
      {insights.length > 0 && (
        <div className="space-y-8">
          {insights.map((insight) => (
            <div key={insight.id} data-ocid={`insight-${insight.id}`}>
              {/* Type label */}
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1.17px",
                  color: "rgba(240,240,250,0.45)",
                  marginBottom: "0.5rem",
                }}
              >
                {insight.type === "opportunity"
                  ? "Opportunity"
                  : insight.type === "warning"
                    ? "Timing"
                    : "Strategy"}
              </p>

              {/* Insight heading */}
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1.17px",
                  color: "#f0f0fa",
                  marginBottom: "0.4rem",
                  lineHeight: 1.4,
                }}
              >
                {insight.title}
              </p>

              {/* Insight body */}
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 400,
                  textTransform: "uppercase",
                  letterSpacing: "1.17px",
                  color: "rgba(240,240,250,0.65)",
                  lineHeight: 1.6,
                  maxWidth: "70ch",
                }}
              >
                {insight.message}
              </p>

              {insight.metric && (
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "1.17px",
                    color: "rgba(240,240,250,0.4)",
                    marginTop: "0.5rem",
                  }}
                >
                  {insight.metric}
                </p>
              )}

              {insight.action && (
                <button
                  type="button"
                  className="ghost-button"
                  data-ocid={`insight-action-${insight.id}`}
                  style={{ marginTop: "1rem" }}
                >
                  Explore →
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="space-y-8">
          {/* Section label */}
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1.17px",
              color: "rgba(240,240,250,0.45)",
              borderTop: "1px solid rgba(240,240,250,0.1)",
              paddingTop: "2rem",
            }}
          >
            Recommended Next Steps
          </p>

          {recommendations.map((rec, i) => (
            <div key={rec} className="flex gap-6 items-start">
              {/* Step number */}
              <span
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  letterSpacing: "0.96px",
                  color: "rgba(240,240,250,0.15)",
                  lineHeight: 1,
                  flexShrink: 0,
                  userSelect: "none",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Recommendation text */}
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 400,
                  textTransform: "uppercase",
                  letterSpacing: "1.17px",
                  color: "rgba(240,240,250,0.7)",
                  lineHeight: 1.6,
                  maxWidth: "60ch",
                  paddingTop: "0.25rem",
                }}
              >
                {rec}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
