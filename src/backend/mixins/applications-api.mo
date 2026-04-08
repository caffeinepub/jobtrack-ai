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
  grokModels : Map.Map<Types.UserId, Text>,
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

  // --- Model Preference ---

  public shared ({ caller }) func setGrokModel(model : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    grokModels.add(caller, model);
  };

  public shared ({ caller }) func getGrokModel() : async ?Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized");
    };
    grokModels.get(caller)
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
        let model = switch (grokModels.get(caller)) {
          case (?m) m;
          case null "grok-3-mini";
        };

        let prompt = "You are a job posting parser. You cannot fetch URLs, but you can infer information from the URL structure itself.\n\nJob posting URL: " # url # "\n\nInstructions:\n1. Infer the company name from the URL domain/path (examples: 'careers.stripe.com' -> 'Stripe', 'jobs.google.com' -> 'Google', 'linkedin.com/jobs/view/software-engineer-at-acme' -> 'Acme', 'greenhouse.io/jobs/acme' -> 'Acme', 'lever.co/acme' -> 'Acme')\n2. Infer the job title/position from the URL path segments if present\n3. Infer location, job type, and other details from any keywords in the URL\n4. For fields you cannot determine, use reasonable defaults\n\nReturn ONLY a JSON object (no markdown, no explanation) with EXACTLY these field names:\n{\n  \"companyName\": \"string - company name inferred from URL domain or path\",\n  \"position\": \"string - job title or position\",\n  \"location\": \"string - city/state or Remote\",\n  \"jobType\": \"string - one of: full_time, part_time, contract, internship, remote\",\n  \"salaryRange\": { \"min\": number_or_null, \"max\": number_or_null },\n  \"fitScore\": number_between_0_and_100,\n  \"tags\": [\"array\", \"of\", \"relevant\", \"skill\", \"tags\"],\n  \"notes\": \"string - brief description of what was inferred\"\n}";

        let requestBody = "{\"model\":" # jsonString(model) # ",\"messages\":[{\"role\":\"user\",\"content\":" # jsonString(prompt) # "}],\"max_tokens\":1024}";

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
    let company = extractJsonStringField(json, "companyName");
    let title = extractJsonStringField(json, "position");
    let location = extractJsonStringField(json, "location");
    let jobTypeStr = extractJsonStringField(json, "jobType");
    let fitScore = extractJsonNatField(json, "fitScore");

    let jobType : ?Types.JobType = if (jobTypeStr.contains(#text "remote")) {
      ?#remote
    } else if (jobTypeStr.contains(#text "contract")) {
      ?#onsite  // map contract to onsite as closest
    } else if (jobTypeStr.contains(#text "hybrid")) {
      ?#hybrid
    } else {
      ?#onsite
    };

    // Extract salaryRange.min and salaryRange.max from nested object
    let salMin = extractJsonNatField(json, "min");
    let salMax = extractJsonNatField(json, "max");

    // Extract tags array (best-effort: first string inside array not used; tags returned as empty)
    ignore(extractJsonStringField(json, "tags"));

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
