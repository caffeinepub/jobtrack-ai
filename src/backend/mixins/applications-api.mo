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

    switch (grokApiKeys.get(caller)) {
      case (?apiKey) {
        let model = switch (grokModels.get(caller)) {
          case (?m) m;
          case null "grok-3-mini";
        };

        // System prompt: extremely explicit about output format
        let systemPrompt = "You are a job posting data extractor. Your ONLY job is to extract structured data from job posting URLs and return it as JSON.\n\nCRITICAL RULES:\n1. Return ONLY a valid JSON object. No markdown, no code blocks (no ```), no explanation text before or after.\n2. The JSON must start with { and end with }.\n3. Extract the EMPLOYER company name - NOT the job board. Examples:\n   - jobs.lever.co/stripe/abc -> companyName is \"Stripe\"\n   - greenhouse.io/acme/jobs -> companyName is \"Acme\"\n   - linkedin.com/jobs/view/engineer-at-google -> companyName is \"Google\"\n   - careers.shopify.com/job -> companyName is \"Shopify\"\n   - workday.com/acme/job -> companyName is \"Acme\"\n4. Use the URL path segments to infer position, company, and other details.\n5. For fields you cannot determine, use sensible defaults.\n\nThe JSON object must have EXACTLY these fields with EXACTLY these names:\n{\n  \"companyName\": \"string\",\n  \"position\": \"string\",\n  \"location\": \"string\",\n  \"jobType\": \"full_time or part_time or contract or internship or remote\",\n  \"salaryRange\": { \"min\": number or null, \"max\": number or null },\n  \"fitScore\": number between 0 and 100,\n  \"description\": \"string max 200 chars\",\n  \"notes\": \"string with 1-2 sentences of AI suggestions for the applicant\"\n}\n\nExample output:\n{\"companyName\":\"Stripe\",\"position\":\"Senior Software Engineer\",\"location\":\"San Francisco, CA\",\"jobType\":\"full_time\",\"salaryRange\":{\"min\":150000,\"max\":190000},\"fitScore\":82,\"description\":\"Backend infrastructure role on payments platform.\",\"notes\":\"Strong match for distributed systems experience. Highlight any payments or fintech background.\"}";

        let userMessage = "Extract job details from this URL: " # url;

        let requestBody = "{\"model\":" # jsonString(model) # ",\"messages\":[{\"role\":\"system\",\"content\":" # jsonString(systemPrompt) # "},{\"role\":\"user\",\"content\":" # jsonString(userMessage) # "}],\"max_tokens\":1024,\"temperature\":0}";

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

          // Extract the content field from the Grok response, then parse the job JSON
          let content = extractGrokContent(responseText);
          // Strip any markdown code fences the model may have added despite instructions
          let cleanedContent = stripMarkdownFences(content);
          parseGrokJobJson(cleanedContent, url)
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

  // =====================================================================
  // Private helpers
  // =====================================================================

  // Escape a text value for safe inclusion inside a JSON string literal.
  func jsonString(t : Text) : Text {
    let escaped = t
      .replace(#text "\\", "\\\\")
      .replace(#text "\"", "\\\"")
      .replace(#text "\n", "\\n")
      .replace(#text "\r", "\\r")
      .replace(#text "\t", "\\t");
    "\"" # escaped # "\""
  };

  // -----------------------------------------------------------------------
  // extractGrokContent
  //
  // The Grok chat-completions response has the shape:
  //   {"choices":[{"message":{"role":"assistant","content":"<VALUE>"}},...]}
  //
  // Strategy:
  //   1. Find the LAST occurrence of `"content":` in the response (the
  //      assistant turn is always the last content field).
  //   2. Skip whitespace after the colon.
  //   3. If the next char is `"`, read a JSON string (handling `\"` escapes).
  //   4. Unescape the resulting value so callers get a plain Motoko Text.
  // -----------------------------------------------------------------------
  func extractGrokContent(responseJson : Text) : Text {
    let chars = responseJson.toArray();
    let size = chars.size();

    // Find the last index of the sequence: "content":
    let needle = "\"content\":";
    let needleChars = needle.toArray();
    let needleLen = needleChars.size();

    var lastFound : Nat = 0;
    var foundAny = false;
    var i = 0;
    while (i + needleLen <= size) {
      var matchN = true;
      var j = 0;
      while (j < needleLen and matchN) {
        if (chars[i + j] != needleChars[j]) { matchN := false };
        j += 1;
      };
      if (matchN) { lastFound := i; foundAny := true };
      i += 1;
    };

    if (not foundAny) return responseJson; // not found — return raw

    // Advance past the needle
    var pos = lastFound + needleLen;

    // Skip whitespace
    while (pos < size and (chars[pos] == ' ' or chars[pos] == '\n' or chars[pos] == '\r' or chars[pos] == '\t')) {
      pos += 1;
    };

    if (pos >= size or chars[pos] != '\"') return responseJson; // not a string value

    pos += 1; // skip opening quote

    // Read until unescaped closing quote, collecting raw (still-escaped) chars
    var rawValue = "";
    var done = false;
    while (pos < size and not done) {
      let c = chars[pos];
      if (c == '\\' and pos + 1 < size) {
        // Escape sequence — keep both chars so we can unescape below
        rawValue := rawValue # Text.fromChar(c) # Text.fromChar(chars[pos + 1]);
        pos += 2;
      } else if (c == '\"') {
        done := true;
        pos += 1;
      } else {
        rawValue := rawValue # Text.fromChar(c);
        pos += 1;
      };
    };

    // Unescape JSON escape sequences
    unescapeJsonString(rawValue)
  };

  // Unescape a JSON-encoded string (after the surrounding quotes have been removed).
  func unescapeJsonString(s : Text) : Text {
    let chars = s.toArray();
    let size = chars.size();
    var result = "";
    var i = 0;
    while (i < size) {
      let c = chars[i];
      if (c == '\\' and i + 1 < size) {
        let next = chars[i + 1];
        if (next == 'n') {
          result := result # "\n";
        } else if (next == 'r') {
          result := result # "\r";
        } else if (next == 't') {
          result := result # "\t";
        } else if (next == '\"') {
          result := result # "\"";
        } else if (next == '\\') {
          result := result # "\\";
        } else if (next == '/') {
          result := result # "/";
        } else {
          // Unknown escape — keep as-is
          result := result # Text.fromChar(c) # Text.fromChar(next);
        };
        i += 2;
      } else {
        result := result # Text.fromChar(c);
        i += 1;
      };
    };
    result
  };

  // Strip markdown code fences that AI models sometimes add despite instructions.
  // e.g. ```json\n{...}\n``` -> {…}
  func stripMarkdownFences(s : Text) : Text {
    // Find first '{' and last '}'
    let chars = s.toArray();
    let size = chars.size();
    var firstBrace : Nat = 0;
    var firstBraceFound = false;
    var lastBrace : Nat = 0;
    var lastBraceFound = false;
    var i = 0;
    while (i < size) {
      if (chars[i] == '{') {
        if (not firstBraceFound) { firstBrace := i; firstBraceFound := true };
      };
      i += 1;
    };
    // Find last '}'
    var j = size;
    label findLast while (j > 0) {
      j -= 1;
      if (chars[j] == '}') {
        lastBrace := j;
        lastBraceFound := true;
        break findLast;
      };
    };

    if (not firstBraceFound or not lastBraceFound or lastBrace < firstBrace) return s;

    // Extract the substring from firstBrace to lastBrace inclusive
    var result = "";
    var k = firstBrace;
    while (k <= lastBrace) {
      result := result # Text.fromChar(chars[k]);
      k += 1;
    };
    result
  };

  // -----------------------------------------------------------------------
  // parseGrokJobJson
  //
  // Parse the JSON content returned by Grok into ParsedJobDetails.
  // Uses character-level scanning for reliable field extraction without
  // a full JSON parser.
  // -----------------------------------------------------------------------
  func parseGrokJobJson(json : Text, originalUrl : Text) : Types.ParsedJobDetails {
    let company = extractJsonStringField(json, "companyName");
    let title = extractJsonStringField(json, "position");
    let location = extractJsonStringField(json, "location");
    let jobTypeStr = extractJsonStringField(json, "jobType");
    let description = extractJsonStringField(json, "description");
    let notesStr = extractJsonStringField(json, "notes");
    let fitScore = extractJsonNatField(json, "fitScore");

    let jobType : ?Types.JobType = if (jobTypeStr.contains(#text "remote")) {
      ?#remote
    } else if (jobTypeStr.contains(#text "hybrid")) {
      ?#hybrid
    } else {
      ?#onsite
    };

    // Extract salaryRange nested object: find the block and extract min/max within it
    let (salMin, salMax) = extractSalaryRange(json);

    // Build notes from description + AI notes
    let combinedNotes = if (notesStr != "") {
      notesStr
    } else if (description != "") {
      description # " (Parsed by Grok AI)"
    } else {
      "Parsed by Grok AI. Review and adjust details before saving."
    };

    {
      companyName = if (company == "") companyFromUrl(originalUrl) else company;
      position = if (title == "") "Software Engineer" else title;
      location = if (location == "") "Remote" else location;
      jobType;
      salaryMin = salMin;
      salaryMax = salMax;
      tags = [];
      fitScore = switch fitScore {
        case (?s) ?s;
        case null ?75;
      };
      fitScoreConfidence = ?75;
      notes = combinedNotes;
      rawJson = json;
    }
  };

  // -----------------------------------------------------------------------
  // extractSalaryRange
  //
  // Finds the "salaryRange" nested object and extracts min/max from within it.
  // Falls back to a plain "salary" string field if nested object not found.
  // -----------------------------------------------------------------------
  func extractSalaryRange(json : Text) : (?Nat, ?Nat) {
    let chars = json.toArray();
    let size = chars.size();

    // Find "salaryRange" key
    let key = "\"salaryRange\"";
    let keyChars = key.toArray();
    let keyLen = keyChars.size();

    var keyPos : Nat = 0;
    var keyFound = false;
    var i = 0;
    while (i + keyLen <= size and not keyFound) {
      var matchK = true;
      var j = 0;
      while (j < keyLen and matchK) {
        if (chars[i + j] != keyChars[j]) { matchK := false };
        j += 1;
      };
      if (matchK) { keyPos := i; keyFound := true };
      i += 1;
    };

    if (not keyFound) return (null, null);

    // Find the opening '{' of the salaryRange object
    var pos = keyPos + keyLen;
    while (pos < size and chars[pos] != '{') { pos += 1 };
    if (pos >= size) return (null, null);

    // Find the closing '}' of the salaryRange object (track depth)
    var depth : Int = 0;
    var endPos = pos;
    var k = pos;
    label depthLoop while (k < size) {
      if (chars[k] == '{') { depth += 1 };
      if (chars[k] == '}') {
        depth -= 1;
        if (depth == 0) { endPos := k; break depthLoop };
      };
      k += 1;
    };

    // Extract just the salaryRange block
    var block = "";
    var b = pos;
    while (b <= endPos) {
      block := block # Text.fromChar(chars[b]);
      b += 1;
    };

    let salMin = extractJsonNatField(block, "min");
    let salMax = extractJsonNatField(block, "max");
    (salMin, salMax)
  };

  // -----------------------------------------------------------------------
  // extractJsonStringField
  //
  // Extract a JSON string field value by name.
  // Handles escaped quotes (\") within the value correctly by tracking
  // escape state rather than looking backward at the previous character.
  // -----------------------------------------------------------------------
  func extractJsonStringField(json : Text, field : Text) : Text {
    let marker = "\"" # field # "\":";
    let chars = json.toArray();
    let markerChars = marker.toArray();
    let markerLen = markerChars.size();
    let size = chars.size();

    // Find the marker
    var markerPos : Nat = 0;
    var markerFound = false;
    var i = 0;
    while (i + markerLen <= size and not markerFound) {
      var matchM = true;
      var j = 0;
      while (j < markerLen and matchM) {
        if (chars[i + j] != markerChars[j]) { matchM := false };
        j += 1;
      };
      if (matchM) { markerPos := i; markerFound := true };
      i += 1;
    };

    if (not markerFound) return "";

    var pos = markerPos + markerLen;

    // Skip whitespace
    while (pos < size and (chars[pos] == ' ' or chars[pos] == '\n' or chars[pos] == '\r' or chars[pos] == '\t')) {
      pos += 1;
    };

    if (pos >= size or chars[pos] != '\"') return ""; // not a string value
    pos += 1; // skip opening quote

    // Read until unescaped closing quote, using escape-state tracking
    var result = "";
    var done = false;
    while (pos < size and not done) {
      let c = chars[pos];
      if (c == '\\' and pos + 1 < size) {
        // Consume the escape sequence and emit the actual character
        let next = chars[pos + 1];
        if (next == '\"') {
          result := result # "\"";
        } else if (next == '\\') {
          result := result # "\\";
        } else if (next == 'n') {
          result := result # "\n";
        } else if (next == 'r') {
          result := result # "\r";
        } else if (next == 't') {
          result := result # "\t";
        } else {
          result := result # Text.fromChar(next);
        };
        pos += 2;
      } else if (c == '\"') {
        done := true;
        pos += 1;
      } else {
        result := result # Text.fromChar(c);
        pos += 1;
      };
    };
    result
  };

  // -----------------------------------------------------------------------
  // extractJsonNatField
  //
  // Extract a numeric field from JSON and return as ?Nat.
  // Skips whitespace after the colon, handles null literal.
  // -----------------------------------------------------------------------
  func extractJsonNatField(json : Text, field : Text) : ?Nat {
    let marker = "\"" # field # "\":";
    let chars = json.toArray();
    let markerChars = marker.toArray();
    let markerLen = markerChars.size();
    let size = chars.size();

    var markerPos2 : Nat = 0;
    var markerFound2 = false;
    var i = 0;
    while (i + markerLen <= size and not markerFound2) {
      var matchM2 = true;
      var j = 0;
      while (j < markerLen and matchM2) {
        if (chars[i + j] != markerChars[j]) { matchM2 := false };
        j += 1;
      };
      if (matchM2) { markerPos2 := i; markerFound2 := true };
      i += 1;
    };

    if (not markerFound2) return null;

    var pos = markerPos2 + markerLen;

    // Skip whitespace
    while (pos < size and (chars[pos] == ' ' or chars[pos] == '\n' or chars[pos] == '\r' or chars[pos] == '\t')) {
      pos += 1;
    };

    if (pos >= size) return null;

    // Check for null literal
    if (chars[pos] == 'n') return null;

    // Collect digit characters
    var numText = "";
    while (pos < size and chars[pos] >= '0' and chars[pos] <= '9') {
      numText := numText # Text.fromChar(chars[pos]);
      pos += 1;
    };

    if (numText == "") null else Nat.fromText(numText)
  };

  // -----------------------------------------------------------------------
  // companyFromUrl
  //
  // Last-resort: extract a company hint from the URL itself.
  // Handles common job-board patterns like:
  //   jobs.lever.co/<company>/...
  //   greenhouse.io/<company>/...
  //   <company>.com/careers/...
  // -----------------------------------------------------------------------
  func companyFromUrl(url : Text) : Text {
    let lower = url.toLower();

    // Common ATS patterns where company name is in the path
    let atsPatterns = [
      "lever.co/",
      "greenhouse.io/",
      "workday.com/",
      "smartrecruiters.com/",
      "icims.com/",
      "taleo.net/",
      "jobvite.com/",
      "ashbyhq.com/",
      "rippling.com/jobs/",
    ];

    var companySlug = "";
    for (pattern in atsPatterns.values()) {
      if (lower.contains(#text pattern) and companySlug == "") {
        // Extract the next path segment after the pattern
        let afterChars = lower.toArray();
        let patChars = pattern.toArray();
        let patLen = patChars.size();
        let afterSize = afterChars.size();
        var patPos : Nat = 0;
        var patFound = false;
        var pi = 0;
        while (pi + patLen <= afterSize and not patFound) {
          var matchP = true;
          var pj = 0;
          while (pj < patLen and matchP) {
            if (afterChars[pi + pj] != patChars[pj]) { matchP := false };
            pj += 1;
          };
          if (matchP) { patPos := pi; patFound := true };
          pi += 1;
        };
        if (patFound) {
          var seg = "";
          var si = patPos + patLen;
          while (si < afterSize and afterChars[si] != '/' and afterChars[si] != '?' and afterChars[si] != '#') {
            seg := seg # Text.fromChar(afterChars[si]);
            si += 1;
          };
          if (seg.size() > 0) { companySlug := seg };
        };
      };
    };

    // If no ATS pattern matched, try to extract the subdomain or domain name
    if (companySlug == "") {
      // Strip protocol
      let withoutProtocol = switch (lower.stripStart(#text "https://")) {
        case (?s) s;
        case null switch (lower.stripStart(#text "http://")) {
          case (?s) s;
          case null lower;
        };
      };
      // Take the hostname (up to first '/')
      let hostChars = withoutProtocol.toArray();
      var host = "";
      var hi = 0;
      while (hi < hostChars.size() and hostChars[hi] != '/') {
        host := host # Text.fromChar(hostChars[hi]);
        hi += 1;
      };
      // Remove known job-board subdomains/domains
      let jobBoards = ["jobs.", "careers.", "work.", "apply.", "hiring.", "recruit."];
      var cleanHost = host;
      for (prefix in jobBoards.values()) {
        switch (cleanHost.stripStart(#text prefix)) {
          case (?stripped) { cleanHost := stripped };
          case null {};
        };
      };
      // Take the first part before '.'
      let cleanChars = cleanHost.toArray();
      var part = "";
      var ci = 0;
      while (ci < cleanChars.size() and cleanChars[ci] != '.') {
        part := part # Text.fromChar(cleanChars[ci]);
        ci += 1;
      };
      // Skip generic job-board names
      let genericBoards = ["linkedin", "indeed", "glassdoor", "monster", "ziprecruiter", "lever", "greenhouse", "workday"];
      if (part.size() > 0 and not genericBoards.contains(part)) {
        companySlug := part;
      };
    };

    if (companySlug == "") return "Unknown Company";

    // Capitalize the slug: replace hyphens/underscores with spaces, then title-case
    let normalized = companySlug
      .replace(#char '-', " ")
      .replace(#char '_', " ");
    let slugChars = normalized.toArray();
    if (slugChars.size() == 0) return "Unknown Company";
    var result2 = "";
    var capitalizeNext2 = true; // capitalize first letter
    for (sc in slugChars.values()) {
      if (sc == ' ') {
        result2 := result2 # " ";
        capitalizeNext2 := true;
      } else if (capitalizeNext2) {
        result2 := result2 # Text.fromChar(sc).toUpper();
        capitalizeNext2 := false;
      } else {
        result2 := result2 # Text.fromChar(sc);
      };
    };
    result2
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
