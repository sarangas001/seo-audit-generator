const stats = [
  { value: "+500", label: "BUSINESSES AUDITED" },
  { value: "+5", label: "YEARS OF SEO EXCELLENCE" },
  { value: "+10K", label: "KEYWORDS TRACKED" },
  { value: "9", label: "AUDIT COMPONENTS" },
  { value: "+70", label: "TECHNICAL SEO FACTORS" },
  { value: "Sri Lanka", label: "MARKET FOCUS" },
];

const useCases = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" stroke="#5E2CED" strokeWidth="1.8" />
        <path d="M8 21h8M12 17v4" stroke="#5E2CED" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    title: "For Small Businesses",
    description:
      "Identify quick wins, fix critical SEO gaps, and grow organic traffic without a dedicated marketing team.",
    link: "About Small Businesses",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 12l3-4 3 2 3-5 3 3 3-2"
          stroke="#5E2CED"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M3 20h18" stroke="#5E2CED" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    title: "For Digital Agencies",
    description:
      "Deliver branded SEO audit reports to clients. Multi-site management with white-label ready outputs.",
    link: "About Digital Agencies",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="8" r="4" stroke="#5E2CED" strokeWidth="1.8" />
        <path
          d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
          stroke="#5E2CED"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "For E-commerce Brands",
    description:
      "Audit product pages, fix indexing issues, track ranking keywords and outperform competitors in search.",
    link: "About E-commerce Brands",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2L2 7l10 5 10-5-10-5z"
          stroke="#5E2CED"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M2 17l10 5 10-5M2 12l10 5 10-5"
          stroke="#5E2CED"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "For Startups",
    description:
      "Get a full SEO health check from day one. Build on a solid foundation and rank faster from launch.",
    link: "About Startups",
  },
];

const StatsSection = () => {
  return (
    <section
      className="w-full bg-white py-20 px-36"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-[1fr_380px] gap-16 items-start">

        {/* ── LEFT COLUMN ── */}
        <div>
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-5">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="6" stroke="#5E2CED" strokeWidth="1.5" />
              <circle cx="8" cy="8" r="2.5" fill="#5E2CED" />
            </svg>
            <span className="text-[11.5px] font-bold tracking-widest text-[#5E2CED] uppercase">
              Smarter Insights. Better Rankings. Zero Guesswork.
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-[40px] font-extrabold text-[#1a1a2e] leading-[1.12] tracking-[-1px] mb-5 max-w-145">
            GrowDigitally helps you rank higher on Google and get found online.
          </h2>

          {/* Description */}
          <p className="text-[15.5px] text-[#5a5a74] leading-[1.7] max-w-140 mb-10">
            Our automated SEO audit catches issues fast. Competitor intelligence shows exactly
            where you stand. A detailed report — covering 9 key SEO components — gets delivered
            straight to your WhatsApp after expert review.
          </p>

          {/* Stats grid — 3 cols × 2 rows with left border dividers */}
          <div className="grid grid-cols-3 mb-10">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="py-5 pr-6"
                style={{
                  borderLeft: "3px solid #5E2CED",
                  marginLeft: i % 3 !== 0 ? "0" : "0",
                  paddingLeft: "20px",
                  borderBottom: i < 3 ? "1px solid #f0edf9" : "none",
                  paddingBottom: i < 3 ? "20px" : "0",
                  paddingTop: i >= 3 ? "20px" : "0",
                }}
              >
                <p className="text-[32px] font-extrabold text-[#5E2CED] leading-none mb-1.5 tracking-[-1px]">
                  {stat.value}
                </p>
                <p className="text-[10.5px] font-semibold tracking-widest text-[#9090a8] uppercase m-0">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <button
              className="h-11.5 px-6 bg-[#5E2CED] hover:bg-[#4a1fd4] active:scale-[0.98] text-white font-semibold text-[14px] rounded-lg border-none cursor-pointer transition-all duration-150"
              
            >
              Get Free Audit
            </button>
            <button
              className="h-11.5 px-6 bg-white hover:bg-[#f5f0ff] text-[#1a1a2e] font-semibold text-[14px] rounded-lg border border-[#ddd8f0] cursor-pointer transition-all duration-150"
              
            >
              Learn More
            </button>
          </div>
        </div>

        {/* ── RIGHT COLUMN — Use Cases ── */}
        <div className="flex flex-col gap-0 divide-y divide-[#f0edf9]">
          {useCases.map((item, i) => (
            <div key={i} className="py-5 first:pt-0 last:pb-0 group">
              <div className="flex items-start gap-3 mb-2">
                {/* Icon box */}
                <div className="w-9 h-9 rounded-lg bg-[#f5f0ff] flex items-center justify-center shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div>
                  <p className="text-[14.5px] font-bold text-[#1a1a2e] mb-1">{item.title}</p>
                  <p className="text-[13px] text-[#5a5a74] leading-[1.6] m-0">
                    {item.description}
                  </p>
                </div>
              </div>
              <button
                className="ml-12 flex items-center gap-1 text-[12.5px] font-semibold text-[#5E2CED] bg-transparent border-none cursor-pointer p-0 hover:gap-2 transition-all duration-150"
                
              >
                {item.link}
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M4 8h8M9 5l3 3-3 3"
                    stroke="#5E2CED"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default StatsSection;