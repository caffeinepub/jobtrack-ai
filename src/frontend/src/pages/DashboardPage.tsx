import { ApplicationCard } from "@/components/ApplicationCard";
import { useBackendContext } from "@/contexts/BackendContext";
import {
  useAddApplication,
  useApplications,
  useParseAndAdd,
} from "@/hooks/useApplications";
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
  ChevronDown,
  Loader2,
  RotateCcw,
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
  url: string;
  notes: string;
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
  url: "",
  notes: "",
};

// ── Ghost Select ───────────────────────────────────────────────────────────────
function GhostSelect({
  value,
  onChange,
  options,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  id?: string;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 36px 10px 0",
          background: "transparent",
          border: "none",
          borderBottom: "1px solid rgba(240,240,250,0.2)",
          color: "#f0f0fa",
          fontSize: "13px",
          fontWeight: 700,
          appearance: "none",
          cursor: "pointer",
          outline: "none",
        }}
      >
        {options.map((o) => (
          <option
            key={o}
            value={o}
            style={{ background: "#000", color: "#f0f0fa" }}
          >
            {o.replace(/_/g, " ")}
          </option>
        ))}
      </select>
      <ChevronDown
        style={{
          position: "absolute",
          right: 4,
          top: "50%",
          transform: "translateY(-50%)",
          width: 14,
          height: 14,
          color: "rgba(240,240,250,0.4)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

// ── Ghost Input ────────────────────────────────────────────────────────────────
function GhostInput({
  value,
  onChange,
  placeholder,
  type = "text",
  id,
  onKeyDown,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  id?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "10px 0",
        background: "transparent",
        border: "none",
        borderBottom: "1px solid rgba(240,240,250,0.2)",
        color: "#f0f0fa",
        fontSize: "13px",
        fontWeight: 400,
        outline: "none",
        fontFamily: "'Space Grotesk', sans-serif",
        letterSpacing: "1.17px",
        textTransform: "uppercase",
      }}
    />
  );
}

// ── Ghost Textarea ─────────────────────────────────────────────────────────────
function GhostTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      style={{
        width: "100%",
        padding: "10px 0",
        background: "transparent",
        border: "none",
        borderBottom: "1px solid rgba(240,240,250,0.2)",
        color: "#f0f0fa",
        fontSize: "13px",
        fontWeight: 400,
        outline: "none",
        resize: "none",
        fontFamily: "'Space Grotesk', sans-serif",
        letterSpacing: "1.17px",
        textTransform: "uppercase",
      }}
    />
  );
}

// ── Field label ────────────────────────────────────────────────────────────────
function FieldLabel({
  children,
  htmlFor,
}: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: "block",
        fontSize: 10,
        fontWeight: 700,
        color: "rgba(240,240,250,0.45)",
        letterSpacing: "1.17px",
        textTransform: "uppercase",
        marginBottom: 2,
      }}
    >
      {children}
    </label>
  );
}

// ── URL Input View ─────────────────────────────────────────────────────────────
function UrlInputView({
  onParse,
  onManual,
  isBackendReady,
}: {
  onParse: (url: string) => void;
  onManual: () => void;
  isBackendReady: boolean;
}) {
  const [url, setUrl] = useState("");
  const canParse = url.trim().length > 0 && isBackendReady;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ marginBottom: "2rem" }}>
        <FieldLabel htmlFor="url-paste">Paste Job URL</FieldLabel>
        <GhostInput
          id="url-paste"
          value={url}
          onChange={setUrl}
          placeholder="https://jobs.company.com/role/..."
          onKeyDown={(e) =>
            e.key === "Enter" && canParse && onParse(url.trim())
          }
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          type="button"
          data-ocid="parse-btn"
          onClick={() => canParse && onParse(url.trim())}
          disabled={!canParse}
          className="ghost-button"
          style={{ opacity: canParse ? 1 : 0.4 }}
        >
          {!isBackendReady ? "CONNECTING..." : "Parse with AI"}
        </button>
        <button
          type="button"
          data-ocid="manual-add-btn"
          onClick={isBackendReady ? onManual : undefined}
          disabled={!isBackendReady}
          style={{
            background: "transparent",
            border: "none",
            color: isBackendReady
              ? "rgba(240,240,250,0.5)"
              : "rgba(240,240,250,0.25)",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "1.17px",
            textTransform: "uppercase",
            cursor: isBackendReady ? "pointer" : "default",
            padding: 0,
          }}
        >
          {!isBackendReady ? "CONNECTING..." : "Add Manually"}
        </button>
      </div>
    </motion.div>
  );
}

// ── Parsing View ───────────────────────────────────────────────────────────────
function ParsingView() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ padding: "3rem 0", textAlign: "center" }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "1px solid rgba(240,240,250,0.15)",
          borderTopColor: "#f0f0fa",
          margin: "0 auto 1.5rem",
        }}
      />
      <p
        style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "1.17px",
          color: "rgba(240,240,250,0.7)",
        }}
      >
        AI Reading Job Posting...
      </p>
      <p
        style={{
          fontSize: 11,
          color: "rgba(240,240,250,0.35)",
          marginTop: "0.5rem",
          letterSpacing: "1.17px",
        }}
      >
        Extracting details and calculating fit score
      </p>
    </motion.div>
  );
}

// ── Confirmation View ──────────────────────────────────────────────────────────
interface ConfirmationViewProps {
  parsed: ParsedJobDetails;
  onReset: () => void;
}

function ConfirmationView({ parsed, onReset }: ConfirmationViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Extracted header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "2.5rem",
        }}
      >
        <div>
          <p
            style={{
              fontSize: 10,
              color: "rgba(240,240,250,0.45)",
              letterSpacing: "1.17px",
              marginBottom: "0.25rem",
              textTransform: "uppercase",
            }}
          >
            Job Added to Pipeline
          </p>
          {parsed.fitScore !== undefined && (
            <p
              style={{
                fontSize: 40,
                fontWeight: 700,
                letterSpacing: "0.96px",
                lineHeight: 1,
                color: "#f0f0fa",
              }}
            >
              {parsed.fitScore}
              <span style={{ fontSize: 16, opacity: 0.5, marginLeft: 4 }}>
                % Fit
              </span>
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onReset}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "transparent",
            border: "none",
            color: "rgba(240,240,250,0.4)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "1.17px",
            textTransform: "uppercase",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <RotateCcw size={12} />
          Add Another
        </button>
      </div>

      {/* Parsed fields — read-only display */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0 3rem",
          marginBottom: "2rem",
        }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <FieldLabel>Company</FieldLabel>
          <p
            style={{
              padding: "10px 0",
              color: "#f0f0fa",
              fontSize: "13px",
              letterSpacing: "1.17px",
              textTransform: "uppercase",
              borderBottom: "1px solid rgba(240,240,250,0.1)",
            }}
          >
            {parsed.companyName || "—"}
          </p>
        </div>
        <div style={{ marginBottom: "1.5rem" }}>
          <FieldLabel>Role</FieldLabel>
          <p
            style={{
              padding: "10px 0",
              color: "#f0f0fa",
              fontSize: "13px",
              letterSpacing: "1.17px",
              textTransform: "uppercase",
              borderBottom: "1px solid rgba(240,240,250,0.1)",
            }}
          >
            {parsed.position || "—"}
          </p>
        </div>
        <div style={{ marginBottom: "1.5rem" }}>
          <FieldLabel>Location</FieldLabel>
          <p
            style={{
              padding: "10px 0",
              color: "#f0f0fa",
              fontSize: "13px",
              letterSpacing: "1.17px",
              textTransform: "uppercase",
              borderBottom: "1px solid rgba(240,240,250,0.1)",
            }}
          >
            {parsed.location || "—"}
          </p>
        </div>
        <div style={{ marginBottom: "1.5rem" }}>
          <FieldLabel>Type</FieldLabel>
          <p
            style={{
              padding: "10px 0",
              color: "#f0f0fa",
              fontSize: "13px",
              letterSpacing: "1.17px",
              textTransform: "uppercase",
              borderBottom: "1px solid rgba(240,240,250,0.1)",
            }}
          >
            {parsed.jobType || "—"}
          </p>
        </div>
      </div>

      {/* Success indicator */}
      <p
        data-ocid="auto-add-success"
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "1.17px",
          color: "rgba(240,240,250,0.6)",
          textTransform: "uppercase",
        }}
      >
        ✓ Automatically saved to your pipeline
      </p>
    </motion.div>
  );
}

// ── Manual Form View ───────────────────────────────────────────────────────────
function ManualFormView({
  onSave,
  onCancel,
  isSaving,
}: {
  onSave: (args: AddApplicationArgs) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<ManualForm>(DEFAULT_MANUAL);
  const set = (k: keyof ManualForm) => (v: string) =>
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
      tags: [],
      isHighPotential: false,
      appliedDate: BigInt(Date.now()) * BigInt(1_000_000),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0 3rem",
            marginBottom: "2rem",
          }}
        >
          <div style={{ marginBottom: "1.5rem" }}>
            <FieldLabel htmlFor="m-company">Company *</FieldLabel>
            <GhostInput
              data-ocid="manual-company"
              id="m-company"
              value={form.company}
              onChange={set("company")}
              placeholder="e.g. SpaceX"
            />
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <FieldLabel htmlFor="m-title">Job Title *</FieldLabel>
            <GhostInput
              data-ocid="manual-title"
              id="m-title"
              value={form.jobTitle}
              onChange={set("jobTitle")}
              placeholder="e.g. Senior Engineer"
            />
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <FieldLabel htmlFor="m-location">Location</FieldLabel>
            <GhostInput
              data-ocid="manual-location"
              id="m-location"
              value={form.location}
              onChange={set("location")}
              placeholder="Hawthorne, CA or Remote"
            />
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <FieldLabel htmlFor="m-type">Job Type</FieldLabel>
            <GhostSelect
              id="m-type"
              value={form.jobType}
              onChange={set("jobType")}
              options={JOB_TYPES}
            />
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <FieldLabel htmlFor="m-source">Source</FieldLabel>
            <GhostSelect
              id="m-source"
              value={form.source}
              onChange={set("source")}
              options={SOURCES}
            />
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <FieldLabel htmlFor="m-status">Status</FieldLabel>
            <GhostSelect
              id="m-status"
              value={form.status}
              onChange={set("status")}
              options={STATUSES}
            />
          </div>
          <div style={{ marginBottom: "1.5rem", gridColumn: "1 / -1" }}>
            <FieldLabel htmlFor="m-url">Job URL</FieldLabel>
            <GhostInput
              data-ocid="manual-url"
              id="m-url"
              type="url"
              value={form.url}
              onChange={set("url")}
              placeholder="https://..."
            />
          </div>
          <div style={{ marginBottom: "1.5rem", gridColumn: "1 / -1" }}>
            <FieldLabel>Notes</FieldLabel>
            <GhostTextarea
              value={form.notes}
              onChange={set("notes")}
              placeholder="Any notes about this role..."
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <button
            type="submit"
            data-ocid="manual-submit-btn"
            disabled={isSaving}
            className="ghost-button"
          >
            {isSaving ? <Loader2 size={14} style={{ marginRight: 8 }} /> : null}
            Add to Pipeline
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(240,240,250,0.4)",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "1.17px",
              textTransform: "uppercase",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ── STAT display ───────────────────────────────────────────────────────────────
function StatOverlay({
  value,
  label,
}: { value: string | number; label: string }) {
  return (
    <div>
      <p
        style={{
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          fontWeight: 700,
          letterSpacing: "0.96px",
          lineHeight: 1,
          color: "#f0f0fa",
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "1.17px",
          color: "rgba(240,240,250,0.5)",
          marginTop: "0.4rem",
          textTransform: "uppercase",
        }}
      >
        {label}
      </p>
    </div>
  );
}

// ── Main Dashboard Page ────────────────────────────────────────────────────────
export function DashboardPage() {
  const [view, setView] = useState<ViewMode>("url-input");
  const [parsedResult, setParsedResult] = useState<ParsedJobDetails | null>(
    null,
  );
  const [parseError, setParseError] = useState<string | null>(null);

  const { isBackendReady } = useBackendContext();
  const parseAndAdd = useParseAndAdd();
  const addApplication = useAddApplication();
  // Recent apps for the list — page size 5
  const { data: appsData, isLoading: appsLoading } = useApplications({
    pageSize: BigInt(5),
  });
  // Full count for mission control stats — reads total directly from backend
  const { data: allAppsData } = useApplications({ pageSize: BigInt(1000) });

  const recentApps = (appsData?.applications ?? []).slice(0, 5);
  const total = Number(allAppsData?.total ?? 0);
  const active = (allAppsData?.applications ?? []).filter(
    (a) => a.status === "Applied" || a.status === "Interviewing",
  ).length;
  const offers = (allAppsData?.applications ?? []).filter(
    (a) => a.status === "Offer",
  ).length;

  const handleParse = (url: string) => {
    setParseError(null);
    setView("parsing");
    parseAndAdd.mutate(url, {
      onSuccess: ({ parsed, app }) => {
        setParsedResult(parsed);
        toast.success(`${app.company} added to pipeline`);
        setView("confirmation");
      },
      onError: (err) => {
        setParseError(
          err.message ?? "Couldn't parse that URL. Add manually instead.",
        );
        setView("url-input");
      },
    });
  };

  const handleSave = (args: AddApplicationArgs) => {
    addApplication.mutate(args, {
      onSuccess: (app) => {
        toast.success(`${app.company} added to pipeline`);
        setView("url-input");
        setParsedResult(null);
      },
    });
  };

  const handleReset = () => {
    setView("url-input");
    setParsedResult(null);
    setParseError(null);
  };

  return (
    <div style={{ background: "#000", minHeight: "100vh" }}>
      {/* ── Hero Scene — full 100vh with aerospace photography ─────────────── */}
      <section
        className="full-bleed-section"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1541185934-01b600ea069c?w=1920&q=80')",
        }}
      >
        <div className="image-overlay" />
        <div className="scene-content">
          {/* Stats row — numbers directly on photography */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              display: "flex",
              gap: "4vw",
              marginBottom: "3rem",
            }}
          >
            <StatOverlay value={total} label="Total Applications" />
            <StatOverlay value={active} label="Active" />
            <StatOverlay value={offers} label="Offers" />
          </motion.div>

          {/* Mission Control title */}
          <motion.h1
            className="display-text"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: "0.5rem" }}
          >
            Mission Control
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "1.17px",
              color: "rgba(240,240,250,0.55)",
              marginBottom: "2.5rem",
            }}
          >
            Your Job Application Pipeline
          </motion.p>

          {/* CTA row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ display: "flex", gap: "1rem" }}
          >
            <Link
              to="/applications"
              className="ghost-button"
              data-ocid="view-pipeline-cta"
            >
              View Pipeline
            </Link>
            <Link
              to="/kanban"
              className="ghost-button"
              data-ocid="view-kanban-cta"
            >
              Kanban Board
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── AI Parse Section ────────────────────────────────────────────────── */}
      <section style={{ padding: "6rem 5vw" }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "1.17px",
              color: "rgba(240,240,250,0.35)",
              marginBottom: "0.5rem",
            }}
          >
            AI-Powered
          </p>
          <h2
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
              fontWeight: 700,
              letterSpacing: "0.96px",
              color: "#f0f0fa",
              marginBottom: "3rem",
              lineHeight: 1.1,
            }}
          >
            Add New Application
          </h2>

          <div style={{ maxWidth: 640 }}>
            <AnimatePresence mode="wait">
              {view === "url-input" && (
                <UrlInputView
                  key="url"
                  onParse={handleParse}
                  onManual={() => setView("manual")}
                  isBackendReady={isBackendReady}
                />
              )}
              {view === "parsing" && <ParsingView key="parsing" />}
              {view === "confirmation" && parsedResult && (
                <ConfirmationView
                  key="confirmation"
                  parsed={parsedResult}
                  onReset={handleReset}
                />
              )}
              {view === "manual" && (
                <ManualFormView
                  key="manual"
                  onSave={handleSave}
                  onCancel={handleReset}
                  isSaving={addApplication.isPending}
                />
              )}
            </AnimatePresence>

            {/* Error message */}
            {parseError && view === "url-input" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: "1.5rem",
                  color: "rgba(240,240,250,0.6)",
                  fontSize: 12,
                  letterSpacing: "1.17px",
                }}
              >
                <AlertCircle size={14} />
                {parseError}
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* ── Recent Applications Section ──────────────────────────────────────── */}
      <section
        style={{
          padding: "6rem 5vw",
          borderTop: "1px solid rgba(240,240,250,0.06)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Section header */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: "3rem",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "1.17px",
                  color: "rgba(240,240,250,0.35)",
                  marginBottom: "0.5rem",
                }}
              >
                Recent Activity
              </p>
              <h2
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                  fontWeight: 700,
                  letterSpacing: "0.96px",
                  color: "#f0f0fa",
                  lineHeight: 1.1,
                }}
              >
                Latest Applications
              </h2>
            </div>
            <Link
              to="/applications"
              data-ocid="view-all-apps-link"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "1.17px",
                color: "rgba(240,240,250,0.5)",
                textDecoration: "none",
                textTransform: "uppercase",
                transition: "color 0.3s",
              }}
            >
              View All
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Application list — text-only rows */}
          {appsLoading ? (
            <div>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    padding: "1.5rem 0",
                    borderBottom: "1px solid rgba(240,240,250,0.06)",
                    opacity: 0.3,
                  }}
                >
                  <div
                    style={{
                      width: "40%",
                      height: 14,
                      background: "rgba(240,240,250,0.1)",
                      borderRadius: 2,
                      marginBottom: 8,
                    }}
                  />
                  <div
                    style={{
                      width: "25%",
                      height: 10,
                      background: "rgba(240,240,250,0.06)",
                      borderRadius: 2,
                    }}
                  />
                </div>
              ))}
            </div>
          ) : recentApps.length === 0 ? (
            <div data-ocid="empty-recent-apps" style={{ paddingTop: "3rem" }}>
              <p
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                  fontWeight: 700,
                  letterSpacing: "0.96px",
                  color: "rgba(240,240,250,0.2)",
                  marginBottom: "1rem",
                }}
              >
                No Applications Yet
              </p>
              <p
                style={{
                  fontSize: 13,
                  letterSpacing: "1.17px",
                  color: "rgba(240,240,250,0.3)",
                }}
              >
                Paste a job URL above to get started
              </p>
            </div>
          ) : (
            <div>
              {recentApps.map((app, i) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                >
                  <ApplicationCard application={app} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
}
