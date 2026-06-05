// ─────────────────────────────────────────────────────────────────────────────
//  services/siteSpeedService.js
//  GrowDigitally — Site Speed Test Service
//
//  Free API used:
//    • Google PageSpeed Insights API v5 (same as performanceService)
//      Add to .env: PAGESPEED_API_KEY=your_key_here
//
//  What this extracts (speed-focused, different from performanceService):
//    • Load time breakdown
//    • Interactivity metrics
//    • Visual stability
//    • LCP, FCP, TBT, CLS — with ratings + user-friendly labels
//    • Mobile experience rating
//    • Desktop experience rating
//    • Speed grade (A–F)
//
//  Exports:
//    runSiteSpeedTest(url)  →  { mobile, desktop, summary }
// ─────────────────────────────────────────────────────────────────────────────

require("dotenv").config();
const cheerio = require("cheerio");
const { safeGet } = require("./TechnicalSeoAudit");

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert a performance score (0–100) to a letter grade (A–F)
 */
const scoreToGrade = (score) => {
  if (score === null || score === undefined || isNaN(score)) return "N/A";
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 50) return "D";
  return "F";
};

/**
 * Convert a performance score (0–100) to a speed label
 */
const scoreToSpeedLabel = (score) => {
  if (score === null || score === undefined || isNaN(score)) return "Unknown";
  if (score >= 90) return "Fast";
  if (score >= 50) return "Moderate";
  return "Slow";
};

/**
 * Rate a Core Web Vital value against Google's official thresholds.
 * Returns: "good" | "needs-improvement" | "poor" | "unknown"
 */
const rateVital = (metricId, numericValue) => {
  if (numericValue === null || numericValue === undefined) return "unknown";

  const thresholds = {
    "largest-contentful-paint": { good: 2500,  poor: 4000  }, // ms
    "first-contentful-paint":   { good: 1800,  poor: 3000  }, // ms
    "total-blocking-time":      { good: 200,   poor: 600   }, // ms
    "cumulative-layout-shift":  { good: 0.1,   poor: 0.25  }, // unitless (score)
    "speed-index":              { good: 3400,  poor: 5800  }, // ms
    "interactive":              { good: 3800,  poor: 7300  }, // ms (TTI)
  };

  const t = thresholds[metricId];
  if (!t) return "unknown";
  if (numericValue <= t.good) return "good";
  if (numericValue <= t.poor) return "needs-improvement";
  return "poor";
};

/**
 * Map a vital rating to a user-friendly label
 */
const ratingToLabel = (rating) => {
  const map = {
    "good":              "Good",
    "needs-improvement": "Needs Improvement",
    "poor":              "Poor",
    "unknown":           "N/A",
  };
  return map[rating] || "N/A";
};

/**
 * Extract a single metric from Lighthouse audits safely
 */
const extractMetric = (audits, auditId) => {
  const audit = audits[auditId];
  if (!audit) {
    return {
      displayValue: "N/A",
      numericValue: null,
      rating:       "unknown",
      label:        "N/A",
    };
  }
  const numericValue = audit.numericValue ?? null;
  const rating       = rateVital(auditId, numericValue);
  return {
    displayValue: audit.displayValue || "N/A",
    numericValue,
    unit:         audit.numericUnit || "ms",
    rating,
    label:        ratingToLabel(rating),
  };
};

/**
 * Ensure PageSpeed receives a valid absolute URL.
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

/**
 * Resolve redirects before calling PageSpeed.
 */
const resolveAuditUrl = async (url) => {
  const normalized = normaliseUrl(url);
  if (!normalized) return "";

  const res = await safeGet(normalized, { maxRedirects: 10, validateStatus: () => true });
  return res.finalUrl || normalized;
};

/**
 * Free fallback when PageSpeed fails: estimate speed from public HTML signals.
 */
const estimateFromSignals = async (url, strategy, resolvedUrl) => {
  const targetUrl = resolvedUrl || normaliseUrl(url);
  const homeRes = await safeGet(targetUrl, {
    timeout: 60000,
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; GrowDigitallyBot/1.0; +https://growdigitally.lk)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });

  const html = typeof homeRes.data === "string" ? homeRes.data : "";
  const $ = html ? cheerio.load(html) : null;

  const htmlSizeKb = Math.round(Buffer.byteLength(html || "", "utf8") / 1024);
  const imgCount = $ ? $("img").length : 0;
  const scriptCount = $ ? $("script").length : 0;
  const cssCount = $ ? $('link[rel="stylesheet"]').length : 0;
  const externalScriptCount = $ ? $("script[src]").filter((_, el) => {
    try {
      return new URL($(el).attr("src"), targetUrl).hostname !== new URL(targetUrl).hostname;
    } catch (_) {
      return false;
    }
  }).length : 0;

  let performanceScore = 90;
  if (htmlSizeKb > 250) performanceScore -= 20;
  else if (htmlSizeKb > 150) performanceScore -= 12;
  else if (htmlSizeKb > 80) performanceScore -= 8;

  performanceScore -= Math.min(20, Math.max(0, imgCount - 10) * 2);
  performanceScore -= Math.min(15, Math.max(0, scriptCount - 8) * 2);
  performanceScore -= Math.min(10, cssCount > 6 ? (cssCount - 6) * 2 : 0);
  performanceScore -= Math.min(15, externalScriptCount * 3);
  if (!homeRes.data) performanceScore -= 10;
  performanceScore = Math.max(15, Math.min(95, performanceScore));

  const makeMetric = (label, value, rating) => ({
    displayValue: value,
    numericValue: null,
    unit: "ms",
    rating,
    label,
  });

  const speedLabel = performanceScore >= 90 ? "Fast" : performanceScore >= 50 ? "Moderate" : "Slow";
  const interactivity = performanceScore >= 85 ? "Smooth" : performanceScore >= 60 ? "Moderate" : "Sluggish";
  const stability = performanceScore >= 85 ? "Stable" : performanceScore >= 60 ? "Some Layout Shift" : "Unstable";

  const rating = performanceScore >= 90 ? "good" : performanceScore >= 60 ? "needs-improvement" : "poor";
  const displayValue = `Estimated (${htmlSizeKb}KB HTML, ${imgCount} imgs, ${scriptCount} scripts)`;

  const speedIssues = [];
  if (performanceScore < 60) {
    speedIssues.push(`🟠 Estimated page complexity is high (${htmlSizeKb}KB HTML, ${scriptCount} scripts, ${imgCount} images)`);
  } else {
    speedIssues.push("✅ No critical speed issues detected from free signal-based estimation");
  }

  return {
    strategy,
    resolvedUrl: targetUrl,
    isEstimated: true,
    estimationNote: "PageSpeed was unavailable, so this is a free signal-based estimate from the homepage HTML.",
    fetchedAt: new Date().toISOString(),
    performanceScore,
    speedGrade: scoreToGrade(performanceScore),
    speedLabel: speedLabel,
    metrics: {
      loadTime: makeMetric(speedLabel, displayValue, rating),
      lcp: makeMetric(speedLabel, displayValue, rating),
      fcp: makeMetric(speedLabel, displayValue, rating),
      tbt: makeMetric(interactivity, displayValue, rating),
      cls: makeMetric(stability, displayValue, rating),
      tti: makeMetric(interactivity, displayValue, rating),
    },
    vitalSummary: {
      passing: rating === "good" ? 6 : rating === "needs-improvement" ? 2 : 0,
      warning: rating === "needs-improvement" ? 4 : rating === "poor" ? 2 : 0,
      failing: rating === "poor" ? 6 : 0,
      total: 6,
    },
    userFriendlyLabels: {
      loadingSpeed: speedLabel,
      interactivity,
      visualStability: stability,
      mobileExperience: strategy === "mobile" ? speedLabel : null,
      desktopExperience: strategy === "desktop" ? speedLabel : null,
    },
    speedIssues,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
//  fetchSpeedData
//  Calls PageSpeed API for one strategy and extracts speed-specific data only.
// ─────────────────────────────────────────────────────────────────────────────

const fetchSpeedData = async (url, strategy) => {
  try {
    const resolvedUrl = await resolveAuditUrl(url);
    if (!resolvedUrl) {
      const errMsg = "Invalid or empty website URL";
      console.error(`[Site Speed] API error (${strategy}): ${errMsg}`);
      return { strategy, error: errMsg };
    }

    const apiKey   = process.env.PAGESPEED_API_KEY
      ? `&key=${process.env.PAGESPEED_API_KEY}`
      : "";
    const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed`
      + `?url=${encodeURIComponent(resolvedUrl)}`
      + `&strategy=${strategy}`
      + `${apiKey}`
      + `&locale=en`;

    console.log(`[Site Speed] Fetching speed data — ${strategy.toUpperCase()}...`);
    console.log(`[Site Speed] Using resolved URL: ${resolvedUrl}`);
    const res = await safeGet(endpoint, { timeout: 60000 });

    if (!res.data || res.data.error) {
      const apiError = res.data?.error;
      const errMsg = apiError?.message || res.error || "Unknown API error";
      const details = apiError?.details?.map((d) => d?.message).filter(Boolean).join("; ");
      const fullMsg = details ? `${errMsg} (${details})` : errMsg;
      console.error(`[Site Speed] API error (${strategy}): ${fullMsg}`);
      return estimateFromSignals(url, strategy, resolvedUrl);
    }

    const lhr    = res.data.lighthouseResult;
    const audits = lhr?.audits     || {};
    const cats   = lhr?.categories || {};

    // ── Overall performance score ──────────────────────────────────────────────
    const performanceScore = Math.round((cats.performance?.score ?? 0) * 100);

    // ── Speed metrics ──────────────────────────────────────────────────────────
    const lcp = extractMetric(audits, "largest-contentful-paint");
    const fcp = extractMetric(audits, "first-contentful-paint");
    const tbt = extractMetric(audits, "total-blocking-time");
    const cls = extractMetric(audits, "cumulative-layout-shift");
    const si  = extractMetric(audits, "speed-index");
    const tti = extractMetric(audits, "interactive");

    // ── Load time estimate (Speed Index as proxy for perceived load time) ──────
    const loadTime = {
      displayValue: si.displayValue,
      numericValue: si.numericValue,
      unit:         "ms",
      rating:       si.rating,
      label:        si.label,
    };

    // ── User-friendly experience labels ────────────────────────────────────────
    const userFriendlyLabels = {
      loadingSpeed:   scoreToSpeedLabel(performanceScore),
      interactivity:  tti.rating === "good" ? "Smooth"
                    : tti.rating === "needs-improvement" ? "Moderate"
                    : "Sluggish",
      visualStability: cls.rating === "good" ? "Stable"
                     : cls.rating === "needs-improvement" ? "Some Layout Shift"
                     : "Unstable",
      mobileExperience:  strategy === "mobile"
                       ? scoreToSpeedLabel(performanceScore)
                       : null,
      desktopExperience: strategy === "desktop"
                       ? scoreToSpeedLabel(performanceScore)
                       : null,
    };

    // ── Speed grade ────────────────────────────────────────────────────────────
    const speedGrade = scoreToGrade(performanceScore);

    // ── Count how many vitals are failing ──────────────────────────────────────
    const vitals        = [lcp, fcp, tbt, cls, si, tti];
    const failingVitals = vitals.filter((v) => v.rating === "poor").length;
    const warningVitals = vitals.filter((v) => v.rating === "needs-improvement").length;
    const passingVitals = vitals.filter((v) => v.rating === "good").length;

    // ── Speed issues list ──────────────────────────────────────────────────────
    const speedIssues = [];

    if (lcp.rating === "poor")              speedIssues.push(`🔴 LCP is ${lcp.displayValue} — content loads too slowly (target: under 2.5s)`);
    else if (lcp.rating === "needs-improvement") speedIssues.push(`🟡 LCP is ${lcp.displayValue} — could be improved (target: under 2.5s)`);

    if (fcp.rating === "poor")              speedIssues.push(`🔴 FCP is ${fcp.displayValue} — first content appears too late (target: under 1.8s)`);
    else if (fcp.rating === "needs-improvement") speedIssues.push(`🟡 FCP is ${fcp.displayValue} — could be improved (target: under 1.8s)`);

    if (tbt.rating === "poor")              speedIssues.push(`🔴 TBT is ${tbt.displayValue} — page is blocking user interaction (target: under 200ms)`);
    else if (tbt.rating === "needs-improvement") speedIssues.push(`🟡 TBT is ${tbt.displayValue} — consider reducing JavaScript execution time`);

    if (cls.rating === "poor")              speedIssues.push(`🔴 CLS is ${cls.displayValue} — severe layout shift affecting user experience (target: under 0.1)`);
    else if (cls.rating === "needs-improvement") speedIssues.push(`🟡 CLS is ${cls.displayValue} — some layout shifting detected (target: under 0.1)`);

    if (tti.rating === "poor")              speedIssues.push(`🔴 TTI is ${tti.displayValue} — page takes too long to become interactive (target: under 3.8s)`);
    else if (tti.rating === "needs-improvement") speedIssues.push(`🟡 TTI is ${tti.displayValue} — interactivity could be improved (target: under 3.8s)`);

    if (speedIssues.length === 0)           speedIssues.push("✅ All speed metrics are within acceptable thresholds");

    return {
      strategy,
      resolvedUrl,
      fetchedAt:        new Date().toISOString(),
      performanceScore,
      speedGrade,
      speedLabel:       scoreToSpeedLabel(performanceScore),

      // Core speed metrics
      metrics: {
        loadTime,      // Speed Index — perceived load time
        lcp,           // Largest Contentful Paint
        fcp,           // First Contentful Paint
        tbt,           // Total Blocking Time — interactivity proxy
        cls,           // Cumulative Layout Shift — visual stability
        tti,           // Time to Interactive
      },

      // Vital counts
      vitalSummary: {
        passing: passingVitals,
        warning: warningVitals,
        failing: failingVitals,
        total:   vitals.length,
      },

      userFriendlyLabels,
      speedIssues,
    };

  } catch (err) {
    console.error(`[Site Speed] Unexpected error (${strategy}):`, err.message);
    return estimateFromSignals(url, strategy, await resolveAuditUrl(url));
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  runSiteSpeedTest  (main export)
//  Runs mobile + desktop in parallel, then builds a cross-strategy summary.
//
//  @param  {string} url  — normalised website URL
//  @returns {{ mobile, desktop, summary }}
// ─────────────────────────────────────────────────────────────────────────────

const runSiteSpeedTest = async (url) => {
  console.log(`[Site Speed] Starting site speed test for: ${url}`);

  const mobile = await fetchSpeedData(url, "mobile");
  const desktop = await fetchSpeedData(url, "desktop");

  // ── Cross-strategy summary ──────────────────────────────────────────────────
  const summary = {
    mobileScore:          mobile.error  ? null : mobile.performanceScore,
    desktopScore:         desktop.error ? null : desktop.performanceScore,
    mobileGrade:          mobile.error  ? "N/A" : mobile.speedGrade,
    desktopGrade:         desktop.error ? "N/A" : desktop.speedGrade,
    mobileExperience:     mobile.error  ? "Error" : mobile.userFriendlyLabels.mobileExperience,
    desktopExperience:    desktop.error ? "Error" : desktop.userFriendlyLabels.desktopExperience,
    overallLoadingSpeed:  mobile.error  ? "Unknown" : mobile.userFriendlyLabels.loadingSpeed,
    overallInteractivity: mobile.error  ? "Unknown" : mobile.userFriendlyLabels.interactivity,
    overallVisualStability: mobile.error ? "Unknown" : mobile.userFriendlyLabels.visualStability,
    totalIssues: [
      ...(mobile.error  ? [] : mobile.speedIssues.filter((i) => i.startsWith("🔴") || i.startsWith("🟡"))),
      ...(desktop.error ? [] : desktop.speedIssues.filter((i) => i.startsWith("🔴") || i.startsWith("🟡"))),
    ].length,
  };

  console.log(`[Site Speed] Done — Mobile: ${summary.mobileScore ?? "ERROR"}/100 (${summary.mobileGrade}) | Desktop: ${summary.desktopScore ?? "ERROR"}/100 (${summary.desktopGrade})`);

  return { mobile, desktop, summary };
};

// ─────────────────────────────────────────────────────────────────────────────
//  formatSiteSpeedAsText
//  GrowDigitally — Site Speed Test Report Formatter
//
//  Add this function into seoController.js alongside formatAuditAsText
//  and formatPerformanceAsText.
//
//  @param  {object} siteSpeedData  — result from runSiteSpeedTest(url)
//                                    shape: { mobile, desktop, summary }
//  @param  {object} customerInfo   — { name, email, whatsAppNum, websiteUrl }
//  @returns {string}               — formatted plain-text report section
// ─────────────────────────────────────────────────────────────────────────────

const formatSiteSpeedAsText = (siteSpeedData, customerInfo) => {

  const { name, email, whatsAppNum, websiteUrl } = customerInfo;
  const { mobile, desktop, summary } = siteSpeedData;

  const LINE  = "─".repeat(70);
  const LINE2 = "═".repeat(70);

  // ── Icon helpers ─────────────────────────────────────────────────────────────
  const ratingIcon = (rating) => {
    const map = {
      "good":              "✅",
      "needs-improvement": "🟡",
      "poor":              "🔴",
      "unknown":           "⚪",
    };
    return map[rating] || "⚪";
  };

  const gradeIcon = (grade) => {
    const map = { A: "🟢", B: "🟢", C: "🟡", D: "🟠", F: "🔴" };
    return map[grade] || "⚪";
  };

  // ── Build report string ───────────────────────────────────────────────────────
  let R = "";

  // Header
  R += `\n${LINE2}\n`;
  R += `  SERVICE 3 — SITE SPEED TEST\n`;
  R += `${LINE2}\n\n`;

  R += `CUSTOMER INFORMATION\n${LINE}\n`;
  R += `Name       : ${name}\n`;
  R += `Email      : ${email}\n`;
  R += `WhatsApp   : ${whatsAppNum}\n`;
  R += `Website    : ${websiteUrl}\n`;
  R += `Generated  : ${new Date().toISOString()}\n\n`;

  // ── Overall summary ───────────────────────────────────────────────────────────
  R += `SPEED SUMMARY\n${LINE}\n`;
  R += `${"".padEnd(28)} ${"Mobile".padEnd(20)} Desktop\n`;
  R += `${"-".repeat(66)}\n`;
  R += `${"Performance Score".padEnd(28)} ${String(summary.mobileScore  ?? "N/A").padEnd(20)} ${summary.desktopScore ?? "N/A"}\n`;
  R += `${"Speed Grade".padEnd(28)} ${String(summary.mobileGrade  ?? "N/A").padEnd(20)} ${summary.desktopGrade  ?? "N/A"}\n`;
  R += `${"Loading Speed".padEnd(28)} ${String(summary.overallLoadingSpeed).padEnd(20)} ${desktop?.error ? "Error" : desktop?.userFriendlyLabels?.loadingSpeed ?? "N/A"}\n`;
  R += `${"Interactivity".padEnd(28)} ${String(summary.overallInteractivity).padEnd(20)} ${desktop?.error ? "Error" : desktop?.userFriendlyLabels?.interactivity ?? "N/A"}\n`;
  R += `${"Visual Stability".padEnd(28)} ${String(summary.overallVisualStability).padEnd(20)} ${desktop?.error ? "Error" : desktop?.userFriendlyLabels?.visualStability ?? "N/A"}\n`;
  R += "\n";

  // ── User-friendly labels summary ─────────────────────────────────────────────
  R += `USER-FRIENDLY EXPERIENCE LABELS\n${LINE}\n`;
  R += `  Loading Speed      : ${summary.overallLoadingSpeed}\n`;
  R += `  Interactivity      : ${summary.overallInteractivity}\n`;
  R += `  Visual Stability   : ${summary.overallVisualStability}\n`;
  R += `  Mobile Experience  : ${summary.mobileExperience  ?? "N/A"}\n`;
  R += `  Desktop Experience : ${summary.desktopExperience ?? "N/A"}\n\n`;

  // ── Per-strategy detail block ─────────────────────────────────────────────────
  const printStrategyBlock = (result) => {
    if (!result) return;

    const strategyLabel = result.strategy === "mobile" ? "📱 MOBILE" : "🖥️  DESKTOP";

    // Error fallback
    if (result.error) {
      R += `${strategyLabel}\n${LINE}\n`;
      R += `  ❌ Could not fetch speed data: ${result.error}\n\n`;
      return;
    }

    // ── Speed grade + score ───────────────────────────────────────────────────
    R += `${strategyLabel} — SPEED OVERVIEW\n${LINE}\n`;
    if (result.isEstimated) {
      R += `  ⚠️  Estimated from free public signals\n`;
      R += `  Note: ${result.estimationNote}\n\n`;
    }
    R += `  Performance Score : ${result.performanceScore}/100\n`;
    R += `  Speed Grade       : ${gradeIcon(result.speedGrade)} ${result.speedGrade}\n`;
    R += `  Speed Label       : ${result.speedLabel}\n\n`;

    // ── Core speed metrics table ──────────────────────────────────────────────
    R += `${strategyLabel} — SPEED METRICS\n${LINE}\n`;
    R += `${"Metric".padEnd(32)} ${"Value".padEnd(20)} Rating\n`;
    R += `${"-".repeat(66)}\n`;

    const m = result.metrics;
    const metricRows = [
      { label: "Load Time (Speed Index)",       metric: m.loadTime },
      { label: "Largest Contentful Paint (LCP)", metric: m.lcp     },
      { label: "First Contentful Paint (FCP)",  metric: m.fcp     },
      { label: "Total Blocking Time (TBT)",     metric: m.tbt     },
      { label: "Cumulative Layout Shift (CLS)", metric: m.cls     },
      { label: "Time to Interactive (TTI)",     metric: m.tti     },
    ];

    metricRows.forEach(({ label, metric }) => {
      const icon  = ratingIcon(metric.rating);
      const value = metric.displayValue || "N/A";
      const rLabel = metric.label || "N/A";
      R += `${icon} ${label.padEnd(32)} ${value.padEnd(20)} ${rLabel}\n`;
    });
    R += "\n";

    // ── Vital counts ──────────────────────────────────────────────────────────
    R += `${strategyLabel} — VITAL COUNTS\n${LINE}\n`;
    R += `  ✅ Passing : ${result.vitalSummary.passing} / ${result.vitalSummary.total}\n`;
    R += `  🟡 Warning : ${result.vitalSummary.warning} / ${result.vitalSummary.total}\n`;
    R += `  🔴 Failing : ${result.vitalSummary.failing} / ${result.vitalSummary.total}\n\n`;

    // ── User-friendly labels (per strategy) ───────────────────────────────────
    R += `${strategyLabel} — EXPERIENCE LABELS\n${LINE}\n`;
    R += `  Loading Speed   : ${result.userFriendlyLabels.loadingSpeed}\n`;
    R += `  Interactivity   : ${result.userFriendlyLabels.interactivity}\n`;
    R += `  Visual Stability: ${result.userFriendlyLabels.visualStability}\n`;
    if (result.userFriendlyLabels.mobileExperience)
      R += `  Mobile Experience : ${result.userFriendlyLabels.mobileExperience}\n`;
    if (result.userFriendlyLabels.desktopExperience)
      R += `  Desktop Experience: ${result.userFriendlyLabels.desktopExperience}\n`;
    R += "\n";

    // ── Speed issues ──────────────────────────────────────────────────────────
    R += `${strategyLabel} — SPEED ISSUES\n${LINE}\n`;
    if (result.speedIssues.length > 0) {
      result.speedIssues.forEach((issue) => { R += `  ${issue}\n`; });
    } else {
      R += `  ✅ No speed issues detected.\n`;
    }
    R += "\n";
  };

  printStrategyBlock(mobile);
  printStrategyBlock(desktop);

  // Footer
  R += `${LINE2}\n`;
  R += `  END OF SERVICE 3 — SITE SPEED TEST\n`;
  R += `${LINE2}\n`;

  return R;
};

module.exports = { runSiteSpeedTest, formatSiteSpeedAsText };
