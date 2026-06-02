/* ─────────────────────────────────────────────
   FeaturesSection.jsx  — Section 4
   GrowDigitally · React + Tailwind CSS
───────────────────────────────────────────── */

import { useNavigate } from "react-router-dom";

/* ── Shared: Check bullet ── */
const CheckItem = ({ text }) => (
  <li className="flex items-center gap-3">
    <span className="shrink-0 w-5 h-5 rounded-full bg-[#edf7f1] flex items-center justify-center">
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path
          d="M2.5 6l2.5 2.5 4.5-5"
          stroke="#16a34a"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
    <span className="text-[15px] font-semibold text-[#1a1a2e]">{text}</span>
  </li>
);

/* ── Shared: CTA pair ── */
const CtaPair = ({ primary, secondary, scrollToSection , navigate, slug}) => (
  <div className="flex items-center gap-3 mt-8">
    <button
      className="h-11.5 px-6 bg-[#5E2CED] hover:bg-[#4a1fd4] active:scale-[0.98] text-white font-semibold text-[14px] rounded-lg border-none cursor-pointer transition-all duration-150 whitespace-nowrap"
      onClick={() => scrollToSection('hero-section')}
    >
      {primary}
    </button>
    <button
      className="h-11.5 px-5 bg-white hover:bg-[#f5f0ff] text-[#1a1a2e] font-semibold text-[14px] rounded-lg border border-[#ddd8f0] cursor-pointer transition-all duration-150"
      onClick={() => navigate(`${slug}`)}
    >
      {secondary}
    </button>
  </div>
);

/* ── Shared: Sidebar icons ── */
const SidebarIcons = ({ activeIndex = 0 }) => {
  const icons = [
    <path key="a" d="M3 12h18M3 6h18M3 18h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />,
    <><circle key="b1" cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" /><path key="b2" d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>,
    <path key="c" d="M3 12l3-4 3 2 3-5 3 3 3-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
    <><rect key="d1" x="3" y="4" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" /><path key="d2" d="M8 20h8M12 17v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>,
    <path key="e" d="M20 4L4 20M4 4l16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />,
  ];
  return (
    <div className="bg-[#1e1b2e] w-10 flex flex-col items-center py-4 gap-3 shrink-0">
      {icons.map((icon, i) => (
        <div
          key={i}
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: i === activeIndex ? "#5E2CED" : "white" }}
        >
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke={i === activeIndex ? "white" : "#6b6888"}
            aria-hidden="true"
          >
            {icon}
          </svg>
        </div>
      ))}
    </div>
  );
};

/* ── Shared: Window chrome ── */
const WindowChrome = ({ title }) => (
  <div className="bg-[#1e1b2e] px-4 py-2.5 flex items-center gap-3">
    <div className="flex gap-1.5">
      <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
      <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
      <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
    </div>
    <div className="flex items-center gap-2 ml-1">
      <div className="w-4 h-4 rounded bg-[#5E2CED] flex items-center justify-center shrink-0">
        <svg width="9" height="9" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 13C4.5 11 6 9 8 10C10 11 11 7 13 5" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <span className="text-[11px] text-[#c4bfdb] font-medium" >
        {title}
      </span>
    </div>
  </div>
);

/* ══════════════════════════════════════════
   FEATURE 1 MOCKUP — Technical SEO Audit
   (mockup right, text left — matches ref)
══════════════════════════════════════════ */
const TechnicalAuditMockup = () => {
  const auditRows = [
    { label: "Title Tag Optimisation", status: "pass", score: "100%" },
    { label: "Meta Description", status: "warn", score: "Needs fix" },
    { label: "Canonical Tags", status: "pass", score: "Correct" },
    { label: "Schema / Structured Data", status: "fail", score: "Missing" },
    { label: "Mobile Friendliness", status: "pass", score: "Passed" },
    { label: "Page Speed (Desktop)", status: "warn", score: "2.4s" },
    { label: "Broken Links", status: "pass", score: "None found" },
    { label: "XML Sitemap", status: "fail", score: "Not found" },
  ];

  const statusConfig = {
    pass: { color: "#16a34a", bg: "#dcfce7", label: "Pass" },
    warn: { color: "#d97706", bg: "#fef3c7", label: "Warning" },
    fail: { color: "#dc2626", bg: "#fee2e2", label: "Fail" },
  };

  return (
    <div
      className="rounded-2xl overflow-hidden w-full"
      style={{
        boxShadow: "0 8px 40px rgba(94,44,237,.13), 0 2px 8px rgba(0,0,0,.05)",
        border: "1px solid #ede8fc",
      }}
    >
      <WindowChrome title="Technical SEO Audit — GrowDigitally" />
      <div className="flex">
        <SidebarIcons activeIndex={0} />
        <div className="flex-1 bg-[#f9f8ff] p-4">
          <p className="text-[13px] font-bold text-[#1a1a2e] mb-0.5" >
            Technical SEO Audit
          </p>
          <p className="text-[11px] text-[#9090a8] mb-3">Detailed scan of your website's technical health</p>
          <div className="flex items-center justify-between mb-3 text-[10px] font-semibold text-[#9090a8] uppercase tracking-wider px-1">
            <span>Check</span>
            <span>Status</span>
          </div>
          {auditRows.map((row, i) => {
            const s = statusConfig[row.status];
            return (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[#ede8f5] last:border-none px-1">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="text-[12px] text-[#3a3a4a] font-medium" >
                    {row.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10.5px] font-semibold" style={{ color: s.color }}>
                    {row.score}
                  </span>
                  <span
                    className="text-[9.5px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: s.bg, color: s.color }}
                  >
                    {s.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   FEATURE 2 MOCKUP — Competitor Intelligence
   (mockup left, text right)
══════════════════════════════════════════ */
const CompetitorMockup = () => {
  const competitors = [
    { name: "competitor-a.lk", da: 48, traffic: "12.4K", keywords: 320, status: "threat" },
    { name: "competitor-b.lk", da: 41, traffic: "8.1K", keywords: 214, status: "moderate" },
    { name: "competitor-c.lk", da: 35, traffic: "5.3K", keywords: 178, status: "moderate" },
    { name: "competitor-d.lk", da: 29, traffic: "3.6K", keywords: 92, status: "low" },
  ];

  const statusMap = {
    threat: { color: "#dc2626", bg: "#fee2e2", label: "High Threat" },
    moderate: { color: "#d97706", bg: "#fef3c7", label: "Moderate" },
    low: { color: "#16a34a", bg: "#dcfce7", label: "Low Risk" },
  };

  return (
    <div
      className="rounded-2xl overflow-hidden w-full"
      style={{
        boxShadow: "0 8px 40px rgba(94,44,237,.13), 0 2px 8px rgba(0,0,0,.05)",
        border: "1px solid #ede8fc",
      }}
    >
      <WindowChrome title="Competitor Intelligence — GrowDigitally" />
      <div className="flex">
        <SidebarIcons activeIndex={1} />
        <div className="flex-1 bg-[#f9f8ff] p-4">
          <p className="text-[13px] font-bold text-[#1a1a2e] mb-0.5" >
            Top 5 Competitor Analysis
          </p>
          <p className="text-[11px] text-[#9090a8] mb-3">Your competitive landscape in Sri Lanka</p>

          <div className="grid grid-cols-4 text-[9.5px] font-semibold text-[#9090a8] uppercase tracking-wider mb-2 px-1">
            <span>Domain</span>
            <span className="text-center">DA Score</span>
            <span className="text-center">Traffic</span>
            <span className="text-right">Threat</span>
          </div>

          {competitors.map((c, i) => {
            const s = statusMap[c.status];
            return (
              <div key={i} className="grid grid-cols-4 items-center py-2.5 border-b border-[#ede8f5] last:border-none px-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-[#f0edf9] flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-bold text-[#5E2CED]">{c.name[0].toUpperCase()}</span>
                  </div>
                  <span className="text-[11px] text-[#3a3a4a] font-medium truncate" >
                    {c.name}
                  </span>
                </div>
                <div className="flex justify-center">
                  <div className="relative w-9 h-9">
                    <svg width="36" height="36" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#f0edf9" strokeWidth="3.5" />
                      <circle
                        cx="18" cy="18" r="14" fill="none"
                        stroke="#5E2CED" strokeWidth="3.5"
                        strokeDasharray={`${2 * Math.PI * 14 * (c.da / 100)} ${2 * Math.PI * 14}`}
                        strokeDashoffset={2 * Math.PI * 14 * 0.25}
                        strokeLinecap="round"
                        style={{ transform: "rotate(-90deg)", transformOrigin: "18px 18px" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-[#5E2CED]">{c.da}</span>
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[#3a3a4a] text-center" >
                  {c.traffic}
                </span>
                <div className="flex justify-end">
                  <span
                    className="text-[9.5px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: s.bg, color: s.color }}
                  >
                    {s.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   FEATURE 3 MOCKUP — On-Page & Backlink Report
   (mockup right, text left)
══════════════════════════════════════════ */
const OnPageMockup = () => {
  const pages = [
    { url: "/home", onpage: 91, backlinks: 48, status: "Healthy" },
    { url: "/services", onpage: 74, backlinks: 12, status: "Needs Work" },
    { url: "/about-us", onpage: 83, backlinks: 31, status: "Good" },
    { url: "/contact", onpage: 65, backlinks: 4, status: "Weak" },
  ];

  const statusColor = {
    Healthy: "#16a34a",
    Good: "#5E2CED",
    "Needs Work": "#d97706",
    Weak: "#dc2626",
  };

  return (
    <div
      className="rounded-2xl overflow-hidden w-full"
      style={{
        boxShadow: "0 8px 40px rgba(94,44,237,.13), 0 2px 8px rgba(0,0,0,.05)",
        border: "1px solid #ede8fc",
      }}
    >
      <WindowChrome title="On-Page & Backlink Report — GrowDigitally" />
      <div className="flex">
        <SidebarIcons activeIndex={2} />
        <div className="flex-1 bg-[#f9f8ff] p-4">
          <p className="text-[13px] font-bold text-[#1a1a2e] mb-0.5" >
            Top-Performing Pages
          </p>
          <p className="text-[11px] text-[#9090a8] mb-3">On-page scores & backlink profile for key URLs</p>

          <div className="grid grid-cols-4 text-[9.5px] font-semibold text-[#9090a8] uppercase tracking-wider mb-2 px-1">
            <span className="col-span-2">Page URL</span>
            <span className="text-center">On-Page</span>
            <span className="text-right">Backlinks</span>
          </div>

          {pages.map((p, i) => (
            <div key={i} className="grid grid-cols-4 items-center py-2.5 border-b border-[#ede8f5] last:border-none px-1">
              <div className="col-span-2 flex items-center gap-1.5">
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M6 7a3 3 0 105 2.24" stroke="#9090a8" strokeWidth="1.3" strokeLinecap="round" />
                  <path d="M9 4a3 3 0 11-5 2.24" stroke="#9090a8" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <span className="text-[11px] text-[#5E2CED] font-medium" >
                  {p.url}
                </span>
                <span
                  className="text-[9px] font-bold ml-1 px-1.5 py-0.5 rounded"
                  style={{ background: `${statusColor[p.status]}18`, color: statusColor[p.status] }}
                >
                  {p.status}
                </span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <div className="w-12 h-1.5 rounded-full bg-[#ede8f5] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${p.onpage}%`, background: p.onpage >= 85 ? "#16a34a" : p.onpage >= 70 ? "#d97706" : "#dc2626" }}
                  />
                </div>
                <span className="text-[10.5px] font-bold text-[#3a3a4a]">{p.onpage}</span>
              </div>
              <div className="flex items-center justify-end gap-1">
                <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M3 11l8-8M8 3h3v3" stroke="#5E2CED" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[11px] font-bold text-[#5E2CED]">{p.backlinks}</span>
              </div>
            </div>
          ))}

          {/* Spam score footer */}
          <div className="mt-3 flex items-center justify-between bg-[#f5f0ff] rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[#5E2CED] flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle cx="7" cy="7" r="5" stroke="white" strokeWidth="1.5" />
                  <path d="M7 4v4M7 9.5v.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-[11px] font-semibold text-[#1a1a2e]" >
                Backlink Spam Score
              </span>
            </div>
            <span className="text-[11px] font-bold text-[#16a34a]">Low — 4%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   FEATURES SECTION — Full Component
══════════════════════════════════════════ */
const FeaturesSection = ({scrollToSection}) => {

  const navigate = useNavigate();

  const features = [
    {
      layout: "text-left",
      tag: "Technical SEO Audit",
      title: "Find & Fix Every Technical Issue Holding You Back",
      description:
        "Our audit engine scans 70+ technical SEO factors — from indexing and crawlability to page speed and structured data. Every issue is flagged, explained, and prioritised for easy action.",
      bullets: [
        "Scan entire website for indexing & crawl issues",
        "Identify speed bottlenecks on mobile and desktop",
        "Detect missing structured data and schema gaps",
      ],
      primaryCta: "Run Your Audit",
      link: "technical-seo-audit",
      secondaryCta: "Learn more",
      mockup: <TechnicalAuditMockup />,
    },
    {
      layout: "text-right",
      tag: "Competitor Intelligence",
      title: "See Exactly How You Stack Up Against Competitors",
      description:
        "Automatically surfaces your top 5 competitors, their domain authority, traffic estimates, and keyword overlaps. Spot gaps and opportunities before your rivals do.",
      bullets: [
        "Analyse top 5 competitors in your market",
        "Compare domain authority and backlink profiles",
        "Uncover keyword gaps and traffic opportunities",
      ],
      primaryCta: "Analyse Competitors",
      link: "competitor-intelligence",
      secondaryCta: "Learn more",
      mockup: <CompetitorMockup />,
    },
    {
      layout: "text-left",
      tag: "On-Page & Backlink Report",
      title: "Optimise Every Page. Build Authority That Lasts.",
      description:
        "Evaluate title tags, meta descriptions, heading structure, and internal linking across your top pages. Plus a full backlink profile with spam score analysis to protect your domain authority.",
      bullets: [
        "Score on-page elements for every key page",
        "Evaluate backlink quality and spam risk",
        "Identify top-performing pages and link opportunities",
      ],
      primaryCta: "Check Your Pages",
      link: "on-page-optimisation",
      secondaryCta: "Learn more",
      mockup: <OnPageMockup />,
    },
  ];

  return (
    <section
      className="w-full bg-[#faf9ff] py-20"
      
    >
      {/* Section header */}
      <div className="text-center mb-16 px-6">
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="w-5 border-t border-[#5E2CED]" />
          <span className="text-[11.5px] font-bold tracking-widest text-[#5E2CED] uppercase">
            Find &amp; Fix SEO Issues in Minutes, Not Weeks
          </span>
          <span className="w-5 border-t border-[#5E2CED]" />
        </div>
        <h2 className="text-4xl md:text-[54px] font-extrabold text-[#1a1a2e] leading-[1.12] tracking-[-1px] mb-4">
          GrowDigitally's Audit Features
        </h2>
        <p className="text-[15px] text-[#5a5a74] leading-[1.7] max-w-150 mx-auto">
          Complete SEO intelligence without the chaos. Audit 70+ technical factors, analyse your top competitors, score every page, and get a WhatsApp-delivered report reviewed by our experts.
        </p>
      </div>

      {/* Feature blocks */}
      <div className="flex flex-col gap-24 px-36">
        {features.map((f, i) => (
          <div
            key={i}
            className={`max-w-7xl mx-auto w-full grid grid-cols-2 gap-14 items-center ${
              f.layout === "text-right" ? "" : ""
            }`}
          >
            {/* Text side */}
            {f.layout === "text-left" && (
              <>
                <div>
                  <span className="inline-block text-[11px] font-bold tracking-[0.08em] text-[#5E2CED] uppercase bg-[#f0edf9] px-3 py-1 rounded-full mb-4">
                    {f.tag}
                  </span>
                  <h3 className="text-[28px] font-extrabold text-[#1a1a2e] leading-[1.2] tracking-[-0.5px] mb-4">
                    {f.title}
                  </h3>
                  <p className="text-[15px] text-[#5a5a74] leading-[1.7] mb-6">{f.description}</p>
                  <ul className="flex flex-col gap-3 list-none p-0 m-0">
                    {f.bullets.map((b, j) => <CheckItem key={j} text={b} />)}
                  </ul>
                  <CtaPair primary={f.primaryCta} secondary={f.secondaryCta} scrollToSection={scrollToSection} slug={f.link} navigate={(link) => navigate(`/services/${link}`)} />
                </div>
                <div className="relative">
                  <div
                    className="absolute -top-8 -right-8 w-72 h-72 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(94,44,237,0.07) 0%, transparent 70%)" }}
                  />
                  {f.mockup}
                </div>
              </>
            )}

            {/* Flipped: mockup left, text right */}
            {f.layout === "text-right" && (
              <>
                <div className="relative">
                  <div
                    className="absolute -top-8 -left-8 w-72 h-72 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(94,44,237,0.07) 0%, transparent 70%)" }}
                  />
                  {f.mockup}
                </div>
                <div>
                  <span className="inline-block text-[11px] font-bold tracking-[0.08em] text-[#5E2CED] uppercase bg-[#f0edf9] px-3 py-1 rounded-full mb-4">
                    {f.tag}
                  </span>
                  <h3 className="text-[28px] font-extrabold text-[#1a1a2e] leading-[1.2] tracking-[-0.5px] mb-4">
                    {f.title}
                  </h3>
                  <p className="text-[15px] text-[#5a5a74] leading-[1.7] mb-6">{f.description}</p>
                  <ul className="flex flex-col gap-3 list-none p-0 m-0">
                    {f.bullets.map((b, j) => <CheckItem key={j} text={b} />)}
                  </ul>
                  <CtaPair primary={f.primaryCta} secondary={f.secondaryCta} scrollToSection={(data) => scrollToSection(data)} navigate={(link) => navigate(`/services/${link}`)} slug={f.link} />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;