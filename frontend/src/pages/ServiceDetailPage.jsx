import { useParams } from 'react-router-dom';
import { getServiceBySlug } from '../util/ServiceData.js';

/* ══════════════════════════════════════════════════════
   SHARED SUB-COMPONENTS
══════════════════════════════════════════════════════ */

/* ── Stars ── */
const Stars = () => (
  <div className="flex items-center gap-0.5 mb-4">
    {[...Array(5)].map((_, i) => (
      <svg key={i} width="13" height="13" viewBox="0 0 16 16" fill="#5E2CED" aria-hidden="true">
        <path d="M8 1l1.85 3.75L14 5.35l-3 2.92.71 4.13L8 10.25l-3.71 2.15L5 8.27 2 5.35l4.15-.6L8 1z" />
      </svg>
    ))}
  </div>
);

/* ── Review card ── */
const ReviewCard = ({ quote, name, role, company, initials, avatarBg, avatarColor }) => (
  <div
    className="bg-white rounded-2xl border border-[#ede8f5] p-6 flex flex-col justify-between hover:border-[#c4b5f7] hover:shadow-[0_4px_24px_rgba(94,44,237,0.08)] transition-all duration-200"
    
  >
    <div className="flex-1">
      <Stars />
      <p className="text-[14px] text-[#3a3a4a] leading-[1.72] m-0">{quote}</p>
    </div>
    <div className="border-t border-[#f0edf9] my-5" />
    <div className="flex items-center gap-3">
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold"
        style={{ background: avatarBg, color: avatarColor }}
      >
        {initials}
      </div>
      <div>
        <p className="text-[13.5px] font-bold text-[#1a1a2e] m-0 leading-tight">{name}</p>
        <p className="text-[12px] text-[#9090a8] m-0 mt-0.5">
          {role}{company ? ` · ${company}` : ""}
        </p>
      </div>
    </div>
  </div>
);

/* ── Mini Dashboard Mockup (hero right side) ── */
const HeroDashboardMockup = ({ service }) => {
  const checks = [
    { label: "Title Tags", status: "pass" },
    { label: "Meta Descriptions", status: "warn" },
    { label: "Schema Markup", status: "fail" },
    { label: "Page Speed", status: "warn" },
    { label: "Crawlability", status: "pass" },
    { label: "Backlinks", status: "pass" },
  ];
  const statusStyle = {
    pass: { bg: "#dcfce7", color: "#16a34a", label: "Pass" },
    warn: { bg: "#fef3c7", color: "#d97706", label: "Warning" },
    fail: { bg: "#fee2e2", color: "#dc2626", label: "Fail" },
  };
  return (
    <div
      className="rounded-2xl overflow-hidden w-full max-w-130"
      style={{
        boxShadow: "0 8px 48px rgba(94,44,237,0.14), 0 2px 12px rgba(0,0,0,0.06)",
        border: "1px solid #ede8fc",
        
      }}
    >
      {/* Topbar */}
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
          <span className="text-[11px] text-[#c4bfdb] font-medium">{service.categoryLabel} — GrowDigitally</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex">
        {/* Sidebar */}
        <div className="bg-[#1e1b2e] w-10 flex flex-col items-center py-4 gap-3 shrink-0">
          {[true, false, false, false, false].map((active, i) => (
            <div key={i} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: active ? "#5E2CED" : "transparent" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : "#6b6888"} strokeWidth="2" aria-hidden="true">
                {i === 0 && <path d="M3 12h18M3 6h18M3 18h12" strokeLinecap="round" />}
                {i === 1 && <><circle cx="12" cy="12" r="4" /><path d="M12 8v8M8 12h8" strokeLinecap="round" /></>}
                {i === 2 && <path d="M3 12l3-4 3 2 3-5 3 3" strokeLinecap="round" strokeLinejoin="round" />}
                {i === 3 && <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 20h8M12 17v3" strokeLinecap="round" /></>}
                {i === 4 && <path d="M20 4L4 20M4 4l16 16" strokeLinecap="round" />}
              </svg>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-[#f9f8ff] p-4">
          {/* Score header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[12.5px] font-bold text-[#1a1a2e] m-0">yourbusiness.lk</p>
              <p className="text-[10.5px] text-[#9090a8] m-0">{service.categoryLabel}</p>
            </div>
            <div className="relative w-12 h-12 shrink-0">
              <svg width="48" height="48" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="18" fill="none" stroke="#ede8fc" strokeWidth="4.5" />
                <circle cx="24" cy="24" r="18" fill="none" stroke="#5E2CED" strokeWidth="4.5"
                  strokeDasharray="88 113"
                  strokeDashoffset="28"
                  strokeLinecap="round"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "24px 24px" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[11px] font-extrabold text-[#5E2CED] leading-none">78</span>
                <span className="text-[8px] text-[#9090a8]">/100</span>
              </div>
            </div>
          </div>

          {/* Check rows */}
          <div className="flex items-center justify-between text-[9.5px] font-semibold text-[#9090a8] uppercase tracking-wider mb-2 px-1">
            <span>Check</span>
            <span>Status</span>
          </div>
          {checks.map((c, i) => {
            const s = statusStyle[c.status];
            return (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[#ede8f5] last:border-none px-1">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="text-[11.5px] text-[#3a3a4a] font-medium">{c.label}</span>
                </div>
                <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   PAGE SECTIONS
══════════════════════════════════════════════════════ */

/* ── 1. HERO ── */
const HeroSection = ({ service }) => (
  <section
    className="w-full bg-[#faf9ff] pt-16 pb-10 md:px-36"
    
  >
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb pill */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="flex items-center gap-2 border border-[#e0d8fb] bg-[#f5f0ff] rounded-full px-4 py-1.5">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6" stroke="#5E2CED" strokeWidth="1.5" />
            <circle cx="8" cy="8" r="2.5" fill="#5E2CED" />
          </svg>
          <span className="text-[10.5px] font-bold tracking-widest text-[#5E2CED] uppercase">
            {service.category}
          </span>
          <span className="text-[#c4b5f7]">·</span>
          <span className="text-[10.5px] font-bold tracking-[0.08em] text-[#5E2CED] uppercase">
            {service.categoryLabel}
          </span>
        </div>
      </div>

      {/* Centered headline */}
      <div className="text-center max-w-190 mx-auto mb-10">
        <h1 className="text-4xl md:text-[54px] font-extrabold text-[#1a1a2e] leading-[1.1] tracking-[-1.5px] mb-5">
          {service.heroHeadline}
        </h1>
        <p className="text-[15px] text-[#5a5a74] leading-[1.7] mb-8">
          {service.heroSubheadline}
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <button
            className="h-12.5 px-8 bg-[#5E2CED] hover:bg-[#4a1fd4] active:scale-[0.98] text-white font-bold text-[15px] rounded-xl border-none cursor-pointer transition-all duration-150"
          >
            {service.heroPrimaryCta}
          </button>
          <button
            className="h-12.5 px-7 bg-white hover:bg-[#f5f0ff] text-[#1a1a2e] font-semibold text-[15px] rounded-xl border border-[#ddd8f0] cursor-pointer transition-all duration-150"
          >
            {service.heroSecondaryCta}
          </button>
        </div>

        {/* Trust badge */}
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center">
            {[
              { bg: "#e0d8fb", color: "#5E2CED", i: "AK" },
              { bg: "#d8f5eb", color: "#0f6e56", i: "SM" },
              { bg: "#fde8d8", color: "#993c1d", i: "NP" },
              { bg: "#dbeafe", color: "#1e40af", i: "RJ" },
            ].map((a, idx) => (
              <div key={idx} className="w-7 h-7 rounded-full border-2 border-[#faf9ff] flex items-center justify-center text-[9px] font-bold shrink-0"
                style={{ background: a.bg, color: a.color, marginLeft: idx === 0 ? 0 : "-8px", zIndex: 4 - idx, position: "relative" }}>
                {a.i}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="11" height="11" viewBox="0 0 16 16" fill="#5E2CED" aria-hidden="true">
                <path d="M8 1l1.85 3.75L14 5.35l-3 2.92.71 4.13L8 10.25l-3.71 2.15L5 8.27 2 5.35l4.15-.6L8 1z" />
              </svg>
            ))}
          </div>
          <span className="text-[13px] font-semibold text-[#3a3a4a]">{service.heroTrustText}</span>
        </div>
      </div>

      {/* Dashboard mockup — centered */}
      <div className="flex justify-center">
        <HeroDashboardMockup service={service} />
      </div>
    </div>
  </section>
);

/* ── 2. PROBLEM BLOCK ── */
const ProblemSection = ({ service }) => (
  <section
    className="w-full bg-white py-20 px-12"
    
  >
    <div className="max-w-180 mx-auto">
      {/* Tag pill */}
      <div className="inline-flex items-center gap-2 border border-[#e0d8fb] bg-[#f5f0ff] rounded-full px-4 py-1.5 mb-6">
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="6" stroke="#5E2CED" strokeWidth="1.5" />
          <circle cx="8" cy="8" r="2" fill="#5E2CED" />
        </svg>
        <span className="text-[10px] font-bold tracking-widest text-[#5E2CED] uppercase">
          {service.problemTag}
        </span>
      </div>

      {/* Headline */}
      <h2 className="text-[32px] font-extrabold text-[#1a1a2e] leading-[1.2] tracking-[-0.8px] mb-5">
        {service.problemHeadline}
      </h2>

      {/* Body */}
      <p className="text-[16px] text-[#5a5a74] leading-[1.75] m-0">
        {service.problemBody}
      </p>
    </div>
  </section>
);

/* ── 3. WHAT WE GIVE ── */
const WhatWeGiveSection = ({ service }) => (
  <section
    className="w-full bg-[#faf9ff] py-20 px-12"
    
  >
    <div className="max-w-180 mx-auto">
      {/* Tag */}
      <div className="inline-flex items-center gap-2 border border-[#e0d8fb] bg-[#f5f0ff] rounded-full px-4 py-1.5 mb-6">
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="6" stroke="#5E2CED" strokeWidth="1.5" />
          <circle cx="8" cy="8" r="2" fill="#5E2CED" />
        </svg>
        <span className="text-[10px] font-bold tracking-widest text-[#5E2CED] uppercase">
          {service.whatWeGiveTag}
        </span>
      </div>

      {/* Headline */}
      <h2 className="text-[30px] font-extrabold text-[#1a1a2e] leading-[1.2] tracking-[-0.8px] mb-10">
        {service.whatWeGiveHeadline}
      </h2>

      {/* Feature items */}
      <div className="flex flex-col gap-0 divide-y divide-[#f0edf9]">
        {service.whatWeGiveItems.map((item, i) => (
          <div key={i} className="py-7 first:pt-0 last:pb-0">
            <h3 className="text-[16.5px] font-bold text-[#1a1a2e] mb-2">{item.title}</h3>
            <p className="text-[15px] text-[#5a5a74] leading-[1.7] m-0">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ── 4. USE CASES ── */
const UseCasesSection = ({ service }) => (
  <section
    className="w-full bg-white py-20 px-12"
    
  >
    <div className="max-w-180 mx-auto">
      {/* Tag */}
      <div className="inline-flex items-center gap-2 border border-[#e0d8fb] bg-[#f5f0ff] rounded-full px-4 py-1.5 mb-10">
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="6" stroke="#5E2CED" strokeWidth="1.5" />
          <circle cx="8" cy="8" r="2" fill="#5E2CED" />
        </svg>
        <span className="text-[10px] font-bold tracking-widest text-[#5E2CED] uppercase">
          WHO IT'S FOR
        </span>
      </div>

      {/* Use case list */}
      <div className="flex flex-col gap-7">
        {service.useCases.map((uc, i) => (
          <div key={i}>
            <h3 className="text-[16px] font-bold text-[#1a1a2e] mb-1">{uc.audience}</h3>
            <p className="text-[14.5px] text-[#5a5a74] leading-[1.65] mb-2">{uc.description}</p>
            <button
              className="flex items-center gap-1.5 text-[13px] font-semibold text-[#5E2CED] bg-transparent border-none cursor-pointer p-0 hover:underline underline-offset-2 transition-all duration-150"
            >
              {uc.linkLabel}
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 8h8M9 5l3 3-3 3" stroke="#5E2CED" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ── 5. CTA BANNER ── */
const CtaBanner = ({ service }) => (
  <section className="w-full px-12 py-10 bg-[#faf9ff]" >
    <div
      className="max-w-7xl mx-auto rounded-2xl flex flex-col items-center justify-center text-center py-14 px-8 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1e1b2e 0%, #2d1a5e 50%, #1e1b2e 100%)" }}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(94,44,237,0.3) 0%, transparent 65%)" }}
      />
      <h2 className="relative text-[30px] font-extrabold text-white leading-[1.2] tracking-[-0.8px] mb-6 max-w-130">
        {service.ctaHeadline}
      </h2>
      <button
        className="relative h-12.5 px-8 bg-[#5E2CED] hover:bg-[#4a1fd4] active:scale-[0.98] text-white font-bold text-[15px] rounded-xl border-none cursor-pointer transition-all duration-150"
      >
        {service.ctaButtonLabel}
      </button>
    </div>
  </section>
);

/* ── 6. REVIEWS ── */
const ReviewsSection = ({ service }) => (
  <section
    className="w-full bg-[#faf9ff] py-20 px-12"
    
  >
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-[34px] font-extrabold text-[#1a1a2e] leading-[1.1] tracking-[-1px] mb-4">
          Customer Reviews
        </h2>
        <p className="text-[15.5px] text-[#5a5a74] max-w-120 mx-auto leading-[1.65]">
          See why Sri Lankan businesses trust GrowDigitally to uncover their SEO opportunities.
        </p>
      </div>
      {/* 3-col grid */}
      <div className="grid grid-cols-3 gap-5">
        {service.reviews.map((r, i) => (
          <ReviewCard key={i} {...r} />
        ))}
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════
   SERVICE DETAIL PAGE — MAIN COMPONENT
   Usage with React Router: 
     const { slug } = useParams();
     <ServiceDetailPage slug={slug} />
   
   Usage standalone:
     <ServiceDetailPage slug="technical-seo-audit" />
══════════════════════════════════════════════════════ */
const ServiceDetailPage = () => {
    const { slug: routeSlug } = useParams();
  const service = getServiceBySlug(routeSlug);

  /* ── 404 fallback ── */
  if (!service) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-[#faf9ff] gap-4"
        
      >
        <div className="w-16 h-16 rounded-2xl bg-[#f5f0ff] flex items-center justify-center mb-2">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="#5E2CED" strokeWidth="1.8" />
            <path d="M12 7v6M12 15.5v.5" stroke="#5E2CED" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="text-[28px] font-extrabold text-[#1a1a2e] tracking-tight">Service not found</h1>
        <p className="text-[15px] text-[#5a5a74]">The slug "{slug}" doesn't match any service.</p>
        <a href="/"
          className="mt-2 h-11 px-6 bg-[#5E2CED] text-white font-semibold text-[14px] rounded-lg flex items-center no-underline"
        >
          Back to Home
        </a>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#faf9ff]" >
      <HeroSection service={service} />
      <ProblemSection service={service} />
      <WhatWeGiveSection service={service} />
      <UseCasesSection service={service} />
      <CtaBanner service={service} />
      <ReviewsSection service={service} />
    </div>
  );
};

export default ServiceDetailPage;