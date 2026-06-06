// ─────────────────────────────────────────────────────────────────────────────
//  services/organicKeywordsService.js
//  GrowDigitally — Organic Keywords Service
//
//  APIs used:
//
//  PRIMARY — Serper.dev Google Search API (free tier: 2,500 searches/month)
//    Sign up : https://serper.dev (no credit card required)
//    Docs    : https://serper.dev/api-reference
//    Add to .env:
//      SERPER_API_KEY=your_api_key
//
//  FALLBACK — Google Autocomplete API (free, no key needed)
//    Used automatically when SERPER_API_KEY is not set.
//    Provides keyword suggestions without position data.
//
//  Shows:
//    • Total organic keywords found
//    • Top ranking keywords (with real Google positions)
//    • Current position (1–100)
//    • Ranking page URL
//    • Keyword intent classification
//    • Quick win opportunities (positions 11–20)
//
//  Exports:
//    runOrganicKeywords(url, mainKeywords, location)  →  structured result
// ─────────────────────────────────────────────────────────────────────────────

require("dotenv").config();
const axios = require("axios");
const { safeGet } = require("./TechnicalSeoAudit");

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Map location string to Serper.dev gl (country) code */
const getSerperCountry = (location) => {
  if (!location) return "us";
  const loc = location.toLowerCase();
  const map = {
    "sri lanka":            "lk",
    "india":                "in",
    "united states":        "us",
    "uk":                   "gb",
    "united kingdom":       "gb",
    "australia":            "au",
    "canada":               "ca",
    "singapore":            "sg",
    "uae":                  "ae",
    "united arab emirates": "ae",
    "pakistan":             "pk",
    "bangladesh":           "bd",
    "malaysia":             "my",
    "south africa":         "za",
  };
  for (const [key, code] of Object.entries(map)) {
    if (loc.includes(key)) return code;
  }
  return "us";
};

/** Classify keyword position into a SERP tier label */
const classifyPosition = (position) => {
  if (!position) return { label: "Not Ranking", tier: "none" };
  if (position === 1)        return { label: "Position 1 🏆",   tier: "top"   };
  if (position <= 3)         return { label: "Top 3",           tier: "top"   };
  if (position <= 10)        return { label: "Page 1",          tier: "page1" };
  if (position <= 20)        return { label: "Page 2",          tier: "page2" };
  if (position <= 50)        return { label: "Pages 3–5",       tier: "low"   };
  return                            { label: "Page 5+",         tier: "deep"  };
};

/** Classify keyword difficulty (0–100) */
const classifyDifficulty = (kd) => {
  if (kd === null || kd === undefined) return { label: "Unknown", tier: "unknown" };
  if (kd >= 80) return { label: "Very Hard", tier: "hard"   };
  if (kd >= 60) return { label: "Hard",      tier: "hard"   };
  if (kd >= 40) return { label: "Medium",    tier: "medium" };
  if (kd >= 20) return { label: "Easy",      tier: "easy"   };
  return               { label: "Very Easy", tier: "easy"   };
};

/** Classify search volume into a tier */
const classifyVolume = (volume) => {
  if (!volume) return { label: "No Data", tier: "unknown" };
  if (volume >= 10000) return { label: "Very High", tier: "high"   };
  if (volume >= 1000)  return { label: "High",      tier: "high"   };
  if (volume >= 100)   return { label: "Medium",    tier: "medium" };
  if (volume >= 10)    return { label: "Low",        tier: "low"   };
  return                      { label: "Very Low",   tier: "low"   };
};

/** Classify keyword intent from its text */
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
//  PRIMARY SOURCE — Serper.dev Google Search API
//  Searches each user keyword on Google and checks if the domain ranks.
//  Also searches "site:domain" to discover all indexed pages.
// ─────────────────────────────────────────────────────────────────────────────

const fetchFromSerper = async (domain, mainKeywords, location) => {
  const apiKey = process.env.SERPER_API_KEY || "";

  if (!apiKey || apiKey === "your_serper_api_key_here") {
    console.log("[Organic Keywords] No Serper API key — using Google Autocomplete fallback");
    return null;
  }

  const gl = getSerperCountry(location);
  const keywordList = (mainKeywords || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  if (keywordList.length === 0) {
    console.log("[Organic Keywords] No main keywords provided for Serper search");
    return null;
  }

  console.log(`[Organic Keywords] Fetching Serper.dev rankings for domain: ${domain}`);

  const serperPost = async (query, num = 10) => {
    try {
      const res = await axios.post(
        "https://google.serper.dev/search",
        { q: query, gl, hl: "en", num },
        {
          headers: {
            "X-API-KEY":    apiKey,
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      );
      return res.data;
    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.message || err.message;
      console.error(`[Organic Keywords] Serper error for "${query}": HTTP ${status} — ${msg}`);
      return null;
    }
  };

  const foundKeywords = [];
  const seenKeywords  = new Set();

  // ── Step 1: Check each user-provided keyword for domain position ────────────
  for (const kw of keywordList.slice(0, 8)) {
    const data = await serperPost(kw, 10);
    if (!data || !Array.isArray(data.organic)) continue;

    const organic = data.organic;

    // Check if domain appears in top-10 results
    const match = organic.find((item) => {
      try {
        return new URL(item.link).hostname.replace("www.", "") === domain.replace("www.", "");
      } catch (_) { return false; }
    });

    if (match && !seenKeywords.has(kw)) {
      seenKeywords.add(kw);
      const pos = match.position;
      foundKeywords.push({
        keyword:           kw,
        searchVolume:      null,            // Serper doesn't provide volume
        volumeLabel:       "N/A",
        currentPosition:   pos,
        positionLabel:     classifyPosition(pos).label,
        positionTier:      classifyPosition(pos).tier,
        rankingUrl:        match.link || "",
        keywordDifficulty: null,
        difficultyLabel:   "N/A",
        cpc:               null,
        competition:       null,
        intent:            classifyIntent(kw),
        snippet:           match.snippet || "",
        trend:             [],
      });
    } else if (!seenKeywords.has(kw)) {
      // Domain not in top 10 for this keyword — record as unranked
      seenKeywords.add(kw);
      foundKeywords.push({
        keyword:           kw,
        searchVolume:      null,
        volumeLabel:       "N/A",
        currentPosition:   null,
        positionLabel:     "Not in Top 10",
        positionTier:      "none",
        rankingUrl:        "",
        keywordDifficulty: null,
        difficultyLabel:   "N/A",
        cpc:               null,
        competition:       null,
        intent:            classifyIntent(kw),
        snippet:           "",
        trend:             [],
      });
    }
  }

  // ── Step 2: Discover additional keywords where domain ranks ──────────────────
  // Search "site:domain" to find indexed pages, then build keyword list from them
  const siteData = await serperPost(`site:${domain}`, 10);
  const indexedCount = siteData?.searchInformation?.totalResults
    ? parseInt(String(siteData.searchInformation.totalResults).replace(/,/g, ""), 10) || 0
    : 0;

  // Try a few branded keyword variations to find additional rankings
  const brandedSearches = [
    domain.replace("www.", "").split(".")[0],         // e.g. "growdigitally"
    `${domain.replace("www.", "").split(".")[0]} services`,
    `${domain.replace("www.", "").split(".")[0]} reviews`,
  ];

  for (const bkw of brandedSearches.slice(0, 2)) {
    if (seenKeywords.has(bkw)) continue;
    const data = await serperPost(bkw, 10);
    if (!data || !Array.isArray(data.organic)) continue;

    const match = data.organic.find((item) => {
      try {
        return new URL(item.link).hostname.replace("www.", "") === domain.replace("www.", "");
      } catch (_) { return false; }
    });

    if (match) {
      seenKeywords.add(bkw);
      const pos = match.position;
      foundKeywords.push({
        keyword:           bkw,
        searchVolume:      null,
        volumeLabel:       "N/A",
        currentPosition:   pos,
        positionLabel:     classifyPosition(pos).label,
        positionTier:      classifyPosition(pos).tier,
        rankingUrl:        match.link || "",
        keywordDifficulty: null,
        difficultyLabel:   "N/A",
        cpc:               null,
        competition:       null,
        intent:            classifyIntent(bkw),
        snippet:           match.snippet || "",
        trend:             [],
      });
    }
  }

  // ── Step 3: Build summary counts ─────────────────────────────────────────────
  const rankedKeywords  = foundKeywords.filter((k) => k.currentPosition !== null);
  const top3Keywords    = rankedKeywords.filter((k) => k.currentPosition <= 3);
  const page1Keywords   = rankedKeywords.filter((k) => k.currentPosition <= 10);
  const page2Keywords   = rankedKeywords.filter((k) => k.currentPosition > 10 && k.currentPosition <= 20);
  const quickWins       = rankedKeywords.filter((k) => k.currentPosition >= 11 && k.currentPosition <= 20);

  return {
    source:               "Serper.dev (Google Search API)",
    domain,
    totalOrganicKeywords: indexedCount || rankedKeywords.length || null,
    indexedPages:         indexedCount,
    pos1Count:            rankedKeywords.filter((k) => k.currentPosition === 1).length,
    page1Count:           page1Keywords.length,
    page2Count:           page2Keywords.length,
    quickWinsCount:       quickWins.length,
    keywords:             foundKeywords,
    top3Keywords,
    page1Keywords,
    quickWins,
    totalRetrieved:       foundKeywords.length,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
//  FALLBACK SOURCE — Google Autocomplete + user keywords expansion
//  Generates keyword suggestions from Google's free autocomplete API.
//  No position data — but shows keyword landscape the site should target.
// ─────────────────────────────────────────────────────────────────────────────

const fetchFromGoogleSuggestions = async (mainKeywords, location) => {
  console.log("[Organic Keywords] Using Google Autocomplete fallback");

  if (!mainKeywords) {
    return {
      source:               "Google Autocomplete (Fallback)",
      isEstimated:          true,
      error:                "No main keywords provided — cannot generate keyword suggestions",
      keywords:             [],
      totalOrganicKeywords: null,
    };
  }

  const keywordList   = mainKeywords.split(",").map((k) => k.trim()).filter(Boolean);
  const allSuggestions = [];

  for (const kw of keywordList.slice(0, 3)) {
    try {
      const res = await safeGet(
        `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(kw)}`
      );
      if (res.data && Array.isArray(res.data) && res.data[1]) {
        const suggestions = res.data[1].slice(0, 10);
        suggestions.forEach((suggestion) => {
          if (!allSuggestions.find((s) => s.keyword === suggestion)) {
            allSuggestions.push({
              keyword:           suggestion,
              searchVolume:      null,
              volumeLabel:       "N/A — API required",
              currentPosition:   null,
              positionLabel:     "Unknown — API required",
              positionTier:      "unknown",
              rankingUrl:        "N/A",
              keywordDifficulty: null,
              difficultyLabel:   "N/A — API required",
              cpc:               null,
              competition:       null,
              intent:            classifyIntent(suggestion),
              isSuggestion:      true,
              seedKeyword:       kw,
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
    estimationNote:       "Position and volume data require a Serper.dev API key. Keywords shown are Google suggestions for your seed keywords. Sign up free at https://serper.dev",
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

  // Try Serper.dev first
  result = await fetchFromSerper(domain, mainKeywords, location);

  // Fall back to Google Autocomplete
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
// ─────────────────────────────────────────────────────────────────────────────

const formatOrganicKeywordsAsText = (keywordsData, customerInfo) => {

  const { name, email, whatsAppNum, websiteUrl } = customerInfo;

  const LINE  = "─".repeat(70);
  const LINE2 = "═".repeat(70);

  const positionIcon = (tier) => {
    const map = { top: "🏆", page1: "🟢", page2: "🟡", low: "🟠", deep: "🔴", none: "⚪", unknown: "⚪" };
    return map[tier] || "⚪";
  };

  const difficultyIcon = (tier) => {
    const map = { easy: "🟢", medium: "🟡", hard: "🔴", unknown: "⚪" };
    return map[tier] || "⚪";
  };

  const intentIcon = (intent) => {
    const map = { "Transactional": "💰", "Informational": "📘", "Navigational": "🧭", "Commercial": "🛒" };
    return map[intent] || "🔵";
  };

  const countLabel = (val) =>
    val !== null && val !== undefined ? val.toLocaleString() : "N/A";

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
    R += `    SERPER_API_KEY=your_key\n`;
    R += `    Sign up free: https://serper.dev\n`;
  } else {
    R += `  ✅ Live data from Serper.dev (Google Search API)\n`;
    if (keywordsData.indexedPages) {
      R += `  📄 Google-indexed pages found: ${keywordsData.indexedPages.toLocaleString()}\n`;
    }
  }
  R += "\n";

  // ── Error fallback ────────────────────────────────────────────────────────
  if (keywordsData.error) {
    R += `ERROR\n${LINE}\n`;
    R += `  ❌ ${keywordsData.error}\n\n`;
    R += `${LINE2}\n  END OF SERVICE 6 — ORGANIC KEYWORDS\n${LINE2}\n`;
    return R;
  }

  // ── Keyword Overview ──────────────────────────────────────────────────────
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

  // ── Top Ranking Keywords ──────────────────────────────────────────────────
  R += `TOP RANKING KEYWORDS\n${LINE}\n`;

  if (keywordsData.keywords && keywordsData.keywords.length > 0) {
    if (!keywordsData.isEstimated) {
      R += `${"#".padEnd(4)} ${"Keyword".padEnd(35)} ${"Position".padEnd(15)} ${"Intent".padEnd(16)} URL\n`;
      R += `${"-".repeat(90)}\n`;

      keywordsData.keywords.slice(0, 30).forEach((kw, i) => {
        const num     = String(i + 1).padEnd(4);
        const keyword = (kw.keyword || "").substring(0, 34).padEnd(35);
        const pos     = kw.currentPosition !== null
          ? `#${kw.currentPosition} ${kw.positionLabel}`.substring(0, 14).padEnd(15)
          : "Not in Top 10 ".padEnd(15);
        const intent  = (kw.intent || "").padEnd(16);
        const pIcon   = positionIcon(kw.positionTier);
        const url     = kw.rankingUrl ? kw.rankingUrl.substring(0, 40) : "";

        R += `${pIcon} ${num}${keyword}${pos}${intentIcon(kw.intent)} ${intent}${url}\n`;
        if (kw.snippet) {
          R += `     Snippet: ${kw.snippet.substring(0, 80)}${kw.snippet.length > 80 ? "..." : ""}\n`;
        }
      });

    } else {
      R += `  ℹ️  Showing Google keyword suggestions for your seed keywords.\n`;
      R += `  Position data not available without Serper.dev API key.\n\n`;
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

  // ── Top 3 Keywords (detailed) ─────────────────────────────────────────────
  const top3 = (keywordsData.top3Keywords || []).filter((k) => k.currentPosition !== null);
  if (top3.length > 0) {
    R += `TOP 3 RANKING KEYWORDS (DETAILED)\n${LINE}\n`;
    top3.forEach((kw, i) => {
      R += `  ${i + 1}. ${kw.keyword}\n`;
      R += `     Position     : #${kw.currentPosition} — ${kw.positionLabel}\n`;
      R += `     Ranking URL  : ${kw.rankingUrl || "N/A"}\n`;
      if (kw.snippet) {
        R += `     Snippet      : ${kw.snippet.substring(0, 100)}${kw.snippet.length > 100 ? "..." : ""}\n`;
      }
      R += `     Intent       : ${intentIcon(kw.intent)} ${kw.intent}\n`;
      R += "\n";
    });
  }

  // ── Quick Win Keywords ────────────────────────────────────────────────────
  const qw = keywordsData.quickWins || [];
  if (qw.length > 0) {
    R += `QUICK WIN KEYWORDS (Positions 11–20)\n${LINE}\n`;
    R += `  These keywords are on page 2 — a small optimisation push could move them to page 1.\n\n`;
    qw.slice(0, 10).forEach((kw, i) => {
      R += `  ${i + 1}. "${kw.keyword}"\n`;
      R += `     Position     : #${kw.currentPosition}\n`;
      R += `     Ranking URL  : ${kw.rankingUrl || "N/A"}\n`;
      R += `     Intent       : ${intentIcon(kw.intent)} ${kw.intent}\n\n`;
    });
  }

  // ── Keyword Intent Breakdown ──────────────────────────────────────────────
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

  // ── Recommendations ───────────────────────────────────────────────────────
  R += `KEYWORD RECOMMENDATIONS\n${LINE}\n`;
  const recs = [];

  if (keywordsData.isEstimated) {
    recs.push("Add a free Serper.dev API key to see real Google ranking positions (sign up at https://serper.dev)");
  }
  if (keywordsData.page1Count === 0 && !keywordsData.isEstimated) {
    recs.push("No keywords ranking on page 1 — focus on long-tail, low-competition keywords first");
  }
  if (qw.length > 0) {
    recs.push(`${qw.length} keyword(s) are on page 2 — optimise those pages to push them to page 1`);
  }
  if (keywordsData.totalOrganicKeywords !== null && keywordsData.totalOrganicKeywords < 50) {
    recs.push("Very few organic keywords — create more SEO-optimised content targeting your main services");
  }
  if (keywordsData.keywords?.some((k) => k.intent === "Transactional" && k.currentPosition > 10)) {
    recs.push("Transactional keywords are below page 1 — improve those pages with stronger CTAs and content");
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


module.exports = { runOrganicKeywords, formatOrganicKeywordsAsText };