import { AiInsightsPanel } from "@/components/AiInsightsPanel";
import { MetricCard } from "@/components/MetricCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAnalytics,
  useApplications,
  useInsights,
} from "@/hooks/useApplications";
import { cn } from "@/lib/utils";
import type { Application } from "@/types";
import { Download } from "lucide-react";
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

// ── Date range helpers ────────────────────────────────────────────────────────
type Range = "7d" | "30d" | "90d" | "all";

const RANGE_LABELS: Record<Range, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
  all: "All Time",
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

// ── Chart colors ──────────────────────────────────────────────────────────────
const CHART_COLORS = [
  "oklch(0.5 0.18 265)",
  "oklch(0.65 0.16 195)",
  "oklch(0.6 0.15 150)",
  "oklch(0.55 0.16 85)",
  "oklch(0.5 0.14 25)",
];

// ── Custom tooltip ────────────────────────────────────────────────────────────
interface TooltipPayload {
  value: number;
  name: string;
}

const CustomTooltip = ({
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
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-md text-sm">
      {label && <p className="font-semibold text-foreground mb-1">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="text-muted-foreground">
          {p.name}:{" "}
          <span className="font-semibold text-foreground tabular-nums">
            {p.value}
          </span>
        </p>
      ))}
    </div>
  );
};

// ── Chart card ────────────────────────────────────────────────────────────────
function ChartCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl p-5 overflow-hidden",
        className,
      )}
    >
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-0.5 mb-4">{subtitle}</p>
      )}
      {!subtitle && <div className="mt-4" />}
      {children}
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

  // Timeline chart
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

  // Source chart
  const sourceData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of filtered) {
      counts[a.source] = (counts[a.source] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([source, count]) => ({ source, count }));
  }, [filtered]);

  // Job type donut
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

  // Stage funnel
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
    "Follow up on open Interview-stage applications within 7 days to stay top of mind.",
    "Prioritize remote-first companies — 50% of your pipeline is remote with strong conversion.",
  ];

  return (
    <div className="p-6 md:p-8 max-w-screen-2xl mx-auto space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track your job search performance and surface strategic insights
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Date range pills */}
          <div
            data-ocid="analytics-date-range"
            className="flex items-center bg-muted/50 border border-border rounded-full p-1 gap-0.5"
          >
            {(Object.keys(RANGE_LABELS) as Range[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-smooth",
                  range === r
                    ? "bg-card text-foreground shadow-sm border border-border/60"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {RANGE_LABELS[r]}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => exportCsv(filtered)}
            className="gap-2"
            data-ocid="analytics-export-csv"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI row */}
      {analyticsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }, (_, i) => i).map((i) => (
            <Skeleton key={`skeleton-${i}`} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <MetricCard
            label="Total Applications"
            value={total}
            trend="up"
            trendValue="Active pipeline"
            colorClass="bg-primary"
            data-ocid="metric-total"
          />
          <MetricCard
            label="Interview Rate"
            value={interviewRate}
            unit="%"
            trend={interviewRate >= 30 ? "up" : "neutral"}
            trendValue={
              interviewRate >= 30 ? "Above average" : "Building pipeline"
            }
            colorClass="bg-[oklch(0.65_0.16_195)]"
            data-ocid="metric-interview-rate"
          />
          <MetricCard
            label="Offer Rate"
            value={offerRate}
            unit="%"
            trend={offerRate >= 10 ? "up" : "neutral"}
            trendValue={offerRate >= 10 ? "Strong conversion" : "In progress"}
            colorClass="bg-[oklch(0.6_0.15_150)]"
            data-ocid="metric-offer-rate"
          />
          <MetricCard
            label="Avg Days to Offer"
            value={avgTimeToOffer}
            unit="days"
            trend="neutral"
            trendValue="Time to response"
            colorClass="bg-[oklch(0.55_0.16_85)]"
            data-ocid="metric-avg-time"
          />
          <MetricCard
            label="Response Rate"
            value={responseRate}
            unit="%"
            trend={responseRate >= 50 ? "up" : "down"}
            trendValue={responseRate >= 50 ? "Healthy rate" : "Needs attention"}
            colorClass="bg-[oklch(0.5_0.14_25)]"
            data-ocid="metric-response-rate"
          />
        </div>
      )}

      {/* Charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* Trend line — spans 2 cols */}
        <div className="md:col-span-2">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Activity
          </p>
          <ChartCard
            title="Application Trend"
            subtitle="Applications submitted over time"
          >
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={timelineData}
                margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.88 0.008 250 / 0.5)"
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "oklch(0.52 0.012 250)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "oklch(0.52 0.012 250)" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Applications"
                  stroke={CHART_COLORS[0]}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: CHART_COLORS[0], strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: CHART_COLORS[0] }}
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Stage funnel */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Pipeline
          </p>
          <ChartCard
            title="Stage Funnel"
            subtitle="Applied → Interview → Offer conversion"
          >
            <div className="space-y-4 mt-2">
              {funnelData.map((stage, i) => (
                <div
                  key={stage.stage}
                  data-ocid={`funnel-stage-${stage.stage.toLowerCase()}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-foreground">
                      {stage.stage}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {stage.pct}%
                      </span>
                      <span className="text-xs font-bold text-foreground tabular-nums w-5 text-right">
                        {stage.count}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${stage.pct}%`,
                        backgroundColor: CHART_COLORS[i],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* By source — horizontal bar */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Sources
          </p>
          <ChartCard title="By Source" subtitle="Applications per channel">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={sourceData}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                barSize={12}
              >
                <CartesianGrid
                  horizontal={false}
                  stroke="oklch(0.88 0.008 250 / 0.5)"
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "oklch(0.52 0.012 250)" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="source"
                  tick={{ fontSize: 11, fill: "oklch(0.52 0.012 250)" }}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  name="Applications"
                  fill={CHART_COLORS[1]}
                  radius={[0, 6, 6, 0]}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* By job type — donut */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Work Type
          </p>
          <ChartCard
            title="Remote vs. Onsite"
            subtitle="Distribution across work arrangements"
          >
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={jobTypeData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
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
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span
                      style={{
                        fontSize: 11,
                        color: "oklch(0.52 0.012 250)",
                      }}
                    >
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* AI Insights */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Intelligence
        </p>
        <AiInsightsPanel
          insights={insights}
          recommendations={recommendations}
          isLoading={insightsLoading}
          data-ocid="ai-insights-panel"
        />
      </div>
    </div>
  );
}
