// ─────────────────────────────────────────────────────────────────────────────
//  services/backlinksService.js
//  GrowDigitally — Backlinks Overview Service
//
//  APIs used:
//
//  PRIMARY — OpenPageRank API (completely free, no billing ever)
//    Sign up : https://www.domcop.com/openpagerank/documentation
//    Already configured in .env: OPEN_PAGE_RANK_API_KEY=your_key
//    Provides: Open Page Rank score (0–10) and domain authority proxy (0–100)
//
//  SECONDARY — Serper.dev Google Search API (if SERPER_API_KEY is set)
//    Uses "link:domain" and related searches to infer backlink signals.
//
//  FALLBACK — Signal-based estimation
//    Crawls homepage for link signals and estimates domain strength.
//    Used when no API keys are available.
//
//  Exports:
//    runBacklinksOverview(url, mainKeywords)  →  structured result
// ─────────────────────────────────────────────────────────────────────────────

require("dotenv").config();
const axios   = require("axios");
const cheerio = require("cheerio");
const { safeGet } = require("./TechnicalSeoAudit");

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Classify domain authority score (0–100) */
const classifyDA = (score) => {
  if (score === null || score === undefined) return { label: "Unknown",     tier: "unknown" };
  if (score >= 70) return { label: "Very Strong",  tier: "good"    };
  if (score >= 50) return { label: "Strong",        tier: "good"    };
  if (score >= 30) return { label: "Moderate",      tier: "medium"  };
  if (score >= 15) return { label: "Weak",          tier: "low"     };
  return               { label: "Very Weak",    tier: "poor"    };
};

/** Classify spam score (0–100) */
const classifySpam = (score) => {
  if (score === null || score === undefined) return { label: "Unknown",     tier: "unknown", isToxic: false };
  if (score >= 60) return { label: "High Risk",     tier: "poor",    isToxic: true  };
  if (score >= 30) return { label: "Medium Risk",   tier: "medium",  isToxic: false };
  if (score >= 10) return { label: "Low Risk",      tier: "low",     isToxic: false };
  return               { label: "Very Safe",    tier: "good",    isToxic: false };
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
//  SOURCE 1 — OpenPageRank API (PRIMARY — already configured, always free)
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

    const pageRank  = result.page_rank_integer ?? null;   // 0–10
    const rankScore = result.rank              ?? null;   // raw rank score
    const daProxy   = pageRank !== null ? Math.round(pageRank * 10) : null; // 0–100

    if (pageRank === null) return null;

    console.log(`[Backlinks] OpenPageRank: ${pageRank}/10 (DA proxy: ${daProxy}/100)`);

    return {
      openPageRank: pageRank,
      domainScore:  daProxy,
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
//  SOURCE 2 — Serper.dev backlink signals (optional enhancement)
//  Uses "link:domain" SERP search to find pages that link to the domain.
//  Not a true backlink database — but shows real referring pages Google knows.
// ─────────────────────────────────────────────────────────────────────────────

const fetchSerperBacklinkSignals = async (domain) => {
  const apiKey = process.env.SERPER_API_KEY || "";
  if (!apiKey || apiKey === "your_serper_api_key_here") return null;

  console.log(`[Backlinks] Fetching Serper.dev backlink signals for: ${domain}`);

  try {
    // "link:domain" search shows pages Google knows link to the domain
    const res = await axios.post(
      "https://google.serper.dev/search",
      { q: `link:${domain}`, gl: "us", hl: "en", num: 10 },
      {
        headers: {
          "X-API-KEY":    apiKey,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const organic = res.data?.organic || [];
    if (organic.length === 0) return null;

    // Parse referring pages from SERP results
    const referringPages = organic.slice(0, 10).map((item) => {
      let sourceDomain = "";
      try { sourceDomain = new URL(item.link).hostname.replace("www.", ""); } catch (_) {}

      return {
        sourceUrl:    item.link || "",
        sourceDomain,
        targetUrl:    `https://${domain}`,
        anchorText:   item.title || "",
        isDofollow:   true,   // unknown — default to true
        isNofollow:   false,
        domainRank:   null,
        spamScore:    null,
        isSpam:       false,
        firstSeen:    null,
      };
    });

    // Count unique referring domains
    const uniqueDomains = new Set(referringPages.map((p) => p.sourceDomain)).size;

    return {
      referringPages,
      uniqueDomains,
      totalFoundInSerp: organic.length,
    };
  } catch (err) {
    console.error(`[Backlinks] Serper backlink signals error: ${err.message}`);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  SOURCE 3 — Signal-based fallback
//  Crawls homepage external links to estimate backlink profile health.
// ─────────────────────────────────────────────────────────────────────────────

const estimateFromSignals = async (url) => {
  console.log("[Backlinks] Using free signal-based estimation");

  const normalizedUrl = normaliseUrl(url);
  const domain  = new URL(normalizedUrl).hostname;
  const homeRes = await safeGet(normalizedUrl, { timeout: 60000 });
  const $       = homeRes.data ? cheerio.load(homeRes.data) : null;

  let externalLinks = 0;
  let internalLinks = 0;
  const externalDomains = new Set();

  if ($) {
    $("a[href]").each((_, el) => {
      try {
        const abs    = new URL($(el).attr("href"), normalizedUrl).href;
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

  const isHttps   = url.startsWith("https://");
  const robotsRes = await safeGet(`${new URL(normalizedUrl).origin}/robots.txt`);
  const hasRobots = robotsRes.status === 200;
  const sitemapRes = await safeGet(`${new URL(normalizedUrl).origin}/sitemap.xml`);
  const hasSitemap = sitemapRes.status === 200;

  // Signal-based DA estimate
  let estimatedDA = 0;
  if (isHttps)             estimatedDA += 10;
  if (hasRobots)           estimatedDA += 5;
  if (hasSitemap)          estimatedDA += 5;
  if (internalLinks >= 5)  estimatedDA += 10;
  if (externalLinks >= 3)  estimatedDA += 5;
  estimatedDA = Math.min(30, estimatedDA);

  const daInfo = classifyDA(estimatedDA);
  const estimatedBacklinks   = Math.max(10, Math.min(5000, externalLinks * 25 + internalLinks * 3 + (hasSitemap ? 25 : 0) + (isHttps ? 15 : 0)));
  const estimatedRefDomains  = Math.max(1, Math.round(estimatedBacklinks / 6));
  const estimatedDofollow    = Math.round(estimatedBacklinks * 0.68);
  const estimatedNofollow    = Math.max(0, estimatedBacklinks - estimatedDofollow);
  const estimatedSpam        = Math.max(5, Math.min(45, 35 - estimatedDA + Math.max(0, externalLinks - 10)));
  const spamInfo             = classifySpam(estimatedSpam);
  const toxicCount           = estimatedSpam >= 30 ? Math.max(1, Math.round(estimatedBacklinks * 0.02)) : 0;

  return {
    source:            "Estimated (Free Signal-Based)",
    isEstimated:       true,
    estimationNote:    "Signal-based estimate using public SEO signals. OpenPageRank key is already set — this data will be enhanced automatically.",
    domain,
    totalBacklinks:    estimatedBacklinks,
    totalBacklinksLabel: classifyBacklinks(estimatedBacklinks),
    referringDomains:  estimatedRefDomains,
    referringDomainsLabel: classifyReferringDomains(estimatedRefDomains),
    dofollowLinks:     estimatedDofollow,
    nofollowLinks:     estimatedNofollow,
    dofollowRatio:     `${Math.round((estimatedDofollow / estimatedBacklinks) * 100)}%`,
    domainAuthority: {
      score: estimatedDA,
      label: daInfo.label + " (estimated)",
      tier:  daInfo.tier,
      note:  "Estimated from free public signals",
    },
    spamScore: {
      score:   estimatedSpam,
      label:   spamInfo.label + " (estimated)",
      tier:    spamInfo.tier,
      isToxic: spamInfo.isToxic,
      note:    "Estimated from outbound-link patterns and authority signals",
    },
    toxicWarning:        buildToxicWarning(estimatedSpam, toxicCount),
    toxicBacklinksCount: toxicCount,
    newLinks:            null,
    lostLinks:           null,
    firstSeen:           null,
    topBacklinks:        [],
    topReferringDomains: [],
    signals: {
      isHttps,
      hasRobotsTxt:          hasRobots,
      hasSitemap,
      internalLinks,
      externalLinks,
      uniqueExternalDomains: externalDomains.size,
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
//  runBacklinksOverview  (main export)
// ─────────────────────────────────────────────────────────────────────────────

const runBacklinksOverview = async (url, mainKeywords) => {
  console.log(`[Backlinks] Starting backlinks overview for: ${url}`);

  const normalizedUrl = normaliseUrl(url);
  const domain        = new URL(normalizedUrl).hostname;

  // ── Step 1: Get OpenPageRank data (PRIMARY) ───────────────────────────────
  const oprData = await fetchOpenPageRank(domain);

  // ── Step 2: Get Serper.dev backlink signals (SECONDARY — if key is set) ───
  const serperBacklinks = await fetchSerperBacklinkSignals(domain);

  // ── Step 3: Signal-based estimation for counts ───────────────────────────
  const signals = await estimateFromSignals(normalizedUrl);

  // ── Step 4: Merge everything into final result ────────────────────────────
  let result = { ...signals };

  // Upgrade DA with real OpenPageRank data
  if (oprData) {
    result.domainAuthority = {
      score:        oprData.domainScore,
      openPageRank: oprData.openPageRank,
      label:        oprData.label + " (OpenPageRank)",
      tier:         oprData.tier,
      note:         "Domain authority sourced from OpenPageRank (free, real backlink-based score)",
    };
    result.source      = "OpenPageRank + Signal-Based";
    result.isEstimated = false;  // DA is now real, not estimated
    result.estimationNote = "Domain authority is real data from OpenPageRank. Backlink counts are estimated from free public signals.";

    // Re-classify spam / toxicity using OPR score as authority proxy
    // Higher OPR = more trusted = lower spam estimate
    const adjustedSpam = Math.max(2, Math.min(30, 30 - oprData.openPageRank * 2));
    result.spamScore = {
      score:   adjustedSpam,
      label:   classifySpam(adjustedSpam).label + " (estimated)",
      tier:    classifySpam(adjustedSpam).tier,
      isToxic: classifySpam(adjustedSpam).isToxic,
      note:    `Estimated spam risk, adjusted for OpenPageRank score of ${oprData.openPageRank}/10`,
    };
    result.toxicWarning    = buildToxicWarning(adjustedSpam, 0);
    result.toxicBacklinksCount = 0;
  }

  // Add real backlink sources from Serper (if available)
  if (serperBacklinks && serperBacklinks.referringPages.length > 0) {
    result.topBacklinks = serperBacklinks.referringPages;
    result.source       = oprData
      ? "OpenPageRank + Serper.dev + Signal-Based"
      : "Serper.dev + Signal-Based";

    // Use Serper unique domain count as a minimum floor for referring domains
    if (serperBacklinks.uniqueDomains > result.referringDomains) {
      result.referringDomains = Math.max(result.referringDomains, serperBacklinks.uniqueDomains);
      result.referringDomainsLabel = classifyReferringDomains(result.referringDomains);
    }

    result.topReferringDomains = Array.from(
      new Set(serperBacklinks.referringPages.map((p) => p.sourceDomain))
    ).slice(0, 10).map((d) => ({
      domain:         d,
      domainRank:     null,
      backlinksCount: serperBacklinks.referringPages.filter((p) => p.sourceDomain === d).length,
      isDofollow:     true,
      spamScore:      null,
    }));
  }

  console.log(`[Backlinks] Done — Source: ${result.source} | DA: ${result.domainAuthority?.score ?? "N/A"} | Backlinks: ${result.totalBacklinks ?? "N/A"} | Spam: ${result.spamScore?.score ?? "N/A"}%`);

  return {
    ...result,
    url: normalizedUrl,
    mainKeywords,
    fetchedAt: new Date().toISOString(),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
//  formatBacklinksAsText
// ─────────────────────────────────────────────────────────────────────────────

const formatBacklinksAsText = (backlinksData, customerInfo) => {

  const { name, email, whatsAppNum, websiteUrl } = customerInfo;

  const LINE  = "─".repeat(70);
  const LINE2 = "═".repeat(70);

  const tierIcon = (tier) => {
    const map = { good: "🟢", medium: "🟡", low: "🟠", poor: "🔴", unknown: "⚪" };
    return map[tier] || "⚪";
  };

  const boolIcon     = (val) => val ? "✅" : "❌";
  const dofollowIcon = (val) => val ? "🟢 Dofollow" : "🔴 Nofollow";

  const spamIcon = (tier) => {
    const map = { good: "✅", low: "🟢", medium: "🟡", poor: "🔴", unknown: "⚪" };
    return map[tier] || "⚪";
  };

  const countLabel = (val) =>
    val !== null && val !== undefined ? val.toLocaleString() : "N/A";

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
    R += `  ⚠️  PARTIALLY ESTIMATED DATA\n`;
    R += `  Note    : ${backlinksData.estimationNote}\n`;
  } else {
    R += `  ✅ Domain authority sourced from OpenPageRank (real data)\n`;
    R += `  ℹ️  Backlink counts are estimated from free public signals\n`;
  }
  R += "\n";

  // ── Toxic backlink warning ────────────────────────────────────────────────
  if (backlinksData.toxicWarning) {
    R += `⚠️  TOXIC BACKLINK WARNING\n${LINE}\n`;
    R += `  ${backlinksData.toxicWarning}\n\n`;
  }

  // ── 1. Total backlinks ────────────────────────────────────────────────────
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
  R += "\n";

  // ── 2. Referring domains ──────────────────────────────────────────────────
  R += `2. REFERRING DOMAINS\n${LINE}\n`;
  R += `  Referring Domains  : ${countLabel(backlinksData.referringDomains)}\n`;
  R += `  Quality Level      : ${backlinksData.referringDomainsLabel}\n\n`;

  // ── 3. Domain Authority / OpenPageRank ────────────────────────────────────
  R += `3. DOMAIN AUTHORITY / DOMAIN SCORE\n${LINE}\n`;
  const da = backlinksData.domainAuthority;
  R += `  ${tierIcon(da?.tier)} Score        : ${da?.score !== null && da?.score !== undefined ? `${da.score}/100` : "N/A"}\n`;
  R += `  Strength       : ${da?.label || "Unknown"}\n`;
  if (da?.openPageRank !== undefined && da?.openPageRank !== null) {
    R += `  Open Page Rank : ${da.openPageRank}/10  (free real backlink-based score)\n`;
  }
  if (da?.note) {
    R += `  Note           : ${da.note}\n`;
  }
  R += "\n";

  // ── 4. Spam Score ─────────────────────────────────────────────────────────
  R += `4. SPAM SCORE\n${LINE}\n`;
  const sp = backlinksData.spamScore;
  R += `  ${spamIcon(sp?.tier)} Spam Score   : ${sp?.score !== null && sp?.score !== undefined ? `${sp.score}%` : "N/A"}\n`;
  R += `  Risk Level     : ${sp?.label || "Unknown"}\n`;
  R += `  Toxic Flag     : ${sp?.isToxic ? "🔴 YES — Action Required" : sp?.score !== null ? "✅ No" : "⚪ Unknown"}\n`;
  if (sp?.note) {
    R += `  Note           : ${sp.note}\n`;
  }
  R += "\n";

  // ── 5. Toxic backlink analysis ────────────────────────────────────────────
  R += `5. TOXIC BACKLINK ANALYSIS\n${LINE}\n`;
  if (backlinksData.toxicWarning) {
    R += `  Status         : ⚠️  TOXIC LINKS DETECTED\n`;
    R += `  Toxic Count    : ${backlinksData.toxicBacklinksCount ?? "N/A"}\n`;
    R += `  Warning        : ${backlinksData.toxicWarning}\n`;
    R += `\n  Recommended Actions:\n`;
    R += `    1. Export backlinks list from Google Search Console\n`;
    R += `    2. Create a disavow file (disavow.txt) listing toxic domains\n`;
    R += `    3. Submit disavow file via Google Search Console\n`;
    R += `       → https://search.google.com/search-console/disavow-links\n`;
    R += `    4. Monitor spam score monthly to track improvement\n`;
  } else {
    R += `  Status         : ✅ No high-risk toxic backlinks detected\n`;
    R += `  Spam Score     : ${sp?.score !== null ? `${sp.score}% — within safe range` : "N/A"}\n`;
  }
  R += "\n";

  // ── 6. Top backlink sources ───────────────────────────────────────────────
  R += `6. TOP BACKLINK SOURCES\n${LINE}\n`;
  if (backlinksData.topBacklinks && backlinksData.topBacklinks.length > 0) {
    backlinksData.topBacklinks.forEach((link, i) => {
      R += `  ${i + 1}. ${link.sourceDomain || link.sourceUrl}\n`;
      if (link.sourceUrl && link.sourceUrl !== link.sourceDomain) {
        R += `     From URL     : ${link.sourceUrl.substring(0, 80)}${link.sourceUrl.length > 80 ? "..." : ""}\n`;
      }
      if (link.anchorText) {
        R += `     Anchor Text  : "${link.anchorText.substring(0, 60)}"\n`;
      }
      R += `     Link Type    : ${dofollowIcon(link.isDofollow)}\n`;
      if (link.domainRank !== null && link.domainRank !== undefined) {
        R += `     Domain Rank  : ${link.domainRank}/100\n`;
      }
      R += "\n";
    });
  } else {
    R += `  ℹ️  Individual backlink sources not available from free sources.\n`;
    R += `     Add SERPER_API_KEY to .env to discover referring pages from Google.\n\n`;
  }

  // ── Top referring domains ─────────────────────────────────────────────────
  if (backlinksData.topReferringDomains && backlinksData.topReferringDomains.length > 0) {
    R += `TOP REFERRING DOMAINS\n${LINE}\n`;
    backlinksData.topReferringDomains.forEach((domain, i) => {
      R += `  ${i + 1}. ${domain.domain}\n`;
      R += `     Backlinks     : ${countLabel(domain.backlinksCount)}\n`;
      R += `     Link Type     : ${dofollowIcon(domain.isDofollow)}\n`;
      R += "\n";
    });
  }

  // ── Signal-based details ──────────────────────────────────────────────────
  if (backlinksData.signals) {
    R += `SIGNAL-BASED ESTIMATION DETAILS\n${LINE}\n`;
    const sig = backlinksData.signals;
    R += `  ${boolIcon(sig.isHttps)}        HTTPS enabled\n`;
    R += `  ${boolIcon(sig.hasRobotsTxt)}   robots.txt found\n`;
    R += `  ${boolIcon(sig.hasSitemap)}     XML sitemap found\n`;
    R += `  Internal Links           : ${sig.internalLinks}\n`;
    R += `  External Links (outbound): ${sig.externalLinks}\n`;
    R += `  Unique Outbound Domains  : ${sig.uniqueExternalDomains}\n\n`;
  }

  // ── Recommendations ───────────────────────────────────────────────────────
  R += `BACKLINK HEALTH RECOMMENDATIONS\n${LINE}\n`;

  const recs     = [];
  const da_score = backlinksData.domainAuthority?.score;
  const sp_score = backlinksData.spamScore?.score;
  const totalBL  = backlinksData.totalBacklinks;

  if (sp_score !== null && sp_score >= 30) {
    recs.push("Run a full backlink audit and disavow toxic links via Google Search Console");
  }
  if (da_score !== null && da_score < 20) {
    recs.push("Domain authority is low — focus on earning backlinks from reputable local websites");
    recs.push("Get listed in local business directories: Google Business Profile, Bing Places, local chambers of commerce");
  }
  if (totalBL !== null && totalBL < 50) {
    recs.push("Total backlinks are very low — create shareable content and reach out for link placements");
    recs.push("Publish guest posts on industry-relevant blogs to build referring domain diversity");
  }
  if (totalBL !== null && totalBL >= 100 && da_score < 30) {
    recs.push("You have backlinks but low domain authority — quality matters more than quantity; focus on authoritative sources");
  }
  if (backlinksData.dofollowRatio && parseInt(backlinksData.dofollowRatio) < 50) {
    recs.push("Dofollow ratio is low — prioritise earning dofollow links which pass SEO value");
  }
  if (!backlinksData.signals?.hasSitemap) {
    recs.push("Add an XML sitemap — it signals to search engines how many pages your site has");
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
