// ── Backend-aligned enum types ─────────────────────────────────────────────────
export type ApplicationStatus =
  | "Applied"
  | "Interviewing"
  | "Offer"
  | "Rejected"
  | "Archived";

export type JobType = "remote" | "hybrid" | "onsite";

export type ApplicationSource =
  | "job_board"
  | "referral"
  | "recruiter"
  | "direct"
  | "network";

// ── Frontend-friendly Application type (adapter from backend shape) ────────────
export interface Application {
  id: string; // bigint stringified for frontend
  company: string; // backend: companyName
  jobTitle: string; // backend: position
  location: string;
  jobType: JobType;
  source: ApplicationSource;
  status: ApplicationStatus;
  salary?: string; // derived from salaryMin/salaryMax
  url?: string; // backend: jobUrl
  notes?: string;
  tags: string[];
  appliedAt: string; // ISO string from bigint timestamp
  updatedAt: string; // ISO string from lastUpdated bigint
  fitScore?: number; // bigint → number (0–100)
  fitScoreConfidence?: number; // bigint → number (0–100)
  remote: boolean; // derived from jobType
  isHighPotential: boolean;
  aiSuggestion?: string;
}

// ── Backend-aligned args (matches backend.d.ts exactly) ───────────────────────
export interface AddApplicationArgs {
  companyName: string;
  position: string;
  location: string;
  jobType: JobType;
  source: ApplicationSource;
  status: ApplicationStatus;
  jobUrl: string;
  notes: string;
  tags: string[];
  isHighPotential: boolean;
  appliedDate: bigint;
  fitScore?: bigint;
  fitScoreConfidence?: bigint;
  aiSuggestion?: string;
  salaryMin?: bigint;
  salaryMax?: bigint;
}

export interface UpdateApplicationArgs {
  id: bigint;
  companyName: string;
  position: string;
  location: string;
  jobType: JobType;
  source: ApplicationSource;
  status: ApplicationStatus;
  jobUrl: string;
  notes: string;
  tags: string[];
  isHighPotential: boolean;
  appliedDate: bigint;
  fitScore?: bigint;
  fitScoreConfidence?: bigint;
  aiSuggestion?: string;
  salaryMin?: bigint;
  salaryMax?: bigint;
}

export interface GetApplicationsArgs {
  page?: bigint;
  pageSize?: bigint;
  statusFilter?: ApplicationStatus;
}

export interface GetApplicationsResult {
  applications: Application[];
  total: number;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface AnalyticsResult {
  totalApplications: number;
  byStatus: Record<ApplicationStatus, number>;
  bySource: Record<string, number>;
  byMonth: Array<{ month: string; count: number }>;
  responseRate: number;
  avgTimeToResponse: number;
  topCompanies: Array<{ company: string; count: number }>;
}

export interface ParsedJobDetails {
  companyName: string;
  position: string;
  location: string;
  jobType?: JobType;
  salary?: string; // derived from salaryMin/salaryMax
  salaryMin?: bigint;
  salaryMax?: bigint;
  fitScore?: number; // bigint → number
  fitScoreConfidence?: number; // bigint → number (confidence 0–100)
  tags: string[];
  notes: string;
  rawJson: string;
}

export interface AiInsight {
  id: string;
  type: "tip" | "warning" | "opportunity";
  title: string;
  message: string;
  metric?: string;
  action?: string;
}
