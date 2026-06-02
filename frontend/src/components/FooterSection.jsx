import Logo from "../assets/logo.png";

import { useState } from "react";

/* ══════════════════════════════════════════
   PRE-FOOTER — Dark CTA banner with mockup
══════════════════════════════════════════ */
const PreFooterBanner = ({ scrollToSection }) => {

  
  const metrics = [
    { label: "On-Page Score", value: "84/100", trend: "up", color: "#16a34a" },
    { label: "Backlinks", value: "142", trend: "up", color: "#16a34a" },
    { label: "Page Speed", value: "2.3s", trend: "down", color: "#ef4444" },
    { label: "Site Issues", value: "No critical issues", trend: "ok", color: "#16a34a" },
  ];

  return (
    <div className="w-full px-12 py-10 bg-[#faf9ff]">
      <div
        className="max-w-7xl mx-auto rounded-3xl overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, #1e1b2e 0%, #2d1a5e 50%, #1e1b2e 100%)",
          minHeight: "340px",
        }}
      >
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 30% 50%, rgba(94,44,237,0.25) 0%, transparent 65%)",
          }}
        />

        <div className="relative grid grid-cols-2 gap-0 items-center h-full min-h-85">
          {/* Left — Text + CTAs */}
          <div className="p-12">
            <p
              className="text-[11px] font-bold tracking-[0.12em] text-[#a78df5] uppercase mb-4"
              
            >
              Complete SEO Audit &amp; Expert Review
            </p>
            <h2
              className="text-[54px] font-extrabold text-white leading-[1.15] tracking-[-1px] mb-5"
              
            >
              Dominate search today on Google &amp; beyond.
            </h2>
            <p
              className="text-[15px] text-[#c4bfdb] leading-[1.65] mb-8 max-w-95"
              
            >
              Join 500+ Sri Lankan businesses and agencies who trust GrowDigitally to audit, analyse, and grow their online visibility.
            </p>
            <div className="flex items-center gap-3">
              <button
                className="h-11.5 px-7 bg-[#5E2CED] hover:bg-[#4a1fd4] active:scale-[0.98] text-white font-semibold text-[14px] rounded-lg border-none cursor-pointer transition-all duration-150"
                onClick={() => { scrollToSection('hero-section')}}
              >
                Get Free Audit
              </button>
              {/* <button
                className="h-11.5 px-6 bg-white/10 hover:bg-white/20 text-white font-semibold text-[14px] rounded-lg border border-white/20 cursor-pointer transition-all duration-150"
                
              >
                See Pricing
              </button> */}
            </div>
          </div>

          {/* Right — Dashboard mockup */}
          <div className="flex items-center justify-end pr-10 py-8">
            <div
              className="bg-white rounded-2xl overflow-hidden w-full max-w-105"
              style={{
                boxShadow: "0 8px 48px rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.1)",
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
                  <div className="w-4 h-4 rounded bg-[#5E2CED] flex items-center justify-center">
                    <svg width="8" height="8" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 13C4.5 11 6 9 8 10C10 11 11 7 13 5" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="text-[10.5px] text-[#c4bfdb] font-medium" >
                    SEO Audit — GrowDigitally
                  </span>
                  
                </div>
              </div>

              {/* Content */}
              <div className="p-4 bg-[#f9f8ff]">
                {/* Domain + score */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[12.5px] font-bold text-[#1a1a2e] m-0" >yourbusiness.lk</p>
                    <p className="text-[10.5px] text-[#9090a8] m-0">SEO Audit Summary</p>
                  </div>
                  <div className="relative w-12 h-12">
                    <svg width="48" height="48" viewBox="0 0 48 48">
                      <circle cx="24" cy="24" r="18" fill="none" stroke="#ede8fc" strokeWidth="4.5" />
                      <circle cx="24" cy="24" r="18" fill="none" stroke="#5E2CED" strokeWidth="4.5"
                        strokeDasharray="88.0 113.1"
                        strokeDashoffset="28.3"
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

                {/* Metric rows */}
                {metrics.map((m, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-[#ede8f5] last:border-none">
                    <span className="text-[11.5px] text-[#4a4a6a] font-medium" >
                      {m.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {m.trend === "up" && (
                        <svg width="8" height="8" viewBox="0 0 10 10" fill="#16a34a" aria-hidden="true"><path d="M5 1L9 7H1L5 1Z" /></svg>
                      )}
                      {m.trend === "down" && (
                        <svg width="8" height="8" viewBox="0 0 10 10" fill="#ef4444" aria-hidden="true"><path d="M5 9L9 3H1L5 9Z" /></svg>
                      )}
                      {m.trend === "ok" && (
                        <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                          <circle cx="6" cy="6" r="5" stroke="#16a34a" strokeWidth="1.3" />
                          <path d="M3.5 6l2 2 3-3.5" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      <span className="text-[11.5px] font-bold" style={{ color: m.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {m.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   MAIN FOOTER
══════════════════════════════════════════ */

/* Social icon button */
const SocialIcon = ({ href = "#", label, children }) => (
  <a
    href={href}
    aria-label={label}
    className="w-9 h-9 rounded-lg bg-[#f5f0ff] hover:bg-[#5E2CED] text-[#5E2CED] hover:text-white flex items-center justify-center transition-all duration-150 group"
  >
    {children}
  </a>
);

/* Footer link column */
const FooterColumn = ({ heading, links }) => (
  <div>
    <p
      className="text-[11px] font-bold tracking-widest text-[#1a1a2e] uppercase mb-4"
      
    >
      {heading}
    </p>
    <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
      {links.map((link, i) => (
        <li key={i}>
          <a
            href={link.href || "#"}
            className="text-[13.5px] text-[#5a5a74] hover:text-[#5E2CED] transition-colors duration-150 no-underline font-medium"
            
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

const ServiceFooterColumn = ({ heading, links }) => (
  <div>
    <p
      className="text-[11px] font-bold tracking-widest text-[#1a1a2e] uppercase mb-4"
      
    >
      {heading}
    </p>
    <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
      {links.map((link, i) => (
        <li key={i}>
          <a
            href={link.href || "#"}
            className="text-[13.5px] text-[#5a5a74] hover:text-[#5E2CED] transition-colors duration-150 no-underline font-medium"
            
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

const footerColumns = [
  {
    heading: "Services",
    links: [
      { label: "Free SEO Audit" },
      { label: "Pricing" },
      { label: "Resources" },
    ],
  },
  {
    heading: "Audit Components",
    links: [
      { label: "Executive Summary", href: "/services/executive-summary" },
      { label: "Competitor Intelligence", href: "/services/competitor-intelligence" },
      { label: "On-Page Optimisation", href: "/services/on-page-optimisation" },
      { label: "Performance Metrics", href: "/services/performance-metrics" },
      { label: "Backlink Profile", href: "/services/backlink-profile" },
      { label: "Technical SEO Audit", href: "/services/technical-seo-audit" },
      { label: "Organic Insights", href: "/services/organic-insights" },
      { label: "Actionable Recommendations", href: "/services/actionable-recommendations" },
    ],
  },
  {
    heading: "Use Cases",
    links: [
      { label: "Small Businesses" },
      { label: "E-commerce Brands" },
      { label: "Digital Agencies" },
      { label: "Startups" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us" },
      { label: "FAQs" },
      { label: "Contact" },
      { label: "WhatsApp Us" },
    ],
  },
];

const MainFooter = () => {
  const [url, setUrl] = useState("");

  return (
    <footer
      className="w-full bg-white border-t border-[#f0edf9]"
      
    >
      {/* Main footer body */}
      <div className="max-w-7xl mx-auto px-12 py-14 grid grid-cols-[280px_1fr] gap-16">

        {/* ── Left: Logo + tagline + URL input + socials ── */}
        <div className="flex flex-col gap-">
          {/* Logo */}
          <img src={Logo} alt="GrowDigitally Logo" className="w-40" />
          {/* <a href="#" className="flex items-center gap-2.5 no-underline w-fit">
            <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#5E2CED" fillOpacity="0.1" />
              <path d="M6 22 C8 18, 11 14, 14 16 C17 18, 19 10, 22 8 C24 6, 26 10, 26 10"
                stroke="#5E2CED" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="14" cy="16" r="2" fill="#5E2CED" />
              <circle cx="22" cy="8" r="2" fill="#5E2CED" />
            </svg>
            
            <span className="text-[16px] font-bold text-[#1a1a2e] tracking-tight">
              Grow<span className="text-[#5E2CED]">Digitally</span>
            </span>
          </a> */}

          {/* URL input */}
          <div className="flex items-center gap-0 mb-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Email Address"
              className="flex-1 h-10 px-3 text-[13px] text-[#1a1a2e] placeholder-[#b0aac4] border border-[#ddd8f0] border-r-0 rounded-l-lg bg-white outline-none focus:border-[#5E2CED] transition-colors"
              
            />
            <button
              className="h-10 px-4 bg-[#5E2CED] hover:bg-[#4a1fd4] text-white text-[13px] font-bold rounded-r-lg border-none cursor-pointer transition-colors duration-150 whitespace-nowrap"
              
            >
              Email
            </button>
          </div>

          {/* Tagline */}
          <p className="text-[13px] text-[#5a5a74] leading-[1.65] m-0 max-w-60 mb-3">
            Expert-reviewed SEO audits. Competitor insights. Delivered to your WhatsApp.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-2 mt-1">
            <SocialIcon label="LinkedIn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="2" y="9" width="4" height="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </SocialIcon>
            <SocialIcon label="Facebook">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </SocialIcon>
            <SocialIcon label="Instagram">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.8" />
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
              </svg>
            </SocialIcon>
            <SocialIcon label="WhatsApp">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </SocialIcon>
          </div>
        </div>

        {/* ── Right: Link columns ── */}
        <div className="grid grid-cols-4 gap-8">
          {footerColumns.map((col, i) => (
            <FooterColumn key={i} heading={col.heading} links={col.links} />
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-[#f0edf9]">
        <div className="max-w-7xl mx-auto px-12 py-4 flex items-center justify-between">
          <p className="text-[12.5px] text-[#9090a8] m-0">
            © GrowDigitally {new Date().getFullYear()} · All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {["Terms of Service", "Privacy Policy", "Refund Policy"].map((item, i, arr) => (
              <span key={i} className="flex items-center gap-5">
                <a
                  href="#"
                  className="text-[12.5px] text-[#9090a8] hover:text-[#5E2CED] no-underline transition-colors duration-150"
                  
                >
                  {item}
                </a>
                {i < arr.length - 1 && (
                  <span className="text-[#ddd8f0]">•</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

/* ══════════════════════════════════════════
   COMBINED EXPORT
══════════════════════════════════════════ */
const FooterSection = ({ scrollToSection }) => (
  <>
    <PreFooterBanner scrollToSection={(data) => scrollToSection(data)} />
    <MainFooter />
  </>
);

export default FooterSection;