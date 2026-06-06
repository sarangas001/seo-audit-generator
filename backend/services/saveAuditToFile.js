// ─────────────────────────────────────────────────────────────────────────────
//  saveAuditToFile
//  GrowDigitally — Save audit report as both .txt and .pdf
// ─────────────────────────────────────────────────────────────────────────────

const fs      = require("fs");
const path    = require("path");
const PDFDocument = require("pdfkit");

// ── Brand colours ─────────────────────────────────────────────────────────────
const BRAND = {
  purple:     "#5E2CED",
  purpleLight:"#f5f0ff",
  dark:       "#1a1a2e",
  grey:       "#5a5a74",
  lightGrey:  "#ede8f5",
  red:        "#dc2626",
  orange:     "#d97706",
  green:      "#16a34a",
  white:      "#ffffff",
  pageBg:     "#fafafa",
};

// ── Map emoji-prefixed lines to colours ───────────────────────────────────────
const getLineColour = (line) => {
  if (line.includes("🔴") || line.includes("CRITICAL"))   return BRAND.red;
  if (line.includes("🟠"))                                 return "#f97316";
  if (line.includes("🟡") || line.includes("WARNING"))    return BRAND.orange;
  if (line.includes("✅") || line.includes("🟢"))          return BRAND.green;
  if (line.includes("🔵"))                                 return BRAND.purple;
  return null; // default colour
};

// ── Detect if a line is a section header (═══ or ─── underlines) ─────────────
const isMainHeader  = (line) => /^[═]{10,}/.test(line);
const isSubHeader   = (line) => /^[─]{10,}/.test(line);
const isSectionTitle = (line) => /^\s*(SERVICE\s+\d+|CUSTOMER\s+INFO|WEBSITE\s+INFO|ISSUES\s+SUMMARY|TOP\s+3|ALL\s+ISSUES|DATA\s+SOURCE)/i.test(line.trim());
const isNumberedCheck = (line) => /^\s*\d+\.\s+[A-Z]/.test(line);

// ─────────────────────────────────────────────────────────────────────────────
//  buildPDF
//  Converts the plain-text audit string into a branded PDF document.
// ─────────────────────────────────────────────────────────────────────────────

const buildPDF = (auditText, pdfPath, customerInfo) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size:    "A4",
        margins: { top: 60, bottom: 60, left: 50, right: 50 },
        info: {
          Title:    `GrowDigitally SEO Audit — ${customerInfo.websiteUrl}`,
          Author:   "GrowDigitally",
          Subject:  "SEO Audit Report",
          Keywords: "SEO, Audit, GrowDigitally",
        },
        bufferPages: true,  // enables page numbering after build
      });

      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);

      const PAGE_WIDTH  = doc.page.width  - doc.page.margins.left - doc.page.margins.right;
      const PAGE_HEIGHT = doc.page.height;
      const MARGIN_LEFT = doc.page.margins.left;
      const MARGIN_TOP  = doc.page.margins.top;
      let   pageCount   = 1;

      // ── Draw header on a page ──────────────────────────────────────────────
      const drawPageHeader = (isFirstPage = false) => {
        // Purple top bar
        doc.rect(0, 0, doc.page.width, 42).fill(BRAND.purple);

        // Logo text
        doc.font("Helvetica-Bold").fontSize(14).fillColor(BRAND.white);
        doc.text("GrowDigitally", MARGIN_LEFT, 13, { continued: true });
        doc.font("Helvetica").fontSize(10).fillColor("#c4b5f7");
        doc.text("  SEO Audit Report", { continued: false });

        // Domain on top right
        doc.font("Helvetica").fontSize(9).fillColor("#c4b5f7");
        doc.text(
          customerInfo.websiteUrl,
          MARGIN_LEFT,
          16,
          { align: "right", width: PAGE_WIDTH }
        );

        doc.moveDown(0.3);
      };

      // ── Draw footer on current page ────────────────────────────────────────
      const drawPageFooter = (pageNum) => {
        const footerY = PAGE_HEIGHT - 38;
        // Thin purple line
        doc.moveTo(MARGIN_LEFT, footerY)
           .lineTo(MARGIN_LEFT + PAGE_WIDTH, footerY)
           .strokeColor(BRAND.lightGrey)
           .lineWidth(0.5)
           .stroke();

        doc.font("Helvetica").fontSize(8).fillColor(BRAND.grey);
        doc.text(
          `GrowDigitally SEO Audit  •  ${customerInfo.websiteUrl}`,
          MARGIN_LEFT,
          footerY + 6,
          { continued: true }
        );
        doc.text(`Page ${pageNum}`, { align: "right" });
      };

      // ── Cover page ─────────────────────────────────────────────────────────
      // Full purple background
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(BRAND.purple);

      // GrowDigitally wordmark
      doc.font("Helvetica-Bold").fontSize(28).fillColor(BRAND.white);
      doc.text("GrowDigitally", MARGIN_LEFT, 180, { align: "center", width: PAGE_WIDTH });

      // Report title
      doc.font("Helvetica").fontSize(15).fillColor("#c4b5f7");
      doc.text("SEO AUDIT REPORT", MARGIN_LEFT, 220, { align: "center", width: PAGE_WIDTH });

      // Horizontal rule
      doc.moveTo(MARGIN_LEFT + 60, 250)
         .lineTo(MARGIN_LEFT + PAGE_WIDTH - 60, 250)
         .strokeColor("#a78df5").lineWidth(1).stroke();

      // Customer info box
      doc.rect(MARGIN_LEFT + 40, 270, PAGE_WIDTH - 80, 130)
         .fillAndStroke("#4a1fd4", "#a78df5");

      const infoX = MARGIN_LEFT + 60;
      const labelCol = 90;
      let infoY = 285;

      const drawInfoRow = (label, value) => {
        doc.font("Helvetica-Bold").fontSize(9).fillColor("#c4b5f7");
        doc.text(label, infoX, infoY, { width: labelCol });
        doc.font("Helvetica").fontSize(9).fillColor(BRAND.white);
        doc.text(value || "N/A", infoX + labelCol, infoY, { width: PAGE_WIDTH - 160 });
        infoY += 18;
      };

      drawInfoRow("Client:",   customerInfo.name);
      drawInfoRow("Email:",    customerInfo.email);
      drawInfoRow("WhatsApp:", customerInfo.whatsAppNum);
      drawInfoRow("Website:",  customerInfo.websiteUrl);
      drawInfoRow("Keywords:", customerInfo.mainKeywords || "N/A");
      drawInfoRow("Location:", customerInfo.location    || "N/A");
      drawInfoRow("Date:",     new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" }));

      // Tagline
      doc.font("Helvetica").fontSize(10).fillColor("#a78df5");
      doc.text(
        "Powered by GrowDigitally — Expert-Reviewed SEO Audits Delivered to WhatsApp",
        MARGIN_LEFT, 430, { align: "center", width: PAGE_WIDTH }
      );

      drawPageFooter(pageCount);

      // ── Start content pages ────────────────────────────────────────────────
      doc.addPage();
      pageCount++;
      drawPageHeader(true);

      // ── Parse and render each line of the text report ──────────────────────
      const lines  = auditText.split("\n");
      let   yPos   = MARGIN_TOP + 10;
      const lineH  = 13;
      const bottomMargin = PAGE_HEIGHT - 70;

      const checkPageBreak = (extraLines = 1) => {
        if (yPos + lineH * extraLines >= bottomMargin) {
          drawPageFooter(pageCount);
          doc.addPage();
          pageCount++;
          drawPageHeader();
          yPos = MARGIN_TOP + 10;
        }
      };

      for (let i = 0; i < lines.length; i++) {
        const raw  = lines[i];
        const line = raw.trim();

        // ── Skip pure separator lines (─── / ═══) — we draw our own ─────────
        if (isMainHeader(line) || isSubHeader(line)) continue;

        // ── Empty line → small gap ────────────────────────────────────────────
        if (line === "") {
          yPos += 5;
          checkPageBreak();
          continue;
        }

        // ── SERVICE header (SERVICE 1 —, SERVICE 2 —, etc.) ──────────────────
        if (/^\s*SERVICE\s+\d+\s+—/i.test(line) || /^\s*SERVICE\s+\d+\s+-/i.test(line)) {
          checkPageBreak(5);

          // Coloured bar behind service title
          doc.rect(MARGIN_LEFT, yPos - 2, PAGE_WIDTH, 22).fill(BRAND.purple);
          doc.font("Helvetica-Bold").fontSize(11).fillColor(BRAND.white);
          doc.text(line, MARGIN_LEFT + 6, yPos + 3, { width: PAGE_WIDTH - 10 });
          yPos += 28;
          checkPageBreak();
          continue;
        }

        // ── GROWDIGITALLY main title line ─────────────────────────────────────
        if (/GROWDIGITALLY/i.test(line) && line.length < 60) {
          checkPageBreak(3);
          doc.font("Helvetica-Bold").fontSize(13).fillColor(BRAND.purple);
          doc.text(line, MARGIN_LEFT, yPos, { width: PAGE_WIDTH });
          yPos += 20;

          // Draw a rule under the title
          doc.moveTo(MARGIN_LEFT, yPos - 4)
             .lineTo(MARGIN_LEFT + PAGE_WIDTH, yPos - 4)
             .strokeColor(BRAND.lightGrey).lineWidth(0.8).stroke();
          checkPageBreak();
          continue;
        }

        // ── Numbered check headers (1. META TITLE, 2. META DESC, etc.) ────────
        if (isNumberedCheck(line)) {
          checkPageBreak(3);
          // Light purple background strip
          doc.rect(MARGIN_LEFT, yPos - 1, PAGE_WIDTH, 16).fill(BRAND.purpleLight);
          doc.font("Helvetica-Bold").fontSize(9.5).fillColor(BRAND.purple);
          doc.text(line, MARGIN_LEFT + 4, yPos + 2, { width: PAGE_WIDTH - 8 });
          yPos += 21;
          checkPageBreak();
          continue;
        }

        // ── ALL-CAPS section header (SCORE OVERVIEW, TOP RANKING KEYWORDS…) ───
        if (line === line.toUpperCase() && line.length > 4 && !/^[#\-*•]/.test(line) && !/^\d/.test(line)) {
          checkPageBreak(3);
          doc.font("Helvetica-Bold").fontSize(9).fillColor(BRAND.dark);
          doc.text(line, MARGIN_LEFT, yPos, { width: PAGE_WIDTH });
          // Thin underline
          doc.moveTo(MARGIN_LEFT, yPos + 11)
             .lineTo(MARGIN_LEFT + PAGE_WIDTH, yPos + 11)
             .strokeColor(BRAND.lightGrey).lineWidth(0.5).stroke();
          yPos += 16;
          checkPageBreak();
          continue;
        }

        // ── Coloured status lines (✅ 🔴 🟡 🟠 🟢) ────────────────────────────
        const lineColour = getLineColour(line);

        // Clean emojis for PDFKit (it renders them as tofu on some systems)
        const cleanLine = line
          .replace(/✅/g, "[OK]")
          .replace(/❌/g, "[X]")
          .replace(/🔴/g, "[CRITICAL]")
          .replace(/🟠/g, "[HIGH]")
          .replace(/🟡/g, "[WARNING]")
          .replace(/🟢/g, "[GOOD]")
          .replace(/🔵/g, "[INFO]")
          .replace(/⚪/g, "[-]")
          .replace(/🏆/g, "[#1]")
          .replace(/🔥/g, "[HOT]")
          .replace(/📱/g, "[MOBILE]")
          .replace(/🖥️/g,  "[DESKTOP]")
          .replace(/📊/g, "[DATA]")
          .replace(/🔑/g, "[KEY]")
          .replace(/🔗/g, "[LINK]")
          .replace(/📝/g, "[CONTENT]")
          .replace(/📄/g, "[PAGE]")
          .replace(/🏛/g,  "[DA]")
          .replace(/💰/g, "[TRANS]")
          .replace(/📘/g, "[INFO]")
          .replace(/🧭/g, "[NAV]")
          .replace(/🛒/g, "[COMM]")
          .replace(/⚠️/g,  "[WARN]")
          .replace(/[^\x00-\x7F]/g, ""); // strip any remaining non-ASCII

        checkPageBreak();

        // Indented lines (2+ spaces)
        const isIndented   = raw.startsWith("  ");
        const isDoubleIndent = raw.startsWith("    ");
        const xPos = isDoubleIndent ? MARGIN_LEFT + 20
                   : isIndented     ? MARGIN_LEFT + 10
                   : MARGIN_LEFT;
        const textWidth = PAGE_WIDTH - (xPos - MARGIN_LEFT);

        doc.font("Helvetica").fontSize(8).fillColor(lineColour || BRAND.dark);
        doc.text(cleanLine, xPos, yPos, { width: textWidth, lineBreak: true });

        // Estimate actual height used (pdfkit wraps long lines)
        const approxLines = Math.ceil(cleanLine.length / Math.max(textWidth / 5, 1));
        yPos += lineH * Math.max(approxLines, 1);
        checkPageBreak();
      }

      // ── Final page footer ──────────────────────────────────────────────────
      drawPageFooter(pageCount);

      // ── Flush and finalise ─────────────────────────────────────────────────
      doc.end();

      stream.on("finish", () => {
        console.log(`[SEO Audit] PDF saved to: ${pdfPath}`);
        resolve();
      });
      stream.on("error", reject);

    } catch (err) {
      reject(err);
    }
  });
};

// ─────────────────────────────────────────────────────────────────────────────
//  saveAuditToFile  (updated — replaces original in seoController.js)
//
//  Saves report as BOTH .txt and .pdf inside reports/
//
//  @param  {string} auditText    — full formatted report string
//  @param  {object} customerInfo — { name, email, whatsAppNum, websiteUrl,
//                                    mainKeywords, location }
//  @returns {object}             — { txtFilename, txtFilepath,
//                                    pdfFilename, pdfFilepath }
// ─────────────────────────────────────────────────────────────────────────────

const saveAuditToFile = async (auditText, customerInfo) => {
  // ── Create reports/ directory if it doesn't exist ──────────────────────────
  const reportsDir = path.join(__dirname, "..", "reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // ── Build safe filename base ───────────────────────────────────────────────
  const safeDomain = (customerInfo.websiteUrl || "unknown")
    .replace(/https?:\/\//, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .substring(0, 50);
  const timestamp  = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
  const fileBase   = `seo_audit_${safeDomain}_${timestamp}`;

  // ── Save .txt (unchanged behaviour) ───────────────────────────────────────
  const txtFilename = `${fileBase}.txt`;
  const txtFilepath = path.join(reportsDir, txtFilename);
  fs.writeFileSync(txtFilepath, auditText, "utf-8");
  console.log(`[SEO Audit] TXT report saved to: ${txtFilepath}`);

  // ── Save .pdf ──────────────────────────────────────────────────────────────
  const pdfFilename = `${fileBase}.pdf`;
  const pdfFilepath = path.join(reportsDir, pdfFilename);

  try {
    await buildPDF(auditText, pdfFilepath, customerInfo);
  } catch (pdfErr) {
    console.error(`[SEO Audit] PDF generation failed: ${pdfErr.message}`);
    // PDF failure is non-fatal — .txt still saved
    return {
      txtFilename,
      txtFilepath,
      pdfFilename:  null,
      pdfFilepath:  null,
      pdfError:     pdfErr.message,
      note:         "TXT report saved. PDF generation failed — check pdfkit is installed (npm install pdfkit)",
    };
  }

  return {
    txtFilename,
    txtFilepath,
    pdfFilename,
    pdfFilepath,
    note: "Both TXT and PDF reports saved to the reports/ directory",
  };
};

module.exports = { saveAuditToFile };