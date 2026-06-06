// ─────────────────────────────────────────────────────────────────────────────
//  services/organicTrafficService.js
//  GrowDigitally — Organic Monthly Traffic Service
//
//  APIs used:
//
//  PRIMARY — Serper.dev Google Search API (free tier: 2,500 searches/month)
//    Sign up : https://serper.dev (no credit card required)
//    Add to .env:  SERPER_API_KEY=your_api_key
//    Gives us: real SERP positions, indexed page count, competitor detection
//
//  SECONDARY — OpenPageRank (free, already configured)
//    Provides domain authority score as a proxy for domain strength.
//
//  FALLBACK — Sitemap URL count + PageSpeed signal-based estimation
//    Used automatically when no Serper API key is set.
//
//  Exports:
//    runOrganicTraffic(url, mainKeywords, location)  →  structured result
// ─────────────────────────────────────────────────────────────────────────────

require("dotenv").config();
const axios   = require("axios");
const cheerio = require("cheerio");
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

/** Classify traffic volume into a human-readable tier */
const classifyTraffic = (visits) => {
  if (visits === null || visits === undefined) return { tier: "unknown",   label: "Unknown"          };
  if (visits >= 100000) return { tier: "high",        label: "High Traffic"       };
  if (visits >= 10000)  return { tier: "medium-high", label: "Growing Traffic"    };
  if (visits >= 1000)   return { tier: "medium",      label: "Moderate Traffic"   };
  if (visits >= 100)    return { tier: "low",          label: "Low Traffic"        };
  return                       { tier: "very-low",    label: "Very Low Traffic"   };
};

/** Classify search visibility based on keyword positions */
const classifyVisibility = (avgPosition, keywordsChecked) => {
  if (!avgPosition || keywordsChecked === 0) return "Unknown";
  if (avgPosition <= 3)  return "Excellent";
  if (avgPosition <= 7)  return "Good";
  if (avgPosition <= 15) return "Moderate";
  if (avgPosition <= 30) return "Low";
  return                        "Very Low";
};

/** Estimate opportunity based on current traffic + keyword positions */
const estimateOpportunity = (currentTraffic, keywordCount) => {
  if (currentTraffic === null) return { label: "Unknown", description: "Could not estimate — no traffic data available" };
  if (currentTraffic < 100 && keywordCount > 0)  return { label: "High",    description: "Low current traffic with active keywords — strong growth potential with SEO improvements" };
  if (currentTraffic < 1000 && keywordCount > 5) return { label: "High",    description: "Moderate traffic but ranking for keywords — optimisation could 3–5x organic visits" };
  if (currentTraffic < 5000)                     return { label: "Medium",  description: "Decent foundation — targeted content and technical fixes could significantly grow traffic" };
  if (currentTraffic < 20000)                    return { label: "Low",     description: "Good traffic already — focus on maintaining rankings and expanding keyword coverage" };
  return                                                 { label: "Minimal", description: "Strong traffic base — incremental growth through long-tail keyword targeting" };
};

/** Normalize URLs */
const normaliseUrl = (url) => {
  if (typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

/**
 * Estimate monthly traffic from SERP position using CTR curves.
 * Based on industry-average CTR data for organic Google results.
 */
const estimateTrafficFromPosition = (position, estimatedMonthlySearches = 1000) => {
  const ctrMap = {
    1: 0.278, 2: 0.155, 3: 0.110, 4: 0.079, 5: 0.062,
    6: 0.049, 7: 0.039, 8: 0.032, 9: 0.026, 10: 0.022,
  };
  const ctr = ctrMap[position] || (position <= 20 ? 0.01 : 0.002);
  return Math.round(estimatedMonthlySearches * ctr);
};

// ─────────────────────────────────────────────────────────────────────────────
//  PRIMARY SOURCE — Serper.dev Google Search API
// ─────────────────────────────────────────────────────────────────────────────

const fetchFromSerper = async (domain, mainKeywords, location) => {
  const apiKey = process.env.SERPER_API_KEY || "";

  if (!apiKey || apiKey === "your_serper_api_key_here") {
    return null;
  }

  const gl          = getSerperCountry(location);
  const keywordList = (mainKeywords || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  console.log(`[Organic Traffic] Fetching Serper.dev data for domain: ${domain}`);

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
      console.error(`[Organic Traffic] Serper error for "${query}": HTTP ${status} — ${msg}`);
      return null;
    }
  };

  // ── Step 1: site:domain search for indexed page count ─────────────────────
  const siteData     = await serperPost(`site:${domain}`, 10);
  const totalResults = siteData?.searchInformation?.totalResults
    ? parseInt(String(siteData.searchInformation.totalResults).replace(/,/g, ""), 10) || 0
    : 0;

  // ── Step 2: Check domain positions for each main keyword ──────────────────
  const keywordPositions = [];
  const topPages         = [];
  let   totalEstimatedTraffic = 0;

  for (const kw of keywordList.slice(0, 5)) {
    const data = await serperPost(kw, 10);
    if (!data || !Array.isArray(data.organic)) continue;

    const match = data.organic.find((item) => {
      try {
        return new URL(item.link).hostname.replace("www.", "") === domain.replace("www.", "");
      } catch (_) { return false; }
    });

    if (match) {
      const pos = match.position;
      keywordPositions.push({ keyword: kw, position: pos, url: match.link });
      totalEstimatedTraffic += estimateTrafficFromPosition(pos);

      if (!topPages.find((p) => p.url === match.link)) {
        topPages.push({
          url:         match.link,
          title:       match.title || "",
          topKeyword:  kw,
          position:    pos,
          trafficShare: `~${Math.round(estimateTrafficFromPosition(pos) / Math.max(totalEstimatedTraffic, 1) * 100)}%`,
          searchVolume: 0,
        });
      }
    }
  }

  // ── Step 3: Find competitors from SERP ────────────────────────────────────
  const competitors = new Map();
  if (keywordList.length > 0) {
    const competitorData = await serperPost(keywordList[0], 10);
    if (competitorData?.organic) {
      competitorData.organic
        .filter((item) => {
          try {
            return new URL(item.link).hostname.replace("www.", "") !== domain.replace("www.", "");
          } catch (_) { return false; }
        })
        .slice(0, 5)
        .forEach((item) => {
          try {
            const compDomain = new URL(item.link).hostname.replace("www.", "");
            if (!competitors.has(compDomain)) {
              competitors.set(compDomain, {
                domain:   compDomain,
                position: item.position,
                keyword:  keywordList[0],
              });
            }
          } catch (_) {}
        });
    }
  }

  // ── Step 4: Build summary ─────────────────────────────────────────────────
  const rankedCount  = keywordPositions.length;
  const avgPosition  = rankedCount > 0
    ? Math.round(keywordPositions.reduce((s, k) => s + k.position, 0) / rankedCount)
    : null;
  const visibilityLabel = classifyVisibility(avgPosition, keywordPositions.length);

  // Traffic estimate: base on positions found + index size signal
  const indexBonus = Math.min(totalResults * 2, 5000);
  const estimatedTraffic = Math.max(totalEstimatedTraffic + indexBonus, rankedCount > 0 ? 50 : 10);

  const pos1Count    = keywordPositions.filter((k) => k.position === 1).length;
  const pos2_3Count  = keywordPositions.filter((k) => k.position >= 2 && k.position <= 3).length;
  const pos4_10Count = keywordPositions.filter((k) => k.position >= 4 && k.position <= 10).length;

  return {
    source:            "Serper.dev (Google Search API)",
    domain,
    monthlyTraffic:    estimatedTraffic,
    monthlyTrafficRange: `${Math.round(estimatedTraffic * 0.7).toLocaleString()} – ${Math.round(estimatedTraffic * 1.5).toLocaleString()}`,
    trafficTier:       classifyTraffic(estimatedTraffic),
    organicKeywords:   rankedCount,
    indexedPages:      totalResults,
    domainAuthority:   null,   // will be enriched with OpenPageRank below
    avgPosition,
    keywordPositions,
    searchVisibility: {
      score:            avgPosition ? Math.max(0, 1 - avgPosition / 100) : null,
      label:            visibilityLabel,
      pos1Keywords:     pos1Count,
      pos2_3Keywords:   pos2_3Count,
      pos4_10Keywords:  pos4_10Count,
      pos11_20Keywords: keywordPositions.filter((k) => k.position >= 11 && k.position <= 20).length,
    },
    trafficOpportunity: estimateOpportunity(estimatedTraffic, rankedCount),
    topPages:           topPages.slice(0, 10),
    topCompetitors:     Array.from(competitors.values()).slice(0, 5).map((c) => ({
      domain:          c.domain,
      intersections:   1,
      organicKeywords: 0,
      traffic:         0,
      topPosition:     c.position,
    })),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
//  OpenPageRank enrichment — adds domain authority score to any result
// ─────────────────────────────────────────────────────────────────────────────

const enrichWithOpenPageRank = async (domain, result) => {
  const apiKey = process.env.OPEN_PAGE_RANK_API_KEY || "";
  if (!apiKey) return result;

  try {
    const res = await safeGet(
      `https://openpagerank.com/api/v1.0/getPageRank?domains[]=${domain}`,
      { headers: { "API-OPR": apiKey } }
    );
    const item = res.data?.response?.[0];
    if (item) {
      const opr  = item.page_rank_integer ?? null;  // 0–10
      const daProxy = opr !== null ? Math.round(opr * 10) : null; // 0–100
      result.domainAuthority = daProxy;
      result.openPageRank    = opr;
      console.log(`[Organic Traffic] OpenPageRank for ${domain}: ${opr}/10 (DA proxy: ${daProxy})`);
    }
  } catch (err) {
    console.error(`[Organic Traffic] OpenPageRank error: ${err.message}`);
  }
  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
//  FALLBACK SOURCE — Signal-based estimation
// ─────────────────────────────────────────────────────────────────────────────

const estimateFromSignals = async (url, mainKeywords) => {
  console.log("[Organic Traffic] Using free signal-based estimation");

  const normalizedUrl = normaliseUrl(url);
  const baseUrl = new URL(normalizedUrl);
  const domain  = baseUrl.hostname;

  // ── Fetch sitemap to count indexed pages ──────────────────────────────────
  let indexedPageCount = 0;
  const sitemapRes = await safeGet(`${baseUrl.origin}/sitemap.xml`);
  if (sitemapRes.data && typeof sitemapRes.data === "string") {
    const urlMatches = sitemapRes.data.match(/<loc>/gi) || [];
    indexedPageCount = urlMatches.length;
  }

  // ── Fetch homepage for SEO signals ────────────────────────────────────────
  const homeRes  = await safeGet(normalizedUrl);
  const $        = homeRes.data ? cheerio.load(homeRes.data) : null;

  let hasSchema   = false;
  let hasMeta     = false;
  let hasH1       = false;
  let internalLinks = 0;

  if ($) {
    hasSchema = $('script[type="application/ld+json"]').length > 0;
    hasMeta   = !!$('meta[name="description"]').attr("content");
    hasH1     = $("h1").length === 1;
    $("a[href]").each((_, el) => {
      try {
        const abs = new URL($(el).attr("href"), normalizedUrl).href;
        if (new URL(abs).hostname === baseUrl.hostname) internalLinks++;
      } catch (_) {}
    });
  }

  // ── PageSpeed SEO score ───────────────────────────────────────────────────
  let seoScore = 50;
  try {
    const apiKey = process.env.PAGESPEED_API_KEY ? `&key=${process.env.PAGESPEED_API_KEY}` : "";
    const psRes  = await safeGet(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=desktop${apiKey}`
    );
    const cats   = psRes.data?.lighthouseResult?.categories || {};
    seoScore     = Math.round((cats.seo?.score ?? 0.5) * 100);
  } catch (_) {}

  // ── Signal-based traffic estimation ──────────────────────────────────────
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

  let estimatedMin = 0, estimatedMax = 0, estimatedMid = 0;
  if (signalScore >= 80)      { estimatedMin = 5000;  estimatedMax = 20000; estimatedMid = 10000; }
  else if (signalScore >= 60) { estimatedMin = 1000;  estimatedMax = 5000;  estimatedMid = 2500;  }
  else if (signalScore >= 40) { estimatedMin = 200;   estimatedMax = 1000;  estimatedMid = 500;   }
  else if (signalScore >= 20) { estimatedMin = 50;    estimatedMax = 200;   estimatedMid = 100;   }
  else                        { estimatedMin = 0;     estimatedMax = 50;    estimatedMid = 10;    }

  // ── Top pages from sitemap ────────────────────────────────────────────────
  let topPages = [];
  if (sitemapRes.data && typeof sitemapRes.data === "string") {
    const urlMatches = (sitemapRes.data.match(/<loc>(.*?)<\/loc>/gi) || [])
      .map((m) => m.replace(/<\/?loc>/gi, "").trim())
      .slice(0, 10);
    topPages = urlMatches.map((pageUrl) => ({
      url:          pageUrl,
      title:        "",
      note:         "From sitemap — traffic estimated from free public signals",
      trafficShare: "N/A",
    }));
  }

  return {
    source:           "Estimated (Free Signal-Based)",
    isEstimated:      true,
    estimationNote:   "Signal-based estimate using public SEO signals. Add a free Serper.dev API key for real traffic data.",
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
      hasSitemap:        indexedPageCount > 0,
      hasSchemaMarkup:   hasSchema,
      hasMetaDesc:       hasMeta,
      hasCorrectH1:      hasH1,
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
        : "Low SEO signal strength — fixing technical issues and creating optimised content could dramatically increase organic traffic.",
    },
    topPages,
    topCompetitors: [],
  };
};

// ─────────────────────────────────────────────────────────────────────────────
//  runOrganicTraffic  (main export)
// ─────────────────────────────────────────────────────────────────────────────

const runOrganicTraffic = async (url, mainKeywords, location) => {
  console.log(`[Organic Traffic] Starting organic traffic analysis for: ${url}`);

  const normalizedUrl = normaliseUrl(url);
  const domain        = new URL(normalizedUrl).hostname;

  // Try Serper.dev first
  let result = await fetchFromSerper(domain, mainKeywords, location);

  if (!result) {
    result = await estimateFromSignals(normalizedUrl, mainKeywords);
  }

  // Enrich with OpenPageRank domain authority (always try — key is already set)
  result = await enrichWithOpenPageRank(domain, result);

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
    const map = { "Excellent": "🟢", "Good": "🟢", "Moderate": "🟡", "Low": "🟠", "Very Low": "🔴", "Unknown": "⚪" };
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

  // ── Data source ───────────────────────────────────────────────────────────
  R += `DATA SOURCE\n${LINE}\n`;
  R += `  Source    : ${trafficData.source}\n`;
  if (trafficData.isEstimated) {
    R += `  ⚠️  ESTIMATED DATA — ${trafficData.estimationNote}\n`;
  } else {
    R += `  ✅ Live data from Serper.dev (Google Search API)\n`;
  }
  R += `  Domain    : ${trafficData.domain}\n`;
  R += `  Location  : ${trafficData.location || "Not specified"}\n`;
  R += `  Keywords  : ${trafficData.mainKeywords || "Not provided"}\n`;
  if (trafficData.indexedPages) {
    R += `  📄 Google-indexed pages: ${trafficData.indexedPages.toLocaleString()}\n`;
  }
  R += "\n";

  // ── Traffic overview ──────────────────────────────────────────────────────
  R += `ORGANIC TRAFFIC OVERVIEW\n${LINE}\n`;
  R += `  ${tierIcon(trafficData.trafficTier?.tier)} Estimated Monthly Traffic : ${trafficData.monthlyTraffic !== null ? trafficData.monthlyTraffic.toLocaleString() : "N/A"} visits\n`;
  R += `  Traffic Range              : ${trafficData.monthlyTrafficRange} visits/month\n`;
  R += `  Traffic Tier               : ${trafficData.trafficTier?.label || "Unknown"}\n`;
  if (trafficData.organicKeywords !== null && trafficData.organicKeywords !== undefined) {
    R += `  Keywords Ranking (found)   : ${trafficData.organicKeywords}\n`;
  }
  if (trafficData.domainAuthority !== null && trafficData.domainAuthority !== undefined) {
    R += `  Domain Authority (OPR)     : ${trafficData.domainAuthority}/100\n`;
  }
  if (trafficData.openPageRank !== null && trafficData.openPageRank !== undefined) {
    R += `  Open Page Rank             : ${trafficData.openPageRank}/10\n`;
  }
  if (trafficData.avgPosition !== null && trafficData.avgPosition !== undefined) {
    R += `  Avg. Keyword Position      : #${trafficData.avgPosition}\n`;
  }
  R += "\n";

  // ── Keyword positions (Serper mode) ──────────────────────────────────────
  if (trafficData.keywordPositions && trafficData.keywordPositions.length > 0) {
    R += `KEYWORD RANKINGS FOUND\n${LINE}\n`;
    trafficData.keywordPositions.forEach((kp, i) => {
      R += `  ${i + 1}. "${kp.keyword}" → Position #${kp.position}\n`;
      if (kp.url) R += `     URL: ${kp.url}\n`;
    });
    R += "\n";
  }

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
    R += `  ℹ️  Add SERPER_API_KEY to .env for real traffic data (free at https://serper.dev)\n\n`;
  }

  // ── Top pages ─────────────────────────────────────────────────────────────
  R += `TOP TRAFFIC-DRIVING PAGES\n${LINE}\n`;
  if (trafficData.topPages && trafficData.topPages.length > 0) {
    trafficData.topPages.forEach((page, i) => {
      R += `  ${i + 1}. ${page.url}\n`;
      if (page.title)        R += `     Title        : ${page.title}\n`;
      if (page.topKeyword)   R += `     Top Keyword  : ${page.topKeyword}\n`;
      if (page.position)     R += `     Position     : #${page.position}\n`;
      if (page.trafficShare && page.trafficShare !== "N/A")
                             R += `     Traffic Share: ${page.trafficShare}\n`;
      if (page.note)         R += `     Note         : ${page.note}\n`;
      R += "\n";
    });
  } else {
    R += `  ℹ️  Top pages data not available.\n\n`;
  }

  // ── Top competitors ───────────────────────────────────────────────────────
  if (trafficData.topCompetitors && trafficData.topCompetitors.length > 0) {
    R += `ORGANIC COMPETITORS (from SERP)\n${LINE}\n`;
    trafficData.topCompetitors.forEach((comp, i) => {
      R += `  ${i + 1}. ${comp.domain}\n`;
      if (comp.topPosition) R += `     SERP Position : #${comp.topPosition}\n`;
      R += "\n";
    });
  }

  // ── Recommendations ───────────────────────────────────────────────────────
  R += `TRAFFIC GROWTH RECOMMENDATIONS\n${LINE}\n`;
  const recs = [];
  const traffic = trafficData.monthlyTraffic;

  if (trafficData.isEstimated) {
    recs.push("Add a free Serper.dev API key to get real Google ranking positions (https://serper.dev)");
  }
  if (traffic !== null && traffic < 1000) {
    recs.push("Traffic is low — prioritise fixing technical SEO issues identified in Service 1");
    recs.push("Create SEO-optimised content targeting your main keywords with 1,000+ words per page");
    recs.push("Build backlinks from local business directories and industry sites");
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
