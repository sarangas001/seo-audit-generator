const axios   = require("axios");
const cheerio = require("cheerio");
const fs      = require("fs");
const path    = require("path");
const technicalSeoAduit = require("../services/TechnicalSeoAudit")
const {runPerformanceScores} = require("../services/performanceServices");
const { formatSiteSpeedAsText, runSiteSpeedTest } = require("../services/siteSpeedService");
require("dotenv").config();

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN CONTROLLER FUNCTION
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
//  TEXT REPORT FORMATTER
// ─────────────────────────────────────────────────────────────────────────────

const formatAuditAsText = (audit, performanceData, customerInfo) => {
  const line  = "─".repeat(70);
  const line2 = "═".repeat(70);
  const LINE  = "─".repeat(70);
  const LINE2 = "═".repeat(70);
  const { name, email, whatsAppNum, websiteUrl } = customerInfo;
  const { mobile, desktop } = performanceData;

  const statusIcon = (bool) => (bool ? "✅" : "❌");
  const issueIcon  = (str)  => {
    if (str.startsWith("CRITICAL:")) return "🔴";
    if (str.startsWith("MISSING:") || str.startsWith("BROKEN") || str.startsWith("LOW")) return "🟠";
    if (str.startsWith("TOO ") || str.startsWith("THIN") || str.startsWith("KEYWORD") || str.startsWith("MEDIUM")) return "🟡";
    return "🔵";
  };

  let report = "";

  report += `${line2}\n`;
  report += `  GROWDIGITALLY — TECHNICAL SEO AUDIT REPORT\n`;
  report += `${line2}\n\n`;

  // Customer info
  report += `CUSTOMER INFORMATION\n${line}\n`;
  report += `Name        : ${name}\n`;
  report += `Email       : ${email}\n`;
  report += `WhatsApp    : ${whatsAppNum}\n`;
  report += `Generated   : ${audit.meta.auditTimestamp}\n\n`;

  // Website info
  report += `WEBSITE INFORMATION\n${line}\n`;
  report += `URL         : ${audit.meta.url}\n`;
  report += `Domain      : ${audit.meta.domain}\n`;
  report += `Keywords    : ${audit.meta.mainKeywords}\n`;
  report += `Location    : ${audit.meta.location}\n`;
  report += `HTTPS       : ${statusIcon(audit.meta.isHttps)}\n`;
  report += `Reachable   : ${statusIcon(audit.meta.isReachable)} (HTTP ${audit.meta.httpStatus})\n\n`;

  // Issues summary
  report += `ISSUES SUMMARY\n${line}\n`;
  report += `Total Issues Found : ${audit.issuesSummary.totalIssues}\n`;
  report += `🔴 Critical        : ${audit.issuesSummary.criticalCount}\n`;
  report += `🟠 High            : ${audit.issuesSummary.highCount}\n`;
  report += `🟡 Medium          : ${audit.issuesSummary.mediumCount}\n`;
  report += `🔵 Low             : ${audit.issuesSummary.lowCount}\n\n`;

  // Top 3 quick fixes
  report += `TOP 3 QUICK SEO FIXES\n${line}\n`;
  if (audit.top3QuickFixes.length > 0) {
    audit.top3QuickFixes.forEach((fix) => {
      report += `${fix.rank}. [${fix.priority.toUpperCase()}] [${fix.section}]\n`;
      report += `   ${fix.fix}\n\n`;
    });
  } else {
    report += `No critical issues found — great job!\n\n`;
  }

  // Crawlability
  report += `1. CRAWLABILITY & INDEXABILITY\n${line}\n`;
  report += `Reachable         : ${statusIcon(audit.crawlability.isReachable)}\n`;
  report += `HTTP Status       : ${audit.crawlability.httpStatus}\n`;
  report += `Indexable         : ${statusIcon(audit.crawlability.isIndexable)}\n`;
  report += `Robots Blocking   : ${statusIcon(!(audit.crawlability.robotsBlockingAll || audit.crawlability.robotsAccessBlocked))} (${(audit.crawlability.robotsBlockingAll || audit.crawlability.robotsAccessBlocked) ? "BLOCKING" : "OK"})\n`;
  report += `Noindex Tag       : ${audit.crawlability.hasNoindex ? "🔴 YES — page excluded from index" : "✅ Not found"}\n`;
  if (audit.crawlability.issues.length > 0) {
    report += `Issues:\n`;
    audit.crawlability.issues.forEach((i) => report += `  ${issueIcon(i)} ${i}\n`);
  }
  report += "\n";

  // HTTPS
  report += `2. HTTPS & SECURITY\n${line}\n`;
  report += `HTTPS Enabled     : ${statusIcon(audit.https.isHttps)}\n`;
  report += `HTTP → HTTPS Redirect : ${statusIcon(audit.https.httpRedirects)}\n`;
  if (audit.https.issues.length > 0) {
    report += `Issues:\n`;
    audit.https.issues.forEach((i) => report += `  ${issueIcon(i)} ${i}\n`);
  }
  report += "\n";

  // Robots.txt
  report += `3. ROBOTS.TXT\n${line}\n`;
  report += `Exists            : ${statusIcon(audit.robotsTxt.exists)}\n`;
  report += `Accessible        : ${statusIcon(audit.robotsTxt.accessible)}\n`;
  report += `HTTP Status       : ${audit.robotsTxt.status}\n`;
  report += `Has Disallow Rules: ${audit.robotsTxt.hasDisallow ? "Yes" : "None found"}\n`;
  report += `Access Blocked    : ${audit.robotsTxt.accessBlocked ? "🔴 YES — CRITICAL" : "✅ No"}\n`;
  report += `Blocks All Bots   : ${audit.robotsTxt.blockingAll ? "🔴 YES — CRITICAL" : "✅ No"}\n`;
  report += `Sitemap Referenced: ${statusIcon(audit.robotsTxt.hasSitemapRef)}\n`;
  if (typeof audit.robotsTxt.content === "string" && audit.robotsTxt.content) {
    report += `\nContent Preview:\n`;
    report += `${audit.robotsTxt.content.substring(0, 500)}\n`;
    if (audit.robotsTxt.content.length > 500) report += `  [... truncated]\n`;
  }
  report += "\n";

  // Sitemap
  report += `4. XML SITEMAP\n${line}\n`;
  report += `URL               : ${audit.sitemap.url}\n`;
  report += `Exists            : ${statusIcon(audit.sitemap.exists)}\n`;
  report += `HTTP Status       : ${audit.sitemap.status}\n`;
  report += `URLs in Sitemap   : ${audit.sitemap.urlCount}\n`;
  report += `In Robots.txt     : ${statusIcon(audit.sitemap.isSubmittedInRobots)}\n`;
  if (audit.sitemap.urls.length > 0) {
    report += `Sample URLs:\n`;
    audit.sitemap.urls.slice(0, 5).forEach((u) => report += `  • ${u}\n`);
  }
  report += "\n";

  // On-page
  if (audit.onPage && !audit.onPage.error) {
    const op = audit.onPage;

    report += `5. META TITLE\n${line}\n`;
    report += `Content           : "${op.metaTitle.content}"\n`;
    report += `Length            : ${op.metaTitle.length} chars ${op.metaTitle.isGoodLength ? "✅ Good" : "⚠️ Needs fix"}\n`;
    report += `Keyword Present   : ${statusIcon(op.metaTitle.hasKeyword)}\n`;
    if (op.metaTitle.issues.length > 0) op.metaTitle.issues.forEach((i) => report += `  ${issueIcon(i)} ${i}\n`);
    report += "\n";

    report += `6. META DESCRIPTION\n${line}\n`;
    report += `Content           : "${op.metaDescription.content.substring(0, 120)}${op.metaDescription.content.length > 120 ? "..." : ""}"\n`;
    report += `Length            : ${op.metaDescription.length} chars ${op.metaDescription.isGoodLength ? "✅ Good" : "⚠️ Needs fix"}\n`;
    report += `Keyword Present   : ${statusIcon(op.metaDescription.hasKeyword)}\n`;
    if (op.metaDescription.issues.length > 0) op.metaDescription.issues.forEach((i) => report += `  ${issueIcon(i)} ${i}\n`);
    report += "\n";

    report += `7. CANONICAL TAGS\n${line}\n`;
    report += `Canonical URL     : ${op.canonical.href || "Not found"}\n`;
    report += `Self-Referencing  : ${op.canonical.isSelfReferencing ? "✅ Yes" : "⚠️ No or missing"}\n`;
    if (op.canonical.issues.length > 0) op.canonical.issues.forEach((i) => report += `  ${issueIcon(i)} ${i}\n`);
    report += "\n";

    report += `8. VIEWPORT / MOBILE USABILITY\n${line}\n`;
    report += `Viewport Tag      : ${op.viewport.content || "Not found"}\n`;
    report += `Mobile Ready      : ${statusIcon(op.viewport.isMobileReady)}\n`;
    if (op.viewport.issues.length > 0) op.viewport.issues.forEach((i) => report += `  ${issueIcon(i)} ${i}\n`);
    report += "\n";

    report += `9. HEADING STRUCTURE\n${line}\n`;
    report += `H1 Count          : ${op.headings.h1Count} ${op.headings.h1Count === 1 ? "✅" : op.headings.h1Count === 0 ? "🔴" : "🟠"}\n`;
    if (op.headings.h1Content.length > 0) report += `H1 Content        : "${op.headings.h1Content[0]}"\n`;
    report += `H2 Count          : ${op.headings.h2Count}\n`;
    report += `H3 Count          : ${op.headings.h3Count}\n`;
    if (op.headings.h2Content.length > 0) {
      report += `H2 Samples        :\n`;
      op.headings.h2Content.slice(0, 3).forEach((h) => report += `  • "${h}"\n`);
    }
    if (op.headings.issues.length > 0) op.headings.issues.forEach((i) => report += `  ${issueIcon(i)} ${i}\n`);
    report += "\n";

    report += `10. IMAGE ALT TEXT\n${line}\n`;
    report += `Total Images      : ${op.images.totalImages}\n`;
    report += `Missing Alt Text  : ${op.images.missingAltCount} ${op.images.missingAltCount === 0 ? "✅" : "🟠"}\n`;
    if (op.images.missingAltImages.length > 0) {
      report += `Missing Alt Examples:\n`;
      op.images.missingAltImages.slice(0, 3).forEach((src) => report += `  • ${src}\n`);
    }
    if (op.images.issues.length > 0) op.images.issues.forEach((i) => report += `  ${issueIcon(i)} ${i}\n`);
    report += "\n";

    report += `11. SCHEMA MARKUP\n${line}\n`;
    report += `Schema Present    : ${statusIcon(op.schemaMarkup.isPresent)}\n`;
    if (op.schemaMarkup.types.length > 0) report += `Schema Types      : ${op.schemaMarkup.types.join(", ")}\n`;
    if (op.schemaMarkup.issues.length > 0) op.schemaMarkup.issues.forEach((i) => report += `  ${issueIcon(i)} ${i}\n`);
    report += "\n";

    report += `12. INTERNAL LINKING\n${line}\n`;
    report += `Total Links Found : ${op.links.totalLinks}\n`;
    report += `Internal Links    : ${op.links.internalLinkCount}\n`;
    report += `External Links    : ${op.links.externalLinkCount}\n`;
    if (op.links.internalLinks.length > 0) {
      report += `Internal Link Samples:\n`;
      op.links.internalLinks.slice(0, 5).forEach((l) => report += `  • ${l.href}${l.text ? ` ("${l.text.substring(0, 40)}")` : ""}\n`);
    }
    if (op.links.issues.length > 0) op.links.issues.forEach((i) => report += `  ${issueIcon(i)} ${i}\n`);
    report += "\n";

    report += `13. CONTENT\n${line}\n`;
    report += `Word Count        : ~${op.content.wordCount} words\n`;
    report += `Thin Content      : ${op.content.isThinContent ? "🟡 Yes — add more content" : "✅ No"}\n`;
    if (op.content.issues.length > 0) op.content.issues.forEach((i) => report += `  ${issueIcon(i)} ${i}\n`);
    report += "\n";

    report += `14. OPEN GRAPH TAGS\n${line}\n`;
    report += `OG Title          : ${op.openGraph.title || "❌ Not found"}\n`;
    report += `OG Description    : ${op.openGraph.description ? op.openGraph.description.substring(0, 80) + "..." : "❌ Not found"}\n`;
    report += `OG Image          : ${op.openGraph.image || "❌ Not found"}\n`;
    if (op.openGraph.issues.length > 0) op.openGraph.issues.forEach((i) => report += `  ${issueIcon(i)} ${i}\n`);
    report += "\n";

  } else {
    report += `ON-PAGE CHECKS: ${audit.onPage?.error || "Skipped"}\n\n`;
  }

  // Broken links
  report += `15. BROKEN LINKS & REDIRECTS\n${line}\n`;
  if (audit.linkAudit && !audit.linkAudit.error) {
    report += `Links Checked     : ${audit.linkAudit.checkedCount}\n`;
    report += `Broken Links      : ${audit.linkAudit.brokenCount} ${audit.linkAudit.brokenCount === 0 ? "✅" : "🔴"}\n`;
    report += `Redirects Found   : ${audit.linkAudit.redirectCount}\n`;
    if (audit.linkAudit.brokenLinks.length > 0) {
      report += `Broken Link URLs:\n`;
      audit.linkAudit.brokenLinks.forEach((l) => report += `  🔴 [${l.status}] ${l.url}\n`);
    }
    if (audit.linkAudit.issues.length > 0) audit.linkAudit.issues.forEach((i) => report += `  ${issueIcon(i)} ${i}\n`);
  } else {
    report += `  ${audit.linkAudit?.error || "Skipped"}\n`;
  }
  report += "\n";

  // PageSpeed
  report += `16. GOOGLE PAGESPEED INSIGHTS\n${line}\n`;
  const printSpeed = (speed, label) => {
    if (!speed) return;
    if (speed.error) {
      report += `${label}: Error — ${speed.error}\n`;
      return;
    }
    report += `${label} Scores:\n`;
    report += `  Performance    : ${speed.scores?.performance  ?? "N/A"}/100\n`;
    report += `  Accessibility  : ${speed.scores?.accessibility ?? "N/A"}/100\n`;
    report += `  Best Practices : ${speed.scores?.bestPractices ?? "N/A"}/100\n`;
    report += `  SEO            : ${speed.scores?.seo           ?? "N/A"}/100\n`;
    if (speed.coreWebVitals) {
      report += `  Core Web Vitals:\n`;
      report += `    LCP (Largest Contentful Paint) : ${speed.coreWebVitals.lcp}\n`;
      report += `    FCP (First Contentful Paint)   : ${speed.coreWebVitals.fcp}\n`;
      report += `    TBT (Total Blocking Time)      : ${speed.coreWebVitals.tbt}\n`;
      report += `    CLS (Cumulative Layout Shift)  : ${speed.coreWebVitals.cls}\n`;
      report += `    Speed Index                    : ${speed.coreWebVitals.si}\n`;
      report += `    Time to Interactive            : ${speed.coreWebVitals.tti}\n`;
    }
  };
  printSpeed(audit.pageSpeed?.mobile,  "📱 MOBILE");
  printSpeed(audit.pageSpeed?.desktop, "🖥️  DESKTOP");
  if (audit.pageSpeed?.issues?.length > 0) {
    report += `Issues:\n`;
    audit.pageSpeed.issues.forEach((i) => report += `  ${issueIcon(i)} ${i}\n`);
  }
  report += "\n";

  // All issues
  report += `ALL ISSUES BY PRIORITY\n${line2}\n\n`;

  const printIssueGroup = (label, emoji, issues) => {
    report += `${emoji} ${label} ISSUES (${issues.length})\n${line}\n`;
    if (issues.length === 0) {
      report += `  None found ✅\n`;
    } else {
      issues.forEach((i, idx) => report += `  ${idx + 1}. [${i.section}] ${i.issue}\n`);
    }
    report += "\n";
  };

  printIssueGroup("CRITICAL", "🔴", audit.issuesSummary.critical);
  printIssueGroup("HIGH",     "🟠", audit.issuesSummary.high);
  printIssueGroup("MEDIUM",   "🟡", audit.issuesSummary.medium);
  printIssueGroup("LOW",      "🔵", audit.issuesSummary.low);


  // ── Icon helpers ────────────────────────────────────────────────────────────
  const tierIcon = (tier) => {
    const map = { good: "🟢", medium: "🟡", poor: "🔴", unknown: "⚪" };
    return map[tier] || "⚪";
  };
 
  const ratingIcon = (rating) => {
    const map = { good: "✅", "needs-improvement": "🟡", poor: "🔴", unknown: "⚪" };
    return map[rating] || "⚪";
  };
 
  // Header
  report += `\n${LINE2}\n`;
  report += `  SERVICE 2 — WEBSITE PERFORMANCE SCORES\n`;
  report += `${LINE2}\n\n`;
 
  report += `CUSTOMER INFORMATION\n${LINE}\n`;
  report += `Name       : ${name}\n`;
  report += `Email      : ${email}\n`;
  report += `WhatsApp   : ${whatsAppNum}\n`;
  report += `Website    : ${websiteUrl}\n`;
  report += `Generated  : ${new Date().toISOString()}\n\n`;
 
  // ── Score overview comparison table ─────────────────────────────────────────
  report += `SCORE OVERVIEW\n${LINE}\n`;
  report += `${"Area".padEnd(24)} ${"Mobile".padEnd(24)} Desktop\n`;
  report += `${"-".repeat(68)}\n`;
 
  const scoreRow = (label, mKey, dKey) => {
    const mScore = !mobile?.error  ? `${mobile?.scores?.[mKey]?.score  ?? "N/A"}/100 (${mobile?.scores?.[mKey]?.label  ?? "N/A"})` : "Error";
    const dScore = !desktop?.error ? `${desktop?.scores?.[dKey]?.score ?? "N/A"}/100 (${desktop?.scores?.[dKey]?.label ?? "N/A"})` : "Error";
    return `${label.padEnd(24)} ${mScore.padEnd(24)} ${dScore}\n`;
  };
 
  report += scoreRow("Performance",    "performance",   "performance");
  report += scoreRow("Accessibility",  "accessibility", "accessibility");
  report += scoreRow("Best Practices", "bestPractices", "bestPractices");
  report += scoreRow("SEO",            "seo",           "seo");
  report += "\n";
 
  // ── Per-strategy detail block ────────────────────────────────────────────────
  const printStrategyBlock = (result) => {
    if (!result) return;
 
    const strategyLabel = result.strategy === "mobile" ? "📱 MOBILE" : "🖥️  DESKTOP";
 
    // Error fallback
    if (result.error) {
      report += `${strategyLabel}\n${LINE}\n`;
      report += `  ❌ Could not fetch data: ${result.error}\n\n`;
      return;
    }
 
    // ── Scores ───────────────────────────────────────────────────────────────
    report += `${strategyLabel} — SCORES\n${LINE}\n`;
 
    const scoreNames = {
      performance:   "Performance",
      accessibility: "Accessibility",
      bestPractices: "Best Practices",
      seo:           "SEO",
    };
 
    Object.entries(result.scores).forEach(([key, val]) => {
      const name = scoreNames[key] || key;
      report += `  ${tierIcon(val.tier)} ${name.padEnd(22)} ${String(val.score).padStart(3)}/100  — ${val.label}\n`;
    });
    report += "\n";
 
    // ── Core Web Vitals ───────────────────────────────────────────────────────
    report += `${strategyLabel} — CORE WEB VITALS\n${LINE}\n`;
 
    Object.values(result.coreWebVitals).forEach((v) => {
      report += `  ${ratingIcon(v.rating)} ${v.label.padEnd(32)} ${v.displayValue}\n`;
    });
    report += "\n";
 
    // ── Experience labels ─────────────────────────────────────────────────────
    report += `${strategyLabel} — EXPERIENCE LABELS\n${LINE}\n`;
    report += `  Loading Speed      : ${result.experienceLabels.loadingSpeed}\n`;
    report += `  Interactivity      : ${result.experienceLabels.interactivity}\n`;
    report += `  Visual Stability   : ${result.experienceLabels.visualStability}\n`;
    report += `  Overall Experience : ${result.experienceLabels.overallExperience}\n\n`;
 
    // ── Opportunities ─────────────────────────────────────────────────────────
    if (result.opportunities && result.opportunities.length > 0) {
      report += `${strategyLabel} — OPPORTUNITIES (Potential Time Savings)\n${LINE}\n`;
      result.opportunities.forEach((o, i) => {
        report += `  ${i + 1}. ${o.title}\n`;
        report += `     Potential saving : ~${o.savingsMs}ms`;
        if (o.displayValue) report += `  |  Current: ${o.displayValue}`;
        report += "\n";
        if (o.description) report += `     Note: ${o.description.substring(0, 120)}${o.description.length > 120 ? "..." : ""}\n`;
        report += "\n";
      });
    } else {
      report += `${strategyLabel} — OPPORTUNITIES\n${LINE}\n`;
      report += `  ✅ No major time-saving opportunities found.\n\n`;
    }
 
    // ── Diagnostics ───────────────────────────────────────────────────────────
    if (result.diagnostics && result.diagnostics.length > 0) {
      report += `${strategyLabel} — DIAGNOSTICS\n${LINE}\n`;
      result.diagnostics.forEach((d, i) => {
        report += `  ${i + 1}. ${d.title}`;
        if (d.displayValue) report += `  (${d.displayValue})`;
        report += "\n";
        if (d.description) report += `     ${d.description.substring(0, 120)}${d.description.length > 120 ? "..." : ""}\n`;
      });
      report += "\n";
    }
 
    // ── Passed audits count ───────────────────────────────────────────────────
    report += `  ✅ Passed Audits: ${result.passedCount}\n\n`;
  };
 
  printStrategyBlock(mobile);
  printStrategyBlock(desktop);
 
  // Footer
  report += `${LINE2}\n`;
  report += `  END OF SERVICE 2 — WEBSITE PERFORMANCE SCORES\n`;
  report += `${LINE2}\n`;

  const timestamp = new Date().toLocaleString();

  report += `${line2}\n`;
  report += `  END OF TECHNICAL SEO AUDIT — GrowDigitally\n`;
  report += `  Generated: ${timestamp}\n`;
  report += `${line2}\n`;

  return report;
};

// ─────────────────────────────────────────────────────────────────────────────
//  SAVE TO .TXT FILE
// ─────────────────────────────────────────────────────────────────────────────

const saveAuditToFile = (auditText, customerInfo) => {
  // Create reports/ directory if it doesn't exist
  const reportsDir = path.join(__dirname, "..", "reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Safe filename: domain_timestamp.txt
  const safeDomain   = customerInfo.websiteUrl.replace(/https?:\/\//, "").replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
  const timestamp    = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
  const filename     = `seo_audit_${safeDomain}_${timestamp}.txt`;
  const filepath     = path.join(reportsDir, filename);

  fs.writeFileSync(filepath, auditText, "utf-8");
  console.log(`[SEO Audit] Report saved to: ${filepath}`);

  return { filename, filepath };
};

const getSEOData = async (req, res) => {
  try {
    const { name, email, whatsAppNum, websiteUrl, mainKeywords, location } = req.body;

    // ── Validate required fields ─────────────────────────────────────────────
    if (!websiteUrl) {
      return res.json({
        message: "Website URL is required",
        status:  false,
        error:   "Missing websiteUrl in request body",
      });
    }

    console.log(`\n[GrowDigitally] New SEO Audit Request`);
    console.log(`[GrowDigitally] Customer : ${name} (${email})`);
    console.log(`[GrowDigitally] Website  : ${websiteUrl}`);
    console.log(`[GrowDigitally] Keywords : ${mainKeywords}`);
    console.log(`[GrowDigitally] Location : ${location}`);

    // ── Run the technical audit ───────────────────────────────────────────────
    const [auditData, performanceData, siteSpeedData] = await Promise.all([
      technicalSeoAduit.runTechnicalSEOAudit(websiteUrl, mainKeywords, location),
      runPerformanceScores(websiteUrl),
      runSiteSpeedTest(websiteUrl),
    ]);


    // ── Format as readable text ───────────────────────────────────────────────
    let auditText  = formatAuditAsText(auditData, performanceData, { name, email, whatsAppNum, websiteUrl });

    auditText += formatSiteSpeedAsText(siteSpeedData, { name, email, whatsAppNum, websiteUrl });

    // ── Save to .txt file ─────────────────────────────────────────────────────
    const { filename, filepath } = saveAuditToFile(auditText, { websiteUrl });

    // ── Return success response (NOT the full audit data) ─────────────────────
    return res.json({
      message:  "Technical SEO Audit completed successfully",
      status:   true,
      customer: { name, email, whatsAppNum },
      website:  websiteUrl,
      summary: {
        totalIssues:   auditData.issuesSummary.totalIssues,
        criticalCount: auditData.issuesSummary.criticalCount,
        highCount:     auditData.issuesSummary.highCount,
        mediumCount:   auditData.issuesSummary.mediumCount,
        lowCount:      auditData.issuesSummary.lowCount,
        top3QuickFixes: auditData.top3QuickFixes,
      },
      reportFile: {
        filename,
        filepath,
        note: "Full audit report saved to the reports/ directory",
      },
    });

  } catch (error) {
    console.error(`[GrowDigitally] Audit Error:`, error.message);
    console.error(error);
    return res.json({
      message: "Error fetching SEO data",
      status:  false,
      error:   error.message,
    });
  }
};

module.exports = { getSEOData };
