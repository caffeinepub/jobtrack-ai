import type {
  AddApplicationArgs as BackendAddApplicationArgs,
  AiInsight as BackendAiInsight,
  Application as BackendApplication,
  ApplicationStatus as BackendStatus,
  UpdateApplicationArgs as BackendUpdateApplicationArgs,
} from "@/backend";
import {
  ApplicationSource as BackendApplicationSource,
  ApplicationStatus as BackendApplicationStatus,
  JobType as BackendJobType,
  createActor,
} from "@/backend";
import { useBackendContext } from "@/contexts/BackendContext";
import type { GrokModel } from "@/store/useAppStore";
import { useAppStore } from "@/store/useAppStore";
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

// ── Build backend-compatible AddApplicationArgs from frontend type ─────────────
function toBackendArgs(args: AddApplicationArgs): BackendAddApplicationArgs {
  return {
    companyName: args.companyName,
    position: args.position,
    location: args.location,
    jobType: args.jobType as BackendAddApplicationArgs["jobType"],
    source: args.source as BackendAddApplicationArgs["source"],
    status: args.status as BackendAddApplicationArgs["status"],
    jobUrl: args.jobUrl,
    notes: args.notes,
    tags: args.tags,
    isHighPotential: args.isHighPotential,
    appliedDate: args.appliedDate,
    fitScore: args.fitScore,
    fitScoreConfidence: args.fitScoreConfidence,
    aiSuggestion: args.aiSuggestion,
    salaryMin: args.salaryMin,
    salaryMax: args.salaryMax,
  };
}

// ── Build backend-compatible UpdateApplicationArgs from frontend type ──────────
// Explicit enum mapping ensures Candid variant serialization works correctly.
function toBackendUpdateArgs(
  args: UpdateApplicationArgs,
): BackendUpdateApplicationArgs {
  const jobTypeMap: Record<string, BackendUpdateApplicationArgs["jobType"]> = {
    remote: BackendJobType.remote,
    hybrid: BackendJobType.hybrid,
    onsite: BackendJobType.onsite,
  };
  const sourceMap: Record<string, BackendUpdateApplicationArgs["source"]> = {
    direct: BackendApplicationSource.direct,
    job_board: BackendApplicationSource.job_board,
    referral: BackendApplicationSource.referral,
    recruiter: BackendApplicationSource.recruiter,
    network: BackendApplicationSource.network,
  };
  const statusMap: Record<string, BackendUpdateApplicationArgs["status"]> = {
    Applied: BackendApplicationStatus.Applied,
    Interviewing: BackendApplicationStatus.Interviewing,
    Offer: BackendApplicationStatus.Offer,
    Rejected: BackendApplicationStatus.Rejected,
    Archived: BackendApplicationStatus.Archived,
  };
  return {
    id: args.id,
    companyName: args.companyName,
    position: args.position,
    location: args.location,
    jobType: jobTypeMap[args.jobType] ?? BackendJobType.remote,
    source: sourceMap[args.source] ?? BackendApplicationSource.direct,
    status: statusMap[args.status] ?? BackendApplicationStatus.Applied,
    jobUrl: args.jobUrl,
    notes: args.notes,
    tags: args.tags,
    isHighPotential: args.isHighPotential,
    appliedDate: args.appliedDate,
    fitScore: args.fitScore,
    fitScoreConfidence: args.fitScoreConfidence,
    aiSuggestion: args.aiSuggestion,
    salaryMin: args.salaryMin,
    salaryMax: args.salaryMax,
  };
}

export function useAddApplication() {
  const { waitForActor } = useBackendContext();
  const qc = useQueryClient();

  return useMutation<Application, Error, AddApplicationArgs>({
    mutationFn: async (args) => {
      const actor = await waitForActor();
      const backendArgs = toBackendArgs(args);
      const result = await actor.addApplication(backendArgs);
      return toFrontendApp(result);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
    onError: (error) => {
      console.error("[JobTrack] addApplication failed:", error);
      toast.error("Failed to add application");
    },
  });
}

export function useUpdateApplication() {
  const { waitForActor } = useBackendContext();
  const qc = useQueryClient();

  return useMutation<Application | null, Error, UpdateApplicationArgs>({
    mutationFn: async (args) => {
      const actor = await waitForActor();
      const result = await actor.updateApplication(toBackendUpdateArgs(args));
      return result ? toFrontendApp(result) : null;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Application updated");
    },
    onError: (error) => {
      console.error("[JobTrack] updateApplication failed:", error);
      toast.error("Failed to update application");
    },
  });
}

export function useDeleteApplication() {
  const { waitForActor } = useBackendContext();
  const qc = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationFn: async (id) => {
      const actor = await waitForActor();
      return actor.deleteApplication(BigInt(id));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Application deleted");
    },
    onError: (error) => {
      console.error("[JobTrack] deleteApplication failed:", error);
      toast.error("Failed to delete application");
    },
  });
}

export function useUpdateApplicationStatus() {
  const { waitForActor } = useBackendContext();
  const qc = useQueryClient();

  return useMutation<void, Error, { id: string; status: ApplicationStatus }>({
    mutationFn: async ({ id, status }) => {
      const actor = await waitForActor();
      await actor.updateApplicationStatus(BigInt(id), status as BackendStatus);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Status updated");
    },
    onError: (error) => {
      console.error("[JobTrack] updateApplicationStatus failed:", error);
      toast.error("Failed to update status");
    },
  });
}

export function useParseJobUrl() {
  const { waitForActor } = useBackendContext();

  return useMutation<ParsedJobDetails, Error, string>({
    mutationFn: async (url) => {
      const actor = await waitForActor();
      let raw: Awaited<ReturnType<typeof actor.parseJobUrl>>;
      try {
        raw = await actor.parseJobUrl(url);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Unknown error from AI service";
        console.error("[JobTrack] parseJobUrl error:", err);
        // Surface meaningful errors: missing API key, model errors, etc.
        if (
          msg.toLowerCase().includes("api key") ||
          msg.toLowerCase().includes("grok")
        ) {
          throw new Error(
            "Grok API key missing or invalid. Go to Settings to add your key.",
          );
        }
        if (
          msg.toLowerCase().includes("parse") ||
          msg.toLowerCase().includes("json")
        ) {
          throw new Error(
            "AI could not parse this job posting. Try a different URL.",
          );
        }
        throw new Error(msg);
      }

      // Validate that we got meaningful data back
      if (!raw.companyName && !raw.position) {
        throw new Error(
          "AI returned no job details. Check your API key in Settings.",
        );
      }

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
    onError: (err) => {
      console.error("[JobTrack] parseJobUrl failed:", err);
      toast.error(err.message ?? "Failed to parse job URL");
    },
  });
}

// ── Combined parse-and-add hook (single actor ref, single mutation) ───────────
// Both parse and add run inside one mutationFn using the same live actor
// obtained from waitForActor() — no race condition possible.

export interface ParseAndAddResult {
  parsed: ParsedJobDetails;
  app: Application;
}

export function useParseAndAdd() {
  const { waitForActor } = useBackendContext();
  const qc = useQueryClient();

  return useMutation<ParseAndAddResult, Error, string>({
    mutationFn: async (url) => {
      // waitForActor() retries for up to 5 s — handles transient null during init
      const actor = await waitForActor();

      // ── Step 1: parse the URL ──────────────────────────────────────────
      let raw: Awaited<ReturnType<typeof actor.parseJobUrl>>;
      try {
        raw = await actor.parseJobUrl(url);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Unknown error from AI service";
        console.error("[JobTrack] parseJobUrl error:", err);
        if (
          msg.toLowerCase().includes("api key") ||
          msg.toLowerCase().includes("grok")
        ) {
          throw new Error(
            "Grok API key missing or invalid. Go to Settings to add your key.",
          );
        }
        if (
          msg.toLowerCase().includes("parse") ||
          msg.toLowerCase().includes("json")
        ) {
          throw new Error(
            "AI could not parse this job posting. Try a different URL.",
          );
        }
        throw new Error(msg);
      }

      if (!raw.companyName && !raw.position) {
        throw new Error(
          "AI returned no job details. Check your API key in Settings.",
        );
      }

      const parsed: ParsedJobDetails = {
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

      // ── Step 2: add to pipeline using the SAME actor from waitForActor ─
      // No second actor lookup — guaranteed same live connection.
      const addArgs: BackendAddApplicationArgs = {
        companyName: parsed.companyName ?? "Unknown Company",
        position: parsed.position ?? "Unknown Position",
        location: parsed.location ?? "",
        jobType: (parsed.jobType ??
          "remote") as BackendAddApplicationArgs["jobType"],
        source: "direct" as BackendAddApplicationArgs["source"],
        status: "Applied" as BackendAddApplicationArgs["status"],
        jobUrl: url,
        notes: parsed.notes ?? "",
        tags: parsed.tags ?? [],
        isHighPotential: (parsed.fitScore ?? 0) >= 80,
        appliedDate: BigInt(Date.now()) * NS_PER_MS,
        fitScore:
          parsed.fitScore !== undefined ? BigInt(parsed.fitScore) : undefined,
        fitScoreConfidence:
          parsed.fitScoreConfidence !== undefined
            ? BigInt(parsed.fitScoreConfidence)
            : undefined,
        salaryMin: raw.salaryMin,
        salaryMax: raw.salaryMax,
        aiSuggestion: parsed.notes || undefined,
      };

      let app: Application;
      try {
        const result = await actor.addApplication(addArgs);
        app = toFrontendApp(result);
      } catch (err) {
        console.error("[JobTrack] addApplication error:", err);
        throw new Error(
          err instanceof Error ? err.message : "Failed to save to pipeline",
        );
      }

      return { parsed, app };
    },
    onSuccess: (_data) => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
    onError: (error) => {
      console.error("[JobTrack] parseAndAdd failed:", error);
    },
  });
}

export function useInitSampleData() {
  const { waitForActor } = useBackendContext();
  const qc = useQueryClient();

  return useMutation<bigint, Error, void>({
    mutationFn: async () => {
      const actor = await waitForActor();
      return actor.initSampleData();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (error) => {
      console.error("[JobTrack] initSampleData failed:", error);
      toast.error("Failed to initialize sample data");
    },
  });
}

// ── Grok API Key hooks ────────────────────────────────────────────────────────

export function useGetGrokApiKey() {
  const { actor, isFetching } = useActor(createActor);
  const localKey = useAppStore((s) => s.grokApiKey);

  const query = useQuery<string | null>({
    queryKey: ["grokApiKey"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getGrokApiKey();
    },
    enabled: !!actor && !isFetching,
    staleTime: 300_000,
  });

  // Prefer backend data; fall back to local Zustand store
  return { data: query.data ?? localKey ?? null, isLoading: query.isLoading };
}

export function useSetGrokApiKey() {
  const { waitForActor } = useBackendContext();
  const { setGrokApiKey, clearGrokApiKey } = useAppStore();
  const qc = useQueryClient();

  const saveMutation = useMutation<void, Error, string>({
    mutationFn: async (key: string) => {
      // Persist locally immediately
      setGrokApiKey(key);
      // Also persist to backend so parseJobUrl can use it
      const actor = await waitForActor();
      await actor.setGrokApiKey(key);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grokApiKey"] });
      toast.success("Grok API key saved");
    },
    onError: (error) => {
      console.error("[JobTrack] setGrokApiKey failed:", error);
      toast.error("Failed to save Grok API key");
    },
  });

  const clearMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      clearGrokApiKey();
      const actor = await waitForActor();
      await actor.setGrokApiKey("");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grokApiKey"] });
      toast.success("Grok API key cleared");
    },
    onError: (error) => {
      console.error("[JobTrack] clearGrokApiKey failed:", error);
      toast.error("Failed to clear API key");
    },
  });

  return { saveMutation, clearMutation };
}

// ── Grok Model hooks ─────────────────────────────────────────────────────────

export function useGetGrokModel() {
  const { actor, isFetching } = useActor(createActor);
  const localModel = useAppStore((s) => s.grokModel);

  const query = useQuery<GrokModel | null>({
    queryKey: ["grokModel"],
    queryFn: async () => {
      if (!actor) return null;
      const result = await actor.getGrokModel();
      return (result as GrokModel | null) ?? null;
    },
    enabled: !!actor && !isFetching,
    staleTime: 300_000,
  });

  // Prefer backend data; fall back to local Zustand store
  return { data: query.data ?? localModel, isLoading: query.isLoading };
}

export function useSetGrokModel() {
  const { waitForActor } = useBackendContext();
  const { setGrokModel } = useAppStore();
  const qc = useQueryClient();

  return useMutation<void, Error, GrokModel>({
    mutationFn: async (model: GrokModel) => {
      // Persist locally immediately
      setGrokModel(model);
      // Also persist to backend so parseJobUrl can use it
      const actor = await waitForActor();
      await actor.setGrokModel(model);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grokModel"] });
      toast.success("Model preference saved");
    },
    onError: (error) => {
      console.error("[JobTrack] setGrokModel failed:", error);
      toast.error("Failed to save model preference");
    },
  });
}
