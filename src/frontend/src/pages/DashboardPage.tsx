import { ApplicationCard } from "@/components/ApplicationCard";
import { JobFitBadge } from "@/components/JobFitBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddApplication,
  useApplications,
  useParseJobUrl,
} from "@/hooks/useApplications";
import { cn } from "@/lib/utils";
import type {
  AddApplicationArgs,
  ApplicationSource,
  ApplicationStatus,
  JobType,
  ParsedJobDetails,
} from "@/types";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  ExternalLink,
  Link2,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────────
type ViewMode = "url-input" | "parsing" | "confirmation" | "manual";

interface ManualForm {
  company: string;
  jobTitle: string;
  location: string;
  jobType: JobType;
  source: ApplicationSource;
  status: ApplicationStatus;
  salary: string;
  url: string;
  notes: string;
  tags: string;
  remote: boolean;
}

const JOB_TYPES: JobType[] = ["remote", "hybrid", "onsite"];
const SOURCES: ApplicationSource[] = [
  "job_board",
  "referral",
  "recruiter",
  "direct",
  "network",
];
const STATUSES: ApplicationStatus[] = [
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
  "Archived",
];

const DEFAULT_MANUAL: ManualForm = {
  company: "",
  jobTitle: "",
  location: "",
  jobType: "remote",
  source: "job_board",
  status: "Applied",
  salary: "",
  url: "",
  notes: "",
  tags: "",
  remote: false,
};

// ── Confidence bar component ───────────────────────────────────────────────────
function ConfidenceBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{pct}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background:
              pct >= 75
                ? "var(--color-chart-3)"
                : pct >= 50
                  ? "var(--color-chart-2)"
                  : "var(--color-muted-foreground)",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ── Editable field ─────────────────────────────────────────────────────────────
function EditableField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 text-sm bg-background/60 border-border/60 focus:border-primary/60"
      />
    </div>
  );
}

// ── URL Parse view ─────────────────────────────────────────────────────────────
function UrlInputView({
  onParse,
  onManual,
}: {
  onParse: (url: string) => void;
  onManual: () => void;
}) {
  const [url, setUrl] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="space-y-3"
    >
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="url-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && url.trim() && onParse(url.trim())
            }
            placeholder="Paste job posting URL here…"
            className="pl-10 h-12 text-base bg-background border-border/60 focus:border-primary/50 transition-smooth placeholder:text-muted-foreground/50"
          />
        </div>
        <Button
          data-ocid="parse-btn"
          onClick={() => url.trim() && onParse(url.trim())}
          disabled={!url.trim()}
          className="h-12 px-6 gap-2 font-semibold"
        >
          <Sparkles className="w-4 h-4" />
          Parse with AI
        </Button>
      </div>
      <button
        type="button"
        data-ocid="manual-add-btn"
        onClick={onManual}
        className="text-xs text-muted-foreground hover:text-primary transition-smooth flex items-center gap-1"
      >
        <Pencil className="w-3 h-3" />
        Add manually instead
      </button>
    </motion.div>
  );
}

// ── Parsing animation ──────────────────────────────────────────────────────────
function ParsingView() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-12 gap-4"
    >
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <Bot className="w-6 h-6 text-primary" />
      </div>
      <div className="text-center space-y-1">
        <p className="font-semibold text-foreground">
          AI is reading the job posting…
        </p>
        <p className="text-sm text-muted-foreground">
          Extracting details and calculating your fit score
        </p>
      </div>
      <div className="flex gap-1.5">
        {[0, 0.2, 0.4].map((delay) => (
          <motion.div
            key={delay}
            className="w-1.5 h-1.5 rounded-full bg-primary/50"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{
              duration: 1.2,
              repeat: Number.POSITIVE_INFINITY,
              delay,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ── Confirmation panel ─────────────────────────────────────────────────────────
interface ConfirmationPanelProps {
  parsed: ParsedJobDetails;
  url: string;
  onSave: (args: AddApplicationArgs) => void;
  onReset: () => void;
  isSaving: boolean;
}

function ConfirmationPanel({
  parsed,
  url,
  onSave,
  onReset,
  isSaving,
}: ConfirmationPanelProps) {
  const [company, setCompany] = useState(parsed.companyName ?? "");
  const [jobTitle, setJobTitle] = useState(parsed.position ?? "");
  const [location, setLocation] = useState(parsed.location ?? "");
  const [jobType, setJobType] = useState<JobType>(parsed.jobType ?? "remote");
  const [salary, setSalary] = useState(parsed.salary ?? "");
  const [activeTags, setActiveTags] = useState<string[]>(parsed.tags ?? []);
  const confidence =
    parsed.fitScoreConfidence !== undefined
      ? parsed.fitScoreConfidence / 100
      : 0.85;

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSave = () => {
    if (!company || !jobTitle) {
      toast.error("Company and job title are required");
      return;
    }
    onSave({
      companyName: company,
      position: jobTitle,
      location,
      jobType,
      source: "direct",
      status: "Applied",
      jobUrl: url,
      notes: "",
      tags: activeTags,
      isHighPotential: (parsed.fitScore ?? 0) >= 80,
      appliedDate: BigInt(Date.now()) * BigInt(1_000_000),
      fitScore:
        parsed.fitScore !== undefined ? BigInt(parsed.fitScore) : undefined,
      fitScoreConfidence:
        parsed.fitScoreConfidence !== undefined
          ? BigInt(parsed.fitScoreConfidence)
          : undefined,
      salaryMin: parsed.salaryMin,
      salaryMax: parsed.salaryMax,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="space-y-4"
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-green-500" />
          </div>
          <span className="text-sm font-semibold text-foreground">
            Extracted successfully
          </span>
          <span className="text-xs text-muted-foreground">
            · Review &amp; save
          </span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-muted-foreground hover:text-foreground transition-smooth flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Try another
        </button>
      </div>

      {/* Main confirmation card */}
      <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden">
        {/* Top strip with fit score */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-primary/5">
          <div>
            <h3 className="font-display font-bold text-foreground text-lg leading-tight">
              {company || "Company"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {jobTitle || "Position"}
            </p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <JobFitBadge
              score={parsed.fitScore ?? 0}
              confidence={confidence}
              size="lg"
            />
            <span className="text-[10px] text-muted-foreground font-medium">
              Fit Score
            </span>
          </div>
        </div>

        {/* Fields grid */}
        <div className="px-5 py-4 grid grid-cols-2 gap-3">
          <EditableField
            label="Company"
            value={company}
            onChange={setCompany}
            placeholder="Company name"
          />
          <EditableField
            label="Job Title"
            value={jobTitle}
            onChange={setJobTitle}
            placeholder="Position title"
          />
          <EditableField
            label="Location"
            value={location}
            onChange={setLocation}
            placeholder="City, State"
          />
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Job Type
            </Label>
            <div className="relative">
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value as JobType)}
                className="w-full h-8 text-sm rounded-md border border-border/60 bg-background/60 px-2 pr-7 appearance-none focus:outline-none focus:border-primary/60 transition-smooth"
              >
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <EditableField
            label="Salary Range"
            value={salary}
            onChange={setSalary}
            placeholder="e.g. $160k–$200k"
          />
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              Job URL
            </Label>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline transition-smooth truncate"
            >
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{url}</span>
            </a>
          </div>
        </div>

        {/* Confidence indicators */}
        <div className="px-5 py-3 border-t border-border bg-muted/20">
          <p className="text-xs font-medium text-muted-foreground mb-2.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI Confidence
          </p>
          <div className="grid grid-cols-3 gap-3">
            <ConfidenceBar
              label="Company"
              value={Math.min(1, confidence * 1.05)}
            />
            <ConfidenceBar label="Job Title" value={Math.min(1, confidence)} />
            <ConfidenceBar
              label="Salary"
              value={Math.max(0.4, confidence * 0.85)}
            />
          </div>
        </div>

        {/* Tags */}
        {(parsed.tags?.length ?? 0) > 0 && (
          <div className="px-5 py-3 border-t border-border">
            <div className="flex items-center gap-1.5 mb-2">
              <Tag className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Suggested Tags
              </span>
              <span className="text-[10px] text-muted-foreground/60">
                (click to toggle)
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(parsed.tags ?? []).map((tag, i) => (
                <motion.button
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => toggleTag(tag)}
                  data-ocid={`tag-toggle-${tag}`}
                  className={cn(
                    "fit-badge text-[11px] transition-smooth",
                    activeTags.includes(tag)
                      ? "bg-primary/15 text-primary border-primary/40"
                      : "bg-muted text-muted-foreground border-border/60",
                  )}
                >
                  {activeTags.includes(tag) && (
                    <Check className="w-2.5 h-2.5" />
                  )}
                  {tag}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Save action */}
        <div className="px-5 py-4 border-t border-border flex items-center justify-between bg-card/40">
          <p className="text-xs text-muted-foreground">
            {activeTags.length} tag{activeTags.length !== 1 ? "s" : ""} selected
          </p>
          <Button
            data-ocid="save-application-btn"
            onClick={handleSave}
            disabled={isSaving || !company || !jobTitle}
            className="gap-2 font-semibold"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add to Pipeline
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Manual form ────────────────────────────────────────────────────────────────
function ManualForm({
  onSave,
  onCancel,
  isSaving,
}: {
  onSave: (args: AddApplicationArgs) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<ManualForm>(DEFAULT_MANUAL);
  const set = (k: keyof ManualForm) => (v: string | boolean) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company || !form.jobTitle) {
      toast.error("Company and job title are required");
      return;
    }
    onSave({
      companyName: form.company,
      position: form.jobTitle,
      location: form.location,
      jobType: form.jobType,
      source: form.source,
      status: form.status,
      jobUrl: form.url || "",
      notes: form.notes || "",
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      isHighPotential: false,
      appliedDate: BigInt(Date.now()) * BigInt(1_000_000),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25 }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl border border-border bg-card/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-sm text-foreground">
                Add Application Manually
              </span>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="text-muted-foreground hover:text-foreground transition-smooth"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-5 py-4 grid grid-cols-2 gap-3">
            {/* Company */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Company *
              </Label>
              <Input
                data-ocid="manual-company"
                value={form.company}
                onChange={(e) => set("company")(e.target.value)}
                placeholder="e.g. Stripe"
                className="h-8 text-sm"
                required
              />
            </div>
            {/* Job Title */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Job Title *
              </Label>
              <Input
                data-ocid="manual-title"
                value={form.jobTitle}
                onChange={(e) => set("jobTitle")(e.target.value)}
                placeholder="e.g. Senior Engineer"
                className="h-8 text-sm"
                required
              />
            </div>
            {/* Location */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Location
              </Label>
              <Input
                data-ocid="manual-location"
                value={form.location}
                onChange={(e) => set("location")(e.target.value)}
                placeholder="City, State or Remote"
                className="h-8 text-sm"
              />
            </div>
            {/* Job Type */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Job Type
              </Label>
              <div className="relative">
                <select
                  data-ocid="manual-jobtype"
                  value={form.jobType}
                  onChange={(e) => set("jobType")(e.target.value)}
                  className="w-full h-8 text-sm rounded-md border border-border bg-background px-2 pr-7 appearance-none focus:outline-none focus:border-primary/60"
                >
                  {JOB_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            {/* Salary */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Salary Range
              </Label>
              <Input
                data-ocid="manual-salary"
                value={form.salary}
                onChange={(e) => set("salary")(e.target.value)}
                placeholder="$100k–$130k"
                className="h-8 text-sm"
              />
            </div>
            {/* Source */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Source
              </Label>
              <div className="relative">
                <select
                  data-ocid="manual-source"
                  value={form.source}
                  onChange={(e) => set("source")(e.target.value)}
                  className="w-full h-8 text-sm rounded-md border border-border bg-background px-2 pr-7 appearance-none focus:outline-none focus:border-primary/60"
                >
                  {SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            {/* Status */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Status
              </Label>
              <div className="relative">
                <select
                  data-ocid="manual-status"
                  value={form.status}
                  onChange={(e) => set("status")(e.target.value)}
                  className="w-full h-8 text-sm rounded-md border border-border bg-background px-2 pr-7 appearance-none focus:outline-none focus:border-primary/60"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            {/* URL */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Job URL
              </Label>
              <Input
                data-ocid="manual-url"
                value={form.url}
                onChange={(e) => set("url")(e.target.value)}
                placeholder="https://..."
                className="h-8 text-sm"
                type="url"
              />
            </div>
            {/* Tags */}
            <div className="col-span-2 space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Tags (comma-separated)
              </Label>
              <Input
                data-ocid="manual-tags"
                value={form.tags}
                onChange={(e) => set("tags")(e.target.value)}
                placeholder="react, typescript, remote"
                className="h-8 text-sm"
              />
            </div>
            {/* Notes */}
            <div className="col-span-2 space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Notes
              </Label>
              <Textarea
                data-ocid="manual-notes"
                value={form.notes}
                onChange={(e) => set("notes")(e.target.value)}
                placeholder="Any notes about this role…"
                className="text-sm min-h-[72px] resize-none"
              />
            </div>
          </div>

          <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="gap-1"
            >
              Cancel
            </Button>
            <Button
              data-ocid="manual-submit-btn"
              type="submit"
              disabled={isSaving}
              className="gap-2 font-semibold"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add to Pipeline
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}

// ── Main Dashboard Page ────────────────────────────────────────────────────────
export function DashboardPage() {
  const [view, setView] = useState<ViewMode>("url-input");
  const [parsedUrl, setParsedUrl] = useState("");
  const [parsedResult, setParsedResult] = useState<ParsedJobDetails | null>(
    null,
  );
  const [parseError, setParseError] = useState<string | null>(null);

  const parseJobUrl = useParseJobUrl();
  const addApplication = useAddApplication();
  const { data: appsData, isLoading: appsLoading } = useApplications({
    pageSize: BigInt(5),
  });

  const recentApps = (appsData?.applications ?? []).slice(0, 5);

  const handleParse = (url: string) => {
    setParseError(null);
    setParsedUrl(url);
    setView("parsing");
    parseJobUrl.mutate(url, {
      onSuccess: (result) => {
        setParsedResult(result);
        setView("confirmation");
      },
      onError: () => {
        setParseError("Couldn't parse that URL. Try adding manually instead.");
        setView("url-input");
      },
    });
  };

  const handleSave = (args: AddApplicationArgs) => {
    addApplication.mutate(args, {
      onSuccess: (app) => {
        toast.success("Application added!", {
          description: `${app.company} · ${app.jobTitle}`,
          action: { label: "View all", onClick: () => {} },
        });
        setView("url-input");
        setParsedResult(null);
        setParsedUrl("");
      },
    });
  };

  const handleReset = () => {
    setView("url-input");
    setParsedResult(null);
    setParsedUrl("");
    setParseError(null);
  };

  return (
    <div className="min-h-full bg-background">
      {/* Page header */}
      <div className="border-b border-border bg-card px-6 py-5">
        <div className="max-w-3xl">
          <h1 className="font-display text-2xl font-bold text-foreground leading-tight">
            Add Application
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Paste a job URL and let AI extract the details instantly.
          </p>
        </div>
      </div>

      <div className="px-6 py-6 max-w-3xl space-y-8">
        {/* ── AI Parse / Manual Form card ────────────────────────────────────── */}
        <section>
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border bg-gradient-to-r from-primary/8 to-transparent">
              <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-sm text-foreground">
                  AI-Powered Job Parser
                </h2>
                <p className="text-xs text-muted-foreground">
                  Paste a URL and we'll extract everything automatically
                </p>
              </div>
            </div>

            {/* Card body */}
            <div className="px-6 py-5">
              <AnimatePresence mode="wait">
                {view === "url-input" && (
                  <UrlInputView
                    key="url"
                    onParse={handleParse}
                    onManual={() => setView("manual")}
                  />
                )}
                {view === "parsing" && <ParsingView key="parsing" />}
                {view === "confirmation" && parsedResult && (
                  <ConfirmationPanel
                    key="confirmation"
                    parsed={parsedResult}
                    url={parsedUrl}
                    onSave={handleSave}
                    onReset={handleReset}
                    isSaving={addApplication.isPending}
                  />
                )}
                {view === "manual" && (
                  <ManualForm
                    key="manual"
                    onSave={handleSave}
                    onCancel={handleReset}
                    isSaving={addApplication.isPending}
                  />
                )}
              </AnimatePresence>

              {/* Error banner */}
              {parseError && view === "url-input" && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive">{parseError}</p>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* ── Recent Applications ─────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              Recent Applications
              {appsData && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {appsData.total}
                </Badge>
              )}
            </h2>
            <Link
              to="/applications"
              data-ocid="view-all-apps-link"
              className="text-xs text-primary hover:text-primary/80 transition-smooth flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {appsLoading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : recentApps.length === 0 ? (
            <div
              data-ocid="empty-recent-apps"
              className="flex flex-col items-center justify-center py-10 gap-3 rounded-xl border border-dashed border-border bg-muted/20"
            >
              <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  No applications yet
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Paste a job URL above to get started
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {recentApps.map((app, i) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <ApplicationCard application={app} />
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
