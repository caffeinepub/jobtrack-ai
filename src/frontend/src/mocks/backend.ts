import type { backendInterface } from "../backend";
import {
  ApplicationStatus,
  ApplicationSource,
  JobType,
  UserRole,
} from "../backend";
import type { Principal } from "@icp-sdk/core/principal";

const now = BigInt(Date.now()) * BigInt(1_000_000);
const day = BigInt(86400) * BigInt(1_000_000_000);

const sampleApplications = [
  {
    id: BigInt(1),
    companyName: "Stripe",
    position: "Senior Frontend Engineer",
    location: "Remote",
    jobUrl: "https://stripe.com/jobs/1",
    status: ApplicationStatus.Interviewing,
    source: ApplicationSource.referral,
    jobType: JobType.remote,
    tags: ["React", "TypeScript", "Payments"],
    notes: "Strong referral from a former colleague. Great culture fit.",
    appliedDate: now - day * BigInt(14),
    lastUpdated: now - day * BigInt(2),
    isHighPotential: true,
    fitScore: BigInt(88),
    fitScoreConfidence: BigInt(91),
    aiSuggestion: "Send follow-up — 14 days since interview",
    salaryMin: BigInt(140000),
    salaryMax: BigInt(180000),
    userId: { toString: () => "user-1" } as unknown as Principal,
  },
  {
    id: BigInt(2),
    companyName: "Linear",
    position: "Staff Product Engineer",
    location: "San Francisco, CA",
    jobUrl: "https://linear.app/jobs/2",
    status: ApplicationStatus.Applied,
    source: ApplicationSource.direct,
    jobType: JobType.hybrid,
    tags: ["Product", "Systems", "TypeScript"],
    notes: "",
    appliedDate: now - day * BigInt(5),
    lastUpdated: now - day * BigInt(5),
    isHighPotential: true,
    fitScore: BigInt(82),
    fitScoreConfidence: BigInt(85),
    aiSuggestion: undefined,
    salaryMin: BigInt(160000),
    salaryMax: BigInt(210000),
    userId: { toString: () => "user-1" } as unknown as Principal,
  },
  {
    id: BigInt(3),
    companyName: "Vercel",
    position: "Frontend Platform Engineer",
    location: "Remote",
    jobUrl: "https://vercel.com/jobs/3",
    status: ApplicationStatus.Offer,
    source: ApplicationSource.job_board,
    jobType: JobType.remote,
    tags: ["Next.js", "Edge", "Platform"],
    notes: "Received offer! Negotiating salary.",
    appliedDate: now - day * BigInt(30),
    lastUpdated: now - day * BigInt(1),
    isHighPotential: true,
    fitScore: BigInt(95),
    fitScoreConfidence: BigInt(97),
    aiSuggestion: undefined,
    salaryMin: BigInt(150000),
    salaryMax: BigInt(190000),
    userId: { toString: () => "user-1" } as unknown as Principal,
  },
  {
    id: BigInt(4),
    companyName: "Figma",
    position: "Senior Software Engineer",
    location: "New York, NY",
    jobUrl: "https://figma.com/jobs/4",
    status: ApplicationStatus.Rejected,
    source: ApplicationSource.network,
    jobType: JobType.onsite,
    tags: ["Graphics", "Canvas", "Performance"],
    notes: "Got to final round but didn't match cultural expectations.",
    appliedDate: now - day * BigInt(45),
    lastUpdated: now - day * BigInt(10),
    isHighPotential: false,
    fitScore: BigInt(70),
    fitScoreConfidence: BigInt(75),
    aiSuggestion: undefined,
    salaryMin: BigInt(130000),
    salaryMax: BigInt(170000),
    userId: { toString: () => "user-1" } as unknown as Principal,
  },
  {
    id: BigInt(5),
    companyName: "Notion",
    position: "Full Stack Engineer",
    location: "Remote",
    jobUrl: "https://notion.so/jobs/5",
    status: ApplicationStatus.Interviewing,
    source: ApplicationSource.recruiter,
    jobType: JobType.remote,
    tags: ["React", "Node.js", "Databases"],
    notes: "Technical screen scheduled for next week.",
    appliedDate: now - day * BigInt(20),
    lastUpdated: now - day * BigInt(3),
    isHighPotential: false,
    fitScore: BigInt(76),
    fitScoreConfidence: BigInt(80),
    aiSuggestion: "Recommended: Prepare system design examples",
    salaryMin: BigInt(120000),
    salaryMax: BigInt(155000),
    userId: { toString: () => "user-1" } as unknown as Principal,
  },
  {
    id: BigInt(6),
    companyName: "Loom",
    position: "React Native Engineer",
    location: "Remote",
    jobUrl: "https://loom.com/jobs/6",
    status: ApplicationStatus.Applied,
    source: ApplicationSource.job_board,
    jobType: JobType.remote,
    tags: ["React Native", "Mobile", "Video"],
    notes: "",
    appliedDate: now - day * BigInt(3),
    lastUpdated: now - day * BigInt(3),
    isHighPotential: false,
    fitScore: BigInt(65),
    fitScoreConfidence: BigInt(70),
    aiSuggestion: undefined,
    salaryMin: BigInt(110000),
    salaryMax: BigInt(145000),
    userId: { toString: () => "user-1" } as unknown as Principal,
  },
  {
    id: BigInt(7),
    companyName: "Retool",
    position: "Engineering Lead",
    location: "San Francisco, CA",
    jobUrl: "https://retool.com/jobs/7",
    status: ApplicationStatus.Interviewing,
    source: ApplicationSource.referral,
    jobType: JobType.hybrid,
    tags: ["Leadership", "React", "B2B"],
    notes: "First interview was excellent.",
    appliedDate: now - day * BigInt(18),
    lastUpdated: now - day * BigInt(7),
    isHighPotential: true,
    fitScore: BigInt(91),
    fitScoreConfidence: BigInt(88),
    aiSuggestion: "Stalled — 7 days since last update",
    salaryMin: BigInt(160000),
    salaryMax: BigInt(220000),
    userId: { toString: () => "user-1" } as unknown as Principal,
  },
];

export const mockBackend: backendInterface = {
  _initializeAccessControl: async () => undefined,

  addApplication: async (args) => ({
    id: BigInt(99),
    ...args,
    lastUpdated: now,
    userId: { toString: () => "user-1" } as unknown as Principal,
  }),

  assignCallerUserRole: async () => undefined,

  deleteApplication: async () => true,

  getAnalytics: async () => ({
    total: BigInt(sampleApplications.length),
    offerRate: 14.3,
    interviewRate: 42.8,
    responseRate: 57.1,
    avgTimeToOffer: 28.5,
    overTime: [
      { date: now - day * BigInt(330), count: BigInt(3) },
      { date: now - day * BigInt(300), count: BigInt(5) },
      { date: now - day * BigInt(270), count: BigInt(4) },
      { date: now - day * BigInt(240), count: BigInt(7) },
      { date: now - day * BigInt(210), count: BigInt(6) },
      { date: now - day * BigInt(180), count: BigInt(9) },
      { date: now - day * BigInt(150), count: BigInt(11) },
      { date: now - day * BigInt(120), count: BigInt(8) },
      { date: now - day * BigInt(90), count: BigInt(12) },
      { date: now - day * BigInt(60), count: BigInt(15) },
      { date: now - day * BigInt(30), count: BigInt(10) },
      { date: now, count: BigInt(7) },
    ],
    byJobType: [
      { jobType: JobType.remote, count: BigInt(4) },
      { jobType: JobType.hybrid, count: BigInt(2) },
      { jobType: JobType.onsite, count: BigInt(1) },
    ],
    bySource: [
      { source: ApplicationSource.referral, count: BigInt(2) },
      { source: ApplicationSource.direct, count: BigInt(1) },
      { source: ApplicationSource.job_board, count: BigInt(2) },
      { source: ApplicationSource.network, count: BigInt(1) },
      { source: ApplicationSource.recruiter, count: BigInt(1) },
    ],
  }),

  getApplication: async (id) =>
    sampleApplications.find((a) => a.id === id) ?? null,

  getApplications: async ({ page, pageSize }) => {
    const start = Number(page - BigInt(1)) * Number(pageSize);
    const items = sampleApplications.slice(start, start + Number(pageSize));
    return {
      total: BigInt(sampleApplications.length),
      page,
      pageSize,
      applications: items,
    };
  },

  getCallerUserRole: async () => UserRole.user,

  getInsights: async () => [
    {
      message:
        "Your response rate from referrals is 3× higher — apply more through your network",
      category: "strategy",
      priority: BigInt(1),
    },
    {
      message:
        "You tend to move faster in product-focused roles — prioritize those",
      category: "pattern",
      priority: BigInt(2),
    },
    {
      message:
        "2 applications have been stalled for 14+ days — consider sending follow-ups",
      category: "action",
      priority: BigInt(3),
    },
    {
      message: "Remote roles have a 2× higher offer rate for your profile",
      category: "insight",
      priority: BigInt(4),
    },
  ],

  initSampleData: async () => BigInt(7),

  isCallerAdmin: async () => false,

  parseJobUrl: async () => ({
    companyName: "Acme Corp",
    position: "Senior Engineer",
    location: "Remote",
    notes: "AI-parsed job description highlights",
    tags: ["React", "TypeScript", "Remote"],
    rawJson: "{}",
    jobType: JobType.remote,
    fitScore: BigInt(84),
    fitScoreConfidence: BigInt(87),
    salaryMin: BigInt(130000),
    salaryMax: BigInt(170000),
  }),

  searchApplications: async (query) =>
    sampleApplications.filter(
      (a) =>
        a.companyName.toLowerCase().includes(query.toLowerCase()) ||
        a.position.toLowerCase().includes(query.toLowerCase()) ||
        a.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
    ),

  transform: async (input) => ({
    status: BigInt(200),
    body: input.response.body,
    headers: [],
  }),

  updateApplication: async (args) => {
    const existing = sampleApplications.find((a) => a.id === args.id);
    if (!existing) return null;
    return { ...existing, ...args, lastUpdated: now };
  },

  updateApplicationStatus: async (id, status) => {
    const existing = sampleApplications.find((a) => a.id === id);
    if (!existing) return null;
    return { ...existing, status, lastUpdated: now };
  },
};
