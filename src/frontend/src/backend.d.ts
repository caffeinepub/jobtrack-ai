import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type AppId = bigint;
export type Timestamp = bigint;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Application {
    id: AppId;
    fitScoreConfidence?: bigint;
    status: ApplicationStatus;
    aiSuggestion?: string;
    source: ApplicationSource;
    jobType: JobType;
    userId: UserId;
    fitScore?: bigint;
    tags: Array<string>;
    lastUpdated: Timestamp;
    jobUrl: string;
    appliedDate: Timestamp;
    notes: string;
    companyName: string;
    isHighPotential: boolean;
    salaryMax?: bigint;
    salaryMin?: bigint;
    position: string;
    location: string;
}
export interface UpdateApplicationArgs {
    id: AppId;
    fitScoreConfidence?: bigint;
    status: ApplicationStatus;
    aiSuggestion?: string;
    source: ApplicationSource;
    jobType: JobType;
    fitScore?: bigint;
    tags: Array<string>;
    jobUrl: string;
    appliedDate: Timestamp;
    notes: string;
    companyName: string;
    isHighPotential: boolean;
    salaryMax?: bigint;
    salaryMin?: bigint;
    position: string;
    location: string;
}
export interface GetApplicationsArgs {
    page: bigint;
    pageSize: bigint;
    statusFilter?: ApplicationStatus;
}
export interface AnalyticsResult {
    offerRate: number;
    total: bigint;
    overTime: Array<ApplicationsOverTime>;
    interviewRate: number;
    avgTimeToOffer: number;
    responseRate: number;
    byJobType: Array<ApplicationsByJobType>;
    bySource: Array<ApplicationsBySource>;
}
export interface ApplicationsBySource {
    source: ApplicationSource;
    count: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ParsedJobDetails {
    fitScoreConfidence?: bigint;
    rawJson: string;
    jobType?: JobType;
    fitScore?: bigint;
    tags: Array<string>;
    notes: string;
    companyName: string;
    salaryMax?: bigint;
    salaryMin?: bigint;
    position: string;
    location: string;
}
export type UserId = Principal;
export interface GetApplicationsResult {
    total: bigint;
    page: bigint;
    pageSize: bigint;
    applications: Array<Application>;
}
export interface DateRange {
    toDate: Timestamp;
    fromDate: Timestamp;
}
export interface ApplicationsByJobType {
    jobType: JobType;
    count: bigint;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface AiInsight {
    message: string;
    category: string;
    priority: bigint;
}
export interface AddApplicationArgs {
    fitScoreConfidence?: bigint;
    status: ApplicationStatus;
    aiSuggestion?: string;
    source: ApplicationSource;
    jobType: JobType;
    fitScore?: bigint;
    tags: Array<string>;
    jobUrl: string;
    appliedDate: Timestamp;
    notes: string;
    companyName: string;
    isHighPotential: boolean;
    salaryMax?: bigint;
    salaryMin?: bigint;
    position: string;
    location: string;
}
export interface ApplicationsOverTime {
    date: Timestamp;
    count: bigint;
}
export enum ApplicationSource {
    referral = "referral",
    network = "network",
    direct = "direct",
    job_board = "job_board",
    recruiter = "recruiter"
}
export enum ApplicationStatus {
    Applied = "Applied",
    Rejected = "Rejected",
    Interviewing = "Interviewing",
    Offer = "Offer",
    Archived = "Archived"
}
export enum JobType {
    onsite = "onsite",
    remote = "remote",
    hybrid = "hybrid"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addApplication(args: AddApplicationArgs): Promise<Application>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteApplication(id: bigint): Promise<boolean>;
    getAnalytics(dateRange: DateRange): Promise<AnalyticsResult>;
    getApplication(id: bigint): Promise<Application | null>;
    getApplications(args: GetApplicationsArgs): Promise<GetApplicationsResult>;
    getCallerUserRole(): Promise<UserRole>;
    getInsights(): Promise<Array<AiInsight>>;
    initSampleData(): Promise<bigint>;
    isCallerAdmin(): Promise<boolean>;
    parseJobUrl(url: string): Promise<ParsedJobDetails>;
    searchApplications(searchQuery: string): Promise<Array<Application>>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateApplication(args: UpdateApplicationArgs): Promise<Application | null>;
    updateApplicationStatus(id: bigint, status: ApplicationStatus): Promise<Application | null>;
}
