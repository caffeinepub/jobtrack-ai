import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import AppLib "../lib/applications";
import Types "../types/applications";

mixin (
  accessControlState : AccessControl.AccessControlState,
  applications : Map.Map<Nat, Types.Application>,
  nextAppId : [var Nat],
) {

  // --- Transform callback required by http-outcalls ---
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input)
  };

  // --- CRUD ---

  public shared ({ caller }) func addApplication(args : Types.AddApplicationArgs) : async Types.Application {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let app = AppLib.addApplication(applications, nextAppId[0], caller, args);
    nextAppId[0] += 1;
    app
  };

  public shared ({ caller }) func updateApplication(args : Types.UpdateApplicationArgs) : async ?Types.Application {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    AppLib.updateApplication(applications, caller, args)
  };

  public shared ({ caller }) func deleteApplication(id : Nat) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    AppLib.deleteApplication(applications, caller, id)
  };

  public query ({ caller }) func getApplications(args : Types.GetApplicationsArgs) : async Types.GetApplicationsResult {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    AppLib.getApplications(applications, caller, args)
  };

  public query ({ caller }) func getApplication(id : Nat) : async ?Types.Application {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    AppLib.getApplication(applications, caller, id)
  };

  public shared ({ caller }) func updateApplicationStatus(id : Nat, status : Types.ApplicationStatus) : async ?Types.Application {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    AppLib.updateApplicationStatus(applications, caller, id, status)
  };

  // --- AI: URL parsing (mock returning realistic parsed job data) ---

  public shared ({ caller }) func parseJobUrl(url : Text) : async Types.ParsedJobDetails {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    // For demo: return realistic pre-parsed data based on URL patterns
    // In production this would call an AI service via HTTP outcall
    let lowerUrl = url.toLower();

    let (company, position, location, jobType, salMin, salMax, tags) : (Text, Text, Text, ?Types.JobType, ?Nat, ?Nat, [Text]) =
      if (lowerUrl.contains(#text "stripe")) {
        ("Stripe", "Senior Software Engineer", "San Francisco, CA", ?#hybrid, ?150000, ?190000, ["fintech", "backend", "distributed"])
      } else if (lowerUrl.contains(#text "google")) {
        ("Google", "Staff Software Engineer", "Mountain View, CA", ?#hybrid, ?200000, ?260000, ["cloud", "distributed", "backend"])
      } else if (lowerUrl.contains(#text "notion")) {
        ("Notion", "Product Engineer", "Remote", ?#remote, ?145000, ?175000, ["product", "typescript", "react"])
      } else if (lowerUrl.contains(#text "airbnb")) {
        ("Airbnb", "Senior Frontend Engineer", "San Francisco, CA", ?#hybrid, ?155000, ?185000, ["frontend", "react", "typescript"])
      } else if (lowerUrl.contains(#text "shopify")) {
        ("Shopify", "Backend Engineer", "Remote", ?#remote, ?140000, ?170000, ["e-commerce", "ruby", "go"])
      } else {
        ("Company", "Software Engineer", "Remote", ?#remote, ?120000, ?160000, ["software", "engineering"])
      };

    {
      companyName = company;
      position;
      location;
      jobType;
      salaryMin = salMin;
      salaryMax = salMax;
      tags;
      fitScore = ?82;
      fitScoreConfidence = ?78;
      notes = "Parsed from job posting. Review and adjust details before saving.";
      rawJson = "{\"company\":\"" # company # "\",\"position\":\"" # position # "\",\"location\":\"" # location # "\"}";
    }
  };

  // --- AI: Natural language search ---

  public shared ({ caller }) func searchApplications(searchQuery : Text) : async [Types.Application] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    AppLib.searchApplications(applications, caller, searchQuery)
  };

  // --- Analytics ---

  public query ({ caller }) func getAnalytics(dateRange : Types.DateRange) : async Types.AnalyticsResult {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    AppLib.computeAnalytics(applications, caller, dateRange)
  };

  // --- AI: Insights (pre-calculated for demo) ---

  public shared ({ caller }) func getInsights() : async [Types.AiInsight] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    [
      {
        message = "Your response rate from referrals is 3x higher than job boards (67% vs 22%). Apply more through your network to maximize interview chances.";
        category = "sourcing";
        priority = 1;
      },
      {
        message = "You tend to move faster in product-focused roles — your average time from application to interview is 4 days shorter for product companies vs. infrastructure roles.";
        category = "timing";
        priority = 2;
      },
      {
        message = "3 applications haven't been updated in over 2 weeks. Consider sending follow-ups to Google, Airbnb, and Loom to re-engage with recruiters.";
        category = "followup";
        priority = 1;
      },
    ]
  };

  // --- Sample data ---

  public shared ({ caller }) func initSampleData() : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    let newNextId = AppLib.initSampleData(applications, nextAppId[0], caller);
    nextAppId[0] := newNextId;
    newNextId
  };
};
