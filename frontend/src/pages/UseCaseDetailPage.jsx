
import { useParams } from "react-router-dom";
import { getUseCaseBySlug } from "../util/UseCasesData.js";

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

/* ── Tag pill ── */
// const TagPill = ({ label }) => (
//   <div className="inline-flex items-center gap-2 border border-[#e0d8fb] bg-[#f5f0ff] rounded-full px-4 py-1.5 mb-6">
//     <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
//       <circle cx="8" cy="8" r="6" stroke="#5E2CED" strokeWidth="1.5" />
//       <circle cx="8" cy="8" r="2" fill="#5E2CED" />
//     </svg>
//     <span className="text-[10px] font-bold tracking-widest text-[#5E2CED] uppercase">{label}</span>
//   </div>
// );

/* ── Review card ── */
const ReviewCard = ({ quote, name, role, company, initials, avatarBg, avatarColor }) => (
  <div className="bg-white rounded-2xl border border-[#ede8f5] p-6 flex flex-col justify-between hover:border-[#c4b5f7] hover:shadow-[0_4px_24px_rgba(94,44,237,0.08)] transition-all duration-200" >
    <div className="flex-1">
      <Stars />
      <p className="text-[13.5px] text-[#3a3a4a] leading-[1.72] m-0">{quote}</p>
    </div>
    <div className="border-t border-[#f0edf9] my-5" />
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold" style={{ background: avatarBg, color: avatarColor }}>
        {initials}
      </div>
      <div>
        <p className="text-[13.5px] font-bold text-[#1a1a2e] m-0 leading-tight">{name}</p>
        <p className="text-[12px] text-[#9090a8] m-0 mt-0.5">{role}{company ? ` · ${company}` : ""}</p>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════
   SECTION 1 — HERO
══════════════════════════════════════════════════════ */
const HeroSection = ({ uc }) => (
  <section className="w-full bg-[#faf9ff] pt-14 pb-0 px-12" >
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb pill */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center gap-2 border border-[#e0d8fb] bg-[#f5f0ff] rounded-full px-4 py-1.5">
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6" stroke="#5E2CED" strokeWidth="1.5" />
            <circle cx="8" cy="8" r="2.5" fill="#5E2CED" />
          </svg>
          <span className="text-[10px] font-bold tracking-widest text-[#5E2CED] uppercase">{uc.category}</span>
          <span className="text-[#c4b5f7]">·</span>
          <span className="text-[10px] font-bold tracking-[0.08em] text-[#5E2CED] uppercase">{uc.categoryLabel}</span>
        </div>
      </div>

      {/* Centered headline */}
      <div className="text-center max-w-195 mx-auto mb-8">
        <h1 className="text-[44px] font-extrabold text-[#1a1a2e] leading-[1.1] tracking-[-1.5px] mb-5">
          {uc.heroHeadline}
        </h1>
        <p className="text-[16.5px] text-[#5a5a74] leading-[1.7] mb-8">{uc.heroSubheadline}</p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <button className="h-12.5 px-8 bg-[#5E2CED] hover:bg-[#4a1fd4] active:scale-[0.98] text-white font-bold text-[15px] rounded-xl border-none cursor-pointer transition-all duration-150" >
            {uc.heroPrimaryCta}
          </button>
          <button className="h-12.5 px-7 bg-white hover:bg-[#f5f0ff] text-[#1a1a2e] font-semibold text-[15px] rounded-xl border border-[#ddd8f0] cursor-pointer transition-all duration-150" >
            {uc.heroSecondaryCta}
          </button>
        </div>

        {/* Trust row */}
        <div className="flex items-center justify-center gap-2">
          <div className="flex">
            {[
              { bg: "#e0d8fb", c: "#5E2CED", i: "AK" },
              { bg: "#d8f5eb", c: "#0f6e56", i: "SM" },
              { bg: "#fde8d8", c: "#993c1d", i: "NP" },
              { bg: "#dbeafe", c: "#1e40af", i: "RJ" },
            ].map((a, idx) => (
              <div key={idx} className="w-7 h-7 rounded-full border-2 border-[#faf9ff] flex items-center justify-center text-[9px] font-bold shrink-0"
                style={{ background: a.bg, color: a.c, marginLeft: idx === 0 ? 0 : "-8px", zIndex: 4 - idx, position: "relative" }}>
                {a.i}
              </div>
            ))}
          </div>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="11" height="11" viewBox="0 0 16 16" fill="#5E2CED" aria-hidden="true">
                <path d="M8 1l1.85 3.75L14 5.35l-3 2.92.71 4.13L8 10.25l-3.71 2.15L5 8.27 2 5.35l4.15-.6L8 1z" />
              </svg>
            ))}
          </div>
          <span className="text-[13px] font-semibold text-[#3a3a4a]">{uc.heroTrustText}</span>
        </div>
      </div>

      {/* Audience label badge — large centered */}
      <div className="flex justify-center pb-0">
        <div
          className="w-full max-w-170 rounded-3xl flex flex-col items-center justify-center py-14 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #f5f0ff 0%, #ede8fc 50%, #f5f0ff 100%)", border: "1px solid #e0d8fb" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 80%, rgba(94,44,237,0.07) 0%, transparent 65%)" }}
          />
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-[#5E2CED] flex items-center justify-center mb-5 relative z-10" style={{ boxShadow: "0 4px 20px rgba(94,44,237,0.3)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="relative z-10 text-[38px] font-extrabold text-[#1a1a2e] tracking-[-1px] text-center" >
            {uc.heroAudienceLabel}
          </h2>
        </div>
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════
   SECTION 2 — PROBLEMS
══════════════════════════════════════════════════════ */
const ProblemsSection = ({ uc }) => (
  <section className="w-full bg-white py-20 px-12" >
    <div className="max-w-190 mx-auto">
      <h2 className="text-[28px] font-extrabold text-[#1a1a2e] leading-[1.2] tracking-[-0.8px] mb-3">
        {uc.problemsSectionTitle}
      </h2>
      <p className="text-[15.5px] text-[#5a5a74] leading-[1.7] mb-12">{uc.problemsSectionSubtitle}</p>

      {/* Numbered problems */}
      <div className="flex flex-col gap-10">
        {uc.problems.map((p, i) => (
          <div key={i} className="flex gap-6">
            {/* Number */}
            <div className="shrink-0 w-10 h-10 rounded-xl bg-[#f5f0ff] border border-[#e0d8fb] flex items-center justify-center">
              <span className="text-[11px] font-extrabold text-[#5E2CED] tracking-tight">{p.number}</span>
            </div>
            {/* Content */}
            <div className="flex-1 pt-1">
              <h3 className="text-[16px] font-bold text-[#1a1a2e] mb-2">{p.title}</h3>
              <p className="text-[14.5px] text-[#5a5a74] leading-[1.7] m-0">{p.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Callout box */}
      <div className="mt-10 rounded-xl bg-[#f5f0ff] border border-[#e0d8fb] px-6 py-4">
        <p className="text-[14px] font-semibold text-[#5E2CED] leading-[1.65] m-0 text-center italic">
          "{uc.problemCallout}"
        </p>
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════
   SECTION 3 — CAPABILITIES
══════════════════════════════════════════════════════ */
const CapabilitiesSection = ({ uc }) => (
  <section className="w-full bg-[#faf9ff] py-20 px-12" >
    <div className="max-w-190 mx-auto">
      <h2 className="text-[28px] font-extrabold text-[#1a1a2e] leading-[1.2] tracking-[-0.8px] mb-3">
        {uc.capabilitiesSectionHeadline}
      </h2>
      <p className="text-[15.5px] text-[#5a5a74] leading-[1.7] mb-12">{uc.capabilitiesSectionSubtitle}</p>

      {/* Numbered capabilities */}
      <div className="flex flex-col gap-12">
        {uc.capabilities.map((cap, i) => (
          <div key={i}>
            <div className="flex gap-6 mb-4">
              {/* Number */}
              <div className="shrink-0 w-10 h-10 rounded-xl bg-[#5E2CED] flex items-center justify-center" style={{ boxShadow: "0 2px 12px rgba(94,44,237,0.25)" }}>
                <span className="text-[11px] font-extrabold text-white tracking-tight">{cap.number}</span>
              </div>
              {/* Title */}
              <div className="flex-1 pt-1">
                <h3 className="text-[17px] font-bold text-[#1a1a2e] mb-2">{cap.title}</h3>
                <p className="text-[14.5px] text-[#5a5a74] leading-[1.7] m-0">{cap.description}</p>
              </div>
            </div>
            {/* Benefit callout */}
            <div className="ml-16 rounded-xl bg-white border border-[#ede8f5] px-5 py-3.5 flex items-start gap-3">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-0.5" aria-hidden="true">
                <circle cx="10" cy="10" r="9" fill="#5E2CED" fillOpacity="0.12" />
                <path d="M6.5 10l2.5 2.5 4.5-5" stroke="#5E2CED" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-[13.5px] font-semibold text-[#3a3a4a] leading-[1.6] m-0">
                <span className="text-[#5E2CED]">Benefit: </span>{cap.benefit}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════
   SECTION 4 — HOW IT WORKS
══════════════════════════════════════════════════════ */
const HowItWorksSection = ({ uc }) => (
  <section className="w-full bg-white py-20 px-12" >
    <div className="max-w-190 mx-auto">
      <h2 className="text-[28px] font-extrabold text-[#1a1a2e] leading-[1.2] tracking-[-0.8px] mb-12">
        {uc.howItWorksSectionTitle}
      </h2>

      <div className="flex flex-col gap-0">
        {uc.steps.map((step, i) => (
          <div key={i} className="flex gap-6 relative">
            {/* Connector line */}
            {i < uc.steps.length - 1 && (
              <div className="absolute left-5 top-10 bottom-0 w-px bg-[#e0d8fb]" style={{ zIndex: 0 }} />
            )}
            {/* Step number circle */}
            <div className="shrink-0 w-10 h-10 rounded-full bg-[#5E2CED] flex items-center justify-center relative z-10" style={{ boxShadow: "0 2px 12px rgba(94,44,237,0.25)" }}>
              <span className="text-[13px] font-extrabold text-white">{step.number}</span>
            </div>
            {/* Content */}
            <div className={`flex-1 pb-10 ${i === uc.steps.length - 1 ? "pb-0" : ""}`}>
              <h3 className="text-[16px] font-bold text-[#1a1a2e] mb-1.5">{step.title}</h3>
              <p className="text-[14.5px] text-[#5a5a74] leading-[1.7] m-0">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════
   SECTION 5 — SUPPORTING FEATURES TABLE
══════════════════════════════════════════════════════ */
const FeaturesTableSection = ({ uc }) => (
  <section className="w-full bg-[#faf9ff] py-20 px-12" >
    <div className="max-w-190 mx-auto">
      <h2 className="text-[28px] font-extrabold text-[#1a1a2e] leading-[1.2] tracking-[-0.8px] mb-3">
        Supporting Features
      </h2>
      <p className="text-[15px] text-[#5a5a74] leading-[1.7] mb-8">{uc.featuresTableTitle}</p>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden border border-[#ede8f5]">
        {/* Header */}
        <div className="grid grid-cols-2 bg-[#1e1b2e] px-6 py-3">
          <span className="text-[11px] font-bold tracking-widest text-[#c4bfdb] uppercase">Feature</span>
          <span className="text-[11px] font-bold tracking-widest text-[#c4bfdb] uppercase">Benefit</span>
        </div>
        {/* Rows */}
        {uc.featuresTableRows.map((row, i) => (
          <div
            key={i}
            className={`grid grid-cols-2 px-6 py-4 border-b border-[#f0edf9] last:border-none ${i % 2 === 0 ? "bg-white" : "bg-[#faf9ff]"}`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#5E2CED] shrink-0" />
              <span className="text-[13.5px] font-semibold text-[#1a1a2e]">{row.feature}</span>
            </div>
            <span className="text-[13.5px] text-[#5a5a74] leading-snug">{row.benefit}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════
   SECTION 6 — REVIEWS
══════════════════════════════════════════════════════ */
const ReviewsSection = ({ uc }) => (
  <section className="w-full bg-white py-20 px-12" >
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-[34px] font-extrabold text-[#1a1a2e] leading-[1.1] tracking-[-1px] mb-4">
          Customer Reviews
        </h2>
        <p className="text-[15.5px] text-[#5a5a74] max-w-125 mx-auto leading-[1.65]">
          See why {uc.categoryLabel.toLowerCase()} across Sri Lanka trust GrowDigitally to uncover their SEO opportunities.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-5">
        {uc.reviews.map((r, i) => (
          <ReviewCard key={i} {...r} />
        ))}
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════
   SECTION 7 — CTA BANNER
══════════════════════════════════════════════════════ */
const CtaBannerSection = ({ uc }) => (
  <section className="w-full px-12 py-10 bg-[#faf9ff]" >
    <div
      className="max-w-7xl mx-auto rounded-3xl overflow-hidden relative"
      style={{ background: "linear-gradient(135deg, #1e1b2e 0%, #2d1a5e 50%, #1e1b2e 100%)", minHeight: "300px" }}
    >
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(94,44,237,0.25) 0%, transparent 65%)" }} />

      <div className="relative grid grid-cols-2 gap-0 items-center min-h-75">
        {/* Left — Text */}
        <div className="p-12">
          <p className="text-[11px] font-bold tracking-[0.12em] text-[#a78df5] uppercase mb-3">
            Complete SEO &amp; Expert Review
          </p>
          <h2 className="text-[30px] font-extrabold text-white leading-[1.15] tracking-[-0.8px] mb-5">
            Dominate search today<br />on Google &amp; beyond.
          </h2>
          <p className="text-[14.5px] text-[#c4bfdb] leading-[1.65] mb-7 max-w-90">
            Join 500+ Sri Lankan {uc.categoryLabel.toLowerCase()} who trust GrowDigitally to audit, analyse, and grow their online visibility.
          </p>
          <div className="flex items-center gap-3">
            <button className="h-11.5 px-7 bg-[#5E2CED] hover:bg-[#4a1fd4] text-white font-semibold text-[14px] rounded-lg border-none cursor-pointer transition-all duration-150" >
              {uc.heroPrimaryCta}
            </button>
            <button className="h-11.5 px-6 bg-white/10 hover:bg-white/20 text-white font-semibold text-[14px] rounded-lg border border-white/20 cursor-pointer transition-all duration-150" >
              {uc.heroSecondaryCta}
            </button>
          </div>
        </div>

        {/* Right — Mini dashboard mockup */}
        <div className="flex items-center justify-end pr-10 py-8">
          <div className="bg-white rounded-2xl overflow-hidden w-full max-w-95" style={{ boxShadow: "0 8px 48px rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}>
            {/* Topbar */}
            <div className="bg-[#1e1b2e] px-4 py-2.5 flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex items-center gap-2 ml-1">
                <div className="w-4 h-4 rounded bg-[#5E2CED] flex items-center justify-center shrink-0">
                  <svg width="8" height="8" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 13C4.5 11 6 9 8 10C10 11 11 7 13 5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-[10.5px] text-[#c4bfdb] font-medium" >SEO Audit — GrowDigitally</span>
              </div>
            </div>
            {/* Content */}
            <div className="p-4 bg-[#f9f8ff]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[12px] font-bold text-[#1a1a2e] m-0" >yourbusiness.lk</p>
                  <p className="text-[10.5px] text-[#9090a8] m-0">SEO Audit Summary</p>
                </div>
                <div className="relative w-11 h-11">
                  <svg width="44" height="44" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="16" fill="none" stroke="#ede8fc" strokeWidth="4" />
                    <circle cx="22" cy="22" r="16" fill="none" stroke="#5E2CED" strokeWidth="4"
                      strokeDasharray="78 100" strokeDashoffset="25" strokeLinecap="round"
                      style={{ transform: "rotate(-90deg)", transformOrigin: "22px 22px" }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[11px] font-extrabold text-[#5E2CED] leading-none">78</span>
                    <span className="text-[7.5px] text-[#9090a8]">/100</span>
                  </div>
                </div>
              </div>
              {[
                { label: "On-Page Score", val: "84/100", color: "#16a34a" },
                { label: "Backlinks", val: "142", color: "#16a34a" },
                { label: "Page Speed", val: "2.3s", color: "#ef4444" },
                { label: "Site Issues", val: "No critical issues", color: "#16a34a" },
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#ede8f5] last:border-none">
                  <span className="text-[11px] text-[#4a4a6a] font-medium" >{m.label}</span>
                  <span className="text-[11px] font-bold" style={{ color: m.color}}>{m.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════
   USE CASE DETAIL PAGE — MAIN COMPONENT
   Usage with React Router:
     const { slug } = useParams();
     <UseCaseDetailPage slug={slug} />

   Usage standalone:
     <UseCaseDetailPage slug="ecommerce-brands" />
══════════════════════════════════════════════════════ */
const UseCaseDetailPage = () => {
  const { slug: routeSlug } = useParams();
  const uc = getUseCaseBySlug(routeSlug);

  /* ── 404 fallback ── */
  if (!uc) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf9ff] gap-4" >
        <div className="w-16 h-16 rounded-2xl bg-[#f5f0ff] flex items-center justify-center mb-2">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="#5E2CED" strokeWidth="1.8" />
            <path d="M12 7v6M12 15.5v.5" stroke="#5E2CED" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="text-[28px] font-extrabold text-[#1a1a2e] tracking-tight">Use case not found</h1>
        <p className="text-[15px] text-[#5a5a74]">The slug "{routeSlug}" doesn't match any use case.</p>
        <a href="/" className="mt-2 h-11 px-6 bg-[#5E2CED] text-white font-semibold text-[14px] rounded-lg flex items-center no-underline">
          Back to Home
        </a>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#faf9ff]" >
      <HeroSection uc={uc} />
      <ProblemsSection uc={uc} />
      <CapabilitiesSection uc={uc} />
      <HowItWorksSection uc={uc} />
      <FeaturesTableSection uc={uc} />
      <CtaBannerSection uc={uc} />
      <ReviewsSection uc={uc} />
    </div>
  );
};

export default UseCaseDetailPage;