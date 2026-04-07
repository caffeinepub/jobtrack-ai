import type {
  AddApplicationArgs as BackendAddApplicationArgs,
  AiInsight as BackendAiInsight,
  Application as BackendApplication,
  ApplicationStatus as BackendStatus,
  UpdateApplicationArgs as BackendUpdateApplicationArgs,
} from "@/backend";
import { JobType as BackendJobType, createActor } from "@/backend";
import type {
  AddApplicationArgs,
  AiInsight,
  AnalyticsResult,
  Application,
  ApplicationStatus,
  GetApplicationsArgs,
  GetApplicationsResult,
  ParsedJobDetails,
  UpdateApplicationArgs,
} from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ── Timestamp helpers ──────────────────────────────────────────────────────────
const NS_PER_MS = BigInt(1_000_000);

function tsToIso(ts: bigint): string {
  return new Date(Number(ts / NS_PER_MS)).toISOString();
}

function nowTs(): bigint {
  return BigInt(Date.now()) * NS_PER_MS;
}

// ── Salary formatting helpers ──────────────────────────────────────────────────
function formatSalary(min?: bigint, max?: bigint): string | undefined {
  if (!min && !max) return undefined;
  const fmt = (n: bigint) => `$${(Number(n) / 1000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  if (max) return `Up to ${fmt(max)}`;
  return undefined;
}

// ── Type converters ────────────────────────────────────────────────────────────
function toFrontendApp(b: BackendApplication): Application {
  return {
    id: String(b.id),
    company: b.companyName,
    jobTitle: b.position,
    location: b.location,
    jobType: b.jobType as Application["jobType"],
    source: b.source as Application["source"],
    status: b.status as Application["status"],
    salary: formatSalary(b.salaryMin, b.salaryMax),
    url: b.jobUrl || undefined,
    notes: b.notes || undefined,
    tags: b.tags,
    appliedAt: tsToIso(b.appliedDate),
    updatedAt: tsToIso(b.lastUpdated),
    fitScore: b.fitScore !== undefined ? Number(b.fitScore) : undefined,
    fitScoreConfidence:
      b.fitScoreConfidence !== undefined
        ? Number(b.fitScoreConfidence)
        : undefined,
    remote: b.jobType === BackendJobType.remote,
    isHighPotential: b.isHighPotential,
    aiSuggestion: b.aiSuggestion,
  };
}

function toFrontendInsight(b: BackendAiInsight, idx: number): AiInsight {
  const cat = b.category.toLowerCase();
  const type: AiInsight["type"] = cat.includes("warn")
    ? "warning"
    : cat.includes("opp")
      ? "opportunity"
      : "tip";
  return {
    id: String(idx),
    type,
    title: b.category,
    message: b.message,
  };
}

// ── React Query hooks ─────────────────────────────────────────────────────────

export function useApplications(args?: GetApplicationsArgs) {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<GetApplicationsResult>({
    queryKey: ["applications", args],
    queryFn: async () => {
      if (!actor) return { applications: [], total: 0 };
      const result = await actor.getApplications({
        page: args?.page ?? BigInt(1),
        pageSize: args?.pageSize ?? BigInt(100),
        statusFilter: args?.statusFilter as BackendStatus | undefined,
      });
      return {
        applications: result.applications.map(toFrontendApp),
        total: Number(result.total),
      };
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useApplication(id: string) {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<Application | null>({
    queryKey: ["application", id],
    queryFn: async () => {
      if (!actor || !id) return null;
      const result = await actor.getApplication(BigInt(id));
      return result ? toFrontendApp(result) : null;
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useAnalytics() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<AnalyticsResult>({
    queryKey: ["analytics"],
    queryFn: async () => {
      if (!actor)
        return {
          totalApplications: 0,
          byStatus: {
            Applied: 0,
            Interviewing: 0,
            Offer: 0,
            Rejected: 0,
            Archived: 0,
          },
          bySource: {},
          byMonth: [],
          responseRate: 0,
          avgTimeToResponse: 0,
          topCompanies: [],
        };

      // Use a wide date range covering all apps
      const now = nowTs();
      const fiveYearsAgo = now - BigInt(5 * 365 * 24 * 3_600_000) * NS_PER_MS;
      const raw = await actor.getAnalytics({
        fromDate: fiveYearsAgo,
        toDate: now,
      });

      const byStatus: AnalyticsResult["byStatus"] = {
        Applied: 0,
        Interviewing: 0,
        Offer: 0,
        Rejected: 0,
        Archived: 0,
      };

      const bySource: Record<string, number> = {};
      for (const s of raw.bySource) {
        bySource[String(s.source)] = Number(s.count);
      }

      const byMonth = raw.overTime.map((o) => ({
        month: new Date(Number(o.date / NS_PER_MS)).toLocaleDateString(
          "en-US",
          { month: "short" },
        ),
        count: Number(o.count),
      }));

      return {
        totalApplications: Number(raw.total),
        byStatus,
        bySource,
        byMonth,
        responseRate: raw.responseRate,
        avgTimeToResponse: raw.avgTimeToOffer,
        topCompanies: [],
      };
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useInsights() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<AiInsight[]>({
    queryKey: ["insights"],
    queryFn: async () => {
      if (!actor) return [];
      const raw = await actor.getInsights();
      return raw.map(toFrontendInsight);
    },
    enabled: !!actor && !isFetching,
    staleTime: 120_000,
  });
}

export function useAddApplication() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();

  return useMutation<Application, Error, AddApplicationArgs>({
    mutationFn: async (args) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.addApplication(
        args as unknown as BackendAddApplicationArgs,
      );
      return toFrontendApp(result);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Application added successfully");
    },
    onError: () => {
      toast.error("Failed to add application");
    },
  });
}

export function useUpdateApplication() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();

  return useMutation<Application | null, Error, UpdateApplicationArgs>({
    mutationFn: async (args) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.updateApplication(
        args as unknown as BackendUpdateApplicationArgs,
      );
      return result ? toFrontendApp(result) : null;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Application updated");
    },
    onError: () => {
      toast.error("Failed to update application");
    },
  });
}

export function useDeleteApplication() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteApplication(BigInt(id));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Application deleted");
    },
    onError: () => {
      toast.error("Failed to delete application");
    },
  });
}

export function useUpdateApplicationStatus() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();

  return useMutation<void, Error, { id: string; status: ApplicationStatus }>({
    mutationFn: async ({ id, status }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateApplicationStatus(BigInt(id), status as BackendStatus);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Status updated");
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });
}

export function useParseJobUrl() {
  const { actor } = useActor(createActor);

  return useMutation<ParsedJobDetails, Error, string>({
    mutationFn: async (url) => {
      if (!actor) throw new Error("Not connected");
      const raw = await actor.parseJobUrl(url);
      return {
        companyName: raw.companyName,
        position: raw.position,
        location: raw.location,
        jobType: raw.jobType as ParsedJobDetails["jobType"],
        salary: formatSalary(raw.salaryMin, raw.salaryMax),
        salaryMin: raw.salaryMin,
        salaryMax: raw.salaryMax,
        fitScore: raw.fitScore !== undefined ? Number(raw.fitScore) : undefined,
        fitScoreConfidence:
          raw.fitScoreConfidence !== undefined
            ? Number(raw.fitScoreConfidence)
            : undefined,
        tags: raw.tags,
        notes: raw.notes,
        rawJson: raw.rawJson,
      };
    },
    onError: () => {
      toast.error("Failed to parse job URL");
    },
  });
}

export function useInitSampleData() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();

  return useMutation<bigint, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.initSampleData();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: () => {
      toast.error("Failed to initialize sample data");
    },
  });
}
