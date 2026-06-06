// ─────────────────────────────────────────────────────────────────────────────
//  services/organicKeywordsService.js
//  GrowDigitally — Organic Keywords Service
//
//  Free APIs used:
//
//  PRIMARY — DataForSEO Labs API (free trial, no credit card required)
//    Sign up : https://app.dataforseo.com/register
//    Docs    : https://docs.dataforseo.com/v3/dataforseo_labs/
//    Add to .env:
//      DATAFORSEO_LOGIN=your_login_email
//      DATAFORSEO_PASSWORD=your_api_password
//
//  FALLBACK — Google Search Suggestions API (free, no key needed)
//    Uses Google Autocomplete endpoint to estimate keywords the domain
//    might be targeting. Not position data, but useful keyword signals.
//
//  Shows:
//    • Total organic keywords
//    • Top ranking keywords
//    • Search volume per keyword
//    • Current position
//    • Ranking page URL
//    • Keyword difficulty (when available)
//
//  Exports:
//    runOrganicKeywords(url, mainKeywords, location)  →  structured result 
// ─────────────────────────────────────────────────────────────────────────────

require("dotenv").config();
const { safeGet } = require("./TechnicalSeoAudit");

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Build Base64 auth header for DataForSEO */
const getDataForSEOAuth = () => {
  const login    = process.env.DATAFORSEO_LOGIN    || "";
  const password = process.env.DATAFORSEO_PASSWORD || "";
  if (!login || !password) return null;
  return "Basic " + Buffer.from(`${login}:${password}`).toString("base64");
};

/** Get DataForSEO location code from location string */
const getLocationCode = (location) => {
  if (!location) return 2840;
  const loc = location.toLowerCase();
  const map = {
    "sri lanka":              2144,
    "india":                  2356,
    "united states":          2840,
    "uk":                     2826,
    "united kingdom":         2826,
    "australia":              2036,
    "canada":                 2124,
    "singapore":              2702,
    "uae":                    2784,
    "united arab emirates":   2784,
    "pakistan":               2586,
    "bangladesh":             2050,
    "malaysia":               2458,
    "south africa":           2710,
  };
  for (const [key, code] of Object.entries(map)) {
    if (loc.includes(key)) return code;
  }
  return 2840;
};

/**
 * Classify keyword position into a SERP tier label
 */
const classifyPosition = (position) => {
  if (!position) return { label: "Not Ranking", tier: "none" };
  if (position === 1)        return { label: "Position 1 🏆",   tier: "top"    };
  if (position <= 3)         return { label: "Top 3",           tier: "top"    };
  if (position <= 10)        return { label: "Page 1",          tier: "page1"  };
  if (position <= 20)        return { label: "Page 2",          tier: "page2"  };
  if (position <= 50)        return { label: "Pages 3–5",       tier: "low"    };
  return                            { label: "Page 5+",         tier: "deep"   };
};

/**
 * Classify keyword difficulty (0–100)
 */
const classifyDifficulty = (kd) => {
  if (kd === null || kd === undefined) return { label: "Unknown", tier: "unknown" };
  if (kd >= 80) return { label: "Very Hard",   tier: "hard"   };
  if (kd >= 60) return { label: "Hard",        tier: "hard"   };
  if (kd >= 40) return { label: "Medium",      tier: "medium" };
  if (kd >= 20) return { label: "Easy",        tier: "easy"   };
  return               { label: "Very Easy",   tier: "easy"   };
};

/**
 * Classify search volume into a tier
 */
const classifyVolume = (volume) => {
  if (!volume) return { label: "No Data", tier: "unknown" };
  if (volume >= 10000) return { label: "Very High",  tier: "high"   };
  if (volume >= 1000)  return { label: "High",       tier: "high"   };
  if (volume >= 100)   return { label: "Medium",     tier: "medium" };
  if (volume >= 10)    return { label: "Low",        tier: "low"    };
  return                      { label: "Very Low",   tier: "low"    };
};

/**
 * Classify keyword intent from its text
 */
const classifyIntent = (keyword) => {
  const kw = (keyword || "").toLowerCase();

  const transactional = ["buy", "price", "order", "shop", "cheap", "deal", "discount", "hire", "service", "quote", "cost", "booking", "book"];
  const informational = ["how", "what", "why", "when", "where", "guide", "tutorial", "tips", "learn", "explain", "meaning"];
  const navigational  = ["login", "sign in", "website", "official", "contact", "near me", "location", "address", "phone"];

  if (transactional.some((w) => kw.includes(w))) return "Transactional";
  if (navigational.some((w) => kw.includes(w)))  return "Navigational";
  if (informational.some((w) => kw.includes(w))) return "Informational";
  return "Commercial";
};

// ─────────────────────────────────────────────────────────────────────────────
//  PRIMARY SOURCE — DataForSEO Labs
//  Ranked Keywords for a domain (organic positions)
// ─────────────────────────────────────────────────────────────────────────────

const fetchFromDataForSEO = async (domain, location) => {
  const auth = getDataForSEOAuth();
  if (!auth) return null;

  const locationCode = getLocationCode(location);
  console.log(`[Organic Keywords] Fetching DataForSEO ranked keywords for: ${domain}`);

  try {
    // ── Ranked keywords ─────────────────────────────────────────────────────
    const rankedRes = await safeGet(
      "https://api.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live",
      {
        method: "POST",
        headers: { "Authorization": auth, "Content-Type": "application/json" },
        data: JSON.stringify([{
          target:         domain,
          location_code:  locationCode,
          language_code:  "en",
          limit:          50,
          order_by:       ["keyword_data.keyword_info.search_volume,desc"],
          filters:        [
            "ranked_serp_element.serp_item.rank_absolute", "<=", 100
          ],
        }]),
      }
    );

    // ── Domain summary for total keywords count ──────────────────────────────
    const summaryRes = await safeGet(
      "https://api.dataforseo.com/v3/dataforseo_labs/google/domain_whois_overview/live",
      {
        method: "POST",
        headers: { "Authorization": auth, "Content-Type": "application/json" },
        data: JSON.stringify([{ target: domain }]),
      }
    );

    if (rankedRes.status !== 200 || !rankedRes.data || rankedRes.data.status_code !== 20000) {
      const apiMsg = rankedRes.data?.status_message || rankedRes.error || "Unknown error";
      console.error(`[Organic Keywords] DataForSEO ranked keywords call failed. Status: ${rankedRes.status}, API status_code: ${rankedRes.data?.status_code}, Msg: ${apiMsg}`);
      return null;
    }

    if (summaryRes.status !== 200 || !summaryRes.data || summaryRes.data.status_code !== 20000) {
      const apiMsg = summaryRes.data?.status_message || summaryRes.error || "Unknown error";
      console.error(`[Organic Keywords] DataForSEO domain overview call failed. Status: ${summaryRes.status}, API status_code: ${summaryRes.data?.status_code}, Msg: ${apiMsg}`);
      return null;
    }

    // ── Parse ranked keywords ─────────────────────────────────────────────────
    const rankedTask  = rankedRes.data?.tasks?.[0];
    const rankedItems = rankedTask?.result?.[0]?.items || [];
    const totalCount  = rankedTask?.result?.[0]?.total_count || rankedItems.length;

    const keywords = rankedItems.map((item) => {
      const kwData   = item.keyword_data || {};
      const kwInfo   = kwData.keyword_info || {};
      const serpItem = item.ranked_serp_element?.serp_item || {};
      const position = serpItem.rank_absolute || null;

      return {
        keyword:         kwData.keyword             || "",
        searchVolume:    kwInfo.search_volume        ?? null,
        volumeLabel:     classifyVolume(kwInfo.search_volume).label,
        currentPosition: position,
        positionLabel:   classifyPosition(position).label,
        positionTier:    classifyPosition(position).tier,
        rankingUrl:      serpItem.url               || item.url || "",
        keywordDifficulty: kwData.keyword_properties?.keyword_difficulty ?? null,
        difficultyLabel: classifyDifficulty(kwData.keyword_properties?.keyword_difficulty).label,
        cpc:             kwInfo.cpc                 ?? null,
        competition:     kwInfo.competition         ?? null,
        intent:          classifyIntent(kwData.keyword || ""),
        trend:           kwInfo.monthly_searches
          ? kwInfo.monthly_searches.slice(-3).map((m) => m.search_volume)
          : [],
      };
    });

    // ── Parse domain summary ──────────────────────────────────────────────────
    const summaryItem    = summaryRes.data?.tasks?.[0]?.result?.[0]?.items?.[0] || null;
    const totalOrganic   = summaryItem?.metrics?.organic?.count ?? totalCount;
    const pos1Count      = summaryItem?.metrics?.organic?.pos_1    ?? keywords.filter((k) => k.currentPosition === 1).length;
    const page1Count     = summaryItem?.metrics?.organic?.pos_2_3  + summaryItem?.metrics?.organic?.pos_4_10 ?? keywords.filter((k) => k.positionTier === "page1").length;

    // ── Separate into groups ──────────────────────────────────────────────────
    const top3Keywords    = keywords.filter((k) => k.currentPosition && k.currentPosition <= 3);
    const page1Keywords   = keywords.filter((k) => k.currentPosition && k.currentPosition <= 10);
    const page2Keywords   = keywords.filter((k) => k.currentPosition && k.currentPosition > 10 && k.currentPosition <= 20);
    const quickWins       = keywords.filter((k) => k.currentPosition && k.currentPosition >= 11 && k.currentPosition <= 20);

    return {
      source:           "DataForSEO",
      domain,
      totalOrganicKeywords: totalOrganic,
      pos1Count,
      page1Count:       page1Keywords.length,
      page2Count:       page2Keywords.length,
      quickWinsCount:   quickWins.length,
      keywords,
      top3Keywords,
      page1Keywords,
      quickWins,
      totalRetrieved:   keywords.length,
    };

  } catch (err) {
    console.error(`[Organic Keywords] DataForSEO error: ${err.message}`);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  FALLBACK SOURCE — Google Autocomplete + user keywords expansion
//  Generates keyword suggestions from Google's free autocomplete API.
//  No position data — but shows keyword landscape the site should target.
// ─────────────────────────────────────────────────────────────────────────────

const fetchFromGoogleSuggestions = async (mainKeywords, location) => {
  console.log(`[Organic Keywords] No DataForSEO credentials — using Google Autocomplete fallback`);

  if (!mainKeywords) {
    return {
      source:        "Google Autocomplete (Fallback)",
      isEstimated:   true,
      error:         "No main keywords provided — cannot generate keyword suggestions",
      keywords:      [],
      totalOrganicKeywords: null,
    };
  }

  // Parse keywords
  const keywordList = mainKeywords.split(",").map((k) => k.trim()).filter(Boolean);
  const allSuggestions = [];

  for (const kw of keywordList.slice(0, 3)) {  // limit to first 3 seeds
    try {
      // Google Autocomplete free endpoint
      const res = await safeGet(
        `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(kw)}`
      );

      if (res.data && Array.isArray(res.data) && res.data[1]) {
        const suggestions = res.data[1].slice(0, 10);
        suggestions.forEach((suggestion) => {
          if (!allSuggestions.find((s) => s.keyword === suggestion)) {
            allSuggestions.push({
              keyword:         suggestion,
              searchVolume:    null,
              volumeLabel:     "N/A — API required",
              currentPosition: null,
              positionLabel:   "Unknown — API required",
              positionTier:    "unknown",
              rankingUrl:      "N/A",
              keywordDifficulty: null,
              difficultyLabel: "N/A — API required",
              cpc:             null,
              competition:     null,
              intent:          classifyIntent(suggestion),
              isSuggestion:    true,
              seedKeyword:     kw,
            });
          }
        });
      }
    } catch (err) {
      console.error(`[Organic Keywords] Autocomplete error for "${kw}": ${err.message}`);
    }
  }

  return {
    source:               "Google Autocomplete (Fallback)",
    isEstimated:          true,
    estimationNote:       "Position, search volume, and difficulty data require DataForSEO API credentials. Keywords shown are Google suggestions for your seed keywords.",
    domain:               "",
    totalOrganicKeywords: null,
    pos1Count:            null,
    page1Count:           null,
    page2Count:           null,
    quickWinsCount:       null,
    keywords:             allSuggestions,
    top3Keywords:         [],
    page1Keywords:        [],
    quickWins:            [],
    totalRetrieved:       allSuggestions.length,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
//  runOrganicKeywords  (main export)
//
//  @param  {string} url          — normalised website URL
//  @param  {string} mainKeywords — comma-separated keywords from user input
//  @param  {string} location     — user's target location
//  @returns {object}             — structured organic keywords result
// ─────────────────────────────────────────────────────────────────────────────

const runOrganicKeywords = async (url, mainKeywords, location) => {
  console.log(`[Organic Keywords] Starting keyword analysis for: ${url}`);

  const domain = new URL(url).hostname;
  let result   = null;

  // Try DataForSEO first
  result = await fetchFromDataForSEO(domain, location);

  // Fall back to Google Autocomplete if no credentials
  if (!result) {
    result = await fetchFromGoogleSuggestions(mainKeywords, location);
    result.domain = domain;
  }

  console.log(`[Organic Keywords] Done — Source: ${result.source} | Total: ${result.totalOrganicKeywords ?? "N/A"} | Retrieved: ${result.totalRetrieved}`);

  return {
    ...result,
    url,
    mainKeywords,
    location,
    fetchedAt: new Date().toISOString(),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
//  formatOrganicKeywordsAsText
//  GrowDigitally — Organic Keywords Report Formatter
//
//  Add this function into seoController.js alongside all other formatters.
//
//  @param  {object} keywordsData  — result from runOrganicKeywords()
//  @param  {object} customerInfo  — { name, email, whatsAppNum, websiteUrl }
//  @returns {string}              — formatted plain-text report section
// ─────────────────────────────────────────────────────────────────────────────

const formatOrganicKeywordsAsText = (keywordsData, customerInfo) => {

  const { name, email, whatsAppNum, websiteUrl } = customerInfo;

  const LINE  = "─".repeat(70);
  const LINE2 = "═".repeat(70);

  // ── Icon helpers ──────────────────────────────────────────────────────────
  const positionIcon = (tier) => {
    const map = {
      top:     "🏆",
      page1:   "🟢",
      page2:   "🟡",
      low:     "🟠",
      deep:    "🔴",
      none:    "⚪",
      unknown: "⚪",
    };
    return map[tier] || "⚪";
  };

  const difficultyIcon = (tier) => {
    const map = {
      easy:    "🟢",
      medium:  "🟡",
      hard:    "🔴",
      unknown: "⚪",
    };
    return map[tier] || "⚪";
  };

  const volumeIcon = (tier) => {
    const map = {
      high:    "🔥",
      medium:  "🟡",
      low:     "🔵",
      unknown: "⚪",
    };
    return map[tier] || "⚪";
  };

  const intentIcon = (intent) => {
    const map = {
      "Transactional": "💰",
      "Informational": "📘",
      "Navigational":  "🧭",
      "Commercial":    "🛒",
    };
    return map[intent] || "🔵";
  };

  const countLabel = (val) =>
    val !== null && val !== undefined ? val.toLocaleString() : "N/A";

  // ── Build report string ───────────────────────────────────────────────────
  let R = "";

  // ── Header ────────────────────────────────────────────────────────────────
  R += `\n${LINE2}\n`;
  R += `  SERVICE 6 — ORGANIC KEYWORDS\n`;
  R += `${LINE2}\n\n`;

  R += `CUSTOMER INFORMATION\n${LINE}\n`;
  R += `Name       : ${name}\n`;
  R += `Email      : ${email}\n`;
  R += `WhatsApp   : ${whatsAppNum}\n`;
  R += `Website    : ${websiteUrl}\n`;
  R += `Generated  : ${new Date().toISOString()}\n\n`;

  // ── Data source note ──────────────────────────────────────────────────────
  R += `DATA SOURCE\n${LINE}\n`;
  R += `  Source    : ${keywordsData.source}\n`;
  R += `  Domain    : ${keywordsData.domain}\n`;
  R += `  Location  : ${keywordsData.location || "Not specified"}\n`;
  R += `  Keywords  : ${keywordsData.mainKeywords || "Not provided"}\n`;
  if (keywordsData.isEstimated) {
    R += `  ⚠️  ESTIMATED DATA — ${keywordsData.estimationNote}\n`;
    R += `\n  To get real keyword ranking data, add to your .env:\n`;
    R += `    DATAFORSEO_LOGIN=your_email\n`;
    R += `    DATAFORSEO_PASSWORD=your_api_password\n`;
    R += `    Sign up free: https://app.dataforseo.com/register\n`;
  } else {
    R += `  ✅ Live data from DataForSEO API\n`;
  }
  R += "\n";

  // ── Error fallback ────────────────────────────────────────────────────────
  if (keywordsData.error) {
    R += `ERROR\n${LINE}\n`;
    R += `  ❌ ${keywordsData.error}\n\n`;
    R += `${LINE2}\n  END OF SERVICE 6 — ORGANIC KEYWORDS\n${LINE2}\n`;
    return R;
  }

  // ════════════════════════════════════════
  //  KEYWORD OVERVIEW SUMMARY
  // ════════════════════════════════════════
  R += `KEYWORD OVERVIEW\n${LINE}\n`;
  R += `  Total Organic Keywords   : ${countLabel(keywordsData.totalOrganicKeywords)}\n`;
  R += `  Keywords Retrieved       : ${countLabel(keywordsData.totalRetrieved)}\n`;

  if (!keywordsData.isEstimated) {
    R += `  Ranking #1 (Position 1)  : ${countLabel(keywordsData.pos1Count)} keywords\n`;
    R += `  Ranking Page 1 (Top 10)  : ${countLabel(keywordsData.page1Count)} keywords\n`;
    R += `  Ranking Page 2 (11–20)   : ${countLabel(keywordsData.page2Count)} keywords\n`;
    R += `  Quick Win Opportunities  : ${countLabel(keywordsData.quickWinsCount)} keywords (pos 11–20)\n`;
  }
  R += "\n";

  // ════════════════════════════════════════
  //  TOP RANKING KEYWORDS — Full table
  // ════════════════════════════════════════
  R += `TOP RANKING KEYWORDS\n${LINE}\n`;

  if (keywordsData.keywords && keywordsData.keywords.length > 0) {
    // Table header
    if (!keywordsData.isEstimated) {
      R += `${"#".padEnd(4)} ${"Keyword".padEnd(35)} ${"Volume".padEnd(10)} ${"Position".padEnd(12)} ${"Difficulty".padEnd(12)} ${"Intent".padEnd(14)}\n`;
      R += `${"-".repeat(90)}\n`;

      keywordsData.keywords.slice(0, 30).forEach((kw, i) => {
        const num      = String(i + 1).padEnd(4);
        const keyword  = (kw.keyword || "").substring(0, 34).padEnd(35);
        const vol      = kw.searchVolume !== null ? String(kw.searchVolume.toLocaleString()).padEnd(10) : "N/A".padEnd(10);
        const pos      = kw.currentPosition !== null ? `#${kw.currentPosition} ${kw.positionLabel}`.substring(0, 11).padEnd(12) : "N/A".padEnd(12);
        const diff     = kw.keywordDifficulty !== null ? `${kw.keywordDifficulty} ${kw.difficultyLabel}`.substring(0, 11).padEnd(12) : "N/A".padEnd(12);
        const intent   = (kw.intent || "").padEnd(14);
        const pIcon    = positionIcon(kw.positionTier);
        const dIcon    = difficultyIcon(kw.difficultyLabel?.includes("Easy") ? "easy" : kw.difficultyLabel?.includes("Hard") ? "hard" : "medium");

        R += `${pIcon} ${num}${keyword}${vol}${pos}${dIcon} ${diff}${intentIcon(kw.intent)} ${intent}\n`;
      });

      if (keywordsData.keywords.length > 30) {
        R += `  ... and ${keywordsData.keywords.length - 30} more keywords\n`;
      }

    } else {
      // Fallback mode — show suggestions without position data
      R += `  ℹ️  Showing Google keyword suggestions for your seed keywords.\n`;
      R += `  Position and volume data not available without DataForSEO API.\n\n`;
      R += `${"#".padEnd(4)} ${"Keyword".padEnd(40)} ${"Intent".padEnd(16)} ${"Seed Keyword"}\n`;
      R += `${"-".repeat(75)}\n`;

      keywordsData.keywords.slice(0, 30).forEach((kw, i) => {
        const num     = String(i + 1).padEnd(4);
        const keyword = (kw.keyword || "").substring(0, 39).padEnd(40);
        const intent  = (kw.intent || "").padEnd(16);
        const seed    = kw.seedKeyword || "";
        R += `${intentIcon(kw.intent)} ${num}${keyword}${intent}${seed}\n`;
      });
    }
  } else {
    R += `  ℹ️  No keyword data available.\n`;
  }
  R += "\n";

  // ════════════════════════════════════════
  //  TOP 3 KEYWORDS (detailed breakdown)
  // ════════════════════════════════════════
  if (keywordsData.top3Keywords && keywordsData.top3Keywords.length > 0) {
    R += `TOP 3 RANKING KEYWORDS (DETAILED)\n${LINE}\n`;
    keywordsData.top3Keywords.forEach((kw, i) => {
      R += `  ${i + 1}. ${kw.keyword}\n`;
      R += `     Position     : #${kw.currentPosition} — ${kw.positionLabel}\n`;
      R += `     Search Volume: ${countLabel(kw.searchVolume)}/mo ${kw.searchVolume ? `(${kw.volumeLabel})` : ""}\n`;
      R += `     Ranking URL  : ${kw.rankingUrl || "N/A"}\n`;
      if (kw.keywordDifficulty !== null) {
        R += `     Difficulty   : ${kw.keywordDifficulty}/100 (${kw.difficultyLabel})\n`;
      }
      if (kw.cpc !== null) R += `     CPC          : $${kw.cpc}\n`;
      R += `     Intent       : ${intentIcon(kw.intent)} ${kw.intent}\n`;
      if (kw.trend && kw.trend.length > 0) {
        R += `     Trend (3mo)  : ${kw.trend.join(" → ")}\n`;
      }
      R += "\n";
    });
  }

  // ════════════════════════════════════════
  //  QUICK WIN KEYWORDS (positions 11–20)
  // ════════════════════════════════════════
  if (keywordsData.quickWins && keywordsData.quickWins.length > 0) {
    R += `QUICK WIN KEYWORDS (Positions 11–20)\n${LINE}\n`;
    R += `  These keywords are on page 2 — a small optimisation push could move them to page 1.\n\n`;

    keywordsData.quickWins.slice(0, 10).forEach((kw, i) => {
      R += `  ${i + 1}. "${kw.keyword}"\n`;
      R += `     Position     : #${kw.currentPosition}\n`;
      R += `     Search Volume: ${countLabel(kw.searchVolume)}/mo\n`;
      R += `     Ranking URL  : ${kw.rankingUrl || "N/A"}\n`;
      if (kw.keywordDifficulty !== null) {
        R += `     Difficulty   : ${kw.keywordDifficulty}/100 (${kw.difficultyLabel})\n`;
      }
      R += `     Intent       : ${intentIcon(kw.intent)} ${kw.intent}\n\n`;
    });
  }

  // ════════════════════════════════════════
  //  KEYWORD INTENT BREAKDOWN
  // ════════════════════════════════════════
  if (keywordsData.keywords && keywordsData.keywords.length > 0) {
    R += `KEYWORD INTENT BREAKDOWN\n${LINE}\n`;
    const intents = { Transactional: 0, Informational: 0, Navigational: 0, Commercial: 0 };
    keywordsData.keywords.forEach((kw) => {
      if (intents[kw.intent] !== undefined) intents[kw.intent]++;
    });
    const total = keywordsData.keywords.length;
    Object.entries(intents).forEach(([intent, count]) => {
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      R += `  ${intentIcon(intent)} ${intent.padEnd(18)}: ${count} keywords (${pct}%)\n`;
    });
    R += "\n";
  }

  // ════════════════════════════════════════
  //  KEYWORD RECOMMENDATIONS
  // ════════════════════════════════════════
  R += `KEYWORD RECOMMENDATIONS\n${LINE}\n`;
  const recs = [];

  if (keywordsData.isEstimated) {
    recs.push("Add DataForSEO API to see real ranking positions for all your keywords");
  }
  if (keywordsData.totalOrganicKeywords !== null && keywordsData.totalOrganicKeywords < 50) {
    recs.push("Very few organic keywords — create more SEO-optimised content pages targeting your main services");
  }
  if (keywordsData.quickWins && keywordsData.quickWins.length > 0) {
    recs.push(`${keywordsData.quickWins.length} keyword(s) are on page 2 — optimise those pages to push them to page 1`);
  }
  if (keywordsData.page1Count === 0 && !keywordsData.isEstimated) {
    recs.push("No keywords ranking on page 1 — focus on long-tail, low-competition keywords first");
  }
  if (keywordsData.keywords?.some((k) => k.intent === "Transactional" && k.currentPosition > 10)) {
    recs.push("Transactional keywords are ranking below page 1 — improve those pages with stronger CTAs and content");
  }
  if (keywordsData.keywords?.filter((k) => k.intent === "Informational").length > keywordsData.keywords?.filter((k) => k.intent === "Transactional").length * 2) {
    recs.push("Keyword profile is heavily informational — add more service/product pages targeting transactional keywords");
  }
  if (recs.length === 0) {
    recs.push("Continue building content around your target keywords and monitor positions monthly");
  }

  recs.forEach((rec, i) => { R += `  ${i + 1}. ${rec}\n`; });
  R += "\n";

  // ── Footer ────────────────────────────────────────────────────────────────
  R += `${LINE2}\n`;
  R += `  END OF SERVICE 6 — ORGANIC KEYWORDS\n`;
  R += `${LINE2}\n`;

  return R;
};



module.exports = { runOrganicKeywords , formatOrganicKeywordsAsText };