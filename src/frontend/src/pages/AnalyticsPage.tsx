import { AiInsightsPanel } from "@/components/AiInsightsPanel";
import { MetricCard } from "@/components/MetricCard";
import {
  useAnalytics,
  useApplications,
  useInsights,
} from "@/hooks/useApplications";
import type { Application } from "@/types";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ── Date range ────────────────────────────────────────────────────────────────
type Range = "7d" | "30d" | "90d" | "all";

const RANGE_LABELS: Record<Range, string> = {
  "7d": "7D",
  "30d": "30D",
  "90d": "90D",
  all: "All",
};

function filterByRange(apps: Application[], range: Range): Application[] {
  if (range === "all") return apps;
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return apps.filter((a) => new Date(a.appliedAt) >= cutoff);
}

// ── CSV export ────────────────────────────────────────────────────────────────
function exportCsv(apps: Application[]) {
  const headers = [
    "Company",
    "Job Title",
    "Location",
    "Status",
    "Source",
    "Job Type",
    "Salary",
    "Applied At",
    "Fit Score",
  ].join(",");
  const rows = apps.map((a) =>
    [
      `"${a.company}"`,
      `"${a.jobTitle}"`,
      `"${a.location}"`,
      a.status,
      a.source,
      a.jobType,
      `"${a.salary ?? ""}"`,
      a.appliedAt,
      a.fitScore ?? "",
    ].join(","),
  );
  const csv = [headers, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "applications.csv";
  link.click();
  URL.revokeObjectURL(url);
}

// ── SpaceX chart colors — monochrome spectrum ─────────────────────────────────
const CHART_COLORS = [
  "#f0f0fa",
  "rgba(240,240,250,0.75)",
  "rgba(240,240,250,0.55)",
  "rgba(240,240,250,0.38)",
  "rgba(240,240,250,0.22)",
];

// ── Axis / grid style constants ───────────────────────────────────────────────
const AXIS_TICK = {
  fontSize: 10,
  fill: "rgba(240,240,250,0.45)",
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 700,
  textTransform: "uppercase" as const,
};

const GRID_STROKE = "rgba(240,240,250,0.1)";

// ── Cinematic tooltip ─────────────────────────────────────────────────────────
interface TooltipPayload {
  value: number;
  name: string;
}

const CinematicTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(0,0,0,0.85)",
        border: "1px solid rgba(240,240,250,0.2)",
        borderRadius: 4,
        padding: "8px 14px",
      }}
    >
      {label && (
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "rgba(240,240,250,0.45)",
            letterSpacing: "1.17px",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          {label}
        </p>
      )}
      {payload.map((p) => (
        <p
          key={p.name}
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#f0f0fa",
            letterSpacing: "0.96px",
            textTransform: "uppercase",
          }}
        >
          {p.value}
        </p>
      ))}
    </div>
  );
};

// ── Chart section wrapper — no card, just a labeled block ────────────────────
function ChartSection({
  sectionLabel,
  children,
}: {
  sectionLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1.17px",
          color: "rgba(240,240,250,0.35)",
          marginBottom: "1.25rem",
        }}
      >
        {sectionLabel}
      </p>
      {children}
    </div>
  );
}

// ── Stage funnel — inline bars, no container ─────────────────────────────────
function StageFunnel({
  data,
}: { data: { stage: string; count: number; pct: number }[] }) {
  return (
    <div style={{ paddingTop: "0.5rem" }}>
      {data.map((stage, i) => (
        <div
          key={stage.stage}
          data-ocid={`funnel-stage-${stage.stage.toLowerCase()}`}
          style={{ marginBottom: "2rem" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1.17px",
                color: "rgba(240,240,250,0.6)",
              }}
            >
              {stage.stage}
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.96px",
                color: "#f0f0fa",
              }}
            >
              {stage.count} — {stage.pct}%
            </span>
          </div>
          <div
            style={{
              height: 1,
              background: "rgba(240,240,250,0.1)",
              width: "100%",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                width: `${stage.pct}%`,
                background: CHART_COLORS[i],
                transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main analytics page ───────────────────────────────────────────────────────
export function AnalyticsPage() {
  const [range, setRange] = useState<Range>("all");

  const { data: analyticsData, isLoading: analyticsLoading } = useAnalytics();
  const { data: insightsData, isLoading: insightsLoading } = useInsights();
  const { data: appsData } = useApplications();

  const allApps = appsData?.applications ?? [];
  const filtered = useMemo(
    () => filterByRange(allApps, range),
    [allApps, range],
  );

  // KPI metrics
  const total = filtered.length;
  const interviews = filtered.filter(
    (a) => a.status === "Interviewing" || a.status === "Offer",
  ).length;
  const offers = filtered.filter((a) => a.status === "Offer").length;
  const responses = filtered.filter((a) => a.status !== "Applied").length;
  const interviewRate = total > 0 ? Math.round((interviews / total) * 100) : 0;
  const offerRate = total > 0 ? Math.round((offers / total) * 100) : 0;
  const responseRate = total > 0 ? Math.round((responses / total) * 100) : 0;
  const avgTimeToOffer = analyticsData?.avgTimeToResponse ?? 8;

  // Timeline data
  const timelineData = useMemo(() => {
    const buckets: Record<string, number> = {};
    for (const a of filtered) {
      const d = new Date(a.appliedAt);
      const key =
        range === "7d"
          ? d.toLocaleDateString("en-US", { weekday: "short" })
          : range === "30d"
            ? `${d.getMonth() + 1}/${d.getDate()}`
            : d.toLocaleDateString("en-US", { month: "short" });
      buckets[key] = (buckets[key] ?? 0) + 1;
    }
    if (Object.keys(buckets).length === 0) {
      return (analyticsData?.byMonth ?? []).map((m) => ({
        label: m.month,
        count: m.count,
      }));
    }
    return Object.entries(buckets).map(([label, count]) => ({ label, count }));
  }, [filtered, range, analyticsData]);

  // Source data
  const sourceData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of filtered) {
      counts[a.source] = (counts[a.source] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([source, count]) => ({ source, count }));
  }, [filtered]);

  // Job type data
  const jobTypeData = useMemo(() => {
    const remote = filtered.filter(
      (a) => a.remote || a.jobType === "remote",
    ).length;
    const hybrid = filtered.filter(
      (a) => !a.remote && a.location?.toLowerCase().includes("hybrid"),
    ).length;
    const onsite = Math.max(filtered.length - remote - hybrid, 0);
    return [
      { name: "Remote", value: remote },
      { name: "Onsite", value: onsite },
      { name: "Hybrid", value: Math.max(hybrid, 0) },
    ].filter((d) => d.value > 0);
  }, [filtered]);

  // Funnel data
  const funnelData = useMemo(() => {
    const applied = filtered.length;
    const interview = filtered.filter(
      (a) => a.status === "Interviewing" || a.status === "Offer",
    ).length;
    const offer = filtered.filter((a) => a.status === "Offer").length;
    return [
      { stage: "Applied", count: applied, pct: 100 },
      {
        stage: "Interview",
        count: interview,
        pct: applied > 0 ? Math.round((interview / applied) * 100) : 0,
      },
      {
        stage: "Offer",
        count: offer,
        pct: applied > 0 ? Math.round((offer / applied) * 100) : 0,
      },
    ];
  }, [filtered]);

  const insights = insightsData ?? [];
  const recommendations = [
    "Focus on referral applications — your win rate is 3× higher than job boards.",
    "Follow up on open interview-stage applications within 7 days to stay top of mind.",
    "Prioritize remote-first companies — 50% of your pipeline is remote with strong conversion.",
  ];

  return (
    <div
      className="full-bleed-section"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80')",
        height: "auto",
        minHeight: "100vh",
      }}
    >
      {/* Dark overlay */}
      <div
        className="image-overlay"
        style={{ background: "rgba(0,0,0,0.62)" }}
      />

      {/* Page content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          padding: "6rem 5vw 7rem",
          maxWidth: "none",
        }}
      >
        {/* Hero title + controls */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "2rem",
            marginBottom: "5rem",
          }}
        >
          <div>
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1.17px",
                color: "rgba(240,240,250,0.4)",
                marginBottom: "0.75rem",
              }}
            >
              Jobtrack AI
            </p>
            <h1
              className="display-text"
              style={{ fontSize: "clamp(3rem, 8vw, 5.5rem)", marginBottom: 0 }}
            >
              Insights
            </h1>
          </div>

          {/* Range filters + export */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            <div
              data-ocid="analytics-date-range"
              style={{ display: "flex", gap: "0.25rem" }}
            >
              {(Object.keys(RANGE_LABELS) as Range[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className="ghost-button"
                  style={{
                    padding: "8px 16px",
                    opacity: range === r ? 1 : 0.45,
                    fontSize: 12,
                  }}
                >
                  {RANGE_LABELS[r]}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="ghost-button"
              onClick={() => exportCsv(filtered)}
              data-ocid="analytics-export-csv"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* KPI metrics — floating on photography */}
        {analyticsLoading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "3rem",
              marginBottom: "6rem",
            }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{ opacity: 0.25, animation: "pulse 2s infinite" }}
              >
                <div
                  style={{
                    height: 13,
                    width: "60%",
                    background: "rgba(240,240,250,0.2)",
                    marginBottom: 8,
                  }}
                />
                <div
                  style={{
                    height: 56,
                    width: "80%",
                    background: "rgba(240,240,250,0.1)",
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "3rem 4rem",
              marginBottom: "6rem",
            }}
          >
            <MetricCard
              label="Total Applied"
              value={total}
              trend="up"
              trendValue="Active pipeline"
              data-ocid="metric-total"
            />
            <MetricCard
              label="Interview Rate"
              value={interviewRate}
              unit="%"
              trend={interviewRate >= 30 ? "up" : "neutral"}
              trendValue={interviewRate >= 30 ? "Above avg" : "Building"}
              data-ocid="metric-interview-rate"
            />
            <MetricCard
              label="Offer Rate"
              value={offerRate}
              unit="%"
              trend={offerRate >= 10 ? "up" : "neutral"}
              trendValue={offerRate >= 10 ? "Strong" : "In progress"}
              data-ocid="metric-offer-rate"
            />
            <MetricCard
              label="Days to Offer"
              value={avgTimeToOffer}
              unit="days"
              trend="neutral"
              trendValue="Avg time"
              data-ocid="metric-avg-time"
            />
            <MetricCard
              label="Response Rate"
              value={responseRate}
              unit="%"
              trend={responseRate >= 50 ? "up" : "down"}
              trendValue={responseRate >= 50 ? "Healthy" : "Attention"}
              data-ocid="metric-response-rate"
            />
          </div>
        )}

        {/* Charts — direct on photography, no cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "5rem 6rem",
            marginBottom: "6rem",
          }}
        >
          {/* Timeline trend */}
          <ChartSection sectionLabel="Activity — Applications Over Time">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={timelineData}
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="2 4" stroke={GRID_STROKE} />
                <XAxis
                  dataKey="label"
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CinematicTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Applications"
                  stroke="#f0f0fa"
                  strokeWidth={1.5}
                  dot={{ r: 3, fill: "#f0f0fa", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#f0f0fa" }}
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartSection>

          {/* Stage funnel */}
          <ChartSection sectionLabel="Pipeline Funnel">
            <StageFunnel data={funnelData} />
          </ChartSection>

          {/* Source bar */}
          <ChartSection sectionLabel="Applications by Source Channel">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={sourceData}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                barSize={1}
              >
                <CartesianGrid horizontal={false} stroke={GRID_STROKE} />
                <XAxis
                  type="number"
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="source"
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                  width={110}
                />
                <Tooltip content={<CinematicTooltip />} />
                <Bar
                  dataKey="count"
                  name="Applications"
                  fill="rgba(240,240,250,0.7)"
                  radius={[0, 2, 2, 0]}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartSection>

          {/* Job type donut */}
          <ChartSection sectionLabel="Work Arrangement Distribution">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={jobTypeData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  animationDuration={800}
                >
                  {jobTypeData.map((_entry, index) => (
                    <Cell
                      key={`cell-${_entry.name}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CinematicTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={6}
                  formatter={(value: string) => (
                    <span
                      style={{
                        fontSize: 10,
                        color: "rgba(240,240,250,0.5)",
                        fontFamily: "'Space Grotesk',sans-serif",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "1.17px",
                      }}
                    >
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartSection>
        </div>

        {/* AI Insights — text directly on photography */}
        <div
          style={{
            borderTop: "1px solid rgba(240,240,250,0.1)",
            paddingTop: "4rem",
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1.17px",
              color: "rgba(240,240,250,0.35)",
              marginBottom: "3rem",
            }}
          >
            Intelligence — AI Analysis
          </p>
          <AiInsightsPanel
            insights={insights}
            recommendations={recommendations}
            isLoading={insightsLoading}
            data-ocid="ai-insights-panel"
          />
        </div>
      </div>
    </div>
  );
}
