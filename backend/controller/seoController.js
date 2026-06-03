const axios   = require("axios");
const cheerio = require("cheerio");
const fs      = require("fs");
const path    = require("path");
const technicalSeoAduit = require("../services/TechnicalSeoAudit")
require("dotenv").config();

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN CONTROLLER FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

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
    const auditData  = await technicalSeoAduit.runTechnicalSEOAudit(websiteUrl, mainKeywords, location);

    // ── Format as readable text ───────────────────────────────────────────────
    const auditText  = technicalSeoAduit.formatAuditAsText(auditData, { name, email, whatsAppNum, websiteUrl });

    // ── Save to .txt file ─────────────────────────────────────────────────────
    const { filename, filepath } = technicalSeoAduit.saveAuditToFile(auditText, { websiteUrl });

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