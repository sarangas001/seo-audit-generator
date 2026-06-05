// ─────────────────────────────────────────────────────────────────────────────
//  seoController.js
//  GrowDigitally — SEO Audit Backend
//  Node.js + Express.js
//
//  Step 1: Technical SEO Audit
//
//  Free tools/APIs used:
//    • axios + cheerio  — HTML crawling (no API key needed)
//    • Google PageSpeed Insights API (free, no billing required for basic use)
//      → Set PAGESPEED_API_KEY in .env (optional — works without key at lower rate limit)
//    • Native Node.js https/url modules
//
//  Install dependencies:
//    npm install axios cheerio dotenv fs path
// ─────────────────────────────────────────────────────────────────────────────


const axios   = require("axios");
const cheerio = require("cheerio");
const fs      = require("fs");
const path    = require("path");
require("dotenv").config();

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Normalise a URL — ensure it has a protocol.
 */
const normaliseUrl = (url) => {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
};

/**
 * Safe GET request — returns { data, status, headers } or null on failure.
 */
const safeGet = async (url, options = {}) => {
  try {
    const res = await axios.get(url, {
      timeout: 15000,
      maxRedirects: 10,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; GrowDigitallyBot/1.0; +https://growdigitally.lk)",
      },
      ...options,
    });
    return { data: res.data, status: res.status, headers: res.headers, finalUrl: res.request?.res?.responseUrl || url };
  } catch (err) {
    return { data: null, status: err.response?.status || 0, headers: {}, error: err.message, finalUrl: url };
  }
};

/**
 * Parse robots.txt content to detect broad crawl blocking and sitemap references.
 */
const parseRobotsTxt = (robotsTxt) => {
  const lines = typeof robotsTxt === "string" ? robotsTxt.split(/\r?\n/) : [];
  const groups = [];
  let currentGroup = [];

  const flushGroup = () => {
    if (currentGroup.length > 0) groups.push(currentGroup);
    currentGroup = [];
  };

  lines.forEach((rawLine) => {
    const trimmed = rawLine.replace(/#.*/, "").trim();
    if (!trimmed) {
      flushGroup();
      return;
    }

    currentGroup.push(trimmed);
  });
  flushGroup();

  let hasDisallow = false;
  let hasSitemapRef = false;
  let blockingAll = false;

  groups.forEach((group) => {
    const userAgents = [];
    const disallowValues = [];

    group.forEach((line) => {
      const separatorIndex = line.indexOf(":");
      if (separatorIndex === -1) return;

      const directive = line.slice(0, separatorIndex).trim().toLowerCase();
      const value = line.slice(separatorIndex + 1).trim();

      if (directive === "user-agent") {
        userAgents.push(value.toLowerCase());
      }

      if (directive === "disallow") {
        hasDisallow = true;
        if (value) disallowValues.push(value);
      }

      if (directive === "sitemap") {
        hasSitemapRef = true;
      }
    });

    const hasWildcardAgent = userAgents.includes("*");
    const blocksAllAgents = hasWildcardAgent && disallowValues.some((value) => value === "/" || value === "/*");
    if (blocksAllAgents) blockingAll = true;
  });

  return { hasDisallow, hasSitemapRef, blockingAll };
};

/**
 * Extract all absolute URLs from anchor tags.
 */
const extractLinks = ($, baseUrl) => {
  const links = [];
  const base  = new URL(baseUrl);
  $("a[href]").each((_, el) => {
    try {
      const href   = $(el).attr("href").trim();
      const absUrl = new URL(href, baseUrl).href;
      links.push({ href: absUrl, text: $(el).text().trim(), isInternal: new URL(absUrl).hostname === base.hostname });
    } catch (_) { /* skip malformed */ }
  });
  return links;
};

/**
 * Check if a URL returns a non-OK status (broken link check).
 * Uses HEAD first, falls back to GET.
 */
const checkLinkStatus = async (url) => {
  try {
    const res = await axios.head(url, { timeout: 8000, maxRedirects: 5, headers: { "User-Agent": "GrowDigitallyBot/1.0" } });
    return res.status;
  } catch (headErr) {
    try {
      const res = await axios.get(url, { timeout: 8000, maxRedirects: 5, headers: { "User-Agent": "GrowDigitallyBot/1.0" } });
      return res.status;
    } catch (getErr) {
      return getErr.response?.status || 0;
    }
  }
};

/**
 * Check a sample of links (max 20) to avoid timeout.
 */
const auditLinks = async (links) => {
  const sample  = links.slice(0, 20);
  const results = await Promise.all(
    sample.map(async (link) => {
      const status = await checkLinkStatus(link.href);
      return { ...link, status };
    })
  );
  const broken    = results.filter((l) => l.status === 404 || l.status === 0);
  const redirects = results.filter((l) => l.status >= 300 && l.status < 400);
  return { checked: results.length, broken, redirects, all: results };
};

/**
 * Fetch Google PageSpeed Insights data (free API).
 * API key is optional but recommended to avoid rate limits.
 * Add PAGESPEED_API_KEY to .env — leave blank if not available.
 */
const fetchPageSpeed = async (url, strategy = "mobile") => {
  try {
    const apiKey    = process.env.PAGESPEED_API_KEY || "";
    const keyParam  = apiKey ? `&key=${apiKey}` : "";
    const endpoint  = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}${keyParam}`;
    const res       = await safeGet(endpoint);
    if (!res.data) return null;

    const lhr       = res.data.lighthouseResult;
    const cats      = lhr?.categories || {};
    const audits    = lhr?.audits     || {};

    return {
      strategy,
      scores: {
        performance:  Math.round((cats.performance?.score  || 0) * 100),
        accessibility: Math.round((cats.accessibility?.score || 0) * 100),
        bestPractices: Math.round((cats["best-practices"]?.score || 0) * 100),
        seo:           Math.round((cats.seo?.score          || 0) * 100),
      },
      coreWebVitals: {
        lcp:  audits["largest-contentful-paint"]?.displayValue   || "N/A",
        fid:  audits["max-potential-fid"]?.displayValue          || "N/A",
        cls:  audits["cumulative-layout-shift"]?.displayValue    || "N/A",
        fcp:  audits["first-contentful-paint"]?.displayValue     || "N/A",
        tbt:  audits["total-blocking-time"]?.displayValue        || "N/A",
        si:   audits["speed-index"]?.displayValue                || "N/A",
        tti:  audits["interactive"]?.displayValue                || "N/A",
      },
      mobileUsability: audits["uses-responsive-images"] ? "Responsive images found" : "Check responsive images",
    };
  } catch (err) {
    return { strategy, error: err.message };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  TECHNICAL SEO AUDIT ENGINE
// ─────────────────────────────────────────────────────────────────────────────

const runTechnicalSEOAudit = async (websiteUrl, mainKeywords, location) => {
  const url       = normaliseUrl(websiteUrl);
  const baseUrl   = new URL(url);
  const domain    = baseUrl.hostname;
  const timestamp = new Date().toISOString();
  const audit     = {};

  console.log(`[SEO Audit] Starting Technical SEO Audit for: ${url}`);

  // ── 1. FETCH HOMEPAGE HTML ────────────────────────────────────────────────
  console.log(`[SEO Audit] Fetching homepage HTML...`);
  const homepageRes = await safeGet(url);
  const html        = homepageRes.data || "";
  const $           = html ? cheerio.load(html) : null;
  const isReachable = !!html;

  audit.meta = {
    url,
    domain,
    mainKeywords,
    location,
    auditTimestamp: timestamp,
    isReachable,
    httpStatus: homepageRes.status,
    finalUrl:   homepageRes.finalUrl,
    isHttps:    url.startsWith("https://"),
    hasRedirect: homepageRes.finalUrl !== url,
  };

  // ── 2. ROBOTS.TXT ─────────────────────────────────────────────────────────
  console.log(`[SEO Audit] Checking robots.txt...`);
  const robotsUrl = `${baseUrl.origin}/robots.txt`;
  const robotsRes = await safeGet(robotsUrl);
  const robotsTxt = typeof robotsRes.data === "string" ? robotsRes.data : "";
  const robotsAccessBlocked = [401, 403, 407, 408, 425, 429, 451].includes(robotsRes.status);
  const robotsParse = parseRobotsTxt(robotsTxt);
  audit.robotsTxt = {
    url:          robotsUrl,
    exists:       robotsRes.status === 200 && !!robotsTxt.trim(),
    accessible:   robotsRes.status === 200 && !!robotsTxt.trim(),
    accessBlocked: robotsAccessBlocked,
    status:       robotsRes.status,
    content:      typeof robotsTxt === "string" ? robotsTxt.substring(0, 2000) : "Binary/unavailable",
    hasDisallow:  robotsParse.hasDisallow,
    blockingAll:  robotsAccessBlocked || robotsParse.blockingAll,
    hasSitemapRef: robotsParse.hasSitemapRef,
  };

  // ── 3. XML SITEMAP ────────────────────────────────────────────────────────
  console.log(`[SEO Audit] Checking XML sitemap...`);

  // Check sitemap reference in robots.txt first
  let sitemapUrl = `${baseUrl.origin}/sitemap.xml`;
  if (audit.robotsTxt.hasSitemapRef && typeof robotsTxt === "string") {
    const sitemapMatch = robotsTxt.match(/sitemap:\s*(\S+)/i);
    if (sitemapMatch) sitemapUrl = sitemapMatch[1];
  }

  const sitemapRes = await safeGet(sitemapUrl);
  const sitemapXml = sitemapRes.data || "";
  let sitemapUrls  = [];

  if (sitemapXml && typeof sitemapXml === "string") {
    const urlMatches = sitemapXml.match(/<loc>(.*?)<\/loc>/gi) || [];
    sitemapUrls = urlMatches.map((m) => m.replace(/<\/?loc>/gi, "").trim()).slice(0, 50);
  }

  audit.sitemap = {
    url:          sitemapUrl,
    exists:       sitemapRes.status === 200 && !!sitemapXml,
    status:       sitemapRes.status,
    urlCount:     sitemapUrls.length,
    urls:         sitemapUrls.slice(0, 10), // show first 10 in report
    isSubmittedInRobots: audit.robotsTxt.hasSitemapRef,
  };

  // ── 4. ON-PAGE SEO CHECKS (from HTML) ─────────────────────────────────────
  if ($) {
    console.log(`[SEO Audit] Running on-page checks...`);

    // Meta title
    const metaTitle    = $("title").first().text().trim();
    const metaTitleLen = metaTitle.length;
    const titleHasKeyword = mainKeywords
      ? mainKeywords.split(",").some((kw) => metaTitle.toLowerCase().includes(kw.trim().toLowerCase()))
      : false;

    // Meta description
    const metaDesc    = $('meta[name="description"]').attr("content")?.trim() || "";
    const metaDescLen = metaDesc.length;
    const descHasKeyword = mainKeywords
      ? mainKeywords.split(",").some((kw) => metaDesc.toLowerCase().includes(kw.trim().toLowerCase()))
      : false;

    // Canonical
    const canonical   = $('link[rel="canonical"]').attr("href") || "";

    // Viewport / mobile
    const viewport    = $('meta[name="viewport"]').attr("content") || "";

    // H1 tags
    const h1Tags      = [];
    $("h1").each((_, el) => h1Tags.push($(el).text().trim()));

    // H2 tags
    const h2Tags      = [];
    $("h2").each((_, el) => h2Tags.push($(el).text().trim()));

    // H3 tags
    const h3Tags      = [];
    $("h3").each((_, el) => h3Tags.push($(el).text().trim()));

    // Images — alt text check
    const allImages   = [];
    $("img").each((_, el) => {
      const src = $(el).attr("src") || "";
      const alt = $(el).attr("alt") || "";
      allImages.push({ src, alt, hasMissingAlt: !alt.trim() });
    });
    const imagesWithoutAlt = allImages.filter((img) => img.hasMissingAlt);

    // Schema markup
    const schemaScripts = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const parsed = JSON.parse($(el).html() || "{}");
        schemaScripts.push(parsed["@type"] || "Unknown");
      } catch (_) {
        schemaScripts.push("Invalid JSON-LD");
      }
    });

    // OG tags
    const ogTitle       = $('meta[property="og:title"]').attr("content")   || "";
    const ogDescription = $('meta[property="og:description"]').attr("content") || "";
    const ogImage       = $('meta[property="og:image"]').attr("content")   || "";

    // Lang attribute
    const htmlLang = $("html").attr("lang") || "";

    // Internal / external links
    const allLinks     = extractLinks($, url);
    const internalLinks = allLinks.filter((l) => l.isInternal);
    const externalLinks = allLinks.filter((l) => !l.isInternal);

    // Word count (rough)
    const bodyText     = $("body").text().replace(/\s+/g, " ").trim();
    const wordCount    = bodyText.split(" ").filter(Boolean).length;

    // URL structure check
    const urlIssues    = [];
    if (url.includes("?") && !url.includes("?") ) urlIssues.push("Query parameters in homepage URL");
    if (url.includes("_")) urlIssues.push("Underscores in URL (use hyphens)");
    if (url.length > 115)  urlIssues.push("URL too long (> 115 chars)");

    audit.onPage = {
      metaTitle: {
        content:    metaTitle,
        length:     metaTitleLen,
        isPresent:  !!metaTitle,
        isGoodLength: metaTitleLen >= 30 && metaTitleLen <= 60,
        hasKeyword: titleHasKeyword,
        issues: [
          !metaTitle                       && "MISSING: No meta title found",
          metaTitleLen < 30                && `TOO SHORT: Meta title is only ${metaTitleLen} chars (recommended: 30–60)`,
          metaTitleLen > 60                && `TOO LONG: Meta title is ${metaTitleLen} chars (recommended: max 60)`,
          !titleHasKeyword && mainKeywords && "KEYWORD MISSING: Main keyword not found in title",
        ].filter(Boolean),
      },

      metaDescription: {
        content:    metaDesc,
        length:     metaDescLen,
        isPresent:  !!metaDesc,
        isGoodLength: metaDescLen >= 120 && metaDescLen <= 160,
        hasKeyword: descHasKeyword,
        issues: [
          !metaDesc                        && "MISSING: No meta description found",
          metaDescLen < 120                && metaDescLen > 0 && `TOO SHORT: Meta description is only ${metaDescLen} chars (recommended: 120–160)`,
          metaDescLen > 160                && `TOO LONG: Meta description is ${metaDescLen} chars (recommended: max 160)`,
          !descHasKeyword && mainKeywords  && "KEYWORD MISSING: Main keyword not found in meta description",
        ].filter(Boolean),
      },

      canonical: {
        href:       canonical,
        isPresent:  !!canonical,
        isSelfReferencing: canonical === url || canonical === url.replace(/\/$/, ""),
        issues: [
          !canonical && "MISSING: No canonical tag found",
        ].filter(Boolean),
      },

      viewport: {
        content:    viewport,
        isPresent:  !!viewport,
        isMobileReady: viewport.includes("width=device-width"),
        issues: [
          !viewport                    && "MISSING: No viewport meta tag — site may not be mobile-friendly",
          viewport && !viewport.includes("width=device-width") && "INCORRECT: Viewport not set to device-width",
        ].filter(Boolean),
      },

      headings: {
        h1Count:    h1Tags.length,
        h1Content:  h1Tags,
        h2Count:    h2Tags.length,
        h2Content:  h2Tags.slice(0, 5),
        h3Count:    h3Tags.length,
        issues: [
          h1Tags.length === 0  && "MISSING: No H1 tag found on homepage",
          h1Tags.length > 1    && `MULTIPLE H1s: Found ${h1Tags.length} H1 tags (should have exactly 1)`,
          h2Tags.length === 0  && "MISSING: No H2 tags found — heading structure may be flat",
        ].filter(Boolean),
      },

      images: {
        totalImages:       allImages.length,
        missingAltCount:   imagesWithoutAlt.length,
        missingAltImages:  imagesWithoutAlt.slice(0, 10).map((img) => img.src),
        issues: [
          imagesWithoutAlt.length > 0 && `MISSING ALT TEXT: ${imagesWithoutAlt.length} image(s) are missing alt attributes`,
        ].filter(Boolean),
      },

      schemaMarkup: {
        isPresent:  schemaScripts.length > 0,
        types:      schemaScripts,
        issues: [
          schemaScripts.length === 0 && "MISSING: No JSON-LD schema markup found — add structured data",
        ].filter(Boolean),
      },

      openGraph: {
        title:       ogTitle,
        description: ogDescription,
        image:       ogImage,
        isPresent:   !!ogTitle,
        issues: [
          !ogTitle       && "MISSING: No OG title tag — affects social media sharing appearance",
          !ogDescription && "MISSING: No OG description tag",
          !ogImage       && "MISSING: No OG image tag",
        ].filter(Boolean),
      },

      html: {
        lang:        htmlLang,
        issues: [
          !htmlLang && "MISSING: HTML lang attribute not set — affects accessibility and SEO",
        ].filter(Boolean),
      },

      links: {
        totalLinks:         allLinks.length,
        internalLinkCount:  internalLinks.length,
        externalLinkCount:  externalLinks.length,
        internalLinks:      internalLinks.slice(0, 10).map((l) => ({ href: l.href, text: l.text })),
        externalLinks:      externalLinks.slice(0, 5).map((l) => ({ href: l.href, text: l.text })),
        issues: [
          internalLinks.length === 0 && "WARNING: No internal links found on homepage",
          internalLinks.length < 3   && internalLinks.length > 0 && "LOW: Very few internal links — improve internal linking structure",
        ].filter(Boolean),
      },

      content: {
        wordCount,
        isThinContent: wordCount < 300,
        issues: [
          wordCount < 300 && `THIN CONTENT: Homepage has only ~${wordCount} words (recommended: 300+)`,
        ].filter(Boolean),
      },

      urlStructure: {
        url,
        issues: urlIssues,
      },
    };

    // ── 5. BROKEN LINKS & REDIRECTS ─────────────────────────────────────────
    console.log(`[SEO Audit] Checking up to 20 links for broken/redirect issues...`);
    const linkAudit   = await auditLinks(internalLinks.concat(externalLinks));
    audit.linkAudit   = {
      checkedCount:   linkAudit.checked,
      brokenLinks:    linkAudit.broken.map((l) => ({ url: l.href, status: l.status, text: l.text })),
      brokenCount:    linkAudit.broken.length,
      redirectLinks:  linkAudit.redirects.map((l) => ({ url: l.href, status: l.status })),
      redirectCount:  linkAudit.redirects.length,
      issues: [
        linkAudit.broken.length > 0    && `BROKEN LINKS: Found ${linkAudit.broken.length} broken link(s) (404 or unreachable)`,
        linkAudit.redirects.length > 0 && `REDIRECTS: Found ${linkAudit.redirects.length} redirect(s) — check for unnecessary chains`,
      ].filter(Boolean),
    };

  } else {
    audit.onPage    = { error: "Could not fetch homepage HTML — on-page checks skipped" };
    audit.linkAudit = { error: "Could not fetch homepage HTML — link checks skipped" };
  }

  // ── 6. HTTPS CHECK ────────────────────────────────────────────────────────
  audit.https = {
    isHttps:         url.startsWith("https://"),
    httpRedirects:   false,
    issues: [
      !url.startsWith("https://") && "CRITICAL: Site is not using HTTPS — Google penalises non-HTTPS sites",
    ].filter(Boolean),
  };

  // Check if HTTP redirects to HTTPS
  if (url.startsWith("https://")) {
    const httpVersion = await safeGet(url.replace("https://", "http://"), { maxRedirects: 0, validateStatus: () => true });
    audit.https.httpRedirects = httpVersion.status >= 300 && httpVersion.status < 400;
    if (!audit.https.httpRedirects) {
      audit.https.issues.push("WARNING: HTTP version does not redirect to HTTPS — set up 301 redirect");
    }
  }

  // ── 7. GOOGLE PAGESPEED (mobile + desktop) ────────────────────────────────
  console.log(`[SEO Audit] Fetching Google PageSpeed Insights (mobile)...`);
  const mobileSpeed  = await fetchPageSpeed(url, "mobile");
  console.log(`[SEO Audit] Fetching Google PageSpeed Insights (desktop)...`);
  const desktopSpeed = await fetchPageSpeed(url, "desktop");

  audit.pageSpeed = {
    mobile:  mobileSpeed,
    desktop: desktopSpeed,
    issues: [
      mobileSpeed?.scores?.performance  < 50  && `LOW MOBILE PERFORMANCE: Score is ${mobileSpeed.scores.performance}/100 — needs significant improvement`,
      mobileSpeed?.scores?.performance  < 90  && mobileSpeed?.scores?.performance >= 50  && `MEDIUM MOBILE PERFORMANCE: Score is ${mobileSpeed.scores.performance}/100 — room to improve`,
      desktopSpeed?.scores?.performance < 50  && `LOW DESKTOP PERFORMANCE: Score is ${desktopSpeed.scores.performance}/100 — needs significant improvement`,
      mobileSpeed?.scores?.seo          < 80  && `LOW MOBILE SEO SCORE: Score is ${mobileSpeed.scores.seo}/100`,
    ].filter(Boolean),
  };

  // ── 8. CRAWLABILITY & INDEXABILITY SUMMARY ────────────────────────────────
  audit.crawlability = {
    isReachable:         isReachable,
    httpStatus:          homepageRes.status,
    isIndexable:         isReachable && !audit.robotsTxt.blockingAll && !($ && ($('meta[name="robots"]').attr("content") || "").toLowerCase().includes("noindex")),
    robotsBlockingAll:   audit.robotsTxt.blockingAll,
    robotsAccessBlocked: audit.robotsTxt.accessBlocked,
    hasNoindex:          $ ? !!($('meta[name="robots"]').attr("content") || "").toLowerCase().includes("noindex") : false,
    issues: [
      !isReachable                            && "CRITICAL: Website is unreachable — check if the domain is live",
      homepageRes.status >= 400               && `CRITICAL: Homepage returned status ${homepageRes.status}`,
      audit.robotsTxt.accessBlocked           && `CRITICAL: robots.txt returned HTTP ${audit.robotsTxt.status} - crawlers cannot access crawl rules; allow public GET access to /robots.txt`,
      audit.robotsTxt.blockingAll             && "CRITICAL: robots.txt is blocking all crawlers — Google cannot index your site",
      $ && ($('meta[name="robots"]').attr("content") || "").toLowerCase().includes("noindex")
                                              && "CRITICAL: Noindex meta tag found — this page is excluded from Google's index",
    ].filter(Boolean),
  };

  // ── 9. AGGREGATE ALL ISSUES WITH PRIORITY ────────────────────────────────
  const allIssues = {
    critical: [],
    high:     [],
    medium:   [],
    low:      [],
  };

  const categorise = (issues, section) => {
    (issues || []).forEach((issue) => {
      if (issue.startsWith("CRITICAL:")) {
        allIssues.critical.push({ issue, section });
      } else if (issue.startsWith("MISSING:") || issue.startsWith("BROKEN") || issue.startsWith("LOW MOBILE") || issue.startsWith("LOW DESKTOP")) {
        allIssues.high.push({ issue, section });
      } else if (issue.startsWith("TOO SHORT") || issue.startsWith("TOO LONG") || issue.startsWith("KEYWORD") || issue.startsWith("THIN") || issue.startsWith("MEDIUM")) {
        allIssues.medium.push({ issue, section });
      } else {
        allIssues.low.push({ issue, section });
      }
    });
  };

  categorise(audit.crawlability.issues,              "Crawlability");
  categorise(audit.https.issues,                     "HTTPS");
  categorise(audit.robotsTxt.blockingAll ? ["CRITICAL: robots.txt blocks all"] : [], "Robots.txt");
  categorise(audit.sitemap.exists ? [] : ["MISSING: XML sitemap not found or not accessible"], "Sitemap");
  if (audit.onPage && !audit.onPage.error) {
    categorise(audit.onPage.metaTitle.issues,         "Meta Title");
    categorise(audit.onPage.metaDescription.issues,   "Meta Description");
    categorise(audit.onPage.canonical.issues,         "Canonical Tags");
    categorise(audit.onPage.viewport.issues,          "Mobile/Viewport");
    categorise(audit.onPage.headings.issues,          "Heading Structure");
    categorise(audit.onPage.images.issues,            "Image Optimisation");
    categorise(audit.onPage.schemaMarkup.issues,      "Schema Markup");
    categorise(audit.onPage.openGraph.issues,         "Open Graph");
    categorise(audit.onPage.html.issues,              "HTML Lang");
    categorise(audit.onPage.links.issues,             "Internal Links");
    categorise(audit.onPage.content.issues,           "Content");
    categorise(audit.onPage.urlStructure.issues,      "URL Structure");
  }
  categorise(audit.linkAudit?.issues || [],           "Broken Links");
  categorise(audit.pageSpeed?.issues || [],           "Page Speed");

  audit.issuesSummary = {
    totalIssues:    allIssues.critical.length + allIssues.high.length + allIssues.medium.length + allIssues.low.length,
    criticalCount:  allIssues.critical.length,
    highCount:      allIssues.high.length,
    mediumCount:    allIssues.medium.length,
    lowCount:       allIssues.low.length,
    ...allIssues,
  };

  // ── 10. TOP 3 QUICK FIXES ─────────────────────────────────────────────────
  const allPrioritised = [
    ...allIssues.critical.map((i) => ({ ...i, priority: "Critical" })),
    ...allIssues.high.map((i)     => ({ ...i, priority: "High" })),
    ...allIssues.medium.map((i)   => ({ ...i, priority: "Medium" })),
  ];
  audit.top3QuickFixes = allPrioritised.slice(0, 3).map((fix, idx) => ({
    rank:     idx + 1,
    priority: fix.priority,
    section:  fix.section,
    fix:      fix.issue.replace(/^[A-Z\s]+:\s*/, ""), // clean label prefix
  }));

  console.log(`[SEO Audit] Audit complete. Issues found: ${audit.issuesSummary.totalIssues}`);
  return audit;
};

module.exports = {
  normaliseUrl,
  safeGet,
  extractLinks,
  checkLinkStatus,
  auditLinks,
  fetchPageSpeed,
  runTechnicalSEOAudit,
};
