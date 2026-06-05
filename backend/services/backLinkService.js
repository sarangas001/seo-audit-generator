// ─────────────────────────────────────────────────────────────────────────────
//  services/backlinksService.js
//  GrowDigitally — Backlinks Overview Service
//
//  Free APIs used:
//
//  PRIMARY — DataForSEO Backlinks API (free trial, no credit card required)
//    Sign up : https://app.dataforseo.com/register
//    Docs    : https://docs.dataforseo.com/v3/backlinks/
//    Add to .env:
//      DATAFORSEO_LOGIN=your_login_email
//      DATAFORSEO_PASSWORD=your_api_password
//
//  SECONDARY — OpenPageRank API (completely free, no billing ever)
//    Sign up : https://www.domcop.com/openpagerank/documentation
//    Add to .env:
//      OPEN_PAGE_RANK_API_KEY=your_key_here
//    Provides: Open Page Rank score (0–10), a domain authority proxy
//
//  FALLBACK — Signal-based estimation
//    Used when no API credentials are set.
//    Crawls the homepage for link signals and estimates domain strength.
//
//  Exports:
//    runBacklinksOverview(url, mainKeywords)  →  structured result
// ─────────────────────────────────────────────────────────────────────────────

require("dotenv").config();
const cheerio = require("cheerio");
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

/** Classify domain authority score (0–100) */
const classifyDA = (score) => {
  if (score === null || score === undefined) return { label: "Unknown",  tier: "unknown" };
  if (score >= 70) return { label: "Very Strong", tier: "good"    };
  if (score >= 50) return { label: "Strong",       tier: "good"    };
  if (score >= 30) return { label: "Moderate",     tier: "medium"  };
  if (score >= 15) return { label: "Weak",         tier: "low"     };
  return               { label: "Very Weak",   tier: "poor"    };
};

/** Classify spam score (0–100) */
const classifySpam = (score) => {
  if (score === null || score === undefined) return { label: "Unknown",  tier: "unknown", isToxic: false };
  if (score >= 60) return { label: "High Risk",    tier: "poor",    isToxic: true  };
  if (score >= 30) return { label: "Medium Risk",  tier: "medium",  isToxic: false };
  if (score >= 10) return { label: "Low Risk",     tier: "low",     isToxic: false };
  return               { label: "Very Safe",   tier: "good",    isToxic: false };
};

/** Classify total backlink count */
const classifyBacklinks = (count) => {
  if (count === null || count === undefined) return "Unknown";
  if (count >= 10000) return "Excellent";
  if (count >= 1000)  return "Strong";
  if (count >= 100)   return "Moderate";
  if (count >= 10)    return "Weak";
  return                     "Very Weak";
};

/** Classify referring domains count */
const classifyReferringDomains = (count) => {
  if (count === null || count === undefined) return "Unknown";
  if (count >= 500)  return "Excellent";
  if (count >= 100)  return "Strong";
  if (count >= 20)   return "Moderate";
  if (count >= 5)    return "Weak";
  return                    "Very Weak";
};

/** Generate toxic backlink warning message */
const buildToxicWarning = (spamScore, toxicCount) => {
  if (spamScore === null) return null;
  if (spamScore >= 60) {
    return `🔴 CRITICAL: Domain spam score is ${spamScore}% — high risk of Google penalty. Immediate disavow action recommended.`;
  }
  if (spamScore >= 30) {
    return `🟡 WARNING: Domain spam score is ${spamScore}% — moderate risk. Review backlinks and disavow toxic links.`;
  }
  if (toxicCount && toxicCount > 0) {
    return `🟡 WARNING: ${toxicCount} potentially toxic backlink(s) detected — consider disavowing.`;
  }
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
//  SOURCE 1 — DataForSEO Backlinks API
// ─────────────────────────────────────────────────────────────────────────────

const fetchFromDataForSEO = async (domain) => {
  const auth = getDataForSEOAuth();
  if (!auth) return null;

  console.log(`[Backlinks] Fetching DataForSEO backlinks for: ${domain}`);

  try {
    // ── Backlinks summary ───────────────────────────────────────────────────
    const summaryRes = await safeGet(
      "https://api.dataforseo.com/v3/backlinks/summary/live",
      {
        method: "POST",
        headers: { "Authorization": auth, "Content-Type": "application/json" },
        data: JSON.stringify([{ target: domain, include_subdomains: true }]),
      }
    );

    // ── Top backlinks (referring pages) ────────────────────────────────────
    const backlinksRes = await safeGet(
      "https://api.dataforseo.com/v3/backlinks/backlinks/live",
      {
        method: "POST",
        headers: { "Authorization": auth, "Content-Type": "application/json" },
        data: JSON.stringify([{
          target:             domain,
          include_subdomains: true,
          filters:            ["dofollow", "=", true],
          order_by:           ["page_from_rank,desc"],
          limit:              15,
        }]),
      }
    );

    // ── Referring domains ───────────────────────────────────────────────────
    const referringRes = await safeGet(
      "https://api.dataforseo.com/v3/backlinks/referring_domains/live",
      {
        method: "POST",
        headers: { "Authorization": auth, "Content-Type": "application/json" },
        data: JSON.stringify([{
          target:             domain,
          include_subdomains: true,
          order_by:           ["domain_from_rank,desc"],
          limit:              10,
        }]),
      }
    );

    // ── Parse summary ───────────────────────────────────────────────────────
    const summaryItem = summaryRes.data?.tasks?.[0]?.result?.[0] || null;

    const totalBacklinks     = summaryItem?.backlinks                     ?? null;
    const referringDomains   = summaryItem?.referring_domains             ?? null;
    const dofollowLinks      = summaryItem?.backlinks_dofollow            ?? null;
    const nofollowLinks      = summaryItem?.backlinks_nofollow            ?? null;
    const domainRank         = summaryItem?.rank                          ?? null;
    const spamScore          = summaryItem?.spam_score !== undefined
      ? Math.round(summaryItem.spam_score * 100)
      : null;
    const firstSeen          = summaryItem?.first_seen                    ?? null;
    const lostLinks          = summaryItem?.lost_links                    ?? null;
    const newLinks           = summaryItem?.new_backlinks                 ?? null;

    // ── Parse top backlinks ─────────────────────────────────────────────────
    const backlinkItems = backlinksRes.data?.tasks?.[0]?.result?.[0]?.items || [];
    const topBacklinks  = backlinkItems.slice(0, 15).map((item) => ({
      sourceUrl:       item.url_from             || "",
      sourceDomain:    item.domain_from          || "",
      targetUrl:       item.url_to               || "",
      anchorText:      item.anchor               || "",
      isDofollow:      item.dofollow             ?? false,
      isNofollow:      !item.dofollow,
      domainRank:      item.page_from_rank       ?? null,
      firstSeen:       item.first_seen           || null,
      isSpam:          (item.spam_score ?? 0) > 0.5,
      spamScore:       item.spam_score !== undefined ? Math.round(item.spam_score * 100) : null,
    }));

    // ── Parse referring domains ─────────────────────────────────────────────
    const referringItems   = referringRes.data?.tasks?.[0]?.result?.[0]?.items || [];
    const topReferringDomains = referringItems.slice(0, 10).map((item) => ({
      domain:          item.domain_from          || "",
      domainRank:      item.domain_from_rank     ?? null,
      backlinksCount:  item.backlinks            ?? 0,
      isDofollow:      item.backlinks_dofollow   > 0,
      spamScore:       item.spam_score !== undefined ? Math.round(item.spam_score * 100) : null,
    }));

    // ── Toxic backlink detection ────────────────────────────────────────────
    const toxicBacklinks  = topBacklinks.filter((b) => b.isSpam || (b.spamScore !== null && b.spamScore >= 50));
    const toxicWarning    = buildToxicWarning(spamScore, toxicBacklinks.length);

    const daInfo   = classifyDA(domainRank);
    const spamInfo = classifySpam(spamScore);

    return {
      source:            "DataForSEO",
      domain,
      totalBacklinks,
      totalBacklinksLabel: classifyBacklinks(totalBacklinks),
      referringDomains,
      referringDomainsLabel: classifyReferringDomains(referringDomains),
      dofollowLinks,
      nofollowLinks,
      dofollowRatio:     totalBacklinks && dofollowLinks !== null
        ? `${Math.round((dofollowLinks / totalBacklinks) * 100)}%`
        : "N/A",
      domainAuthority: {
        score:   domainRank,
        label:   daInfo.label,
        tier:    daInfo.tier,
      },
      spamScore: {
        score:   spamScore,
        label:   spamInfo.label,
        tier:    spamInfo.tier,
        isToxic: spamInfo.isToxic,
      },
      toxicWarning,
      toxicBacklinksCount: toxicBacklinks.length,
      newLinks,
      lostLinks,
      firstSeen,
      topBacklinks,
      topReferringDomains,
    };

  } catch (err) {
    console.error(`[Backlinks] DataForSEO error: ${err.message}`);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  SOURCE 2 — OpenPageRank API (free, no billing)
//  Provides domain rank score as a proxy for domain authority.
// ─────────────────────────────────────────────────────────────────────────────

const fetchOpenPageRank = async (domain) => {
  const apiKey = process.env.OPEN_PAGE_RANK_API_KEY || "";
  if (!apiKey) return null;

  console.log(`[Backlinks] Fetching OpenPageRank for: ${domain}`);

  try {
    const res = await safeGet(
      `https://openpagerank.com/api/v1.0/getPageRank?domains[]=${domain}`,
      { headers: { "API-OPR": apiKey } }
    );

    const result = res.data?.response?.[0];
    if (!result) return null;

    const pageRank  = result.page_rank_integer ?? null;      // 0–10
    const rankScore = result.rank              ?? null;      // raw rank
    const daProxy   = pageRank !== null ? Math.round(pageRank * 10) : null; // convert to 0–100

    return {
      openPageRank: pageRank,        // 0–10
      domainScore:  daProxy,         // 0–100 proxy
      rankPosition: rankScore,
      label:        classifyDA(daProxy).label,
      tier:         classifyDA(daProxy).tier,
    };
  } catch (err) {
    console.error(`[Backlinks] OpenPageRank error: ${err.message}`);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  SOURCE 3 — Signal-based fallback
//  Crawls homepage external links to estimate backlink profile health.
// ─────────────────────────────────────────────────────────────────────────────

const estimateFromSignals = async (url) => {
  console.log(`[Backlinks] No API credentials — using signal-based estimation`);

  const domain  = new URL(url).hostname;
  const homeRes = await safeGet(url);
  const $       = homeRes.data ? cheerio.load(homeRes.data) : null;

  // Count outbound links (rough proxy for domain activity)
  let externalLinks = 0;
  let internalLinks = 0;
  const externalDomains = new Set();

  if ($) {
    $("a[href]").each((_, el) => {
      try {
        const abs    = new URL($(el).attr("href"), url).href;
        const parsed = new URL(abs);
        if (parsed.hostname !== domain) {
          externalLinks++;
          externalDomains.add(parsed.hostname);
        } else {
          internalLinks++;
        }
      } catch (_) {}
    });
  }

  // Check if domain is HTTPS (signals trustworthiness)
  const isHttps = url.startsWith("https://");

  // Check robots.txt for crawl signals
  const robotsRes = await safeGet(`${new URL(url).origin}/robots.txt`);
  const hasRobots = robotsRes.status === 200;

  // Check sitemap as a signal
  const sitemapRes = await safeGet(`${new URL(url).origin}/sitemap.xml`);
  const hasSitemap = sitemapRes.status === 200;

  // Signal-based DA estimate
  let estimatedDA = 0;
  if (isHttps)      estimatedDA += 10;
  if (hasRobots)    estimatedDA += 5;
  if (hasSitemap)   estimatedDA += 5;
  if (internalLinks >= 5)  estimatedDA += 10;
  if (externalLinks >= 3)  estimatedDA += 5;
  // Cap at 30 — signal-based can't reliably go higher
  estimatedDA = Math.min(30, estimatedDA);

  const daInfo = classifyDA(estimatedDA);

  return {
    source:            "Estimated (Signal-Based)",
    isEstimated:       true,
    estimationNote:    "Backlink data requires API credentials. Add DATAFORSEO_LOGIN + DATAFORSEO_PASSWORD or OPEN_PAGE_RANK_API_KEY to your .env for real data.",
    domain,
    totalBacklinks:    null,
    totalBacklinksLabel: "Unknown — API required",
    referringDomains:  null,
    referringDomainsLabel: "Unknown — API required",
    dofollowLinks:     null,
    nofollowLinks:     null,
    dofollowRatio:     "N/A",
    domainAuthority: {
      score:   estimatedDA,
      label:   daInfo.label + " (estimated)",
      tier:    daInfo.tier,
      note:    "Estimated from on-page signals — connect API for accurate score",
    },
    spamScore: {
      score:   null,
      label:   "Unknown — API required",
      tier:    "unknown",
      isToxic: false,
      note:    "Spam score requires DataForSEO API credentials",
    },
    toxicWarning:        null,
    toxicBacklinksCount: null,
    newLinks:            null,
    lostLinks:           null,
    firstSeen:           null,
    topBacklinks:        [],
    topReferringDomains: [],
    signals: {
      isHttps,
      hasRobotsTxt:    hasRobots,
      hasSitemap,
      internalLinks,
      externalLinks,
      uniqueExternalDomains: externalDomains.size,
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
//  runBacklinksOverview  (main export)
//
//  @param  {string} url         — normalised website URL
//  @param  {string} mainKeywords — user's keywords (for context)
//  @returns {object}            — structured backlinks result
// ─────────────────────────────────────────────────────────────────────────────

const runBacklinksOverview = async (url, mainKeywords) => {
  console.log(`[Backlinks] Starting backlinks overview for: ${url}`);

  const domain = new URL(url).hostname;
  let result   = null;

  // Try DataForSEO first
  result = await fetchFromDataForSEO(domain);

  // If no DataForSEO, try OpenPageRank for DA + signal estimation for the rest
  if (!result) {
    const oprData      = await fetchOpenPageRank(domain);
    const signalResult = await estimateFromSignals(url);

    if (oprData) {
      // Merge OpenPageRank DA data into the signal result
      signalResult.domainAuthority = {
        score:   oprData.domainScore,
        openPageRank: oprData.openPageRank,
        label:   oprData.label + " (OpenPageRank)",
        tier:    oprData.tier,
      };
      signalResult.source = "OpenPageRank + Signal-Based";
    }

    result = signalResult;
  }

  console.log(`[Backlinks] Done — Source: ${result.source} | DA: ${result.domainAuthority?.score ?? "N/A"} | Backlinks: ${result.totalBacklinks ?? "N/A"} | Spam: ${result.spamScore?.score ?? "N/A"}%`);

  return {
    ...result,
    url,
    mainKeywords,
    fetchedAt: new Date().toISOString(),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
//  formatBacklinksAsText
//  GrowDigitally — Backlinks Overview Report Formatter
//
//  Add this function into seoController.js alongside:
//    formatAuditAsText, formatPerformanceAsText,
//    formatSiteSpeedAsText, formatOnPageAsText,
//    formatOrganicTrafficAsText
//
//  @param  {object} backlinksData — result from runBacklinksOverview()
//  @param  {object} customerInfo  — { name, email, whatsAppNum, websiteUrl }
//  @returns {string}              — formatted plain-text report section
// ─────────────────────────────────────────────────────────────────────────────

const formatBacklinksAsText = (backlinksData, customerInfo) => {

  const { name, email, whatsAppNum, websiteUrl } = customerInfo;

  const LINE  = "─".repeat(70);
  const LINE2 = "═".repeat(70);

  // ── Icon helpers ──────────────────────────────────────────────────────────
  const tierIcon = (tier) => {
    const map = {
      good:    "🟢",
      medium:  "🟡",
      low:     "🟠",
      poor:    "🔴",
      unknown: "⚪",
    };
    return map[tier] || "⚪";
  };

  const boolIcon  = (val) => val ? "✅" : "❌";
  const dofollowIcon = (val) => val ? "🟢 Dofollow" : "🔴 Nofollow";

  const spamIcon = (tier) => {
    const map = { good: "✅", low: "🟢", medium: "🟡", poor: "🔴", unknown: "⚪" };
    return map[tier] || "⚪";
  };

  const countLabel = (val) =>
    val !== null && val !== undefined ? val.toLocaleString() : "N/A";

  // ── Build report string ───────────────────────────────────────────────────
  let R = "";

  // ── Header ────────────────────────────────────────────────────────────────
  R += `\n${LINE2}\n`;
  R += `  SERVICE 7 — BACKLINKS OVERVIEW\n`;
  R += `${LINE2}\n\n`;

  R += `CUSTOMER INFORMATION\n${LINE}\n`;
  R += `Name       : ${name}\n`;
  R += `Email      : ${email}\n`;
  R += `WhatsApp   : ${whatsAppNum}\n`;
  R += `Website    : ${websiteUrl}\n`;
  R += `Generated  : ${new Date().toISOString()}\n\n`;

  // ── Data source note ──────────────────────────────────────────────────────
  R += `DATA SOURCE\n${LINE}\n`;
  R += `  Source  : ${backlinksData.source}\n`;
  R += `  Domain  : ${backlinksData.domain}\n`;
  if (backlinksData.isEstimated) {
    R += `  ⚠️  ESTIMATED DATA\n`;
    R += `  Note    : ${backlinksData.estimationNote}\n`;
    R += `\n  To get real backlink data, add to your .env:\n`;
    R += `    DATAFORSEO_LOGIN=your_email\n`;
    R += `    DATAFORSEO_PASSWORD=your_api_password\n`;
    R += `    Sign up free: https://app.dataforseo.com/register\n`;
    R += `\n  For domain authority only (free, no billing):\n`;
    R += `    OPEN_PAGE_RANK_API_KEY=your_key\n`;
    R += `    Sign up: https://www.domcop.com/openpagerank/\n`;
  } else {
    R += `  ✅ Live data\n`;
  }
  R += "\n";

  // ── Toxic backlink warning — shown prominently at the top if present ───────
  if (backlinksData.toxicWarning) {
    R += `⚠️  TOXIC BACKLINK WARNING\n${LINE}\n`;
    R += `  ${backlinksData.toxicWarning}\n\n`;
  }

  // ════════════════════════════════════════
  //  1. TOTAL BACKLINKS
  // ════════════════════════════════════════
  R += `1. TOTAL BACKLINKS\n${LINE}\n`;
  R += `  Total Backlinks    : ${countLabel(backlinksData.totalBacklinks)}\n`;
  R += `  Quality Level      : ${backlinksData.totalBacklinksLabel}\n`;
  if (backlinksData.dofollowLinks !== null) {
    R += `  Dofollow Links     : ${countLabel(backlinksData.dofollowLinks)}\n`;
  }
  if (backlinksData.nofollowLinks !== null) {
    R += `  Nofollow Links     : ${countLabel(backlinksData.nofollowLinks)}\n`;
  }
  if (backlinksData.dofollowRatio && backlinksData.dofollowRatio !== "N/A") {
    R += `  Dofollow Ratio     : ${backlinksData.dofollowRatio}\n`;
  }
  if (backlinksData.newLinks !== null) {
    R += `  New Links (recent) : ${countLabel(backlinksData.newLinks)}\n`;
  }
  if (backlinksData.lostLinks !== null) {
    R += `  Lost Links (recent): ${countLabel(backlinksData.lostLinks)}\n`;
  }
  if (backlinksData.firstSeen) {
    R += `  First Backlink Seen: ${backlinksData.firstSeen}\n`;
  }
  R += "\n";

  // ════════════════════════════════════════
  //  2. REFERRING DOMAINS
  // ════════════════════════════════════════
  R += `2. REFERRING DOMAINS\n${LINE}\n`;
  R += `  Referring Domains  : ${countLabel(backlinksData.referringDomains)}\n`;
  R += `  Quality Level      : ${backlinksData.referringDomainsLabel}\n\n`;

  // ════════════════════════════════════════
  //  3. DOMAIN AUTHORITY / DOMAIN SCORE
  // ════════════════════════════════════════
  R += `3. DOMAIN AUTHORITY / DOMAIN SCORE\n${LINE}\n`;
  const da = backlinksData.domainAuthority;
  R += `  ${tierIcon(da?.tier)} Score        : ${da?.score !== null && da?.score !== undefined ? `${da.score}/100` : "N/A"}\n`;
  R += `  Strength       : ${da?.label || "Unknown"}\n`;
  if (da?.openPageRank !== undefined && da?.openPageRank !== null) {
    R += `  Open Page Rank : ${da.openPageRank}/10\n`;
  }
  if (da?.note) {
    R += `  Note           : ${da.note}\n`;
  }
  R += "\n";

  // ════════════════════════════════════════
  //  4. SPAM SCORE
  // ════════════════════════════════════════
  R += `4. SPAM SCORE\n${LINE}\n`;
  const sp = backlinksData.spamScore;
  R += `  ${spamIcon(sp?.tier)} Spam Score   : ${sp?.score !== null && sp?.score !== undefined ? `${sp.score}%` : "N/A"}\n`;
  R += `  Risk Level     : ${sp?.label || "Unknown"}\n`;
  R += `  Toxic Flag     : ${sp?.isToxic ? "🔴 YES — Action Required" : sp?.score !== null ? "✅ No" : "⚪ Unknown"}\n`;
  if (sp?.note) {
    R += `  Note           : ${sp.note}\n`;
  }
  R += "\n";

  // ════════════════════════════════════════
  //  5. TOXIC BACKLINK WARNING (detail)
  // ════════════════════════════════════════
  R += `5. TOXIC BACKLINK ANALYSIS\n${LINE}\n`;
  if (backlinksData.toxicWarning) {
    R += `  Status         : ⚠️  TOXIC LINKS DETECTED\n`;
    R += `  Toxic Count    : ${backlinksData.toxicBacklinksCount ?? "N/A"}\n`;
    R += `  Warning        : ${backlinksData.toxicWarning}\n`;
    R += `\n  Recommended Actions:\n`;
    R += `    1. Export toxic backlinks list from DataForSEO or Google Search Console\n`;
    R += `    2. Create a disavow file (disavow.txt) listing toxic domains\n`;
    R += `    3. Submit disavow file via Google Search Console\n`;
    R += `       → https://search.google.com/search-console/disavow-links\n`;
    R += `    4. Monitor spam score monthly to track improvement\n`;
  } else if (backlinksData.isEstimated) {
    R += `  Status         : ⚪ Cannot determine — API credentials required\n`;
    R += `  Note           : Spam score and toxic detection require DataForSEO API\n`;
  } else {
    R += `  Status         : ✅ No toxic backlinks detected\n`;
    R += `  Spam Score     : ${sp?.score !== null ? `${sp.score}% — within safe range` : "N/A"}\n`;
  }
  R += "\n";

  // ════════════════════════════════════════
  //  6. TOP BACKLINK SOURCES
  // ════════════════════════════════════════
  R += `6. TOP BACKLINK SOURCES\n${LINE}\n`;
  if (backlinksData.topBacklinks && backlinksData.topBacklinks.length > 0) {
    backlinksData.topBacklinks.forEach((link, i) => {
      R += `  ${i + 1}. ${link.sourceDomain || link.sourceUrl}\n`;
      if (link.sourceUrl && link.sourceUrl !== link.sourceDomain) {
        R += `     From URL     : ${link.sourceUrl.substring(0, 80)}${link.sourceUrl.length > 80 ? "..." : ""}\n`;
      }
      if (link.targetUrl) {
        R += `     To URL       : ${link.targetUrl.substring(0, 80)}${link.targetUrl.length > 80 ? "..." : ""}\n`;
      }
      if (link.anchorText) {
        R += `     Anchor Text  : "${link.anchorText}"\n`;
      }
      R += `     Link Type    : ${dofollowIcon(link.isDofollow)}\n`;
      if (link.domainRank !== null && link.domainRank !== undefined) {
        R += `     Domain Rank  : ${link.domainRank}/100\n`;
      }
      if (link.spamScore !== null && link.spamScore !== undefined) {
        R += `     Spam Score   : ${link.spamScore}% ${link.isSpam ? "🔴 Toxic" : "✅ Clean"}\n`;
      }
      if (link.firstSeen) {
        R += `     First Seen   : ${link.firstSeen}\n`;
      }
      R += "\n";
    });
  } else {
    R += `  ℹ️  Top backlink sources not available.\n`;
    R += `     Add DataForSEO API credentials to retrieve individual backlink sources.\n\n`;
  }

  // ── Top referring domains ─────────────────────────────────────────────────
  if (backlinksData.topReferringDomains && backlinksData.topReferringDomains.length > 0) {
    R += `TOP REFERRING DOMAINS\n${LINE}\n`;
    backlinksData.topReferringDomains.forEach((domain, i) => {
      R += `  ${i + 1}. ${domain.domain}\n`;
      if (domain.domainRank !== null && domain.domainRank !== undefined) {
        R += `     Domain Rank   : ${domain.domainRank}/100\n`;
      }
      R += `     Backlinks     : ${countLabel(domain.backlinksCount)}\n`;
      R += `     Link Type     : ${dofollowIcon(domain.isDofollow)}\n`;
      if (domain.spamScore !== null && domain.spamScore !== undefined) {
        R += `     Spam Score    : ${domain.spamScore}% ${domain.spamScore >= 50 ? "🔴" : "✅"}\n`;
      }
      R += "\n";
    });
  }

  // ── Signal-based details (fallback mode only) ─────────────────────────────
  if (backlinksData.isEstimated && backlinksData.signals) {
    R += `SIGNAL-BASED ESTIMATION DETAILS\n${LINE}\n`;
    const sig = backlinksData.signals;
    R += `  ${boolIcon(sig.isHttps)}        HTTPS enabled\n`;
    R += `  ${boolIcon(sig.hasRobotsTxt)}   robots.txt found\n`;
    R += `  ${boolIcon(sig.hasSitemap)}     XML sitemap found\n`;
    R += `  Internal Links         : ${sig.internalLinks}\n`;
    R += `  External Links (outbound): ${sig.externalLinks}\n`;
    R += `  Unique Outbound Domains: ${sig.uniqueExternalDomains}\n\n`;
  }

  // ── Backlink health recommendations ───────────────────────────────────────
  R += `BACKLINK HEALTH RECOMMENDATIONS\n${LINE}\n`;

  const recs = [];
  const da_score = backlinksData.domainAuthority?.score;
  const sp_score = backlinksData.spamScore?.score;
  const totalBL  = backlinksData.totalBacklinks;

  if (backlinksData.isEstimated) {
    recs.push("Connect DataForSEO API for real backlink data (free trial at dataforseo.com)");
  }
  if (sp_score !== null && sp_score >= 30) {
    recs.push("Run a full backlink audit and disavow toxic links via Google Search Console");
  }
  if (da_score !== null && da_score < 20) {
    recs.push("Domain authority is low — focus on earning backlinks from reputable local websites");
    recs.push("Get listed in Sri Lankan business directories: LankaSearch, FindBiz.lk, YellowPages.lk");
  }
  if (totalBL !== null && totalBL < 50) {
    recs.push("Total backlinks are very low — create shareable content and reach out for link placements");
    recs.push("Publish guest posts on industry-relevant blogs to build referring domain diversity");
  }
  if (totalBL !== null && totalBL >= 100 && da_score < 30) {
    recs.push("You have backlinks but low domain authority — quality matters more than quantity, focus on authoritative sources");
  }
  if (backlinksData.dofollowRatio && parseInt(backlinksData.dofollowRatio) < 50) {
    recs.push("Dofollow ratio is low — prioritise earning dofollow links which pass SEO value");
  }
  if (recs.length === 0) {
    recs.push("Backlink profile looks healthy — continue building high-quality links consistently");
  }

  recs.forEach((rec, i) => { R += `  ${i + 1}. ${rec}\n`; });
  R += "\n";

  // ── Footer ────────────────────────────────────────────────────────────────
  R += `${LINE2}\n`;
  R += `  END OF SERVICE 7 — BACKLINKS OVERVIEW\n`;
  R += `${LINE2}\n`;

  return R;
};

module.exports = { runBacklinksOverview, formatBacklinksAsText };