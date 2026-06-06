// ─────────────────────────────────────────────────────────────────────────────
//  services/competitorService.js
//  GrowDigitally — Competitor Analysis Service
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
//    Endpoints used:
//      • SERP / Google Organic  → detect top 5 ranking domains for keyword
//      • Domain Overview        → traffic, DA, keywords per competitor
//      • Keyword Gap Analysis   → keywords competitor ranks for but user doesn't
//      • Ranked Keywords        → pages ranking better than user
//
//  FALLBACK — Google SERP scraping via safeGet (no key needed)
//    Parses top organic results from Google search for the keyword+location.
//    Returns competitor domains only — no traffic/DA data without API.
//
//  Exports:
//    runCompetitorAnalysis(url, mainKeywords, location)  →  structured result
// ─────────────────────────────────────────────────────────────────────────────

require("dotenv").config();
const cheerio = require("cheerio");
const { safeGet } = require("./TechnicalSeoAudit");

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Build Base64 auth for DataForSEO */
const getDataForSEOAuth = () => {
  const login    = process.env.DATAFORSEO_LOGIN    || "";
  const password = process.env.DATAFORSEO_PASSWORD || "";
  if (!login || !password) return null;
  return "Basic " + Buffer.from(`${login}:${password}`).toString("base64");
};

/** DataForSEO location code */
const getLocationCode = (location) => {
  if (!location) return 2840;
  const loc = location.toLowerCase();
  const map = {
    "sri lanka": 2144, "india": 2356, "united states": 2840,
    "uk": 2826, "united kingdom": 2826, "australia": 2036,
    "canada": 2124, "singapore": 2702, "uae": 2784,
    "united arab emirates": 2784, "pakistan": 2586,
    "bangladesh": 2050, "malaysia": 2458, "south africa": 2710,
  };
  for (const [key, code] of Object.entries(map)) {
    if (loc.includes(key)) return code;
  }
  return 2840;
};

/** Classify domain authority */
const classifyDA = (score) => {
  if (!score) return { label: "Unknown", tier: "unknown" };
  if (score >= 70) return { label: "Very Strong", tier: "good"   };
  if (score >= 50) return { label: "Strong",      tier: "good"   };
  if (score >= 30) return { label: "Moderate",    tier: "medium" };
  if (score >= 15) return { label: "Weak",        tier: "low"    };
  return               { label: "Very Weak",  tier: "poor"   };
};

/** Classify traffic volume */
const classifyTraffic = (visits) => {
  if (!visits) return "Unknown";
  if (visits >= 100000) return "Very High";
  if (visits >= 10000)  return "High";
  if (visits >= 1000)   return "Moderate";
  if (visits >= 100)    return "Low";
  return                       "Very Low";
};

/** Build a clean search query from keywords + location */
const buildSearchQuery = (mainKeywords, location) => {
  const kw  = mainKeywords?.split(",")[0]?.trim() || "";
  const loc = location?.trim() || "";
  return loc ? `${kw} ${loc}` : kw;
};

/** Extract root domain from a URL string */
const extractDomain = (url) => {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  PRIMARY SOURCE — DataForSEO
// ─────────────────────────────────────────────────────────────────────────────

const fetchFromDataForSEO = async (url, mainKeywords, location) => {
  const auth = getDataForSEOAuth();
  if (!auth) return null;

  const userDomain   = new URL(url).hostname.replace(/^www\./, "");
  const locationCode = getLocationCode(location);
  const searchQuery  = buildSearchQuery(mainKeywords, location);

  console.log(`[Competitor Analysis] DataForSEO — query: "${searchQuery}"`);

  try {
    // ── STEP 1: Get top 10 SERP results for the keyword ─────────────────────
    const serpRes = await safeGet(
      "https://api.dataforseo.com/v3/serp/google/organic/live/advanced",
      {
        method: "POST",
        headers: { "Authorization": auth, "Content-Type": "application/json" },
        data: JSON.stringify([{
          keyword:       searchQuery,
          location_code: locationCode,
          language_code: "en",
          depth:         20,
          se_domain:     "google.com",
        }]),
      }
    );

    const serpItems = serpRes.data?.tasks?.[0]?.result?.[0]?.items || [];

    // Extract organic results only, exclude user's own domain
    const organicResults = serpItems
      .filter((item) => item.type === "organic")
      .map((item) => ({
        position: item.rank_absolute,
        domain:   extractDomain(item.url || ""),
        url:      item.url || "",
        title:    item.title || "",
        snippet:  item.description || "",
      }))
      .filter((item) => item.domain && item.domain !== userDomain);

    // Top 5 competitor domains
    const top5Domains = organicResults.slice(0, 5).map((r) => r.domain);

    if (top5Domains.length === 0) {
      return { source: "DataForSEO", competitors: [], searchQuery, userDomain, error: "No competitors found for this keyword" };
    }

    // ── STEP 2: Get domain overview for each competitor ──────────────────────
    const domainOverviewRes = await safeGet(
      "https://api.dataforseo.com/v3/dataforseo_labs/google/bulk_traffic_estimation/live",
      {
        method: "POST",
        headers: { "Authorization": auth, "Content-Type": "application/json" },
        data: JSON.stringify([{
          targets:       top5Domains,
          location_code: locationCode,
          language_code: "en",
        }]),
      }
    );

    const overviewItems = domainOverviewRes.data?.tasks?.[0]?.result?.[0]?.items || [];
    const overviewMap   = {};
    overviewItems.forEach((item) => {
      overviewMap[item.target] = item;
    });

    // ── STEP 3: Get user domain overview for comparison ──────────────────────
    const userOverviewRes = await safeGet(
      "https://api.dataforseo.com/v3/dataforseo_labs/google/bulk_traffic_estimation/live",
      {
        method: "POST",
        headers: { "Authorization": auth, "Content-Type": "application/json" },
        data: JSON.stringify([{
          targets:       [userDomain],
          location_code: locationCode,
          language_code: "en",
        }]),
      }
    );
    const userOverviewItem = userOverviewRes.data?.tasks?.[0]?.result?.[0]?.items?.[0] || null;
    const userTraffic      = userOverviewItem?.metrics?.organic?.etv        ?? null;
    const userKeywords     = userOverviewItem?.metrics?.organic?.count      ?? null;
    const userDA           = userOverviewItem?.domain_rank                  ?? null;

    // ── STEP 4: Keyword gap for top competitor vs user ───────────────────────
    let keywordGapItems   = [];
    let contentGapItems   = [];
    let pagesRankingBetter = [];

    if (top5Domains[0]) {
      // Keyword gap — keywords top competitor ranks for that user doesn't
      const gapRes = await safeGet(
        "https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_gap/live",
        {
          method: "POST",
          headers: { "Authorization": auth, "Content-Type": "application/json" },
          data: JSON.stringify([{
            targets: [
              { target: top5Domains[0], type: "domain" },
              { target: userDomain,     type: "domain" },
            ],
            location_code:  locationCode,
            language_code:  "en",
            limit:          20,
            filters:        ["keyword_data.keyword_info.search_volume", ">", 0],
            order_by:       ["keyword_data.keyword_info.search_volume,desc"],
            intersections:  false, // keywords in competitor but NOT in user
          }]),
        }
      );
      keywordGapItems = (gapRes.data?.tasks?.[0]?.result?.[0]?.items || [])
        .slice(0, 15)
        .map((item) => ({
          keyword:      item.keyword_data?.keyword            || "",
          searchVolume: item.keyword_data?.keyword_info?.search_volume ?? null,
          difficulty:   item.keyword_data?.keyword_properties?.keyword_difficulty ?? null,
          competitorPosition: item.ranked_serp_element?.serp_item?.rank_absolute ?? null,
        }));

      // Content gap — topics competitor covers that user doesn't
      contentGapItems = keywordGapItems
        .filter((k) => k.searchVolume && k.searchVolume >= 100)
        .slice(0, 8)
        .map((k) => ({
          topic:        k.keyword,
          searchVolume: k.searchVolume,
          suggestion:   `Create a page targeting "${k.keyword}" (${k.searchVolume}/mo searches)`,
        }));

      // Pages ranking better than user for the same keyword
      const compRankedRes = await safeGet(
        "https://api.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live",
        {
          method: "POST",
          headers: { "Authorization": auth, "Content-Type": "application/json" },
          data: JSON.stringify([{
            target:         top5Domains[0],
            location_code:  locationCode,
            language_code:  "en",
            limit:          10,
            order_by:       ["keyword_data.keyword_info.search_volume,desc"],
          }]),
        }
      );
      pagesRankingBetter = (compRankedRes.data?.tasks?.[0]?.result?.[0]?.items || [])
        .slice(0, 10)
        .map((item) => ({
          competitorUrl:    item.url                                                    || "",
          keyword:          item.keyword_data?.keyword                                 || "",
          position:         item.ranked_serp_element?.serp_item?.rank_absolute         ?? null,
          searchVolume:     item.keyword_data?.keyword_info?.search_volume             ?? null,
        }));
    }

    // ── STEP 5: Build competitor profiles ────────────────────────────────────
    const competitors = organicResults.slice(0, 5).map((result, i) => {
      const domainData   = overviewMap[result.domain] || null;
      const traffic      = domainData?.metrics?.organic?.etv   ?? null;
      const keywords     = domainData?.metrics?.organic?.count ?? null;
      const da           = domainData?.domain_rank             ?? null;
      const backlinks    = domainData?.backlinks_info?.backlinks ?? null;
      const daInfo       = classifyDA(da);

      return {
        rank:             result.position,
        domain:           result.domain,
        rankingUrl:       result.url,
        pageTitle:        result.title,
        snippet:          result.snippet,
        estimatedTraffic: traffic,
        trafficLabel:     classifyTraffic(traffic),
        domainAuthority: {
          score: da,
          label: daInfo.label,
          tier:  daInfo.tier,
        },
        organicKeywords:   keywords,
        backlinks,
        keywordGap:        i === 0 ? keywordGapItems    : [],
        contentGap:        i === 0 ? contentGapItems    : [],
        pagesRankingBetter: i === 0 ? pagesRankingBetter : [],
        trafficVsUser: userTraffic !== null && traffic !== null
          ? traffic > userTraffic
            ? `${Math.round(((traffic - userTraffic) / Math.max(userTraffic, 1)) * 100)}% more traffic than you`
            : `${Math.round(((userTraffic - traffic) / Math.max(traffic, 1)) * 100)}% less traffic than you`
          : "N/A",
        daVsUser: userDA !== null && da !== null
          ? da > userDA
            ? `DA ${da - userDA} points higher than you`
            : da === userDA
            ? "Same DA as you"
            : `DA ${userDA - da} points lower than you`
          : "N/A",
      };
    });

    return {
      source:        "DataForSEO",
      searchQuery,
      userDomain,
      userProfile: {
        domain:   userDomain,
        traffic:  userTraffic,
        keywords: userKeywords,
        da:       userDA,
        daLabel:  classifyDA(userDA).label,
      },
      competitors,
      totalCompetitors: competitors.length,
    };

  } catch (err) {
    console.error(`[Competitor Analysis] DataForSEO error: ${err.message}`);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  FALLBACK SOURCE — Google SERP scraping
//  Returns competitor domains + ranking titles/snippets only.
//  No traffic, DA, or keyword gap data without API.
// ─────────────────────────────────────────────────────────────────────────────

const fetchFromGoogleScrape = async (url, mainKeywords, location) => {
  console.log(`[Competitor Analysis] No DataForSEO credentials — using Google SERP fallback`);

  const userDomain  = new URL(url).hostname.replace(/^www\./, "");
  const searchQuery = buildSearchQuery(mainKeywords, location);

  try {
    // Google search via safeGet (basic HTML scrape)
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&num=20&hl=en`;
    const res       = await safeGet(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const competitors = [];

    if (res.data) {
      const $ = cheerio.load(res.data);

      // Extract organic result blocks
      $("div.g, div[data-sokoban-container]").each((_, el) => {
        if (competitors.length >= 5) return false;

        const linkEl  = $(el).find("a[href]").first();
        const href    = linkEl.attr("href") || "";
        const title   = $(el).find("h3").first().text().trim();
        const snippet = $(el).find("div[data-sncf], span.st, div.IsZvec").first().text().trim();

        if (!href.startsWith("http") || !title) return;

        try {
          const domain = new URL(href).hostname.replace(/^www\./, "");
          if (domain === userDomain) return;
          if (competitors.find((c) => c.domain === domain)) return;

          competitors.push({
            rank:              competitors.length + 1,
            domain,
            rankingUrl:        href,
            pageTitle:         title,
            snippet:           snippet.substring(0, 200),
            estimatedTraffic:  null,
            trafficLabel:      "N/A — API required",
            domainAuthority:  { score: null, label: "N/A — API required", tier: "unknown" },
            organicKeywords:   null,
            backlinks:         null,
            keywordGap:        [],
            contentGap:        [],
            pagesRankingBetter: [],
            trafficVsUser:     "N/A — API required",
            daVsUser:          "N/A — API required",
          });
        } catch (_) {}
      });
    }

    // If scraping returned nothing (Google blocked), build placeholder entries
    if (competitors.length === 0) {
      for (let i = 1; i <= 5; i++) {
        competitors.push({
          rank:              i,
          domain:            `competitor-${i}.com`,
          rankingUrl:        "",
          pageTitle:         `Top Competitor ${i} for "${searchQuery}"`,
          snippet:           "Competitor data could not be retrieved — add DataForSEO API for full analysis",
          estimatedTraffic:  null,
          trafficLabel:      "N/A",
          domainAuthority:  { score: null, label: "N/A", tier: "unknown" },
          organicKeywords:   null,
          backlinks:         null,
          keywordGap:        [],
          contentGap:        [],
          pagesRankingBetter: [],
          trafficVsUser:     "N/A",
          daVsUser:          "N/A",
          isPlaceholder:     true,
        });
      }
    }

    return {
      source:           "Google SERP Scrape (Fallback)",
      isEstimated:      true,
      estimationNote:   "Traffic, DA, keyword gap, and backlink data require DataForSEO API credentials. Add DATAFORSEO_LOGIN + DATAFORSEO_PASSWORD to .env for full competitor analysis.",
      searchQuery,
      userDomain,
      userProfile:      { domain: userDomain, traffic: null, keywords: null, da: null, daLabel: "N/A" },
      competitors,
      totalCompetitors: competitors.length,
    };

  } catch (err) {
    console.error(`[Competitor Analysis] SERP scrape error: ${err.message}`);
    return {
      source:           "Fallback",
      isEstimated:      true,
      searchQuery,
      userDomain,
      userProfile:      { domain: userDomain, traffic: null, keywords: null, da: null, daLabel: "N/A" },
      competitors:      [],
      totalCompetitors: 0,
      error:            err.message,
    };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  runCompetitorAnalysis  (main export)
//
//  @param  {string} url          — normalised website URL
//  @param  {string} mainKeywords — comma-separated keywords from user input
//  @param  {string} location     — user's target location
//  @returns {object}             — structured competitor analysis result
// ─────────────────────────────────────────────────────────────────────────────

const runCompetitorAnalysis = async (url, mainKeywords, location) => {
  console.log(`[Competitor Analysis] Starting for: ${url} | Query: "${buildSearchQuery(mainKeywords, location)}"`);

  let result = null;

  // Try DataForSEO first
  result = await fetchFromDataForSEO(url, mainKeywords, location);

  // Fall back to SERP scrape
  if (!result) {
    result = await fetchFromGoogleScrape(url, mainKeywords, location);
  }

  console.log(`[Competitor Analysis] Done — Source: ${result.source} | Competitors found: ${result.totalCompetitors}`);

  return {
    ...result,
    url,
    mainKeywords,
    location,
    fetchedAt: new Date().toISOString(),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
//  formatCompetitorAsText
//  GrowDigitally — Competitor Analysis Report Formatter
//
//  Add this function into seoController.js alongside all other formatters.
//
//  @param  {object} competitorData — result from runCompetitorAnalysis()
//  @param  {object} customerInfo   — { name, email, whatsAppNum, websiteUrl }
//  @returns {string}               — formatted plain-text report section
// ─────────────────────────────────────────────────────────────────────────────

const formatCompetitorAsText = (competitorData, customerInfo) => {

  const { name, email, whatsAppNum, websiteUrl } = customerInfo;

  const LINE  = "─".repeat(70);
  const LINE2 = "═".repeat(70);

  const countLabel = (val) =>
    val !== null && val !== undefined ? val.toLocaleString() : "N/A";

  const tierIcon = (tier) => {
    const map = { good: "🟢", medium: "🟡", low: "🟠", poor: "🔴", unknown: "⚪" };
    return map[tier] || "⚪";
  };

  let R = "";

  // ── Header ────────────────────────────────────────────────────────────────
  R += `\n${LINE2}\n`;
  R += `  SERVICE 12 — COMPETITOR ANALYSIS\n`;
  R += `${LINE2}\n\n`;

  R += `CUSTOMER INFORMATION\n${LINE}\n`;
  R += `Name       : ${name}\n`;
  R += `Email      : ${email}\n`;
  R += `WhatsApp   : ${whatsAppNum}\n`;
  R += `Website    : ${websiteUrl}\n`;
  R += `Generated  : ${new Date().toISOString()}\n\n`;

  // ── Data source ───────────────────────────────────────────────────────────
  R += `DATA SOURCE\n${LINE}\n`;
  R += `  Source       : ${competitorData.source}\n`;
  R += `  Search Query : "${competitorData.searchQuery}"\n`;
  R += `  Your Domain  : ${competitorData.userDomain}\n`;
  R += `  Location     : ${competitorData.location || "Not specified"}\n`;
  R += `  Keywords     : ${competitorData.mainKeywords || "Not provided"}\n`;
  if (competitorData.isEstimated) {
    R += `\n  ⚠️  PARTIAL DATA — ${competitorData.estimationNote}\n`;
    R += `\n  For full competitor intelligence, add to .env:\n`;
    R += `    DATAFORSEO_LOGIN=your_email\n`;
    R += `    DATAFORSEO_PASSWORD=your_api_password\n`;
    R += `    Sign up free: https://app.dataforseo.com/register\n`;
  } else {
    R += `  ✅ Live data from DataForSEO API\n`;
  }
  R += "\n";

  // ── Error fallback ────────────────────────────────────────────────────────
  if (competitorData.error && competitorData.competitors?.length === 0) {
    R += `ERROR\n${LINE}\n`;
    R += `  ❌ ${competitorData.error}\n\n`;
    R += `${LINE2}\n  END OF SERVICE 12 — COMPETITOR ANALYSIS\n${LINE2}\n`;
    return R;
  }

  // ── Your profile (for comparison) ────────────────────────────────────────
  if (competitorData.userProfile) {
    const up = competitorData.userProfile;
    R += `YOUR DOMAIN PROFILE\n${LINE}\n`;
    R += `  Domain          : ${up.domain}\n`;
    R += `  Est. Traffic    : ${countLabel(up.traffic)}/mo\n`;
    R += `  Organic Keywords: ${countLabel(up.keywords)}\n`;
    R += `  Domain Authority: ${up.da !== null ? `${up.da}/100 (${up.daLabel})` : "N/A"}\n\n`;
  }

  // ── Competitor overview table ─────────────────────────────────────────────
  R += `TOP ${competitorData.totalCompetitors} COMPETITORS FOR "${competitorData.searchQuery}"\n${LINE}\n`;

  if (!competitorData.isEstimated) {
    // Full table with all data
    R += `${"Rank".padEnd(6)} ${"Domain".padEnd(30)} ${"Traffic/mo".padEnd(14)} ${"DA".padEnd(8)} ${"Keywords".padEnd(12)} ${"Backlinks"}\n`;
    R += `${"-".repeat(80)}\n`;
    competitorData.competitors.forEach((comp) => {
      const rank    = `#${comp.rank}`.padEnd(6);
      const domain  = comp.domain.substring(0, 29).padEnd(30);
      const traffic = countLabel(comp.estimatedTraffic).padEnd(14);
      const da      = (comp.domainAuthority?.score !== null ? String(comp.domainAuthority.score) : "N/A").padEnd(8);
      const kws     = countLabel(comp.organicKeywords).padEnd(12);
      const bls     = countLabel(comp.backlinks);
      const icon    = tierIcon(comp.domainAuthority?.tier);
      R += `${icon} ${rank}${domain}${traffic}${da}${kws}${bls}\n`;
    });
  } else {
    // Fallback — domain + title only
    competitorData.competitors.forEach((comp) => {
      R += `  #${comp.rank}. ${comp.domain}\n`;
      if (comp.pageTitle && !comp.isPlaceholder) {
        R += `       Title : ${comp.pageTitle.substring(0, 80)}\n`;
      }
      if (comp.isPlaceholder) {
        R += `       Note  : Real competitor data requires DataForSEO API\n`;
      }
    });
  }
  R += "\n";

  // ── Detailed competitor profiles ──────────────────────────────────────────
  R += `DETAILED COMPETITOR PROFILES\n${LINE2}\n\n`;

  competitorData.competitors.forEach((comp) => {
    R += `COMPETITOR #${comp.rank} — ${comp.domain.toUpperCase()}\n${LINE}\n`;

    // ── Core metrics ───────────────────────────────────────────────────────
    R += `  Competitor Domain   : ${comp.domain}\n`;
    R += `  Ranking URL         : ${comp.rankingUrl || "N/A"}\n`;
    if (comp.pageTitle) R += `  Page Title          : ${comp.pageTitle.substring(0, 80)}\n`;
    if (comp.snippet)   R += `  Snippet             : ${comp.snippet.substring(0, 150)}${comp.snippet.length > 150 ? "..." : ""}\n`;
    R += "\n";

    // ── Estimated monthly traffic ──────────────────────────────────────────
    R += `  📊 ESTIMATED MONTHLY TRAFFIC\n`;
    R += `     Traffic/month    : ${countLabel(comp.estimatedTraffic)} visits\n`;
    R += `     Traffic Tier     : ${comp.trafficLabel}\n`;
    R += `     vs Your Site     : ${comp.trafficVsUser}\n\n`;

    // ── Domain authority ───────────────────────────────────────────────────
    R += `  🏛  DOMAIN AUTHORITY\n`;
    const da = comp.domainAuthority;
    R += `     ${tierIcon(da?.tier)} DA Score     : ${da?.score !== null ? `${da.score}/100` : "N/A"}\n`;
    R += `     Strength         : ${da?.label || "N/A"}\n`;
    R += `     vs Your Site     : ${comp.daVsUser}\n\n`;

    // ── Organic keywords ───────────────────────────────────────────────────
    R += `  🔑 ORGANIC KEYWORDS\n`;
    R += `     Total Keywords   : ${countLabel(comp.organicKeywords)}\n\n`;

    // ── Backlinks ──────────────────────────────────────────────────────────
    R += `  🔗 BACKLINKS\n`;
    R += `     Total Backlinks  : ${countLabel(comp.backlinks)}\n\n`;

    // ── Keyword gap ────────────────────────────────────────────────────────
    R += `  🔍 KEYWORD GAP (keywords they rank for that you don't)\n`;
    if (comp.keywordGap && comp.keywordGap.length > 0) {
      R += `     ${"-".repeat(60)}\n`;
      R += `     ${"Keyword".padEnd(35)} ${"Volume/mo".padEnd(12)} ${"Their Pos".padEnd(10)} Difficulty\n`;
      R += `     ${"-".repeat(60)}\n`;
      comp.keywordGap.forEach((kw) => {
        const keyword = (kw.keyword || "").substring(0, 34).padEnd(35);
        const vol     = countLabel(kw.searchVolume).padEnd(12);
        const pos     = (kw.competitorPosition !== null ? `#${kw.competitorPosition}` : "N/A").padEnd(10);
        const diff    = kw.difficulty !== null ? `${kw.difficulty}/100` : "N/A";
        R += `     ${keyword}${vol}${pos}${diff}\n`;
      });
    } else if (comp.rank === 1) {
      R += `     ℹ️  Keyword gap data requires DataForSEO API\n`;
    } else {
      R += `     ℹ️  Keyword gap shown for top competitor only\n`;
    }
    R += "\n";

    // ── Content gap ────────────────────────────────────────────────────────
    R += `  📝 CONTENT GAP (topics they cover that you should target)\n`;
    if (comp.contentGap && comp.contentGap.length > 0) {
      comp.contentGap.forEach((item, i) => {
        R += `     ${i + 1}. ${item.suggestion}\n`;
      });
    } else if (comp.rank === 1) {
      R += `     ℹ️  Content gap data requires DataForSEO API\n`;
    } else {
      R += `     ℹ️  Content gap shown for top competitor only\n`;
    }
    R += "\n";

    // ── Pages ranking better ───────────────────────────────────────────────
    R += `  📄 PAGES RANKING BETTER THAN YOU\n`;
    if (comp.pagesRankingBetter && comp.pagesRankingBetter.length > 0) {
      comp.pagesRankingBetter.forEach((page, i) => {
        R += `     ${i + 1}. Pos #${page.position || "N/A"} — ${page.keyword}\n`;
        R += `        URL    : ${(page.competitorUrl || "").substring(0, 80)}\n`;
        R += `        Volume : ${countLabel(page.searchVolume)}/mo\n`;
      });
    } else if (comp.rank === 1) {
      R += `     ℹ️  Pages data requires DataForSEO API\n`;
    } else {
      R += `     ℹ️  Shown for top competitor only\n`;
    }
    R += "\n";
    R += `${LINE}\n\n`;
  });

  // ── Competitive intelligence summary ─────────────────────────────────────
  R += `COMPETITIVE INTELLIGENCE SUMMARY\n${LINE}\n`;

  if (!competitorData.isEstimated && competitorData.competitors.length > 0) {
    const avgDA      = competitorData.competitors
      .filter((c) => c.domainAuthority?.score !== null)
      .reduce((sum, c) => sum + (c.domainAuthority?.score || 0), 0) /
      Math.max(competitorData.competitors.filter((c) => c.domainAuthority?.score !== null).length, 1);

    const avgTraffic = competitorData.competitors
      .filter((c) => c.estimatedTraffic !== null)
      .reduce((sum, c) => sum + (c.estimatedTraffic || 0), 0) /
      Math.max(competitorData.competitors.filter((c) => c.estimatedTraffic !== null).length, 1);

    R += `  Avg Competitor DA      : ${Math.round(avgDA)}/100\n`;
    R += `  Avg Competitor Traffic : ${Math.round(avgTraffic).toLocaleString()}/mo\n`;
    R += `  Your DA                : ${competitorData.userProfile?.da ?? "N/A"}\n`;
    R += `  Your Traffic           : ${countLabel(competitorData.userProfile?.traffic)}/mo\n`;

    const userDA = competitorData.userProfile?.da ?? 0;
    const daGap  = Math.round(avgDA) - userDA;
    if (daGap > 0) {
      R += `  DA Gap to Close        : +${daGap} points needed to match average competitor\n`;
    } else {
      R += `  DA vs Competitors      : ✅ Your DA matches or exceeds average competitor\n`;
    }
  }
  R += "\n";

  // ── Action plan ───────────────────────────────────────────────────────────
  R += `COMPETITOR ACTION PLAN\n${LINE}\n`;
  const actions = [];

  if (competitorData.isEstimated) {
    actions.push("Add DataForSEO API credentials for full keyword gap, content gap, and traffic data");
  }

  const top1 = competitorData.competitors[0];
  if (top1) {
    actions.push(`Study ${top1.domain}'s top-ranking page for "${competitorData.searchQuery}" and improve your equivalent page`);
    if (top1.domainAuthority?.score > (competitorData.userProfile?.da || 0)) {
      actions.push(`Build more backlinks to close the ${top1.domainAuthority.score - (competitorData.userProfile?.da || 0)}-point DA gap with ${top1.domain}`);
    }
    if (top1.keywordGap?.length > 0) {
      actions.push(`Target ${top1.keywordGap.length} keyword gap opportunities where ${top1.domain} ranks but you don't`);
    }
    if (top1.contentGap?.length > 0) {
      actions.push(`Create ${top1.contentGap.length} new content pages to cover the topics ${top1.domain} is targeting`);
    }
  }

  actions.push("Monitor competitor rankings monthly to track your progress against each competitor");
  actions.push("Analyse competitor backlink sources and pursue the same referring domains for your own link building");

  actions.forEach((action, i) => { R += `  ${i + 1}. ${action}\n`; });
  R += "\n";

  // ── Footer ────────────────────────────────────────────────────────────────
  R += `${LINE2}\n`;
  R += `  END OF SERVICE 12 — COMPETITOR ANALYSIS\n`;
  R += `${LINE2}\n`;

  return R;
};

module.exports = { runCompetitorAnalysis, formatCompetitorAsText };