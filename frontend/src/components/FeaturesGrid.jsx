/* ── SVG Icons for each card ── */
const icons = {
  executive: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="#5E2CED" strokeWidth="1.8" />
      <path d="M7 12h2l2-4 2 6 2-4h2" stroke="#5E2CED" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  competitor: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="5" stroke="#5E2CED" strokeWidth="1.8" />
      <circle cx="17" cy="15" r="4" stroke="#5E2CED" strokeWidth="1.8" strokeDasharray="2.5 2" />
      <path d="M13 9h4M15 7v4" stroke="#5E2CED" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  onpage: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9l-6-6z" stroke="#5E2CED" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M14 3v6h6M8 13h8M8 17h5" stroke="#5E2CED" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  performance: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#5E2CED" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  ),
  backlinks: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="#5E2CED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="#5E2CED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  technical: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="#5E2CED" strokeWidth="1.8" />
      <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="#5E2CED" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
};

/* ── Check bullet ── */
const CheckItem = ({ text }) => (
  <li className="flex items-center gap-2.5">
    <span
      className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
      style={{ background: "#edf7f1" }}
    >
      <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path
          d="M2 6l2.5 2.5 5.5-5"
          stroke="#16a34a"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
    <span
      className="text-[13px] text-[#3a3a4a] font-medium"
      
    >
      {text}
    </span>
  </li>
);

/* ── Single Feature Card ── */
const FeatureCard = ({ icon, title, description, bullets, linkLabel }) => (
  <div
    className="bg-white rounded-2xl border border-[#ede8f5] p-6 flex flex-col gap-4 hover:border-[#c4b5f7] hover:shadow-[0_4px_24px_rgba(94,44,237,0.08)] transition-all duration-200"
    
  >
    {/* Icon + Title */}
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-[#f5f0ff] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <h3 className="text-[15px] font-bold text-[#1a1a2e] leading-tight m-0">
        {title}
      </h3>
    </div>

    {/* Description */}
    <p className="text-[13.5px] text-[#5a5a74] leading-[1.65] m-0">
      {description}
    </p>

    {/* Divider */}
    <div className="border-t border-[#f0edf9]" />

    {/* Bullets */}
    <ul className="flex flex-col gap-2.5 list-none p-0 m-0 flex-1">
      {bullets.map((b, i) => (
        <CheckItem key={i} text={b} />
      ))}
    </ul>

    {/* More link */}
    <button
      className="flex items-center gap-1.5 text-[13px] font-semibold text-[#5E2CED] bg-transparent border-none cursor-pointer p-0 mt-1 group w-fit"
      
    >
      <span className="group-hover:underline">More on {linkLabel}</span>
      <svg
        width="13" height="13" viewBox="0 0 16 16" fill="none"
        className="transition-transform duration-150 group-hover:translate-x-0.5"
        aria-hidden="true"
      >
        <path
          d="M4 8h8M9 5l3 3-3 3"
          stroke="#5E2CED"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  </div>
);

/* ── Features data ── */
const features = [
  {
    icon: icons.executive,
    title: "Executive Summary",
    description:
      "A clear, at-a-glance overview of your website's overall SEO health with an AI-driven visibility score.",
    bullets: [
      "Overall SEO score out of 100",
      "AI visibility index breakdown",
      "Passed, failed & warning counts",
    ],
    linkLabel: "Executive Summary",
  },
  {
    icon: icons.competitor,
    title: "Competitor Intelligence",
    description:
      "Automatically identify and analyse the top 5 competitors in your niche and see how you compare.",
    bullets: [
      "Domain authority comparison",
      "Traffic & keyword gap analysis",
      "Identify threats and opportunities",
    ],
    linkLabel: "Competitor Intelligence",
  },
  {
    icon: icons.onpage,
    title: "On-Page Optimisation",
    description:
      "Deep evaluation of your title tags, meta descriptions, heading structure, and internal linking.",
    bullets: [
      "Title tag & meta description audit",
      "Heading hierarchy analysis",
      "Internal link structure review",
    ],
    linkLabel: "On-Page Optimisation",
  },
  {
    icon: icons.performance,
    title: "Performance Metrics",
    description:
      "Measure real-world page speed and core web vitals for both mobile and desktop environments.",
    bullets: [
      "Mobile & desktop speed scores",
      "Core Web Vitals assessment",
      "Actionable speed improvement tips",
    ],
    linkLabel: "Performance Metrics",
  },
  {
    icon: icons.backlinks,
    title: "Backlink Profile",
    description:
      "Evaluate your current backlink portfolio — quality, authority, and a comprehensive spam score check.",
    bullets: [
      "Total backlinks & referring domains",
      "Domain authority evaluation",
      "Spam score & toxic link detection",
    ],
    linkLabel: "Backlink Profile",
  },
  {
    icon: icons.technical,
    title: "Technical SEO Audit",
    description:
      "An in-depth scan of indexing, crawlability, structured data, and site architecture issues.",
    bullets: [
      "Crawlability & indexing check",
      "Schema / structured data scan",
      "Sitemap & robots.txt validation",
    ],
    linkLabel: "Technical SEO Audit",
  },
];

/* ══════════════════════════════════════════
   FEATURES GRID SECTION
══════════════════════════════════════════ */
const FeaturesGrid = () => {
  return (
    <section
      className="w-full bg-[#faf9ff] py-20 px-36"
      
    >
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <div className="mb-12">
          <h2 className="text-[32px] font-extrabold text-[#1a1a2e] tracking-[-0.8px] mb-0">
            What's Inside Your Audit Report
          </h2>
        </div>

        {/* 3×2 Card Grid */}
        <div className="grid grid-cols-3 gap-5">
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeaturesGrid;