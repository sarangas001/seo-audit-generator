// ─────────────────────────────────────────────────────────────────────────────
//  services/performanceService.js
//  GrowDigitally — Website Performance Scores Service
//
//  Free API used:
//    • Google PageSpeed Insights API v5 (free, no billing required)
//      Get your free key: https://console.cloud.google.com/
//        1. Create/select a project
//        2. Enable "PageSpeed Insights API"
//        3. Credentials → Create API Key
//      Add to .env: PAGESPEED_API_KEY=your_key_here
//      Without key: works but limited to ~1 req/min
//      With free key: 25,000 requests/day
//
//  Exports:
//    runPerformanceScores(url)  →  { mobile, desktop }
// ─────────────────────────────────────────────────────────────────────────────

require("dotenv").config();
const { safeGet } = require("./TechnicalSeoAudit")

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert a 0–100 score to a human-readable label + colour tier.
 *
 * Tier values:
 *   good    → 90–100
 *   medium  → 50–89
 *   poor    → 0–49
 */
const scoreLabel = (score) => {
  if (score === null || score === undefined || isNaN(score)) {
    return { label: "N/A", tier: "unknown" };
  }
  if (score >= 90) return { label: "Good",              tier: "good"    };
  if (score >= 50) return { label: "Needs Improvement", tier: "medium"  };
  return               { label: "Poor",              tier: "poor"    };
};

/**
 * Rate a Core Web Vital against Google's official thresholds.
 * Returns: "good" | "needs-improvement" | "poor" | "unknown"
 *
 * Thresholds source:
 *   https://web.dev/articles/vitals
 */
const vitalRating = (auditId, numericValue) => {
  if (numericValue === null || numericValue === undefined) return "unknown";

  const thresholds = {
    "largest-contentful-paint": { good: 2500,  poor: 4000  }, // ms
    "first-contentful-paint":   { good: 1800,  poor: 3000  }, // ms
    "total-blocking-time":      { good: 200,   poor: 600   }, // ms
    "cumulative-layout-shift":  { good: 0.1,   poor: 0.25  }, // unitless
    "speed-index":              { good: 3400,  poor: 5800  }, // ms
    "interactive":              { good: 3800,  poor: 7300  }, // ms
    "max-potential-fid":        { good: 100,   poor: 300   }, // ms
  };

  const t = thresholds[auditId];
  if (!t) return "unknown";
  if (numericValue <= t.good) return "good";
  if (numericValue <= t.poor) return "needs-improvement";
  return "poor";
};

// ─────────────────────────────────────────────────────────────────────────────
//  fetchOneStrategy
//  Calls the PageSpeed API for a single strategy (mobile or desktop)
//  and returns a fully structured result object.
// ─────────────────────────────────────────────────────────────────────────────

const fetchOneStrategy = async (url, strategy) => {
  try {
    const apiKey   = process.env.PAGESPEED_API_KEY
      ? `&key=${process.env.PAGESPEED_API_KEY}`
      : "";
    const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed`
      + `?url=${encodeURIComponent(url)}`
      + `&strategy=${strategy}`
      + `${apiKey}`
      + `&locale=en`;

    console.log(`[Performance] Fetching PageSpeed — ${strategy.toUpperCase()}...`);
    const res = await safeGet(endpoint);

    // API returned an error object
    if (!res.data || res.data.error) {
      const errMsg = res.data?.error?.message || res.error || "Unknown API error";
      console.error(`[Performance] PageSpeed API error (${strategy}): ${errMsg}`);
      return { strategy, error: errMsg };
    }

    const lhr    = res.data.lighthouseResult;
    const cats   = lhr?.categories || {};
    const audits = lhr?.audits     || {};

    // ── Category scores ──────────────────────────────────────────────────────
    const rawScores = {
      performance:   Math.round((cats.performance?.score         ?? 0) * 100),
      accessibility: Math.round((cats.accessibility?.score       ?? 0) * 100),
      bestPractices: Math.round((cats["best-practices"]?.score   ?? 0) * 100),
      seo:           Math.round((cats.seo?.score                 ?? 0) * 100),
    };

    // Attach label + tier to each score
    const scores = {};
    Object.entries(rawScores).forEach(([key, value]) => {
      scores[key] = { score: value, ...scoreLabel(value) };
    });

    // ── Core Web Vitals ──────────────────────────────────────────────────────
    const vitalsMap = [
      { id: "largest-contentful-paint", key: "lcp", label: "Largest Contentful Paint" },
      { id: "first-contentful-paint",   key: "fcp", label: "First Contentful Paint"   },
      { id: "total-blocking-time",      key: "tbt", label: "Total Blocking Time"      },
      { id: "cumulative-layout-shift",  key: "cls", label: "Cumulative Layout Shift"  },
      { id: "speed-index",              key: "si",  label: "Speed Index"              },
      { id: "interactive",              key: "tti", label: "Time to Interactive"      },
      { id: "max-potential-fid",        key: "fid", label: "Max Potential FID"        },
    ];

    const coreWebVitals = {};
    vitalsMap.forEach(({ id, key, label }) => {
      const audit = audits[id];
      if (!audit) {
        coreWebVitals[key] = { label, displayValue: "N/A", numericValue: null, rating: "unknown" };
        return;
      }
      coreWebVitals[key] = {
        label,
        displayValue: audit.displayValue   || "N/A",
        numericValue: audit.numericValue   ?? null,
        unit:         audit.numericUnit    || "ms",
        rating:       vitalRating(id, audit.numericValue ?? null),
      };
    });

    // ── Opportunities (items with potential ms savings) ──────────────────────
    const opportunities = Object.values(audits)
      .filter((a) =>
        a.details?.type === "opportunity" &&
        a.score !== null &&
        a.score < 0.9 &&
        a.details?.overallSavingsMs > 0
      )
      .map((a) => ({
        id:           a.id,
        title:        a.title,
        description:  (a.description || "").replace(/\[.*?\]\(.*?\)/g, "").trim(),
        displayValue: a.displayValue || "",
        savingsMs:    Math.round(a.details.overallSavingsMs),
        score:        Math.round((a.score ?? 0) * 100),
      }))
      .sort((a, b) => b.savingsMs - a.savingsMs)
      .slice(0, 10);

    // ── Diagnostics (table-type audits that are failing) ─────────────────────
    const opportunityIds = new Set(opportunities.map((o) => o.id));
    const diagnostics = Object.values(audits)
      .filter((a) =>
        a.details?.type === "table" &&
        a.score !== null &&
        a.score < 0.9 &&
        !opportunityIds.has(a.id)
      )
      .map((a) => ({
        id:           a.id,
        title:        a.title,
        description:  (a.description || "").replace(/\[.*?\]\(.*?\)/g, "").trim(),
        displayValue: a.displayValue || "",
        score:        Math.round((a.score ?? 0) * 100),
      }))
      .slice(0, 10);

    // ── Passed audits count ──────────────────────────────────────────────────
    const passedCount = Object.values(audits).filter((a) => a.score === 1).length;

    // ── User-friendly experience labels ──────────────────────────────────────
    const experienceLabels = {
      loadingSpeed:      coreWebVitals.fcp?.rating === "good" ? "Fast"
                       : coreWebVitals.fcp?.rating === "needs-improvement" ? "Moderate"
                       : "Slow",
      interactivity:     coreWebVitals.tti?.rating === "good" ? "Smooth"
                       : coreWebVitals.tti?.rating === "needs-improvement" ? "Moderate"
                       : "Sluggish",
      visualStability:   coreWebVitals.cls?.rating === "good" ? "Stable"
                       : coreWebVitals.cls?.rating === "needs-improvement" ? "Some Shift"
                       : "Unstable",
      overallExperience: scoreLabel(rawScores.performance).label,
    };

    return {
      strategy,
      fetchedAt: new Date().toISOString(),
      scores,
      coreWebVitals,
      opportunities,
      diagnostics,
      passedCount,
      experienceLabels,
    };

  } catch (err) {
    console.error(`[Performance] Unexpected error (${strategy}):`, err.message);
    return { strategy, error: err.message };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  runPerformanceScores  (main export)
//  Runs mobile + desktop in parallel and returns both results.
//
//  @param {string} url  — normalised website URL
//  @returns {{ mobile: object, desktop: object }}
// ─────────────────────────────────────────────────────────────────────────────

const runPerformanceScores = async (url) => {
  console.log(`[Performance] Starting performance scores for: ${url}`);

  const [mobile, desktop] = await Promise.all([
    fetchOneStrategy(url, "mobile"),
    fetchOneStrategy(url, "desktop"),
  ]);

  console.log(`[Performance] Done — Mobile: ${mobile.error ? "ERROR" : `Performance ${mobile.scores?.performance?.score}/100`} | Desktop: ${desktop.error ? "ERROR" : `Performance ${desktop.scores?.performance?.score}/100`}`);

  return { mobile, desktop };
};

module.exports = { runPerformanceScores };