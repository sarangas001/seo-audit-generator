// ─────────────────────────────────────────────────────────────────────────────
//  services/organicTrafficService.js
//  GrowDigitally — Organic Monthly Traffic Service
//
//  Free APIs used:
//
//  PRIMARY — DataForSEO Labs API (free trial, no credit card required)
//    Sign up : https://app.dataforseo.com/register
//    Docs    : https://docs.dataforseo.com/v3/dataforseo_labs/
//    Add to .env:
//      DATAFORSEO_LOGIN=your_login_email
//      DATAFORSEO_PASSWORD=your_api_password
//    Free trial gives ~$1 in credits — enough for ~100–200 domain lookups
//
//  FALLBACK — Sitemap URL count + PageSpeed data estimation
//    Used automatically when no DataForSEO credentials are set.
//    Provides estimated ranges based on domain signals rather than N/A.
//
//  Exports:
//    runOrganicTraffic(url, mainKeywords, location)  →  structured result
// ─────────────────────────────────────────────────────────────────────────────

require("dotenv").config();
const { safeGet } = require("./TechnicalSeoAudit");

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build Base64 auth header for DataForSEO API
 */
const getDataForSEOAuth = () => {
  const login    = process.env.DATAFORSEO_LOGIN    || "";
  const password = process.env.DATAFORSEO_PASSWORD || "";
  if (!login || !password) return null;
  return "Basic " + Buffer.from(`${login}:${password}`).toString("base64");
};

/**
 * Determine location code from a location string.
 * DataForSEO uses numeric location codes.
 * Full list: https://docs.dataforseo.com/v3/appendix/locations/
 */
const getLocationCode = (location) => {
  if (!location) return 2840; // default: United States
  const loc = location.toLowerCase();
  const locationMap = {
    "sri lanka":         2144,
    "india":             2356,
    "united states":     2840,
    "uk":                2826,
    "united kingdom":    2826,
    "australia":         2036,
    "canada":            2124,
    "singapore":         2702,
    "uae":               2784,
    "united arab emirates": 2784,
    "pakistan":          2586,
    "bangladesh":        2050,
    "malaysia":          2458,
    "south africa":      2710,
  };
  for (const [key, code] of Object.entries(locationMap)) {
    if (loc.includes(key)) return code;
  }
  return 2840;
};

/**
 * Classify traffic volume into a human-readable tier
 */
const classifyTraffic = (visits) => {
  if (visits === null || visits === undefined) return { tier: "unknown", label: "Unknown" };
  if (visits >= 100000) return { tier: "high",        label: "High Traffic"        };
  if (visits >= 10000)  return { tier: "medium-high", label: "Growing Traffic"     };
  if (visits >= 1000)   return { tier: "medium",      label: "Moderate Traffic"    };
  if (visits >= 100)    return { tier: "low",          label: "Low Traffic"         };
  return                       { tier: "very-low",    label: "Very Low Traffic"    };
};

/**
 * Classify search visibility score (0–1 scale from DataForSEO)
 */
const classifyVisibility = (score) => {
  if (score === null || score === undefined) return "Unknown";
  if (score >= 0.7)  return "Excellent";
  if (score >= 0.4)  return "Good";
  if (score >= 0.15) return "Moderate";
  if (score >= 0.05) return "Low";
  return                    "Very Low";
};

/**
 * Estimate traffic opportunity based on current traffic + keywords.
 * Returns a qualitative opportunity label.
 */
const estimateOpportunity = (currentTraffic, keywordCount) => {
  if (currentTraffic === null) return { label: "Unknown",  description: "Could not estimate — no traffic data available" };
  if (currentTraffic < 100 && keywordCount > 0)  return { label: "High",    description: "Low current traffic with active keywords — strong growth potential with SEO improvements" };
  if (currentTraffic < 1000 && keywordCount > 5) return { label: "High",    description: "Moderate traffic but ranking for keywords — optimisation could 3–5x organic visits" };
  if (currentTraffic < 5000)                     return { label: "Medium",  description: "Decent foundation — targeted content and technical fixes could significantly grow traffic" };
  if (currentTraffic < 20000)                    return { label: "Low",     description: "Good traffic already — focus on maintaining rankings and expanding keyword coverage" };
  return                                                 { label: "Minimal", description: "Strong traffic base — incremental growth through long-tail keyword targeting" };
};

/**
 * Normalize URLs for use with new URL() and axios calls.
 */
const normaliseUrl = (url) => {
  if (typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

// ─────────────────────────────────────────────────────────────────────────────
//  PRIMARY SOURCE — DataForSEO Labs API
//  Endpoint: Domain Overview (Live)
// ─────────────────────────────────────────────────────────────────────────────

const fetchFromDataForSEO = async (domain, location) => {
  const auth = getDataForSEOAuth();
  if (!auth) return null; // no credentials — skip to fallback

  const locationCode = getLocationCode(location);

  console.log(`[Organic Traffic] Fetching DataForSEO domain overview for: ${domain}`);

  try {
    // ── Domain overview (organic traffic + keywords) ────────────────────────
    const overviewRes = await safeGet(
      "https://api.dataforseo.com/v3/dataforseo_labs/google/domain_whois_overview/live",
      {
        method: "POST",
        headers: {
          "Authorization": auth,
          "Content-Type":  "application/json",
        },
        data: JSON.stringify([{ target: domain }]),
      }
    );

    // ── Ranked pages (top traffic-driving pages) ────────────────────────────
    const rankedPagesRes = await safeGet(
      "https://api.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live",
      {
        method: "POST",
        headers: {
          "Authorization": auth,
          "Content-Type":  "application/json",
        },
        data: JSON.stringify([{
          target:            domain,
          location_code:     locationCode,
          language_code:     "en",
          limit:             10,
          order_by:          ["traffic_cost,desc"],
        }]),
      }
    );

    // ── Competitors overview ────────────────────────────────────────────────
    const competitorRes = await safeGet(
      "https://api.dataforseo.com/v3/dataforseo_labs/google/competitors_domain/live",
      {
        method: "POST",
        headers: {
          "Authorization": auth,
          "Content-Type":  "application/json",
        },
        data: JSON.stringify([{
          target:            domain,
          location_code:     locationCode,
          language_code:     "en",
          limit:             5,
        }]),
      }
    );

    if (overviewRes.status !== 200 || !overviewRes.data || overviewRes.data.status_code !== 20000) {
      const apiMsg = overviewRes.data?.status_message || overviewRes.error || "Unknown error";
      console.error(`[Organic Traffic] DataForSEO domain overview call failed. Status: ${overviewRes.status}, API status_code: ${overviewRes.data?.status_code}, Msg: ${apiMsg}`);
      return null;
    }

    if (rankedPagesRes.status !== 200 || !rankedPagesRes.data || rankedPagesRes.data.status_code !== 20000) {
      const apiMsg = rankedPagesRes.data?.status_message || rankedPagesRes.error || "Unknown error";
      console.error(`[Organic Traffic] DataForSEO ranked pages call failed. Status: ${rankedPagesRes.status}, API status_code: ${rankedPagesRes.data?.status_code}, Msg: ${apiMsg}`);
      return null;
    }

    if (competitorRes.status !== 200 || !competitorRes.data || competitorRes.data.status_code !== 20000) {
      const apiMsg = competitorRes.data?.status_message || competitorRes.error || "Unknown error";
      console.error(`[Organic Traffic] DataForSEO competitors call failed. Status: ${competitorRes.status}, API status_code: ${competitorRes.data?.status_code}, Msg: ${apiMsg}`);
      return null;
    }

    // ── Parse overview result ───────────────────────────────────────────────
    const overviewTask  = overviewRes.data?.tasks?.[0];
    const overviewItem  = overviewTask?.result?.[0]?.items?.[0] || null;

    // ── Parse ranked pages result ───────────────────────────────────────────
    const rankedTask    = rankedPagesRes.data?.tasks?.[0];
    const rankedItems   = rankedTask?.result?.[0]?.items || [];

    const topPages = rankedItems.slice(0, 10).map((item) => ({
      url:             item.url || "",
      title:           item.title || "",
      keywordCount:    item.se_type === "organic" ? 1 : 0,
      trafficShare:    item.traffic_share ? `${(item.traffic_share * 100).toFixed(1)}%` : "N/A",
      topKeyword:      item.keyword_data?.keyword || "",
      position:        item.ranked_serp_element?.serp_item?.rank_absolute || null,
      searchVolume:    item.keyword_data?.keyword_info?.search_volume || 0,
    }));

    // ── Parse competitor info ───────────────────────────────────────────────
    const competitorTask  = competitorRes.data?.tasks?.[0];
    const competitorItems = competitorTask?.result?.[0]?.items || [];

    // ── Build structured result from DataForSEO ─────────────────────────────
    const monthlyTraffic = overviewItem?.metrics?.organic?.etv ?? null;
    const keywordCount   = overviewItem?.metrics?.organic?.count ?? 0;
    const visibility     = overviewItem?.metrics?.organic?.pos_1
      ? overviewItem.metrics.organic.pos_1 / Math.max(keywordCount, 1)
      : null;

    return {
      source:           "DataForSEO",
      domain,
      monthlyTraffic,
      monthlyTrafficRange: monthlyTraffic !== null
        ? `${Math.round(monthlyTraffic * 0.8).toLocaleString()} – ${Math.round(monthlyTraffic * 1.2).toLocaleString()}`
        : "N/A",
      trafficTier:       classifyTraffic(monthlyTraffic),
      organicKeywords:   keywordCount,
      domainAuthority:   overviewItem?.domain_rank ?? null,
      searchVisibility: {
        score:  visibility,
        label:  classifyVisibility(visibility),
        pos1Keywords:   overviewItem?.metrics?.organic?.pos_1   ?? 0,
        pos2_3Keywords: overviewItem?.metrics?.organic?.pos_2_3 ?? 0,
        pos4_10Keywords: overviewItem?.metrics?.organic?.pos_4_10 ?? 0,
        pos11_20Keywords: overviewItem?.metrics?.organic?.pos_11_20 ?? 0,
      },
      trafficOpportunity: estimateOpportunity(monthlyTraffic, keywordCount),
      topPages,
      topCompetitors: competitorItems.slice(0, 5).map((c) => ({
        domain:          c.domain || "",
        intersections:   c.intersections || 0,
        organicKeywords: c.metrics?.organic?.count || 0,
        traffic:         c.metrics?.organic?.etv   || 0,
      })),
    };

  } catch (err) {
    console.error(`[Organic Traffic] DataForSEO error: ${err.message}`);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  FALLBACK SOURCE — Signal-based estimation
//  Used when DataForSEO credentials are not set.
//  Estimates are based on:
//    • Number of indexed pages (from sitemap)
//    • Domain age signals (TLD, subdomain patterns)
//    • PageSpeed SEO score
//    • Presence of structured data
//  This is an ESTIMATION — clearly labelled in the report.
// ─────────────────────────────────────────────────────────────────────────────

const estimateFromSignals = async (url, mainKeywords) => {
  console.log(`[Organic Traffic] Using free signal-based estimation`);

  const normalizedUrl = normaliseUrl(url);
  const baseUrl = new URL(normalizedUrl);
  const domain  = baseUrl.hostname;

  // ── Fetch sitemap to count indexed pages ───────────────────────────────────
  let indexedPageCount = 0;
  const sitemapRes = await safeGet(`${baseUrl.origin}/sitemap.xml`);
  if (sitemapRes.data && typeof sitemapRes.data === "string") {
    const urlMatches = sitemapRes.data.match(/<loc>/gi) || [];
    indexedPageCount = urlMatches.length;
  }

  // ── Fetch homepage for SEO signals ─────────────────────────────────────────
  const cheerio  = require("cheerio");
  const homeRes  = await safeGet(normalizedUrl);
  const $        = homeRes.data ? cheerio.load(homeRes.data) : null;

  let hasSchema    = false;
  let hasMeta      = false;
  let hasH1        = false;
  let internalLinks = 0;

  if ($) {
    hasSchema  = $('script[type="application/ld+json"]').length > 0;
    hasMeta    = !!$('meta[name="description"]').attr("content");
    hasH1      = $("h1").length === 1;
    $("a[href]").each((_, el) => {
      try {
        const abs = new URL($(el).attr("href"), normalizedUrl).href;
        if (new URL(abs).hostname === baseUrl.hostname) internalLinks++;
      } catch (_) {}
    });
  }

  // ── Fetch PageSpeed SEO score for additional signal ─────────────────────────
  let seoScore = 50; // default
  try {
    const apiKey   = process.env.PAGESPEED_API_KEY ? `&key=${process.env.PAGESPEED_API_KEY}` : "";
    const psRes    = await safeGet(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=desktop${apiKey}`
    );
    const cats     = psRes.data?.lighthouseResult?.categories || {};
    seoScore       = Math.round((cats.seo?.score ?? 0.5) * 100);
  } catch (_) {}

  // ── Signal-based traffic estimation ─────────────────────────────────────────
  // Base score from SEO signals (0–100)
  let signalScore = 0;
  if (indexedPageCount >= 10)  signalScore += 20;
  if (indexedPageCount >= 50)  signalScore += 10;
  if (indexedPageCount >= 100) signalScore += 10;
  if (hasSchema)               signalScore += 15;
  if (hasMeta)                 signalScore += 10;
  if (hasH1)                   signalScore += 10;
  if (internalLinks >= 5)      signalScore += 10;
  if (seoScore >= 80)          signalScore += 15;
  else if (seoScore >= 60)     signalScore += 8;

  // Map signal score to an estimated monthly traffic range
  let estimatedMin = 0, estimatedMax = 0, estimatedMid = 0;
  if (signalScore >= 80)      { estimatedMin = 5000;   estimatedMax = 20000;  estimatedMid = 10000; }
  else if (signalScore >= 60) { estimatedMin = 1000;   estimatedMax = 5000;   estimatedMid = 2500;  }
  else if (signalScore >= 40) { estimatedMin = 200;    estimatedMax = 1000;   estimatedMid = 500;   }
  else if (signalScore >= 20) { estimatedMin = 50;     estimatedMax = 200;    estimatedMid = 100;   }
  else                        { estimatedMin = 0;      estimatedMax = 50;     estimatedMid = 10;    }

  // ── Build top pages from sitemap ────────────────────────────────────────────
  let topPages = [];
  if (sitemapRes.data && typeof sitemapRes.data === "string") {
    const urlMatches = (sitemapRes.data.match(/<loc>(.*?)<\/loc>/gi) || [])
      .map((m) => m.replace(/<\/?loc>/gi, "").trim())
      .slice(0, 10);
    topPages = urlMatches.map((pageUrl) => ({
      url:         pageUrl,
      title:       "",
      note:        "From sitemap — traffic data estimated from free public signals",
      trafficShare: "N/A",
    }));
  }

  return {
    source:           "Estimated (Free Signal-Based)",
    isEstimated:      true,
    estimationNote:   "This is a free signal-based estimate using public SEO signals. No paid API is required.",
    domain,
    monthlyTraffic:   estimatedMid,
    monthlyTrafficRange: `${estimatedMin.toLocaleString()} – ${estimatedMax.toLocaleString()}`,
    trafficTier:      classifyTraffic(estimatedMid),
    organicKeywords:  null,
    domainAuthority:  null,
    signalScore,
    seoScore,
    indexedPageCount,
    signals: {
      hasSitemap:     indexedPageCount > 0,
      hasSchemaMarkup: hasSchema,
      hasMetaDesc:    hasMeta,
      hasCorrectH1:   hasH1,
      internalLinks,
      pageSpeedSeoScore: seoScore,
    },
    searchVisibility: {
      score: null,
      label: signalScore >= 60 ? "Moderate" : signalScore >= 30 ? "Low" : "Very Low",
      note:  "Estimated from on-page signals and sitemap coverage",
    },
    trafficOpportunity: {
      label:       signalScore >= 60 ? "Medium"  : "High",
      description: signalScore >= 60
        ? "Decent SEO signals detected — targeted content and link building could significantly grow traffic."
        : "Low SEO signal strength detected — fixing technical issues and creating optimised content could dramatically increase organic traffic.",
    },
    topPages,
    topCompetitors: [],
  };
};

// ─────────────────────────────────────────────────────────────────────────────
//  runOrganicTraffic  (main export)
//
//  @param  {string} url          — normalised website URL
//  @param  {string} mainKeywords — comma-separated keywords from user input
//  @param  {string} location     — user's target location
//  @returns {object}             — structured organic traffic result
// ─────────────────────────────────────────────────────────────────────────────

const runOrganicTraffic = async (url, mainKeywords, location) => {
  console.log(`[Organic Traffic] Starting organic traffic analysis for: ${url}`);

  const normalizedUrl = normaliseUrl(url);
  const domain = new URL(normalizedUrl).hostname;
  
  // Try DataForSEO first
  let result = await fetchFromDataForSEO(domain, location);

  if (!result) {
    result = await estimateFromSignals(normalizedUrl, mainKeywords);
  }

  console.log(`[Organic Traffic] Done — Source: ${result.source} | Traffic: ${result.monthlyTrafficRange} visits/mo | Opportunity: ${result.trafficOpportunity?.label}`);

  return {
    ...result,
    url: normalizedUrl,
    mainKeywords,
    location,
    fetchedAt: new Date().toISOString(),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
//  formatOrganicTrafficAsText
//  GrowDigitally — Organic Monthly Traffic Report Formatter
//
//  Add this function into seoController.js alongside:
//    formatAuditAsText, formatPerformanceAsText,
//    formatSiteSpeedAsText, formatOnPageAsText
//
//  @param  {object} trafficData   — result from runOrganicTraffic()
//  @param  {object} customerInfo  — { name, email, whatsAppNum, websiteUrl }
//  @returns {string}              — formatted plain-text report section
// ─────────────────────────────────────────────────────────────────────────────

const formatOrganicTrafficAsText = (trafficData, customerInfo) => {

  const { name, email, whatsAppNum, websiteUrl } = customerInfo;

  const LINE  = "─".repeat(70);
  const LINE2 = "═".repeat(70);

  const boolIcon = (val) => val ? "✅" : "❌";

  const tierIcon = (tier) => {
    const map = {
      "high":        "🟢",
      "medium-high": "🟢",
      "medium":      "🟡",
      "low":         "🟠",
      "very-low":    "🔴",
      "unknown":     "⚪",
    };
    return map[tier] || "⚪";
  };

  const opportunityIcon = (label) => {
    const map = { "High": "🔥", "Medium": "🟡", "Low": "🟢", "Minimal": "✅", "Unknown": "⚪" };
    return map[label] || "⚪";
  };

  const visibilityIcon = (label) => {
    const map = {
      "Excellent": "🟢",
      "Good":      "🟢",
      "Moderate":  "🟡",
      "Low":       "🟠",
      "Very Low":  "🔴",
      "Unknown":   "⚪",
    };
    return map[label] || "⚪";
  };

  let R = "";

  // ── Header ────────────────────────────────────────────────────────────────
  R += `\n${LINE2}\n`;
  R += `  SERVICE 5 — ORGANIC MONTHLY TRAFFIC\n`;
  R += `${LINE2}\n\n`;

  R += `CUSTOMER INFORMATION\n${LINE}\n`;
  R += `Name       : ${name}\n`;
  R += `Email      : ${email}\n`;
  R += `WhatsApp   : ${whatsAppNum}\n`;
  R += `Website    : ${websiteUrl}\n`;
  R += `Generated  : ${new Date().toISOString()}\n\n`;

  // ── Data source note ──────────────────────────────────────────────────────
  R += `DATA SOURCE\n${LINE}\n`;
  R += `  Source    : ${trafficData.source}\n`;
  if (trafficData.isEstimated) {
    R += `  ⚠️  ESTIMATED DATA — ${trafficData.estimationNote}\n`;
  } else {
    R += `  ✅ Live data from a free source\n`;
  }
  R += `  Domain    : ${trafficData.domain}\n`;
  R += `  Location  : ${trafficData.location || "Not specified"}\n`;
  R += `  Keywords  : ${trafficData.mainKeywords || "Not provided"}\n\n`;

  // ── Traffic overview ──────────────────────────────────────────────────────
  R += `ORGANIC TRAFFIC OVERVIEW\n${LINE}\n`;
  R += `  ${tierIcon(trafficData.trafficTier?.tier)} Estimated Monthly Traffic : ${trafficData.monthlyTraffic !== null ? trafficData.monthlyTraffic.toLocaleString() : "N/A"} visits\n`;
  R += `  Traffic Range              : ${trafficData.monthlyTrafficRange} visits/month\n`;
  R += `  Traffic Tier               : ${trafficData.trafficTier?.label || "Unknown"}\n`;
  if (trafficData.organicKeywords !== null) {
    R += `  Organic Keywords           : ${trafficData.organicKeywords.toLocaleString()}\n`;
  }
  if (trafficData.domainAuthority !== null) {
    R += `  Domain Authority           : ${trafficData.domainAuthority}/100\n`;
  }
  R += "\n";

  // ── Search visibility ─────────────────────────────────────────────────────
  R += `SEARCH VISIBILITY\n${LINE}\n`;
  const sv = trafficData.searchVisibility;
  R += `  ${visibilityIcon(sv?.label)} Visibility Level : ${sv?.label || "Unknown"}\n`;
  if (sv?.score !== null && sv?.score !== undefined) {
    R += `  Visibility Score  : ${(sv.score * 100).toFixed(1)}%\n`;
  }
  if (sv?.pos1Keywords    !== undefined) R += `  Ranking Position 1       : ${sv.pos1Keywords} keywords\n`;
  if (sv?.pos2_3Keywords  !== undefined) R += `  Ranking Position 2–3     : ${sv.pos2_3Keywords} keywords\n`;
  if (sv?.pos4_10Keywords !== undefined) R += `  Ranking Position 4–10    : ${sv.pos4_10Keywords} keywords\n`;
  if (sv?.pos11_20Keywords !== undefined) R += `  Ranking Position 11–20  : ${sv.pos11_20Keywords} keywords\n`;
  if (sv?.note) R += `  Note: ${sv.note}\n`;
  R += "\n";

  // ── Traffic opportunity ───────────────────────────────────────────────────
  R += `TRAFFIC OPPORTUNITY\n${LINE}\n`;
  const opp = trafficData.trafficOpportunity;
  R += `  ${opportunityIcon(opp?.label)} Opportunity Level : ${opp?.label || "Unknown"}\n`;
  R += `  Assessment         : ${opp?.description || "N/A"}\n\n`;

  // ── Signal-based details (fallback mode only) ─────────────────────────────
  if (trafficData.isEstimated && trafficData.signals) {
    R += `SIGNAL-BASED ESTIMATION DETAILS\n${LINE}\n`;
    R += `  Overall Signal Score       : ${trafficData.signalScore}/100\n`;
    R += `  PageSpeed SEO Score        : ${trafficData.seoScore}/100\n`;
    R += `  Indexed Pages (Sitemap)    : ${trafficData.indexedPageCount}\n`;
    R += "\n";
    R += `  SEO Signals Detected:\n`;
    const sig = trafficData.signals;
    R += `    ${boolIcon(sig.hasSitemap)}       XML Sitemap found\n`;
    R += `    ${boolIcon(sig.hasSchemaMarkup)}   Schema markup present\n`;
    R += `    ${boolIcon(sig.hasMetaDesc)}       Meta description set\n`;
    R += `    ${boolIcon(sig.hasCorrectH1)}      Correct H1 usage\n`;
    R += `    ${boolIcon(sig.internalLinks >= 5)} Internal links (${sig.internalLinks} found)\n`;
    R += `    PageSpeed SEO Score: ${sig.pageSpeedSeoScore}/100\n\n`;

    R += `  ℹ️  This report uses free public signals, so no paid API setup is required.\n\n`;
  }

  // ── Top traffic-driving pages ─────────────────────────────────────────────
  R += `TOP TRAFFIC-DRIVING PAGES\n${LINE}\n`;
  if (trafficData.topPages && trafficData.topPages.length > 0) {
    trafficData.topPages.forEach((page, i) => {
      R += `  ${i + 1}. ${page.url}\n`;
      if (page.title)        R += `     Title        : ${page.title}\n`;
      if (page.topKeyword)   R += `     Top Keyword  : ${page.topKeyword}\n`;
      if (page.position)     R += `     Position     : #${page.position}\n`;
      if (page.searchVolume) R += `     Search Vol   : ${page.searchVolume.toLocaleString()}/mo\n`;
      if (page.trafficShare && page.trafficShare !== "N/A")
                             R += `     Traffic Share: ${page.trafficShare}\n`;
      if (page.note)         R += `     Note         : ${page.note}\n`;
      R += "\n";
    });
  } else {
    R += `  ℹ️  Top pages data not available.\n`;
    R += `     Top pages are estimated from the sitemap when available.\n\n`;
  }

  // ── Top competitors (DataForSEO only) ─────────────────────────────────────
  if (trafficData.topCompetitors && trafficData.topCompetitors.length > 0) {
    R += `ORGANIC COMPETITORS\n${LINE}\n`;
    trafficData.topCompetitors.forEach((comp, i) => {
      R += `  ${i + 1}. ${comp.domain}\n`;
      R += `     Keyword Overlap : ${comp.intersections} keywords\n`;
      R += `     Organic Keywords: ${comp.organicKeywords.toLocaleString()}\n`;
      R += `     Est. Traffic    : ${comp.traffic.toLocaleString()}/mo\n\n`;
    });
  }

  // ── Recommendations ───────────────────────────────────────────────────────
  R += `TRAFFIC GROWTH RECOMMENDATIONS\n${LINE}\n`;

  const recs = [];
  const traffic = trafficData.monthlyTraffic;

  if (trafficData.isEstimated) {
    recs.push("Use Google Search Console for verified traffic data if you need exact clicks and impressions");
  }
  if (traffic !== null && traffic < 1000) {
    recs.push("Traffic is low — prioritise fixing technical SEO issues identified in Service 1");
    recs.push("Create SEO-optimised content targeting your main keywords with 1,000+ words per page");
    recs.push("Build backlinks from local Sri Lankan business directories and industry sites");
  }
  if (trafficData.signals?.pageSpeedSeoScore < 80) {
    recs.push("Improve PageSpeed SEO score — it directly impacts organic search rankings");
  }
  if (!trafficData.signals?.hasSchemaMarkup) {
    recs.push("Add schema markup to help search engines understand your content and display rich results");
  }
  if (!trafficData.signals?.hasSitemap) {
    recs.push("Create and submit an XML sitemap to Google Search Console");
  }
  if (trafficData.searchVisibility?.label === "Very Low" || trafficData.searchVisibility?.label === "Low") {
    recs.push("Search visibility is low — focus on ranking for long-tail, low-competition keywords first");
  }

  if (recs.length === 0) {
    recs.push("Continue monitoring traffic trends and expanding keyword coverage");
  }

  recs.forEach((rec, i) => { R += `  ${i + 1}. ${rec}\n`; });
  R += "\n";

  // ── Footer ────────────────────────────────────────────────────────────────
  R += `${LINE2}\n`;
  R += `  END OF SERVICE 5 — ORGANIC MONTHLY TRAFFIC\n`;
  R += `${LINE2}\n`;

  return R;
};

module.exports = { runOrganicTraffic, formatOrganicTrafficAsText };
