import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import AccessControl "mo:caffeineai-authorization/access-control";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import AppLib "../lib/applications";
import Types "../types/applications";

mixin (
  accessControlState : AccessControl.AccessControlState,
  applications : Map.Map<Nat, Types.Application>,
  nextAppId : [var Nat],
  grokApiKeys : Map.Map<Types.UserId, Text>,
) {

  // --- Transform callback required by http-outcalls ---
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input)
  };

  // --- API Key Management ---

  public shared ({ caller }) func setGrokApiKey(key : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    grokApiKeys.add(caller, key);
  };

  public shared ({ caller }) func getGrokApiKey() : async ?Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    grokApiKeys.get(caller)
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

  // --- AI: URL parsing with Grok API (falls back to mock on missing key or error) ---

  public shared ({ caller }) func parseJobUrl(url : Text) : async Types.ParsedJobDetails {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };

    // Try Grok API if key is set
    switch (grokApiKeys.get(caller)) {
      case (?apiKey) {
        let prompt = "You are a job posting parser. Given this job posting URL: " # url # "\n\nReturn a JSON object (and nothing else) with these exact fields:\n- title (string): job title\n- company (string): company name\n- location (string): job location\n- salary_min (number or null): minimum salary if mentioned\n- salary_max (number or null): maximum salary if mentioned\n- job_type (string): one of \"full-time\", \"part-time\", \"contract\", \"remote\"\n- description (string): brief job description (2-3 sentences)\n- requirements (array of strings): key requirements\n- job_fit_score (number 0-100): score based on job quality and demand\n\nRespond with ONLY the JSON object, no markdown, no explanation.";

        let requestBody = "{\"model\":\"grok-3-mini\",\"messages\":[{\"role\":\"user\",\"content\":" # jsonString(prompt) # "}],\"max_tokens\":1024}";

        let headers : [OutCall.Header] = [
          { name = "Authorization"; value = "Bearer " # apiKey },
          { name = "Content-Type"; value = "application/json" },
        ];

        try {
          let responseText = await OutCall.httpPostRequest(
            "https://api.x.ai/v1/chat/completions",
            headers,
            requestBody,
            transform,
          );

          // Extract the content field from the Grok response JSON
          let content = extractGrokContent(responseText);
          parseGrokJobJson(content, url)
        } catch (_) {
          mockParseJobUrl(url)
        }
      };
      case null {
        mockParseJobUrl(url)
      };
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

  // --- Private helpers ---

  // Escape a text value for inclusion in a JSON string
  func jsonString(t : Text) : Text {
    let escaped = t.replace(#text "\\", "\\\\")
      .replace(#text "\"", "\\\"")
      .replace(#text "\n", "\\n")
      .replace(#text "\r", "\\r");
    "\"" # escaped # "\""
  };

  // Extract the `content` value from a Grok chat completions response.
  // Looks for: "content":"<value>" pattern (simplified extraction).
  func extractGrokContent(responseJson : Text) : Text {
    let marker = "\"content\":\"";
    switch (responseJson.split(#text marker).next()) {
      case null { responseJson };
      case (?_) {
        // Split by marker, take second part
        var parts = responseJson.split(#text marker);
        ignore parts.next(); // skip first (before marker)
        switch (parts.next()) {
          case null { responseJson };
          case (?after) {
            // Find the closing quote (not preceded by backslash — simplified)
            // We'll scan for unescaped closing quote
            var result = "";
            var i = 0;
            var done = false;
            let chars = after.toArray();
            while (i < chars.size() and not done) {
              let c = chars[i];
              if (c == '\"') {
                // Check if preceded by backslash
                if (i > 0 and chars[i - 1] == '\\') {
                  result := result # Text.fromChar(c);
                } else {
                  done := true;
                };
              } else {
                result := result # Text.fromChar(c);
              };
              i += 1;
            };
            // Unescape basic sequences
            result.replace(#text "\\n", "\n").replace(#text "\\\"", "\"").replace(#text "\\\\", "\\")
          };
        }
      };
    }
  };

  // Parse the JSON content returned by Grok into ParsedJobDetails.
  // Uses simple text search for field extraction (no JSON parser available).
  func parseGrokJobJson(json : Text, originalUrl : Text) : Types.ParsedJobDetails {
    let company = extractJsonStringField(json, "company");
    let title = extractJsonStringField(json, "title");
    let location = extractJsonStringField(json, "location");
    let jobTypeStr = extractJsonStringField(json, "job_type");
    let fitScore = extractJsonNatField(json, "job_fit_score");

    let jobType : ?Types.JobType = if (jobTypeStr.contains(#text "remote")) {
      ?#remote
    } else if (jobTypeStr.contains(#text "contract")) {
      ?#onsite  // map contract to onsite as closest
    } else if (jobTypeStr.contains(#text "hybrid")) {
      ?#hybrid
    } else {
      ?#onsite
    };

    let salMin = extractJsonNatField(json, "salary_min");
    let salMax = extractJsonNatField(json, "salary_max");

    {
      companyName = if (company == "") "Unknown Company" else company;
      position = if (title == "") "Software Engineer" else title;
      location = if (location == "") "Remote" else location;
      jobType;
      salaryMin = salMin;
      salaryMax = salMax;
      tags = [];
      fitScore;
      fitScoreConfidence = ?75;
      notes = "Parsed by Grok AI. Review and adjust details before saving.";
      rawJson = json;
    }
  };

  // Extract a string field value from a simple JSON object.
  func extractJsonStringField(json : Text, field : Text) : Text {
    let marker = "\"" # field # "\":\"";
    var parts = json.split(#text marker);
    ignore parts.next();
    switch (parts.next()) {
      case null { "" };
      case (?after) {
        var result = "";
        var i = 0;
        var done = false;
        let chars = after.toArray();
        while (i < chars.size() and not done) {
          let c = chars[i];
          if (c == '\"') {
            if (i > 0 and chars[i - 1] == '\\') {
              result := result # Text.fromChar(c);
            } else {
              done := true;
            };
          } else {
            result := result # Text.fromChar(c);
          };
          i += 1;
        };
        result
      };
    }
  };

  // Extract a numeric field from JSON and return as ?Nat.
  func extractJsonNatField(json : Text, field : Text) : ?Nat {
    let marker = "\"" # field # "\":";
    var parts = json.split(#text marker);
    ignore parts.next();
    switch (parts.next()) {
      case null { null };
      case (?after) {
        // Collect digits
        var numText = "";
        var i = 0;
        let chars = after.toArray();
        // Skip leading whitespace
        while (i < chars.size() and chars[i] == ' ') { i += 1 };
        // null literal
        if (i + 3 < chars.size() and chars[i] == 'n') { return null };
        while (i < chars.size()) {
          let c = chars[i];
          if (c >= '0' and c <= '9') {
            numText := numText # Text.fromChar(c);
          } else {
            i := chars.size(); // break
          };
          i += 1;
        };
        if (numText == "") null else Nat.fromText(numText)
      };
    }
  };

  // Mock parse based on URL keywords (fallback when no API key set or call fails)
  func mockParseJobUrl(url : Text) : Types.ParsedJobDetails {
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
      notes = "Parsed from job posting (demo mode — add your Grok API key in Settings to enable AI parsing). Review and adjust details before saving.";
      rawJson = "{\"company\":\"" # company # "\",\"position\":\"" # position # "\",\"location\":\"" # location # "\"}";
    }
  };
};
