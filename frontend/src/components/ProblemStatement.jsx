/* ─────────────────────────────────────────────
   ProblemStatement.jsx  — Section 5
   GrowDigitally · React + Tailwind CSS
───────────────────────────────────────────── */

/* ── Alert icon used in each problem card ── */
const AlertIcon = () => (
  <div className="w-9 h-9 rounded-xl bg-[#f5f0ff] border border-[#e0d8fb] flex items-center justify-center shrink-0">
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="#5E2CED" strokeWidth="1.8" />
      <path
        d="M12 7v6M12 15.5v.5"
        stroke="#5E2CED"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

/* ── Individual problem card ── */
const ProblemCard = ({ title, description }) => (
  <div className="flex flex-col gap-3">
    <AlertIcon />
    <div>
      <h4
        className="text-[15.5px] font-bold text-[#1a1a2e] leading-[1.3] mb-2"
        
      >
        {title}
      </h4>
      <p
        className="text-[13.5px] text-[#5a5a74] leading-[1.65] m-0"
        
      >
        {description}
      </p>
    </div>
  </div>
);

/* ── Right side: SEO Audit mockup with arrow ── */
const AuditPreviewMockup = () => {
  const skeletonRows = [
    { label: "Missing meta descriptions on 6 pages", severity: "high" },
    { label: "3 broken internal links detected", severity: "high" },
    { label: "No structured data / schema markup", severity: "high" },
    { label: "Page speed score: 48/100 (mobile)", severity: "medium" },
    { label: "Duplicate title tags found on 4 URLs", severity: "medium" },
    { label: "XML sitemap not submitted to Google", severity: "low" },
  ];

  const severityStyle = {
    high: { bg: "#fee2e2", color: "#dc2626", label: "Critical" },
    medium: { bg: "#fef3c7", color: "#d97706", label: "Warning" },
    low: { bg: "#f0edf9", color: "#5E2CED", label: "Info" },
  };

  return (
    <div className="relative">
      {/* Decorative curved arrow */}
      <div className="absolute -top-2 -left-16 pointer-events-none select-none" aria-hidden="true">
        <svg width="120" height="110" viewBox="0 0 120 110" fill="none">
          <path
            d="M10 10 C20 50, 80 20, 100 80"
            stroke="#5E2CED"
            strokeWidth="2"
            strokeDasharray="6 4"
            fill="none"
            opacity="0.5"
          />
          <path
            d="M95 88 L102 78 L108 90"
            stroke="#5E2CED"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.5"
          />
        </svg>
      </div>

      {/* Search query bubble */}
      <div
        className="inline-flex items-center gap-2 bg-white border border-[#ddd8f0] rounded-full px-4 py-2 mb-4 ml-auto"
        style={{
          boxShadow: "0 2px 8px rgba(94,44,237,0.08)",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="5" stroke="#5E2CED" strokeWidth="1.5" />
          <path d="M11 11l3 3" stroke="#5E2CED" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="text-[12.5px] font-semibold text-[#3a3a4a]">
          Why is my website not ranking on Google?
        </span>
      </div>

      {/* Audit results card */}
      <div
        className="bg-white rounded-2xl overflow-hidden w-full"
        style={{
          border: "1px solid #ede8fc",
          boxShadow: "0 8px 40px rgba(94,44,237,.12), 0 2px 8px rgba(0,0,0,.05)",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {/* Card header */}
        <div className="bg-[#1e1b2e] px-4 py-3 flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex items-center gap-2 ml-1">
            <div className="w-4 h-4 rounded bg-[#5E2CED] flex items-center justify-center shrink-0">
              <svg width="9" height="9" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M3 13C4.5 11 6 9 8 10C10 11 11 7 13 5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-[11px] text-[#c4bfdb] font-medium">
              GrowDigitally SEO Audit — yourbusiness.lk
            </span>
          </div>
        </div>

        {/* Summary bar */}
        <div className="px-4 py-3 bg-[#f9f8ff] border-b border-[#ede8f5] flex items-center justify-between">
          <div>
            <p className="text-[12.5px] font-bold text-[#1a1a2e] m-0">Issues Found on Your Website</p>
            <p className="text-[11px] text-[#9090a8] m-0">Reviewed by GrowDigitally team · Sent to WhatsApp</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-center">
              <p className="text-[16px] font-extrabold text-[#dc2626] m-0 leading-none">4</p>
              <p className="text-[9.5px] text-[#9090a8] m-0 mt-0.5">Critical</p>
            </div>
            <div className="w-px h-8 bg-[#ede8f5]" />
            <div className="text-center">
              <p className="text-[16px] font-extrabold text-[#d97706] m-0 leading-none">2</p>
              <p className="text-[9.5px] text-[#9090a8] m-0 mt-0.5">Warnings</p>
            </div>
            <div className="w-px h-8 bg-[#ede8f5]" />
            <div className="text-center">
              <p className="text-[16px] font-extrabold text-[#5E2CED] m-0 leading-none">38</p>
              <p className="text-[9.5px] text-[#9090a8] m-0 mt-0.5">Score</p>
            </div>
          </div>
        </div>

        {/* Issue rows */}
        <div className="px-4 py-2 bg-white">
          {skeletonRows.map((row, i) => {
            const s = severityStyle[row.severity];
            return (
              <div
                key={i}
                className="flex items-center justify-between py-2.5 border-b border-[#f5f0ff] last:border-none"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: s.color }}
                  />
                  <span className="text-[12px] text-[#3a3a4a] font-medium">
                    {row.label}
                  </span>
                </div>
                <span
                  className="text-[9.5px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ml-3"
                  style={{ background: s.bg, color: s.color }}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* WhatsApp delivery footer */}
        <div className="px-4 py-3 bg-[#f0fdf4] border-t border-[#bbf7d0] flex items-center gap-2.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
              stroke="#16a34a"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[12px] font-semibold text-[#16a34a]">
            Full report reviewed &amp; sent to your WhatsApp after expert check
          </span>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   PROBLEM STATEMENT SECTION
══════════════════════════════════════════ */
const problems = [
  {
    title: "Your website has issues you don't know about",
    description:
      "Broken links, missing meta tags, slow load times — these silent killers drag your rankings down every day. Most businesses only find out when it's too late.",
  },
  {
    title: "Competitors are outranking you right now",
    description:
      "While you guess at what's wrong, your competitors are fixing their SEO and climbing Google. Every day you wait is a day they gain ground you can't afford to lose.",
  },
  {
    title: "You don't know which pages need fixing first",
    description:
      "Without a prioritised audit, you waste time on the wrong pages. Critical issues stay unfixed while low-impact tweaks eat up your time and budget.",
  },
  {
    title: "Generic tools give reports, not real answers",
    description:
      "Automated tools dump data without context. You need a human-reviewed report that tells you exactly what to fix, in what order, with clear and actionable guidance.",
  },
];

const ProblemStatement = () => {
  return (
    <section
      className="w-full bg-white py-20 px-36"
      
    >
      <div className="max-w-7xl mx-auto grid grid-cols-2 gap-16 items-start">

        {/* ── LEFT COLUMN ── */}
        <div>
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-5">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="6" stroke="#5E2CED" strokeWidth="1.5" />
              <circle cx="8" cy="8" r="2" fill="#5E2CED" />
            </svg>
            <span className="text-[11px] font-bold tracking-widest text-[#5E2CED] uppercase">
              The Problem You Don't Know You Have
            </span>
          </div>

          {/* Headline */}
          <h2
            className="text-[40px] font-extrabold text-[#1a1a2e] leading-[1.1] tracking-[-1.5px] mb-5 max-w-130"
          >
            Your website is losing traffic. And you can't see why.
          </h2>

          {/* Description */}
          <p className="text-[15.5px] text-[#5a5a74] leading-[1.7] max-w-125 mb-10">
            Most Sri Lankan businesses are held back by the same invisible SEO problems. Your
            competitors are fixing them. You're still guessing. A GrowDigitally audit changes that.
          </p>

          {/* 2×2 problem grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-9 mb-10">
            {problems.map((p, i) => (
              <ProblemCard key={i} title={p.title} description={p.description} />
            ))}
          </div>

          {/* CTA */}
          <button
            className="h-12 px-7 bg-[#5E2CED] hover:bg-[#4a1fd4] active:scale-[0.98] text-white font-semibold text-[14.5px] rounded-lg border-none cursor-pointer transition-all duration-150"
            
          >
            Get Your Free SEO Audit
          </button>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="pt-8 md:mt-20">
          <AuditPreviewMockup />
        </div>

      </div>
    </section>
  );
};

export default ProblemStatement;