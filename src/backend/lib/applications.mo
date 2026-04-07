import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/applications";

module {
  public type AppMap = Map.Map<Nat, Types.Application>;

  let FOURTEEN_DAYS_NS : Int = 1_209_600_000_000_000;

  // --- Helpers ---

  public func isTerminalStatus(status : Types.ApplicationStatus) : Bool {
    switch status {
      case (#Rejected or #Archived) true;
      case _ false;
    };
  };

  public func isStalledApplication(app : Types.Application) : Bool {
    let now = Time.now();
    switch (app.status) {
      case (#Applied or #Interviewing) {
        (now - app.lastUpdated) > FOURTEEN_DAYS_NS
      };
      case _ false;
    };
  };

  func computeHighPotential(fitScore : ?Nat, status : Types.ApplicationStatus) : Bool {
    switch fitScore {
      case (?score) {
        score >= 75 and not isTerminalStatus(status) and status != #Offer
      };
      case null false;
    };
  };

  // --- CRUD ---

  public func addApplication(
    apps : AppMap,
    nextId : Nat,
    userId : Principal,
    args : Types.AddApplicationArgs,
  ) : Types.Application {
    let now = Time.now();
    let hp = computeHighPotential(args.fitScore, args.status);
    let app : Types.Application = {
      id = nextId;
      userId;
      companyName = args.companyName;
      position = args.position;
      jobUrl = args.jobUrl;
      location = args.location;
      jobType = args.jobType;
      salaryMin = args.salaryMin;
      salaryMax = args.salaryMax;
      status = args.status;
      appliedDate = args.appliedDate;
      lastUpdated = now;
      notes = args.notes;
      tags = args.tags;
      fitScore = args.fitScore;
      fitScoreConfidence = args.fitScoreConfidence;
      source = args.source;
      isHighPotential = hp;
      aiSuggestion = args.aiSuggestion;
    };
    apps.add(nextId, app);
    app
  };

  public func updateApplication(
    apps : AppMap,
    userId : Principal,
    args : Types.UpdateApplicationArgs,
  ) : ?Types.Application {
    switch (apps.get(args.id)) {
      case null null;
      case (?existing) {
        if (not Principal.equal(existing.userId, userId)) return null;
        let hp = computeHighPotential(args.fitScore, args.status);
        let updated : Types.Application = {
          existing with
          companyName = args.companyName;
          position = args.position;
          jobUrl = args.jobUrl;
          location = args.location;
          jobType = args.jobType;
          salaryMin = args.salaryMin;
          salaryMax = args.salaryMax;
          status = args.status;
          appliedDate = args.appliedDate;
          lastUpdated = Time.now();
          notes = args.notes;
          tags = args.tags;
          fitScore = args.fitScore;
          fitScoreConfidence = args.fitScoreConfidence;
          source = args.source;
          isHighPotential = hp;
          aiSuggestion = args.aiSuggestion;
        };
        apps.add(args.id, updated);
        ?updated
      };
    };
  };

  public func deleteApplication(
    apps : AppMap,
    userId : Principal,
    id : Nat,
  ) : Bool {
    switch (apps.get(id)) {
      case null false;
      case (?existing) {
        if (not Principal.equal(existing.userId, userId)) return false;
        apps.remove(id);
        true
      };
    };
  };

  public func getApplications(
    apps : AppMap,
    userId : Principal,
    args : Types.GetApplicationsArgs,
  ) : Types.GetApplicationsResult {
    let userApps = apps.values().filter(func(a : Types.Application) : Bool {
        Principal.equal(a.userId, userId) and
        (switch (args.statusFilter) {
          case null true;
          case (?s) a.status == s;
        })
      }).toArray();
    let total = userApps.size();
    let start = args.page * args.pageSize;
    let end_ = Nat.min(start + args.pageSize, total);
    let page = if (start >= total) [] else userApps.sliceToArray(start, end_);
    { applications = page; total; page = args.page; pageSize = args.pageSize }
  };

  public func getApplication(
    apps : AppMap,
    userId : Principal,
    id : Nat,
  ) : ?Types.Application {
    switch (apps.get(id)) {
      case null null;
      case (?app) {
        if (Principal.equal(app.userId, userId)) ?app else null
      };
    };
  };

  public func updateApplicationStatus(
    apps : AppMap,
    userId : Principal,
    id : Nat,
    status : Types.ApplicationStatus,
  ) : ?Types.Application {
    switch (apps.get(id)) {
      case null null;
      case (?existing) {
        if (not Principal.equal(existing.userId, userId)) return null;
        let hp = computeHighPotential(existing.fitScore, status);
        let updated : Types.Application = {
          existing with
          status;
          lastUpdated = Time.now();
          isHighPotential = hp;
        };
        apps.add(id, updated);
        ?updated
      };
    };
  };

  // --- Search (keyword-based smart filtering) ---

  public func searchApplications(
    apps : AppMap,
    userId : Principal,
    filterResult : Text,
  ) : [Types.Application] {
    let lower = filterResult.toLower();
    let tokens : [Text] = lower.split(#char ' ').filter(func(t : Text) : Bool { t.size() > 0 }).toArray();

    // Detect status keywords
    let wantApplied = tokens.contains("applied");
    let wantInterview = tokens.contains("interview") or tokens.contains("interviewing");
    let wantOffer = tokens.contains("offer");
    let wantRejected = tokens.contains("rejected");
    let wantArchived = tokens.contains("archived");
    let hasStatusFilter = wantApplied or wantInterview or wantOffer or wantRejected or wantArchived;

    // Detect remote keyword
    let wantRemote = tokens.contains("remote");
    let wantHybrid = tokens.contains("hybrid");
    let wantOnsite = tokens.contains("onsite");
    let hasJobTypeFilter = wantRemote or wantHybrid or wantOnsite;

    // Detect salary keywords (naive: look for a number after "over" or "above")
    var minSalaryFilter : ?Nat = null;
    for ((i, tok) in tokens.enumerate()) {
      if ((tok == "over" or tok == "above") and i + 1 < tokens.size()) {
        let nextTok = tokens[i + 1];
        // strip 'k' suffix
        let normalized = if (nextTok.endsWith(#text "k")) {
          switch (Nat.fromText(nextTok.trimEnd(#text "k"))) {
            case (?n) ?(n * 1000);
            case null null;
          }
        } else {
          Nat.fromText(nextTok)
        };
        switch normalized {
          case (?n) { minSalaryFilter := ?n };
          case null {};
        };
      };
    };

    apps.values().filter(func(app : Types.Application) : Bool {
        if (not Principal.equal(app.userId, userId)) return false;

        // Status filter
        if (hasStatusFilter) {
          let statusMatch = switch (app.status) {
            case (#Applied) wantApplied;
            case (#Interviewing) wantInterview;
            case (#Offer) wantOffer;
            case (#Rejected) wantRejected;
            case (#Archived) wantArchived;
          };
          if (not statusMatch) return false;
        };

        // Job type filter
        if (hasJobTypeFilter) {
          let typeMatch = switch (app.jobType) {
            case (#remote) wantRemote;
            case (#hybrid) wantHybrid;
            case (#onsite) wantOnsite;
          };
          if (not typeMatch) return false;
        };

        // Salary filter
        switch minSalaryFilter {
          case (?minSal) {
            let salOk = switch (app.salaryMin) {
              case (?s) s >= minSal;
              case null (switch (app.salaryMax) {
                case (?s) s >= minSal;
                case null false;
              });
            };
            if (not salOk) return false;
          };
          case null {};
        };

        // Text search in company/position/notes/tags
        let searchable = (app.companyName # " " # app.position # " " # app.notes # " " # app.location).toLower();
        let hasTagMatch = app.tags.any(func(t : Text) : Bool {
          searchable.contains(#text (t.toLower()))
        });

        // If no structural filters matched any keyword, do generic text search
        if (not hasStatusFilter and not hasJobTypeFilter and minSalaryFilter == null) {
          let relevantTokens = tokens.filter(func(t : Text) : Bool { t.size() > 2 });
          if (relevantTokens.size() == 0) return true;
          relevantTokens.any(func(tok : Text) : Bool {
            searchable.contains(#text tok) or hasTagMatch
          })
        } else {
          true
        }
      }).toArray()
  };

  // --- Analytics ---

  public func computeAnalytics(
    apps : AppMap,
    userId : Principal,
    dateRange : Types.DateRange,
  ) : Types.AnalyticsResult {
    let userApps = apps.values().filter(func(a : Types.Application) : Bool {
        Principal.equal(a.userId, userId) and
        a.appliedDate >= dateRange.fromDate and
        a.appliedDate <= dateRange.toDate
      }).toArray();

    let total = userApps.size();
    if (total == 0) {
      return {
        total = 0;
        interviewRate = 0.0;
        offerRate = 0.0;
        avgTimeToOffer = 0.0;
        responseRate = 0.0;
        bySource = [];
        overTime = [];
        byJobType = [];
      };
    };

    var interviews = 0;
    var offers = 0;
    var rejections = 0;
    var totalOfferDays : Float = 0.0;
    var offerCount = 0;

    // bySource counts
    var srcJobBoard = 0;
    var srcReferral = 0;
    var srcRecruiter = 0;
    var srcDirect = 0;
    var srcNetwork = 0;

    // byJobType counts
    var jtRemote = 0;
    var jtHybrid = 0;
    var jtOnsite = 0;

    // overTime: group by month (use appliedDate truncated to month start)
    let monthMap = Map.empty<Int, Nat>();
    let MONTH_NS : Int = 2_592_000_000_000_000;

    for (app in userApps.values()) {
      switch (app.status) {
        case (#Interviewing) { interviews += 1 };
        case (#Offer) {
          offers += 1;
          let diffNs : Int = app.lastUpdated - app.appliedDate;
          let daysToOffer : Float = diffNs.toFloat() / (86_400_000_000_000 : Int).toFloat();
          totalOfferDays += daysToOffer;
          offerCount += 1;
        };
        case (#Rejected) { rejections += 1 };
        case _ {};
      };

      switch (app.source) {
        case (#job_board) { srcJobBoard += 1 };
        case (#referral) { srcReferral += 1 };
        case (#recruiter) { srcRecruiter += 1 };
        case (#direct) { srcDirect += 1 };
        case (#network) { srcNetwork += 1 };
      };

      switch (app.jobType) {
        case (#remote) { jtRemote += 1 };
        case (#hybrid) { jtHybrid += 1 };
        case (#onsite) { jtOnsite += 1 };
      };

      // Group by 30-day bucket
      let bucket = (app.appliedDate / MONTH_NS) * MONTH_NS;
      switch (monthMap.get(bucket)) {
        case null { monthMap.add(bucket, 1) };
        case (?c) { monthMap.add(bucket, c + 1) };
      };
    };

    let totalF = total.toFloat();
    let interviewRate = interviews.toFloat() / totalF;
    let offerRate = offers.toFloat() / totalF;
    let responseRate = (interviews + offers + rejections).toFloat() / totalF;
    let avgTimeToOffer = if (offerCount > 0) totalOfferDays / offerCount.toFloat() else 0.0;

    let bySource : [Types.ApplicationsBySource] = [
      { source = #job_board; count = srcJobBoard },
      { source = #referral; count = srcReferral },
      { source = #recruiter; count = srcRecruiter },
      { source = #direct; count = srcDirect },
      { source = #network; count = srcNetwork },
    ];

    let byJobType : [Types.ApplicationsByJobType] = [
      { jobType = #remote; count = jtRemote },
      { jobType = #hybrid; count = jtHybrid },
      { jobType = #onsite; count = jtOnsite },
    ];

    let overTime : [Types.ApplicationsOverTime] = monthMap.entries().map<(Int, Nat), Types.ApplicationsOverTime>(
        func((date, count)) { { date; count } }
      ).toArray();

    { total; interviewRate; offerRate; avgTimeToOffer; responseRate; bySource; overTime; byJobType }
  };

  // --- Sample Data ---

  public func initSampleData(
    apps : AppMap,
    nextId : Nat,
    userId : Principal,
  ) : Nat {
    let now = Time.now();
    let DAY : Int = 86_400_000_000_000;

    // Helper to build a timestamp N days ago
    func daysAgo(n : Int) : Int { now - n * DAY };

    let samples : [(
      Text, Text, Text, Text, Types.JobType, ?Nat, ?Nat,
      Types.ApplicationStatus, Int, Text, [Text],
      ?Nat, ?Nat, Types.ApplicationSource, ?Text
    )] = [
      // Applied (8) — 3 stalled (>14 days)
      ("Stripe", "Senior Backend Engineer", "https://stripe.com/jobs/1", "San Francisco, CA", #onsite, ?150000, ?180000, #Applied, daysAgo(20), "Exciting fintech role in payments infra.", ["fintech", "go", "backend"], ?88, ?90, #job_board, ?"Strong fit for distributed systems work"),
      ("Notion", "Staff Software Engineer", "https://notion.so/jobs/2", "Remote", #remote, ?160000, ?195000, #Applied, daysAgo(18), "Full-stack role with heavy Rust usage.", ["productivity", "rust", "full-stack"], ?82, ?85, #referral, ?"Referral from network — prioritize"),
      ("Airbnb", "Engineering Manager", "https://airbnb.com/jobs/3", "San Francisco, CA", #hybrid, ?180000, ?220000, #Applied, daysAgo(17), "EM role leading infra team.", ["management", "infrastructure", "python"], ?74, ?80, #network, null),
      ("Linear", "Product Engineer", "https://linear.app/jobs/4", "Remote", #remote, ?140000, ?165000, #Applied, daysAgo(5), "Small team, high-impact product work.", ["product", "typescript", "react"], ?91, ?92, #direct, ?"Excellent culture fit — apply ASAP"),
      ("Vercel", "Developer Experience Engineer", "https://vercel.com/jobs/5", "Remote", #remote, ?130000, ?155000, #Applied, daysAgo(3), "DX role improving developer tooling.", ["devtools", "nextjs", "typescript"], ?85, ?88, #job_board, null),
      ("Figma", "Senior Frontend Engineer", "https://figma.com/jobs/6", "San Francisco, CA", #hybrid, ?145000, ?175000, #Applied, daysAgo(7), "Design tool frontend work.", ["design", "canvas", "typescript"], ?78, ?82, #job_board, null),
      ("Loom", "Backend Engineer", "https://loom.com/jobs/7", "Remote", #remote, ?125000, ?150000, #Applied, daysAgo(2), "Video infrastructure platform.", ["video", "go", "backend"], ?72, ?75, #recruiter, null),
      ("Zapier", "Senior Software Engineer", "https://zapier.com/jobs/8", "Remote", #remote, ?135000, ?160000, #Applied, daysAgo(4), "Automation platform engineering.", ["automation", "python", "backend"], ?76, ?80, #job_board, null),

      // Interviewing (5) — 1 stalled
      ("Google", "Staff SWE, Infrastructure", "https://google.com/jobs/9", "Mountain View, CA", #hybrid, ?200000, ?250000, #Interviewing, daysAgo(16), "L7 infra role in Google Cloud.", ["cloud", "c++", "distributed"], ?79, ?78, #referral, ?"Follow up with recruiter — loop is stalled"),
      ("Meta", "Senior Software Engineer", "https://meta.com/jobs/10", "Menlo Park, CA", #hybrid, ?175000, ?210000, #Interviewing, daysAgo(8), "Reality Labs infra team.", ["vr", "ar", "c++"], ?80, ?83, #recruiter, ?"System design round scheduled"),
      ("Anthropic", "ML Engineer", "https://anthropic.com/jobs/11", "San Francisco, CA", #onsite, ?180000, ?230000, #Interviewing, daysAgo(6), "Alignment team — safety-focused ML work.", ["ml", "python", "ai"], ?93, ?91, #direct, ?"Strong alignment with background — top priority"),
      ("OpenAI", "Research Engineer", "https://openai.com/jobs/12", "San Francisco, CA", #hybrid, ?190000, ?240000, #Interviewing, daysAgo(5), "Scalable infrastructure for LLM training.", ["ml", "distributed", "python"], ?89, ?87, #network, ?"Prepare system design and ML coding rounds"),
      ("Databricks", "Senior Data Engineer", "https://databricks.com/jobs/13", "Remote", #remote, ?155000, ?185000, #Interviewing, daysAgo(3), "Data platform engineering.", ["spark", "scala", "data"], ?83, ?85, #job_board, null),

      // Offer (2)
      ("Shopify", "Senior Software Engineer", "https://shopify.com/jobs/14", "Remote", #remote, ?160000, ?190000, #Offer, daysAgo(30), "Commerce platform — Ruby and Go.", ["e-commerce", "ruby", "go"], ?86, ?88, #referral, ?"Offer in hand — negotiate equity"),
      ("Cloudflare", "Systems Engineer", "https://cloudflare.com/jobs/15", "Remote", #remote, ?145000, ?175000, #Offer, daysAgo(25), "Edge network systems work.", ["networking", "rust", "systems"], ?84, ?86, #job_board, ?"Competitive offer — deadline in 5 days"),

      // Rejected (5)
      ("Amazon", "Senior SDE II", "https://amazon.com/jobs/16", "Seattle, WA", #onsite, ?155000, ?185000, #Rejected, daysAgo(45), "Failed LP round — culture mismatch.", ["aws", "java", "distributed"], ?60, ?65, #job_board, null),
      ("Microsoft", "Principal Engineer", "https://microsoft.com/jobs/17", "Redmond, WA", #hybrid, ?180000, ?210000, #Rejected, daysAgo(40), "Coding round — algorithm performance.", ["azure", "c#", "cloud"], ?65, ?70, #job_board, null),
      ("Netflix", "Senior SWE, Personalization", "https://netflix.com/jobs/18", "Los Gatos, CA", #onsite, ?190000, ?240000, #Rejected, daysAgo(35), "ML system design round.", ["ml", "java", "streaming"], ?70, ?72, #recruiter, null),
      ("Uber", "Staff SWE", "https://uber.com/jobs/19", "San Francisco, CA", #hybrid, ?170000, ?205000, #Rejected, daysAgo(30), "Strong signal but level mismatch.", ["distributed", "go", "backend"], ?68, ?70, #network, null),
      ("Lyft", "Senior SWE", "https://lyft.com/jobs/20", "San Francisco, CA", #hybrid, ?150000, ?180000, #Rejected, daysAgo(28), "Technical phone screen — system design.", ["python", "backend", "maps"], ?63, ?65, #job_board, null),

      // Archived (2)
      ("Twitter", "Staff Engineer", "https://x.com/jobs/21", "San Francisco, CA", #onsite, ?160000, ?195000, #Archived, daysAgo(90), "Company instability — archived.", ["social", "scala", "backend"], ?55, ?60, #recruiter, null),
      ("Snap", "Senior Backend Engineer", "https://snap.com/jobs/22", "Los Angeles, CA", #hybrid, ?140000, ?170000, #Archived, daysAgo(75), "Role was filled internally.", ["mobile", "python", "backend"], ?58, ?62, #job_board, null),
    ];

    var id = nextId;
    for ((company, position, jobUrl, location, jobType, salMin, salMax, status, appliedDate, notes, tags, fitScore, fitConf, source, aiSuggestion) in samples.values()) {
      let hp = computeHighPotential(fitScore, status);
      let app : Types.Application = {
        id;
        userId;
        companyName = company;
        position;
        jobUrl;
        location;
        jobType;
        salaryMin = salMin;
        salaryMax = salMax;
        status;
        appliedDate;
        lastUpdated = appliedDate;
        notes;
        tags;
        fitScore;
        fitScoreConfidence = fitConf;
        source;
        isHighPotential = hp;
        aiSuggestion;
      };
      apps.add(id, app);
      id += 1;
    };
    id
  };
};
