import CommonTypes "common";

module {
  public type UserId = CommonTypes.UserId;
  public type Timestamp = CommonTypes.Timestamp;
  public type AppId = CommonTypes.AppId;

  public type JobType = {
    #remote;
    #hybrid;
    #onsite;
  };

  public type ApplicationStatus = {
    #Applied;
    #Interviewing;
    #Offer;
    #Rejected;
    #Archived;
  };

  public type ApplicationSource = {
    #job_board;
    #referral;
    #recruiter;
    #direct;
    #network;
  };

  public type Application = {
    id : AppId;
    userId : UserId;
    companyName : Text;
    position : Text;
    jobUrl : Text;
    location : Text;
    jobType : JobType;
    salaryMin : ?Nat;
    salaryMax : ?Nat;
    status : ApplicationStatus;
    appliedDate : Timestamp;
    lastUpdated : Timestamp;
    notes : Text;
    tags : [Text];
    fitScore : ?Nat;
    fitScoreConfidence : ?Nat;
    source : ApplicationSource;
    isHighPotential : Bool;
    aiSuggestion : ?Text;
  };

  public type AddApplicationArgs = {
    companyName : Text;
    position : Text;
    jobUrl : Text;
    location : Text;
    jobType : JobType;
    salaryMin : ?Nat;
    salaryMax : ?Nat;
    status : ApplicationStatus;
    appliedDate : Timestamp;
    notes : Text;
    tags : [Text];
    fitScore : ?Nat;
    fitScoreConfidence : ?Nat;
    source : ApplicationSource;
    isHighPotential : Bool;
    aiSuggestion : ?Text;
  };

  public type UpdateApplicationArgs = {
    id : AppId;
    companyName : Text;
    position : Text;
    jobUrl : Text;
    location : Text;
    jobType : JobType;
    salaryMin : ?Nat;
    salaryMax : ?Nat;
    status : ApplicationStatus;
    appliedDate : Timestamp;
    notes : Text;
    tags : [Text];
    fitScore : ?Nat;
    fitScoreConfidence : ?Nat;
    source : ApplicationSource;
    isHighPotential : Bool;
    aiSuggestion : ?Text;
  };

  public type GetApplicationsArgs = {
    page : Nat;
    pageSize : Nat;
    statusFilter : ?ApplicationStatus;
  };

  public type GetApplicationsResult = {
    applications : [Application];
    total : Nat;
    page : Nat;
    pageSize : Nat;
  };

  public type DateRange = {
    fromDate : Timestamp;
    toDate : Timestamp;
  };

  public type ApplicationsBySource = {
    source : ApplicationSource;
    count : Nat;
  };

  public type ApplicationsByJobType = {
    jobType : JobType;
    count : Nat;
  };

  public type ApplicationsOverTime = {
    date : Timestamp;
    count : Nat;
  };

  public type AnalyticsResult = {
    total : Nat;
    interviewRate : Float;
    offerRate : Float;
    avgTimeToOffer : Float;
    responseRate : Float;
    bySource : [ApplicationsBySource];
    overTime : [ApplicationsOverTime];
    byJobType : [ApplicationsByJobType];
  };

  public type ParsedJobDetails = {
    companyName : Text;
    position : Text;
    location : Text;
    jobType : ?JobType;
    salaryMin : ?Nat;
    salaryMax : ?Nat;
    tags : [Text];
    fitScore : ?Nat;
    fitScoreConfidence : ?Nat;
    notes : Text;
    rawJson : Text;
  };

  public type AiInsight = {
    message : Text;
    category : Text;
    priority : Nat;
  };
};
