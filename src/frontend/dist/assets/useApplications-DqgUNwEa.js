var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _client, _currentResult, _currentMutation, _mutateOptions, _MutationObserver_instances, updateResult_fn, notify_fn, _a;
import { v as Subscribable, w as shallowEqualObjects, x as hashKey, y as getDefaultState, z as notifyManager, A as useQueryClient, r as reactExports, B as noop, C as shouldThrowError, D as useBackendContext, E as useActor, F as useQuery, g as useAppStore, a as ue, J as JobType, G as createActor } from "./index-D_-LeGnM.js";
var MutationObserver = (_a = class extends Subscribable {
  constructor(client, options) {
    super();
    __privateAdd(this, _MutationObserver_instances);
    __privateAdd(this, _client);
    __privateAdd(this, _currentResult);
    __privateAdd(this, _currentMutation);
    __privateAdd(this, _mutateOptions);
    __privateSet(this, _client, client);
    this.setOptions(options);
    this.bindMethods();
    __privateMethod(this, _MutationObserver_instances, updateResult_fn).call(this);
  }
  bindMethods() {
    this.mutate = this.mutate.bind(this);
    this.reset = this.reset.bind(this);
  }
  setOptions(options) {
    var _a2;
    const prevOptions = this.options;
    this.options = __privateGet(this, _client).defaultMutationOptions(options);
    if (!shallowEqualObjects(this.options, prevOptions)) {
      __privateGet(this, _client).getMutationCache().notify({
        type: "observerOptionsUpdated",
        mutation: __privateGet(this, _currentMutation),
        observer: this
      });
    }
    if ((prevOptions == null ? void 0 : prevOptions.mutationKey) && this.options.mutationKey && hashKey(prevOptions.mutationKey) !== hashKey(this.options.mutationKey)) {
      this.reset();
    } else if (((_a2 = __privateGet(this, _currentMutation)) == null ? void 0 : _a2.state.status) === "pending") {
      __privateGet(this, _currentMutation).setOptions(this.options);
    }
  }
  onUnsubscribe() {
    var _a2;
    if (!this.hasListeners()) {
      (_a2 = __privateGet(this, _currentMutation)) == null ? void 0 : _a2.removeObserver(this);
    }
  }
  onMutationUpdate(action) {
    __privateMethod(this, _MutationObserver_instances, updateResult_fn).call(this);
    __privateMethod(this, _MutationObserver_instances, notify_fn).call(this, action);
  }
  getCurrentResult() {
    return __privateGet(this, _currentResult);
  }
  reset() {
    var _a2;
    (_a2 = __privateGet(this, _currentMutation)) == null ? void 0 : _a2.removeObserver(this);
    __privateSet(this, _currentMutation, void 0);
    __privateMethod(this, _MutationObserver_instances, updateResult_fn).call(this);
    __privateMethod(this, _MutationObserver_instances, notify_fn).call(this);
  }
  mutate(variables, options) {
    var _a2;
    __privateSet(this, _mutateOptions, options);
    (_a2 = __privateGet(this, _currentMutation)) == null ? void 0 : _a2.removeObserver(this);
    __privateSet(this, _currentMutation, __privateGet(this, _client).getMutationCache().build(__privateGet(this, _client), this.options));
    __privateGet(this, _currentMutation).addObserver(this);
    return __privateGet(this, _currentMutation).execute(variables);
  }
}, _client = new WeakMap(), _currentResult = new WeakMap(), _currentMutation = new WeakMap(), _mutateOptions = new WeakMap(), _MutationObserver_instances = new WeakSet(), updateResult_fn = function() {
  var _a2;
  const state = ((_a2 = __privateGet(this, _currentMutation)) == null ? void 0 : _a2.state) ?? getDefaultState();
  __privateSet(this, _currentResult, {
    ...state,
    isPending: state.status === "pending",
    isSuccess: state.status === "success",
    isError: state.status === "error",
    isIdle: state.status === "idle",
    mutate: this.mutate,
    reset: this.reset
  });
}, notify_fn = function(action) {
  notifyManager.batch(() => {
    var _a2, _b, _c, _d, _e, _f, _g, _h;
    if (__privateGet(this, _mutateOptions) && this.hasListeners()) {
      const variables = __privateGet(this, _currentResult).variables;
      const onMutateResult = __privateGet(this, _currentResult).context;
      const context = {
        client: __privateGet(this, _client),
        meta: this.options.meta,
        mutationKey: this.options.mutationKey
      };
      if ((action == null ? void 0 : action.type) === "success") {
        try {
          (_b = (_a2 = __privateGet(this, _mutateOptions)).onSuccess) == null ? void 0 : _b.call(
            _a2,
            action.data,
            variables,
            onMutateResult,
            context
          );
        } catch (e) {
          void Promise.reject(e);
        }
        try {
          (_d = (_c = __privateGet(this, _mutateOptions)).onSettled) == null ? void 0 : _d.call(
            _c,
            action.data,
            null,
            variables,
            onMutateResult,
            context
          );
        } catch (e) {
          void Promise.reject(e);
        }
      } else if ((action == null ? void 0 : action.type) === "error") {
        try {
          (_f = (_e = __privateGet(this, _mutateOptions)).onError) == null ? void 0 : _f.call(
            _e,
            action.error,
            variables,
            onMutateResult,
            context
          );
        } catch (e) {
          void Promise.reject(e);
        }
        try {
          (_h = (_g = __privateGet(this, _mutateOptions)).onSettled) == null ? void 0 : _h.call(
            _g,
            void 0,
            action.error,
            variables,
            onMutateResult,
            context
          );
        } catch (e) {
          void Promise.reject(e);
        }
      }
    }
    this.listeners.forEach((listener) => {
      listener(__privateGet(this, _currentResult));
    });
  });
}, _a);
function useMutation(options, queryClient) {
  const client = useQueryClient();
  const [observer] = reactExports.useState(
    () => new MutationObserver(
      client,
      options
    )
  );
  reactExports.useEffect(() => {
    observer.setOptions(options);
  }, [observer, options]);
  const result = reactExports.useSyncExternalStore(
    reactExports.useCallback(
      (onStoreChange) => observer.subscribe(notifyManager.batchCalls(onStoreChange)),
      [observer]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );
  const mutate = reactExports.useCallback(
    (variables, mutateOptions) => {
      observer.mutate(variables, mutateOptions).catch(noop);
    },
    [observer]
  );
  if (result.error && shouldThrowError(observer.options.throwOnError, [result.error])) {
    throw result.error;
  }
  return { ...result, mutate, mutateAsync: result.mutate };
}
const NS_PER_MS = BigInt(1e6);
function tsToIso(ts) {
  return new Date(Number(ts / NS_PER_MS)).toISOString();
}
function nowTs() {
  return BigInt(Date.now()) * NS_PER_MS;
}
function formatSalary(min, max) {
  if (!min && !max) return void 0;
  const fmt = (n) => `$${(Number(n) / 1e3).toFixed(0)}k`;
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  if (max) return `Up to ${fmt(max)}`;
  return void 0;
}
function toFrontendApp(b) {
  return {
    id: String(b.id),
    company: b.companyName,
    jobTitle: b.position,
    location: b.location,
    jobType: b.jobType,
    source: b.source,
    status: b.status,
    salary: formatSalary(b.salaryMin, b.salaryMax),
    url: b.jobUrl || void 0,
    notes: b.notes || void 0,
    tags: b.tags,
    appliedAt: tsToIso(b.appliedDate),
    updatedAt: tsToIso(b.lastUpdated),
    fitScore: b.fitScore !== void 0 ? Number(b.fitScore) : void 0,
    fitScoreConfidence: b.fitScoreConfidence !== void 0 ? Number(b.fitScoreConfidence) : void 0,
    remote: b.jobType === JobType.remote,
    isHighPotential: b.isHighPotential,
    aiSuggestion: b.aiSuggestion
  };
}
function toFrontendInsight(b, idx) {
  const cat = b.category.toLowerCase();
  const type = cat.includes("warn") ? "warning" : cat.includes("opp") ? "opportunity" : "tip";
  return {
    id: String(idx),
    type,
    title: b.category,
    message: b.message
  };
}
function useApplications(args) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["applications", args],
    queryFn: async () => {
      if (!actor) return { applications: [], total: 0 };
      const result = await actor.getApplications({
        page: (args == null ? void 0 : args.page) ?? BigInt(1),
        pageSize: (args == null ? void 0 : args.pageSize) ?? BigInt(100),
        statusFilter: args == null ? void 0 : args.statusFilter
      });
      return {
        applications: result.applications.map(toFrontendApp),
        total: Number(result.total)
      };
    },
    enabled: !!actor && !isFetching,
    staleTime: 3e4
  });
}
function useAnalytics() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
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
            Archived: 0
          },
          bySource: {},
          byMonth: [],
          responseRate: 0,
          avgTimeToResponse: 0,
          topCompanies: []
        };
      const now = nowTs();
      const fiveYearsAgo = now - BigInt(5 * 365 * 24 * 36e5) * NS_PER_MS;
      const raw = await actor.getAnalytics({
        fromDate: fiveYearsAgo,
        toDate: now
      });
      const byStatus = {
        Applied: 0,
        Interviewing: 0,
        Offer: 0,
        Rejected: 0,
        Archived: 0
      };
      const bySource = {};
      for (const s of raw.bySource) {
        bySource[String(s.source)] = Number(s.count);
      }
      const byMonth = raw.overTime.map((o) => ({
        month: new Date(Number(o.date / NS_PER_MS)).toLocaleDateString(
          "en-US",
          { month: "short" }
        ),
        count: Number(o.count)
      }));
      return {
        totalApplications: Number(raw.total),
        byStatus,
        bySource,
        byMonth,
        responseRate: raw.responseRate,
        avgTimeToResponse: raw.avgTimeToOffer,
        topCompanies: []
      };
    },
    enabled: !!actor && !isFetching,
    staleTime: 6e4
  });
}
function useInsights() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["insights"],
    queryFn: async () => {
      if (!actor) return [];
      const raw = await actor.getInsights();
      return raw.map(toFrontendInsight);
    },
    enabled: !!actor && !isFetching,
    staleTime: 12e4
  });
}
function toBackendArgs(args) {
  return {
    companyName: args.companyName,
    position: args.position,
    location: args.location,
    jobType: args.jobType,
    source: args.source,
    status: args.status,
    jobUrl: args.jobUrl,
    notes: args.notes,
    tags: args.tags,
    isHighPotential: args.isHighPotential,
    appliedDate: args.appliedDate,
    fitScore: args.fitScore,
    fitScoreConfidence: args.fitScoreConfidence,
    aiSuggestion: args.aiSuggestion,
    salaryMin: args.salaryMin,
    salaryMax: args.salaryMax
  };
}
function useAddApplication() {
  const { waitForActor } = useBackendContext();
  const qc = useQueryClient();
  return useMutation({
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
      ue.error("Failed to add application");
    }
  });
}
function useDeleteApplication() {
  const { waitForActor } = useBackendContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const actor = await waitForActor();
      return actor.deleteApplication(BigInt(id));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
      ue.success("Application deleted");
    },
    onError: (error) => {
      console.error("[JobTrack] deleteApplication failed:", error);
      ue.error("Failed to delete application");
    }
  });
}
function useUpdateApplicationStatus() {
  const { waitForActor } = useBackendContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const actor = await waitForActor();
      await actor.updateApplicationStatus(BigInt(id), status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      ue.success("Status updated");
    },
    onError: (error) => {
      console.error("[JobTrack] updateApplicationStatus failed:", error);
      ue.error("Failed to update status");
    }
  });
}
function useParseAndAdd() {
  const { waitForActor } = useBackendContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (url) => {
      const actor = await waitForActor();
      let raw;
      try {
        raw = await actor.parseJobUrl(url);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error from AI service";
        console.error("[JobTrack] parseJobUrl error:", err);
        if (msg.toLowerCase().includes("api key") || msg.toLowerCase().includes("grok")) {
          throw new Error(
            "Grok API key missing or invalid. Go to Settings to add your key."
          );
        }
        if (msg.toLowerCase().includes("parse") || msg.toLowerCase().includes("json")) {
          throw new Error(
            "AI could not parse this job posting. Try a different URL."
          );
        }
        throw new Error(msg);
      }
      if (!raw.companyName && !raw.position) {
        throw new Error(
          "AI returned no job details. Check your API key in Settings."
        );
      }
      const parsed = {
        companyName: raw.companyName,
        position: raw.position,
        location: raw.location,
        jobType: raw.jobType,
        salary: formatSalary(raw.salaryMin, raw.salaryMax),
        salaryMin: raw.salaryMin,
        salaryMax: raw.salaryMax,
        fitScore: raw.fitScore !== void 0 ? Number(raw.fitScore) : void 0,
        fitScoreConfidence: raw.fitScoreConfidence !== void 0 ? Number(raw.fitScoreConfidence) : void 0,
        tags: raw.tags,
        notes: raw.notes,
        rawJson: raw.rawJson
      };
      const addArgs = {
        companyName: parsed.companyName ?? "Unknown Company",
        position: parsed.position ?? "Unknown Position",
        location: parsed.location ?? "",
        jobType: parsed.jobType ?? "remote",
        source: "direct",
        status: "Applied",
        jobUrl: url,
        notes: parsed.notes ?? "",
        tags: parsed.tags ?? [],
        isHighPotential: (parsed.fitScore ?? 0) >= 80,
        appliedDate: BigInt(Date.now()) * NS_PER_MS,
        fitScore: parsed.fitScore !== void 0 ? BigInt(parsed.fitScore) : void 0,
        fitScoreConfidence: parsed.fitScoreConfidence !== void 0 ? BigInt(parsed.fitScoreConfidence) : void 0,
        salaryMin: raw.salaryMin,
        salaryMax: raw.salaryMax,
        aiSuggestion: parsed.notes || void 0
      };
      let app;
      try {
        const result = await actor.addApplication(addArgs);
        app = toFrontendApp(result);
      } catch (err) {
        console.error("[JobTrack] addApplication error:", err);
        throw new Error(
          err instanceof Error ? err.message : "Failed to save to pipeline"
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
    }
  });
}
function useGetGrokApiKey() {
  const { actor, isFetching } = useActor(createActor);
  const localKey = useAppStore((s) => s.grokApiKey);
  const query = useQuery({
    queryKey: ["grokApiKey"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getGrokApiKey();
    },
    enabled: !!actor && !isFetching,
    staleTime: 3e5
  });
  return { data: query.data ?? localKey ?? null, isLoading: query.isLoading };
}
function useSetGrokApiKey() {
  const { waitForActor } = useBackendContext();
  const { setGrokApiKey, clearGrokApiKey } = useAppStore();
  const qc = useQueryClient();
  const saveMutation = useMutation({
    mutationFn: async (key) => {
      setGrokApiKey(key);
      const actor = await waitForActor();
      await actor.setGrokApiKey(key);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grokApiKey"] });
      ue.success("Grok API key saved");
    },
    onError: (error) => {
      console.error("[JobTrack] setGrokApiKey failed:", error);
      ue.error("Failed to save Grok API key");
    }
  });
  const clearMutation = useMutation({
    mutationFn: async () => {
      clearGrokApiKey();
      const actor = await waitForActor();
      await actor.setGrokApiKey("");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grokApiKey"] });
      ue.success("Grok API key cleared");
    },
    onError: (error) => {
      console.error("[JobTrack] clearGrokApiKey failed:", error);
      ue.error("Failed to clear API key");
    }
  });
  return { saveMutation, clearMutation };
}
function useGetGrokModel() {
  const { actor, isFetching } = useActor(createActor);
  const localModel = useAppStore((s) => s.grokModel);
  const query = useQuery({
    queryKey: ["grokModel"],
    queryFn: async () => {
      if (!actor) return null;
      const result = await actor.getGrokModel();
      return result ?? null;
    },
    enabled: !!actor && !isFetching,
    staleTime: 3e5
  });
  return { data: query.data ?? localModel, isLoading: query.isLoading };
}
function useSetGrokModel() {
  const { waitForActor } = useBackendContext();
  const { setGrokModel } = useAppStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (model) => {
      setGrokModel(model);
      const actor = await waitForActor();
      await actor.setGrokModel(model);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grokModel"] });
      ue.success("Model preference saved");
    },
    onError: (error) => {
      console.error("[JobTrack] setGrokModel failed:", error);
      ue.error("Failed to save model preference");
    }
  });
}
export {
  useAddApplication as a,
  useApplications as b,
  useDeleteApplication as c,
  useUpdateApplicationStatus as d,
  useAnalytics as e,
  useInsights as f,
  useGetGrokApiKey as g,
  useSetGrokApiKey as h,
  useGetGrokModel as i,
  useSetGrokModel as j,
  useParseAndAdd as u
};
