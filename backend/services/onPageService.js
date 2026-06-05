// ─────────────────────────────────────────────────────────────────────────────
//  services/onPageService.js
//  GrowDigitally — On-Page SEO Score Service
//
//  No external API needed — pure HTML crawling using cheerio + axios
//  Uses: safeGet (from seoHelpers)
//
//  Checks:
//    1.  Meta title quality
//    2.  Meta description quality
//    3.  H1 usage
//    4.  Heading hierarchy
//    5.  Keyword usage (across all on-page elements)
//    6.  Content length
//    7.  Internal links
//    8.  Image optimisation
//    9.  CTA presence
//    10. Schema availability
//    11. Relevance to main service/product keyword
//
//  Exports:
//    runOnPageSEO(url, mainKeywords)  →  structured result object
// ─────────────────────────────────────────────────────────────────────────────

const cheerio = require("cheerio");
const { safeGet } = require("./TechnicalSeoAudit");

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Score 0–100 → label + tier
 */
const scoreToLabel = (score) => {
  if (score >= 80) return { label: "Good",              tier: "good"    };
  if (score >= 50) return { label: "Needs Improvement", tier: "medium"  };
  return               { label: "Poor",              tier: "poor"    };
};

/**
 * Parse keywords from a comma-separated string into a clean array.
 */
const parseKeywords = (mainKeywords) => {
  if (!mainKeywords) return [];
  return mainKeywords
    .split(",")
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);
};

/**
 * Count how many times any of the keywords appear in a text string.
 * Returns { count, found: [keyword, ...] }
 */
const countKeywordsIn = (text, keywords) => {
  const lower = text.toLowerCase();
  const found = keywords.filter((kw) => lower.includes(kw));
  const count = keywords.reduce((acc, kw) => {
    const regex   = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const matches = lower.match(regex);
    return acc + (matches ? matches.length : 0);
  }, 0);
  return { count, found };
};

/**
 * Ensure the crawler uses a valid absolute URL and can follow redirects.
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

const resolveAuditUrl = async (url) => {
  const normalized = normaliseUrl(url);
  if (!normalized) return "";

  const res = await safeGet(normalized, { maxRedirects: 10, validateStatus: () => true });
  return res.finalUrl || normalized;
};

const fetchPageHtml = async (url) => {
  const normalized = normaliseUrl(url);
  if (!normalized) return { html: "", res: { status: 0, finalUrl: "" } };

  const candidates = [];
  const resolved = await resolveAuditUrl(normalized);
  if (resolved) candidates.push(resolved);
  candidates.push(normalized);

  if (normalized.startsWith("https://")) {
    candidates.push(normalized.replace("https://", "http://"));
  } else if (normalized.startsWith("http://")) {
    candidates.push(normalized.replace("http://", "https://"));
  }

  const seen = new Set();
  for (const candidate of candidates) {
    if (!candidate || seen.has(candidate)) continue;
    seen.add(candidate);

    const res = await safeGet(candidate, {
      timeout: 60000,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GrowDigitallyBot/1.0; +https://growdigitally.lk)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (typeof res.data === "string" && res.data.trim()) {
      return { html: res.data, res };
    }
  }

  return { html: "", res: { status: 0, finalUrl: resolved || normalized } };
};

/**
 * Check if heading levels follow a correct hierarchy (no skipped levels).
 * e.g. H1 → H2 → H3 is OK.  H1 → H3 (skipping H2) is a problem.
 * Returns array of hierarchy issues found.
 */
const checkHeadingHierarchy = ($) => {
  const issues  = [];
  const order   = [];
  $("h1, h2, h3, h4, h5, h6").each((_, el) => {
    const level = parseInt(el.tagName.replace("h", ""), 10);
    order.push(level);
  });

  for (let i = 1; i < order.length; i++) {
    const prev = order[i - 1];
    const curr = order[i];
    if (curr > prev + 1) {
      issues.push(`Heading level skipped: H${prev} → H${curr} (missing H${prev + 1})`);
    }
  }

  const h1Count = order.filter((l) => l === 1).length;
  if (h1Count === 0)  issues.push("No H1 tag found on page");
  if (h1Count > 1)    issues.push(`Multiple H1 tags found (${h1Count}) — should be exactly 1`);

  return issues;
};

/**
 * Detect CTA presence by scanning button text, anchor text,
 * and common CTA class/id patterns.
 */
const detectCTAs = ($) => {
  const ctaKeywords = [
    "get started", "start free", "free trial", "sign up", "register",
    "contact us", "get a quote", "book now", "call us", "buy now",
    "order now", "learn more", "get free", "request a demo", "try now",
    "subscribe", "download", "get audit", "schedule", "enquire",
    "free audit", "whatsapp", "chat with us", "send message", "submit",
  ];

  const found = [];

  // Check button text
  $("button, [role='button']").each((_, el) => {
    const text = $(el).text().trim().toLowerCase();
    if (ctaKeywords.some((kw) => text.includes(kw))) found.push({ type: "button", text: $(el).text().trim() });
  });

  // Check anchor text
  $("a").each((_, el) => {
    const text = $(el).text().trim().toLowerCase();
    if (ctaKeywords.some((kw) => text.includes(kw))) found.push({ type: "link", text: $(el).text().trim() });
  });

  // Check class/id patterns
  $("[class*='cta'], [id*='cta'], [class*='btn'], [class*='button']").each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 0 && text.length < 60) {
      found.push({ type: "element", text });
    }
  });

  // Deduplicate by text
  const unique = Array.from(new Map(found.map((c) => [c.text.toLowerCase(), c])).values());
  return unique.slice(0, 10);
};

/**
 * Analyse keyword usage across all major on-page locations.
 * Returns a density + location report.
 */
const analyseKeywordUsage = ($, keywords, bodyText) => {
  if (keywords.length === 0) return { analysed: false, reason: "No keywords provided" };

  const title    = $("title").first().text();
  const metaDesc = $('meta[name="description"]').attr("content") || "";
  const h1Text   = $("h1").first().text();
  const h2Texts  = $("h2").map((_, el) => $(el).text()).get().join(" ");
  const urlText  = "";  // checked at URL level, not needed here

  const wordCount  = bodyText.split(/\s+/).filter(Boolean).length;
  const bodyResult = countKeywordsIn(bodyText, keywords);

  // Keyword density — aim for 0.5%–2.5%
  const density = wordCount > 0
    ? parseFloat(((bodyResult.count / wordCount) * 100).toFixed(2))
    : 0;

  const locations = {
    inTitle:       keywords.some((kw) => title.toLowerCase().includes(kw)),
    inMetaDesc:    keywords.some((kw) => metaDesc.toLowerCase().includes(kw)),
    inH1:          keywords.some((kw) => h1Text.toLowerCase().includes(kw)),
    inH2:          keywords.some((kw) => h2Texts.toLowerCase().includes(kw)),
    inBody:        bodyResult.count > 0,
    inFirstPara:   false, // checked below
    inImgAlt:      false, // checked below
  };

  // First paragraph keyword check
  const firstPara = $("p").first().text().toLowerCase();
  locations.inFirstPara = keywords.some((kw) => firstPara.includes(kw));

  // Image alt keyword check
  $("img[alt]").each((_, el) => {
    const alt = $(el).attr("alt").toLowerCase();
    if (keywords.some((kw) => alt.includes(kw))) locations.inImgAlt = true;
  });

  const locationScore = Object.values(locations).filter(Boolean).length;
  const maxLocations  = Object.keys(locations).length;

  const issues = [];
  if (!locations.inTitle)    issues.push("Keyword not found in meta title");
  if (!locations.inMetaDesc) issues.push("Keyword not found in meta description");
  if (!locations.inH1)       issues.push("Keyword not found in H1 tag");
  if (!locations.inBody)     issues.push("Keyword not found in body content");
  if (!locations.inFirstPara) issues.push("Keyword not found in first paragraph — add it early");
  if (density > 3)            issues.push(`Keyword density is ${density}% — may appear as keyword stuffing (keep under 2.5%)`);
  if (density < 0.3 && wordCount > 100) issues.push(`Keyword density is ${density}% — too low, use keyword more naturally`);

  return {
    analysed:       true,
    keywords,
    bodyOccurrences: bodyResult.count,
    density:        `${density}%`,
    densityStatus:  density >= 0.5 && density <= 2.5 ? "good" : density > 2.5 ? "too-high" : "too-low",
    locations,
    locationScore:  `${locationScore}/${maxLocations}`,
    issues,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
//  SCORING ENGINE
//  Each check contributes points toward a total on-page SEO score (0–100).
//
//  Weight breakdown:
//    Meta title quality       : 12 pts
//    Meta description quality : 12 pts
//    H1 usage                 : 10 pts
//    Heading hierarchy        : 8  pts
//    Keyword usage            : 15 pts
//    Content length           : 10 pts
//    Internal links           : 8  pts
//    Image optimisation       : 8  pts
//    CTA presence             : 7  pts
//    Schema availability      : 5  pts
//    Keyword relevance        : 5  pts
//                             ─────────
//    TOTAL                    : 100 pts
// ─────────────────────────────────────────────────────────────────────────────

const calculateOnPageScore = (checks) => {
  let score = 0;

  // Meta title (12 pts)
  const mt = checks.metaTitle;
  if (mt.isPresent)          score += 4;
  if (mt.isGoodLength)       score += 4;
  if (mt.hasKeyword)         score += 4;

  // Meta description (12 pts)
  const md = checks.metaDescription;
  if (md.isPresent)          score += 4;
  if (md.isGoodLength)       score += 4;
  if (md.hasKeyword)         score += 4;

  // H1 (10 pts)
  const h1 = checks.h1Usage;
  if (h1.hasH1)              score += 5;
  if (h1.exactlyOne)         score += 3;
  if (h1.h1HasKeyword)       score += 2;

  // Heading hierarchy (8 pts)
  const hh = checks.headingHierarchy;
  if (hh.hasH2)              score += 3;
  if (hh.hasH3)              score += 1;
  if (hh.hierarchyIssues.length === 0) score += 4;

  // Keyword usage (15 pts)
  const ku = checks.keywordUsage;
  if (ku.analysed) {
    if (ku.locations?.inTitle)      score += 3;
    if (ku.locations?.inMetaDesc)   score += 2;
    if (ku.locations?.inH1)         score += 3;
    if (ku.locations?.inFirstPara)  score += 2;
    if (ku.locations?.inBody)       score += 3;
    if (ku.densityStatus === "good") score += 2;
  }

  // Content length (10 pts)
  const cl = checks.contentLength;
  if (cl.wordCount >= 300)   score += 4;
  if (cl.wordCount >= 600)   score += 3;
  if (cl.wordCount >= 1000)  score += 3;

  // Internal links (8 pts)
  const il = checks.internalLinks;
  if (il.count >= 1)         score += 3;
  if (il.count >= 3)         score += 3;
  if (il.count >= 6)         score += 2;

  // Image optimisation (8 pts)
  const io = checks.imageOptimisation;
  if (io.totalImages > 0) {
    if (io.altCoverage === 100)         score += 5;
    else if (io.altCoverage >= 75)      score += 3;
    else if (io.altCoverage >= 50)      score += 1;
    if (io.imagesWithKeywordAlt > 0)    score += 2;
    if (io.hasLazyLoading)              score += 1;
  } else {
    score += 4; // no images is neutral — not penalised
  }

  // CTA presence (7 pts)
  const cta = checks.ctaPresence;
  if (cta.found.length >= 1)  score += 4;
  if (cta.found.length >= 2)  score += 2;
  if (cta.found.length >= 3)  score += 1;

  // Schema availability (5 pts)
  const sc = checks.schema;
  if (sc.isPresent)           score += 3;
  if (sc.types.length >= 2)   score += 2;

  // Keyword relevance (5 pts)
  const kr = checks.keywordRelevance;
  if (kr.titleRelevant)       score += 2;
  if (kr.contentRelevant)     score += 2;
  if (kr.urlRelevant)         score += 1;

  return Math.min(100, Math.round(score));
};

// ─────────────────────────────────────────────────────────────────────────────
//  runOnPageSEO  (main export)
//
//  @param  {string} url          — normalised website URL
//  @param  {string} mainKeywords — comma-separated keywords from user input
//  @returns {object}             — full on-page SEO audit result
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
//  formatOnPageAsText
//  GrowDigitally — On-Page SEO Score Report Formatter
//
//  Add this function into seoController.js alongside:
//    formatAuditAsText, formatPerformanceAsText, formatSiteSpeedAsText
//
//  @param  {object} onPageData    — result from runOnPageSEO(url, mainKeywords)
//  @param  {object} customerInfo  — { name, email, whatsAppNum, websiteUrl }
//  @returns {string}              — formatted plain-text report section
// ─────────────────────────────────────────────────────────────────────────────

const formatOnPageAsText = (onPageData, customerInfo) => {

  const { name, email, whatsAppNum, websiteUrl } = customerInfo;

  const LINE  = "─".repeat(70);
  const LINE2 = "═".repeat(70);

  // ── Icon helpers ──────────────────────────────────────────────────────────
  const qualityIcon = (quality) => {
    const map = {
      "Good":              "✅",
      "Acceptable":        "🟡",
      "Needs Improvement": "🟡",
      "Poor":              "🔴",
      "Missing":           "🔴",
      "Thin Content":      "🟡",
      "Multiple H1s":      "🟠",
    };
    return map[quality] || "⚪";
  };

  const tierIcon = (tier) => {
    const map = { good: "🟢", medium: "🟡", poor: "🔴", unknown: "⚪" };
    return map[tier] || "⚪";
  };

  const boolIcon = (val) => val ? "✅" : "❌";

  // ── Build report string ───────────────────────────────────────────────────
  let R = "";

  // ── Header ────────────────────────────────────────────────────────────────
  R += `\n${LINE2}\n`;
  R += `  SERVICE 4 — ON-PAGE SEO SCORE\n`;
  R += `${LINE2}\n\n`;

  R += `CUSTOMER INFORMATION\n${LINE}\n`;
  R += `Name       : ${name}\n`;
  R += `Email      : ${email}\n`;
  R += `WhatsApp   : ${whatsAppNum}\n`;
  R += `Website    : ${websiteUrl}\n`;
  R += `Generated  : ${new Date().toISOString()}\n\n`;

  // ── Error fallback ────────────────────────────────────────────────────────
  if (onPageData.error) {
    R += `ERROR\n${LINE}\n`;
    R += `  ❌ ${onPageData.error}\n\n`;
    R += `${LINE2}\n  END OF SERVICE 4 — ON-PAGE SEO SCORE\n${LINE2}\n`;
    return R;
  }

  // ── Overall score ─────────────────────────────────────────────────────────
  R += `OVERALL ON-PAGE SEO SCORE\n${LINE}\n`;
  R += `  ${tierIcon(onPageData.scoreTier)} Score       : ${onPageData.overallScore}/100\n`;
  R += `  Rating      : ${onPageData.scoreLabel}\n`;
  R += `  URL         : ${onPageData.url}\n`;
  R += `  Keywords    : ${onPageData.mainKeywords || "Not provided"}\n`;
  R += `  Total Issues: ${onPageData.totalIssues}\n\n`;

  // ── Score breakdown table ─────────────────────────────────────────────────
  R += `SCORE BREAKDOWN BY CHECK\n${LINE}\n`;

  const checks = onPageData.checks;
  const checkRows = [
    { label: "Meta Title Quality",          quality: checks.metaTitle?.quality          },
    { label: "Meta Description Quality",    quality: checks.metaDescription?.quality    },
    { label: "H1 Usage",                    quality: checks.h1Usage?.quality            },
    { label: "Heading Hierarchy",           quality: checks.headingHierarchy?.quality   },
    { label: "Keyword Usage",               quality: checks.keywordUsage?.analysed ? (checks.keywordUsage.issues?.length === 0 ? "Good" : "Needs Improvement") : "Not Analysed" },
    { label: "Content Length",              quality: checks.contentLength?.quality      },
    { label: "Internal Links",              quality: checks.internalLinks?.quality      },
    { label: "Image Optimisation",          quality: checks.imageOptimisation?.quality  },
    { label: "CTA Presence",               quality: checks.ctaPresence?.quality        },
    { label: "Schema Availability",         quality: checks.schema?.quality            },
    { label: "Keyword Relevance",           quality: checks.keywordRelevance?.quality   },
  ];

  checkRows.forEach(({ label, quality }) => {
    const icon = qualityIcon(quality || "Poor");
    R += `  ${icon} ${label.padEnd(32)} ${quality || "N/A"}\n`;
  });
  R += "\n";

  // ════════════════════════════════════════
  //  CHECK 1 — META TITLE
  // ════════════════════════════════════════
  const mt = checks.metaTitle;
  R += `1. META TITLE QUALITY\n${LINE}\n`;
  R += `  Content        : "${mt.content || "Not found"}"\n`;
  R += `  Length         : ${mt.length} chars ${mt.isGoodLength ? "✅ Good (30–60)" : "⚠️ Needs fix"}\n`;
  R += `  Keyword Present: ${boolIcon(mt.hasKeyword)}\n`;
  R += `  Quality        : ${qualityIcon(mt.quality)} ${mt.quality}\n`;
  if (mt.issues.length > 0) {
    R += `  Issues:\n`;
    mt.issues.forEach((i) => { R += `    🟡 ${i}\n`; });
  } else {
    R += `  Issues         : ✅ None\n`;
  }
  R += "\n";

  // ════════════════════════════════════════
  //  CHECK 2 — META DESCRIPTION
  // ════════════════════════════════════════
  const md = checks.metaDescription;
  R += `2. META DESCRIPTION QUALITY\n${LINE}\n`;
  R += `  Content        : "${md.content ? md.content.substring(0, 120) + (md.content.length > 120 ? "..." : "") : "Not found"}"\n`;
  R += `  Length         : ${md.length} chars ${md.isGoodLength ? "✅ Good (120–160)" : "⚠️ Needs fix"}\n`;
  R += `  Keyword Present: ${boolIcon(md.hasKeyword)}\n`;
  R += `  Quality        : ${qualityIcon(md.quality)} ${md.quality}\n`;
  if (md.issues.length > 0) {
    R += `  Issues:\n`;
    md.issues.forEach((i) => { R += `    🟡 ${i}\n`; });
  } else {
    R += `  Issues         : ✅ None\n`;
  }
  R += "\n";

  // ════════════════════════════════════════
  //  CHECK 3 — H1 USAGE
  // ════════════════════════════════════════
  const h1 = checks.h1Usage;
  R += `3. H1 USAGE\n${LINE}\n`;
  R += `  H1 Count       : ${h1.count} ${h1.exactlyOne ? "✅" : h1.count === 0 ? "🔴" : "🟠"}\n`;
  if (h1.content.length > 0) {
    R += `  H1 Content     : "${h1.content[0]}"\n`;
    if (h1.content.length > 1) {
      h1.content.slice(1).forEach((h, i) => { R += `  H1 Extra ${i + 2}    : "${h}"\n`; });
    }
  }
  R += `  Keyword in H1  : ${boolIcon(h1.h1HasKeyword)}\n`;
  R += `  Quality        : ${qualityIcon(h1.quality)} ${h1.quality}\n`;
  if (h1.issues.length > 0) {
    R += `  Issues:\n`;
    h1.issues.forEach((i) => { R += `    🟡 ${i}\n`; });
  } else {
    R += `  Issues         : ✅ None\n`;
  }
  R += "\n";

  // ════════════════════════════════════════
  //  CHECK 4 — HEADING HIERARCHY
  // ════════════════════════════════════════
  const hh = checks.headingHierarchy;
  R += `4. HEADING HIERARCHY\n${LINE}\n`;
  R += `  H1 Count       : ${hh.h1Count}\n`;
  R += `  H2 Count       : ${hh.h2Count} ${hh.hasH2 ? "✅" : "🔴"}\n`;
  R += `  H3 Count       : ${hh.h3Count}\n`;
  R += `  H4 Count       : ${hh.h4Count}\n`;
  if (hh.h2Samples.length > 0) {
    R += `  H2 Samples:\n`;
    hh.h2Samples.slice(0, 4).forEach((h) => { R += `    • "${h}"\n`; });
  }
  if (hh.h3Samples.length > 0) {
    R += `  H3 Samples:\n`;
    hh.h3Samples.slice(0, 3).forEach((h) => { R += `    • "${h}"\n`; });
  }
  R += `  Quality        : ${qualityIcon(hh.quality)} ${hh.quality}\n`;
  if (hh.issues.length > 0) {
    R += `  Issues:\n`;
    hh.issues.forEach((i) => { R += `    🟡 ${i}\n`; });
  } else {
    R += `  Issues         : ✅ None\n`;
  }
  R += "\n";

  // ════════════════════════════════════════
  //  CHECK 5 — KEYWORD USAGE
  // ════════════════════════════════════════
  const ku = checks.keywordUsage;
  R += `5. KEYWORD USAGE\n${LINE}\n`;
  if (!ku.analysed) {
    R += `  ⚪ ${ku.reason}\n\n`;
  } else {
    R += `  Keywords       : ${ku.keywords.join(", ")}\n`;
    R += `  Body Count     : ${ku.bodyOccurrences} occurrences\n`;
    R += `  Density        : ${ku.density} ${ku.densityStatus === "good" ? "✅ Good (0.5%–2.5%)" : ku.densityStatus === "too-high" ? "🔴 Too High" : "🟡 Too Low"}\n`;
    R += `  Locations Found: ${ku.locationScore}\n`;
    R += `    In Title       : ${boolIcon(ku.locations.inTitle)}\n`;
    R += `    In Meta Desc   : ${boolIcon(ku.locations.inMetaDesc)}\n`;
    R += `    In H1          : ${boolIcon(ku.locations.inH1)}\n`;
    R += `    In H2          : ${boolIcon(ku.locations.inH2)}\n`;
    R += `    In Body        : ${boolIcon(ku.locations.inBody)}\n`;
    R += `    In First Para  : ${boolIcon(ku.locations.inFirstPara)}\n`;
    R += `    In Image Alt   : ${boolIcon(ku.locations.inImgAlt)}\n`;
    if (ku.issues.length > 0) {
      R += `  Issues:\n`;
      ku.issues.forEach((i) => { R += `    🟡 ${i}\n`; });
    } else {
      R += `  Issues         : ✅ None\n`;
    }
  }
  R += "\n";

  // ════════════════════════════════════════
  //  CHECK 6 — CONTENT LENGTH
  // ════════════════════════════════════════
  const cl = checks.contentLength;
  R += `6. CONTENT LENGTH\n${LINE}\n`;
  R += `  Word Count     : ~${cl.wordCount} words ${cl.wordCount >= 600 ? "✅" : cl.wordCount >= 300 ? "🟡" : "🔴"}\n`;
  R += `  Char Count     : ~${cl.charCount} chars\n`;
  R += `  Paragraph Count: ${cl.paragraphCount}\n`;
  R += `  Thin Content   : ${cl.isThinContent ? "🔴 Yes — add more content" : "✅ No"}\n`;
  R += `  Quality        : ${qualityIcon(cl.quality)} ${cl.quality}\n`;
  if (cl.issues.length > 0) {
    R += `  Issues:\n`;
    cl.issues.forEach((i) => { R += `    🟡 ${i}\n`; });
  } else {
    R += `  Issues         : ✅ None\n`;
  }
  R += "\n";

  // ════════════════════════════════════════
  //  CHECK 7 — INTERNAL LINKS
  // ════════════════════════════════════════
  const il = checks.internalLinks;
  R += `7. INTERNAL LINKS\n${LINE}\n`;
  R += `  Total Count    : ${il.count} ${il.count >= 5 ? "✅" : il.count >= 3 ? "🟡" : "🔴"}\n`;
  R += `  Without Text   : ${il.linksWithoutText}\n`;
  R += `  Quality        : ${qualityIcon(il.quality)} ${il.quality}\n`;
  if (il.sample.length > 0) {
    R += `  Samples:\n`;
    il.sample.slice(0, 5).forEach((l) => { R += `    • ${l.href}  ("${l.text.substring(0, 40)}")\n`; });
  }
  if (il.issues.length > 0) {
    R += `  Issues:\n`;
    il.issues.forEach((i) => { R += `    🟡 ${i}\n`; });
  } else {
    R += `  Issues         : ✅ None\n`;
  }
  R += "\n";

  // ════════════════════════════════════════
  //  CHECK 8 — IMAGE OPTIMISATION
  // ════════════════════════════════════════
  const io = checks.imageOptimisation;
  R += `8. IMAGE OPTIMISATION\n${LINE}\n`;
  R += `  Total Images   : ${io.totalImages}\n`;
  R += `  Alt Coverage   : ${io.altCoverage} ${parseInt(io.altCoverage) === 100 ? "✅" : parseInt(io.altCoverage) >= 75 ? "🟡" : "🔴"}\n`;
  R += `  Missing Alt    : ${io.missingAltCount} ${io.missingAltCount === 0 ? "✅" : "🔴"}\n`;
  R += `  Keyword in Alt : ${io.imagesWithKeywordAlt} image(s)\n`;
  R += `  Lazy Loading   : ${io.hasLazyLoading ? `✅ Yes (${io.lazyLoadCount} images)` : "🟡 Not found"}\n`;
  R += `  Quality        : ${qualityIcon(io.quality)} ${io.quality}\n`;
  if (io.missingAltSamples.length > 0) {
    R += `  Missing Alt Samples:\n`;
    io.missingAltSamples.forEach((src) => { R += `    • ${src}\n`; });
  }
  if (io.issues.length > 0) {
    R += `  Issues:\n`;
    io.issues.forEach((i) => { R += `    🟡 ${i}\n`; });
  } else {
    R += `  Issues         : ✅ None\n`;
  }
  R += "\n";

  // ════════════════════════════════════════
  //  CHECK 9 — CTA PRESENCE
  // ════════════════════════════════════════
  const cta = checks.ctaPresence;
  R += `9. CTA PRESENCE\n${LINE}\n`;
  R += `  CTAs Found     : ${cta.count} ${cta.count >= 2 ? "✅" : cta.count === 1 ? "🟡" : "🔴"}\n`;
  R += `  Quality        : ${qualityIcon(cta.quality)} ${cta.quality}\n`;
  if (cta.found.length > 0) {
    R += `  CTA Examples:\n`;
    cta.found.slice(0, 5).forEach((c) => { R += `    • [${c.type}] "${c.text}"\n`; });
  }
  if (cta.issues.length > 0) {
    R += `  Issues:\n`;
    cta.issues.forEach((i) => { R += `    🟡 ${i}\n`; });
  } else {
    R += `  Issues         : ✅ None\n`;
  }
  R += "\n";

  // ════════════════════════════════════════
  //  CHECK 10 — SCHEMA AVAILABILITY
  // ════════════════════════════════════════
  const sc = checks.schema;
  R += `10. SCHEMA AVAILABILITY\n${LINE}\n`;
  R += `  Schema Present  : ${boolIcon(sc.isPresent)}\n`;
  R += `  JSON-LD Count   : ${sc.schemaCount}\n`;
  R += `  Schema Types    : ${sc.types.length > 0 ? sc.types.join(", ") : "None found"}\n`;
  R += `  Microdata       : ${sc.hasMicrodata ? `✅ Yes (${sc.microdataTypes.slice(0, 2).join(", ")})` : "❌ Not found"}\n`;
  R += `  Quality         : ${qualityIcon(sc.quality)} ${sc.quality}\n`;
  if (sc.issues.length > 0) {
    R += `  Issues:\n`;
    sc.issues.forEach((i) => { R += `    🟡 ${i}\n`; });
  } else {
    R += `  Issues          : ✅ None\n`;
  }
  R += "\n";

  // ════════════════════════════════════════
  //  CHECK 11 — KEYWORD RELEVANCE
  // ════════════════════════════════════════
  const kr = checks.keywordRelevance;
  R += `11. KEYWORD RELEVANCE\n${LINE}\n`;
  R += `  Keywords        : ${kr.keywords.join(", ") || "Not provided"}\n`;
  R += `  Title Relevant  : ${boolIcon(kr.titleRelevant)}\n`;
  R += `  Content Relevant: ${boolIcon(kr.contentRelevant)}\n`;
  R += `  URL Relevant    : ${boolIcon(kr.urlRelevant)}\n`;
  R += `  Semantic Score  : ${kr.semanticScore}\n`;
  R += `  Quality         : ${qualityIcon(kr.quality)} ${kr.quality}\n`;
  if (kr.issues.length > 0) {
    R += `  Issues:\n`;
    kr.issues.forEach((i) => { R += `    🟡 ${i}\n`; });
  } else {
    R += `  Issues          : ✅ None\n`;
  }
  R += "\n";

  // ── All issues summary ────────────────────────────────────────────────────
  R += `ALL ON-PAGE ISSUES (${onPageData.totalIssues} total)\n${LINE}\n`;
  if (onPageData.allIssues.length === 0) {
    R += `  ✅ No on-page issues found — excellent optimisation!\n`;
  } else {
    onPageData.allIssues.forEach((item, i) => {
      R += `  ${i + 1}. [${item.section}] ${item.issue}\n`;
    });
  }
  R += "\n";

  // ── Footer ────────────────────────────────────────────────────────────────
  R += `${LINE2}\n`;
  R += `  END OF SERVICE 4 — ON-PAGE SEO SCORE\n`;
  R += `${LINE2}\n`;

  return R;
};

const runOnPageSEO = async (url, mainKeywords) => {
  console.log(`[On-Page SEO] Starting on-page audit for: ${url}`);

  const keywords = parseKeywords(mainKeywords);

  // ── Fetch page HTML ──────────────────────────────────────────────────────────
  const fetchResult = await fetchPageHtml(url);
  const res  = fetchResult.res;
  const html = fetchResult.html;

  if (!html) {
    console.error(`[On-Page SEO] Could not fetch page HTML`);
    return {
      error:      "Could not fetch page HTML — on-page audit skipped",
      url,
      score:      0,
      scoreLabel: "Poor",
      scoreTier:  "poor",
    };
  }

  const $        = cheerio.load(html);
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const baseUrl  = new URL(url);

  // ════════════════════════════════════════════
  //  CHECK 1 — META TITLE QUALITY
  // ════════════════════════════════════════════
  const titleContent = $("title").first().text().trim();
  const titleLength  = titleContent.length;
  const titleHasKw   = keywords.length > 0 && keywords.some((kw) => titleContent.toLowerCase().includes(kw));

  const metaTitleIssues = [];
  if (!titleContent)                   metaTitleIssues.push("Meta title is missing");
  if (titleLength > 0 && titleLength < 30) metaTitleIssues.push(`Too short: ${titleLength} chars (30–60 recommended)`);
  if (titleLength > 60)                metaTitleIssues.push(`Too long: ${titleLength} chars (60 max recommended)`);
  if (keywords.length > 0 && !titleHasKw) metaTitleIssues.push("Main keyword not found in title");
  if (titleContent === titleContent.toUpperCase() && titleContent.length > 5) metaTitleIssues.push("Title appears to be ALL CAPS — use sentence or title case");

  const metaTitleCheck = {
    content:      titleContent,
    length:       titleLength,
    isPresent:    !!titleContent,
    isGoodLength: titleLength >= 30 && titleLength <= 60,
    hasKeyword:   titleHasKw,
    quality:      !titleContent ? "Missing" : metaTitleIssues.length === 0 ? "Good" : "Needs Improvement",
    issues:       metaTitleIssues,
  };

  // ════════════════════════════════════════════
  //  CHECK 2 — META DESCRIPTION QUALITY
  // ════════════════════════════════════════════
  const descContent = $('meta[name="description"]').attr("content")?.trim() || "";
  const descLength  = descContent.length;
  const descHasKw   = keywords.length > 0 && keywords.some((kw) => descContent.toLowerCase().includes(kw));

  const metaDescIssues = [];
  if (!descContent)                    metaDescIssues.push("Meta description is missing");
  if (descLength > 0 && descLength < 120) metaDescIssues.push(`Too short: ${descLength} chars (120–160 recommended)`);
  if (descLength > 160)                metaDescIssues.push(`Too long: ${descLength} chars (160 max — may be truncated in SERPs)`);
  if (keywords.length > 0 && !descHasKw) metaDescIssues.push("Main keyword not found in meta description");
  if (descContent && !descContent.match(/[.!?]$/)) metaDescIssues.push("Meta description does not end with punctuation");

  const metaDescCheck = {
    content:      descContent,
    length:       descLength,
    isPresent:    !!descContent,
    isGoodLength: descLength >= 120 && descLength <= 160,
    hasKeyword:   descHasKw,
    quality:      !descContent ? "Missing" : metaDescIssues.length === 0 ? "Good" : "Needs Improvement",
    issues:       metaDescIssues,
  };

  // ════════════════════════════════════════════
  //  CHECK 3 — H1 USAGE
  // ════════════════════════════════════════════
  const h1Tags    = [];
  $("h1").each((_, el) => h1Tags.push($(el).text().trim()));
  const h1HasKw   = keywords.length > 0 && h1Tags.some((h) => keywords.some((kw) => h.toLowerCase().includes(kw)));

  const h1Issues = [];
  if (h1Tags.length === 0)   h1Issues.push("No H1 tag found — every page should have exactly one H1");
  if (h1Tags.length > 1)     h1Issues.push(`Multiple H1 tags found (${h1Tags.length}) — use exactly one H1 per page`);
  if (h1Tags.length === 1 && keywords.length > 0 && !h1HasKw)
                              h1Issues.push("Main keyword not found in H1 tag");
  if (h1Tags[0] && h1Tags[0].length < 10) h1Issues.push("H1 is very short — make it descriptive");
  if (h1Tags[0] && h1Tags[0].length > 70) h1Issues.push("H1 is very long (>70 chars) — consider shortening");

  const h1UsageCheck = {
    count:       h1Tags.length,
    content:     h1Tags,
    hasH1:       h1Tags.length > 0,
    exactlyOne:  h1Tags.length === 1,
    h1HasKeyword: h1HasKw,
    quality:     h1Tags.length === 0 ? "Missing" : h1Tags.length > 1 ? "Multiple H1s" : h1Issues.length === 0 ? "Good" : "Needs Improvement",
    issues:      h1Issues,
  };

  // ════════════════════════════════════════════
  //  CHECK 4 — HEADING HIERARCHY
  // ════════════════════════════════════════════
  const h2Tags = []; $("h2").each((_, el) => h2Tags.push($(el).text().trim()));
  const h3Tags = []; $("h3").each((_, el) => h3Tags.push($(el).text().trim()));
  const h4Tags = []; $("h4").each((_, el) => h4Tags.push($(el).text().trim()));

  const hierarchyIssues = checkHeadingHierarchy($);

  const headingHierarchyCheck = {
    h1Count:         h1Tags.length,
    h2Count:         h2Tags.length,
    h3Count:         h3Tags.length,
    h4Count:         h4Tags.length,
    hasH2:           h2Tags.length > 0,
    hasH3:           h3Tags.length > 0,
    h2Samples:       h2Tags.slice(0, 5),
    h3Samples:       h3Tags.slice(0, 3),
    hierarchyIssues,
    quality:         hierarchyIssues.length === 0 && h2Tags.length > 0 ? "Good" : "Needs Improvement",
    issues:          [
      h2Tags.length === 0 && "No H2 tags found — add subheadings to structure content",
      ...hierarchyIssues,
    ].filter(Boolean),
  };

  // ════════════════════════════════════════════
  //  CHECK 5 — KEYWORD USAGE
  // ════════════════════════════════════════════
  const keywordUsageCheck = analyseKeywordUsage($, keywords, bodyText);

  // ════════════════════════════════════════════
  //  CHECK 6 — CONTENT LENGTH
  // ════════════════════════════════════════════
  const wordCount     = bodyText.split(/\s+/).filter(Boolean).length;
  const charCount     = bodyText.length;
  const paraCount     = $("p").length;
  const isThinContent = wordCount < 300;

  const contentLengthIssues = [];
  if (wordCount < 300)        contentLengthIssues.push(`Thin content: only ~${wordCount} words (300+ recommended for SEO)`);
  else if (wordCount < 600)   contentLengthIssues.push(`Content could be richer: ~${wordCount} words (600+ ideal for ranking)`);
  if (paraCount < 3)          contentLengthIssues.push("Very few paragraphs — add more structured content");

  const contentLengthCheck = {
    wordCount,
    charCount,
    paragraphCount: paraCount,
    isThinContent,
    quality:        wordCount >= 600 ? "Good" : wordCount >= 300 ? "Acceptable" : "Thin Content",
    issues:         contentLengthIssues,
  };

  // ════════════════════════════════════════════
  //  CHECK 7 — INTERNAL LINKS
  // ════════════════════════════════════════════
  const internalLinks = [];
  $("a[href]").each((_, el) => {
    try {
      const href   = $(el).attr("href").trim();
      const abs    = new URL(href, url).href;
      const parsed = new URL(abs);
      if (parsed.hostname === baseUrl.hostname) {
        internalLinks.push({
          href:    abs,
          text:    $(el).text().trim(),
          hasText: !!$(el).text().trim(),
        });
      }
    } catch (_) {}
  });

  const linksWithoutText = internalLinks.filter((l) => !l.hasText);
  const internalLinkIssues = [];
  if (internalLinks.length === 0)   internalLinkIssues.push("No internal links found — add links to related pages");
  if (internalLinks.length < 3)     internalLinkIssues.push("Very few internal links — aim for at least 3–5 per page");
  if (linksWithoutText.length > 0)  internalLinkIssues.push(`${linksWithoutText.length} internal link(s) have no anchor text`);

  const internalLinksCheck = {
    count:               internalLinks.length,
    sample:              internalLinks.slice(0, 8).map((l) => ({ href: l.href, text: l.text || "(no text)" })),
    linksWithoutText:    linksWithoutText.length,
    quality:             internalLinks.length >= 5 ? "Good" : internalLinks.length >= 3 ? "Acceptable" : "Poor",
    issues:              internalLinkIssues,
  };

  // ════════════════════════════════════════════
  //  CHECK 8 — IMAGE OPTIMISATION
  // ════════════════════════════════════════════
  const allImages     = [];
  $("img").each((_, el) => {
    const src         = $(el).attr("src")     || "";
    const alt         = $(el).attr("alt")     || "";
    const title       = $(el).attr("title")   || "";
    const loading     = $(el).attr("loading") || "";
    const width       = $(el).attr("width")   || "";
    const height      = $(el).attr("height")  || "";
    const hasKwInAlt  = keywords.length > 0 && keywords.some((kw) => alt.toLowerCase().includes(kw));

    allImages.push({ src, alt, title, loading, width, height, hasKwInAlt, hasAlt: !!alt.trim() });
  });

  const missingAlt         = allImages.filter((i) => !i.hasAlt);
  const imagesWithKwAlt    = allImages.filter((i) => i.hasKwInAlt);
  const imagesWithLazy     = allImages.filter((i) => i.loading === "lazy");
  const imagesWithDimensions = allImages.filter((i) => i.width && i.height);
  const altCoverage        = allImages.length > 0 ? Math.round(((allImages.length - missingAlt.length) / allImages.length) * 100) : 100;

  const imageIssues = [];
  if (missingAlt.length > 0)   imageIssues.push(`${missingAlt.length} image(s) missing alt text`);
  if (imagesWithLazy.length === 0 && allImages.length > 3) imageIssues.push("No lazy loading found — add loading='lazy' to images");
  if (imagesWithDimensions.length < allImages.length * 0.5 && allImages.length > 2)
                                imageIssues.push("Many images missing width/height attributes — can cause layout shift (CLS)");
  if (keywords.length > 0 && imagesWithKwAlt.length === 0 && allImages.length > 0)
                                imageIssues.push("No images have keyword-relevant alt text");

  const imageOptimisationCheck = {
    totalImages:           allImages.length,
    missingAltCount:       missingAlt.length,
    missingAltSamples:     missingAlt.slice(0, 5).map((i) => i.src),
    altCoverage:           `${altCoverage}%`,
    imagesWithKeywordAlt:  imagesWithKwAlt.length,
    hasLazyLoading:        imagesWithLazy.length > 0,
    lazyLoadCount:         imagesWithLazy.length,
    quality:               altCoverage === 100 && imageIssues.length === 0 ? "Good" : altCoverage >= 75 ? "Acceptable" : "Poor",
    issues:                imageIssues,
  };

  // ════════════════════════════════════════════
  //  CHECK 9 — CTA PRESENCE
  // ════════════════════════════════════════════
  const ctasFound    = detectCTAs($);
  const ctaIssues    = [];
  if (ctasFound.length === 0) ctaIssues.push("No CTA (call-to-action) detected — add clear action buttons or links");
  if (ctasFound.length === 1) ctaIssues.push("Only one CTA found — consider adding multiple CTAs across the page");

  const ctaPresenceCheck = {
    count:   ctasFound.length,
    found:   ctasFound,
    quality: ctasFound.length >= 2 ? "Good" : ctasFound.length === 1 ? "Acceptable" : "Missing",
    issues:  ctaIssues,
  };

  // ════════════════════════════════════════════
  //  CHECK 10 — SCHEMA AVAILABILITY
  // ════════════════════════════════════════════
  const schemaScripts = [];
  const schemaTypes   = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).html() || "{}");
      const type   = parsed["@type"] || "Unknown";
      schemaTypes.push(type);
      schemaScripts.push(parsed);
    } catch {
      schemaTypes.push("Invalid JSON-LD");
    }
  });

  // Also check for microdata
  const hasMicrodata = $("[itemtype]").length > 0;
  const microdataTypes = [];
  $("[itemtype]").each((_, el) => { microdataTypes.push($(el).attr("itemtype") || ""); });

  const schemaIssues = [];
  if (schemaTypes.length === 0 && !hasMicrodata) schemaIssues.push("No structured data (schema markup) found — add JSON-LD schema");
  if (schemaTypes.length > 0 && schemaTypes.includes("Invalid JSON-LD")) schemaIssues.push("Invalid JSON-LD schema found — fix the syntax errors");

  const schemaCheck = {
    isPresent:       schemaTypes.length > 0 || hasMicrodata,
    types:           schemaTypes,
    hasMicrodata,
    microdataTypes,
    schemaCount:     schemaTypes.length,
    quality:         schemaTypes.length >= 2 ? "Good" : schemaTypes.length === 1 ? "Acceptable" : "Missing",
    issues:          schemaIssues,
  };

  // ════════════════════════════════════════════
  //  CHECK 11 — KEYWORD RELEVANCE
  //  Is the page actually relevant to the main service/product keyword?
  // ════════════════════════════════════════════
  const urlPath        = baseUrl.pathname.toLowerCase();
  const titleRelevant  = keywords.length > 0 && keywords.some((kw) => titleContent.toLowerCase().includes(kw));
  const contentRelevant = keywords.length > 0 && keywords.some((kw) => bodyText.toLowerCase().includes(kw));
  const urlRelevant    = keywords.length > 0 && keywords.some((kw) =>
    kw.split(" ").some((word) => urlPath.includes(word.toLowerCase()))
  );

  // Semantic relevance — check if related terms appear near keyword
  const semanticTerms = keywords.flatMap((kw) => kw.split(" ")).filter((w) => w.length > 3);
  const semanticHits  = semanticTerms.filter((term) => bodyText.toLowerCase().includes(term));
  const semanticScore = semanticTerms.length > 0
    ? Math.round((semanticHits.length / semanticTerms.length) * 100)
    : 100;

  const relevanceIssues = [];
  if (keywords.length === 0)   relevanceIssues.push("No keywords provided — cannot assess relevance");
  if (!titleRelevant)          relevanceIssues.push("Main keyword not in title — page may not appear relevant to search engines");
  if (!contentRelevant)        relevanceIssues.push("Main keyword not found in body content — low topical relevance");
  if (!urlRelevant)            relevanceIssues.push("URL does not contain keyword-related terms — consider keyword-rich URL slugs");
  if (semanticScore < 50)      relevanceIssues.push(`Low semantic relevance (${semanticScore}%) — use more related terms naturally in content`);

  const keywordRelevanceCheck = {
    keywords,
    titleRelevant,
    contentRelevant,
    urlRelevant,
    semanticScore:   `${semanticScore}%`,
    quality:         titleRelevant && contentRelevant && semanticScore >= 70 ? "Good"
                   : titleRelevant || contentRelevant ? "Acceptable"
                   : "Poor",
    issues:          relevanceIssues,
  };

  // ════════════════════════════════════════════
  //  COMPILE ALL CHECKS
  // ════════════════════════════════════════════
  const checks = {
    metaTitle:          metaTitleCheck,
    metaDescription:    metaDescCheck,
    h1Usage:            h1UsageCheck,
    headingHierarchy:   headingHierarchyCheck,
    keywordUsage:       keywordUsageCheck,
    contentLength:      contentLengthCheck,
    internalLinks:      internalLinksCheck,
    imageOptimisation:  imageOptimisationCheck,
    ctaPresence:        ctaPresenceCheck,
    schema:             schemaCheck,
    keywordRelevance:   keywordRelevanceCheck,
  };

  // ════════════════════════════════════════════
  //  CALCULATE OVERALL ON-PAGE SCORE
  // ════════════════════════════════════════════
  const overallScore = calculateOnPageScore({
    ...checks,
    imageOptimisation: { ...checks.imageOptimisation, altCoverage: parseInt(imageOptimisationCheck.altCoverage), imagesWithKeywordAlt: imagesWithKwAlt.length, hasLazyLoading: imagesWithLazy.length > 0 },
  });
  const { label: scoreLabel, tier: scoreTier } = (() => {
    if (overallScore >= 80) return { label: "Good",              tier: "good"    };
    if (overallScore >= 50) return { label: "Needs Improvement", tier: "medium"  };
    return                         { label: "Poor",              tier: "poor"    };
  })();

  // ════════════════════════════════════════════
  //  COLLECT ALL ISSUES
  // ════════════════════════════════════════════
  const allIssues = Object.entries(checks).flatMap(([section, check]) =>
    (check.issues || []).map((issue) => ({ section, issue }))
  );

  console.log(`[On-Page SEO] Done — Score: ${overallScore}/100 (${scoreLabel}) | Issues: ${allIssues.length}`);

  return {
    url,
    mainKeywords,
    fetchedAt: new Date().toISOString(),
    overallScore,
    scoreLabel,
    scoreTier,
    checks,
    allIssues,
    totalIssues: allIssues.length,
  };
};

module.exports = { runOnPageSEO, formatOnPageAsText };
