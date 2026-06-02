export default function Hero() {
  return (
    <div id="hero-section" className="relative min-h-140 bg-[#faf9ff] px-6 py-14 md:px-36 grid grid-cols-1 lg:grid-cols-2 items-center overflow-hidden">
      {/* Geometric Background Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large floating square - top left */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#f0ebff] rounded-3xl opacity-40 transform -rotate-12"></div>
        
        {/* Large floating square - bottom right */}
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#e0d8fb] rounded-3xl opacity-30 transform rotate-45"></div>
        
        {/* Medium square - center right */}
        <div className="absolute top-1/4 right-10 w-64 h-64 bg-[#f3f0fd] rounded-2xl opacity-50 transform rotate-12"></div>
        
        {/* Small square - top center */}
        {/* <div className="absolute top-12 left-1/3 w-32 h-32 border-2 border-[#d8d0f5] rounded-lg opacity-40 transform -rotate-6"></div> */}
        
        {/* Diagonal line pattern - subtle */}
        <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none">
          <defs>
            <pattern id="diagonal-lines" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="40" y2="40" stroke="#d8d0f5" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonal-lines)"/>
        </svg>

        {/* Grid pattern - very subtle */}
        <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none">
          <defs>
            <pattern id="grid-squares" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="80" height="80" fill="none" stroke="#c4bfdb" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-squares)"/>
        </svg>
      </div>
      
      {/* LEFT COLUMN: Copy & Form */}
      <div className="relative flex flex-col items-start">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 border border-[#e0d8fb] bg-[#f8f5ff] rounded-full px-4 py-1 mb-4">
          <span className="text-[11.5px] font-bold tracking-wider color-[#5E2CED] text-[#5E2CED] uppercase">
            SEO Audit is your growth advantage
          </span>
          {/* Google Icon */}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {/* Search Icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="#5E2CED" strokeWidth="2"/>
            <path d="M16.5 16.5L21 21" stroke="#5E2CED" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-[54px] font-extrabold text-[#1a1a2e] leading-[1.1] tracking-[-1.5px] mb-4">
          Uncover What's<br />
          <span className="text-[#5E2CED]">Holding Your</span><br />
          Website Back
        </h1>

        {/* Description */}
        <p className="text-[15px] text-[#5a5a74] stroke-none leading-relaxed max-w-200 mb-4">
          Get a free, comprehensive SEO audit report — covering technical health, backlinks, on-page scores, competitor insights, and more. Delivered to your WhatsApp.
        </p>

        {/* Input Form Row */}
        <form className="w-full max-w-200 mb-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 gap-3 rounded-2xl border border-[#ddd8f0] bg-white p-3 shadow-[0_8px_24px_rgba(94,44,237,0.08)] md:grid-cols-2">
            <input
              type="text"
              name="name"
              placeholder="Name"
              autoComplete="name"
              required
              className="h-12 rounded-xl border border-[#e7e2f4] px-4 text-sm text-[#1a1a2e] outline-none transition-colors placeholder:text-[#b0aac4] focus:border-[#5E2CED]"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="email"
              required
              className="h-12 rounded-xl border border-[#e7e2f4] px-4 text-sm text-[#1a1a2e] outline-none transition-colors placeholder:text-[#b0aac4] focus:border-[#5E2CED]"
            />
            <input
              type="tel"
              name="whatsapp"
              placeholder="WhatsApp number"
              autoComplete="tel"
              required
              className="h-12 rounded-xl border border-[#e7e2f4] px-4 text-sm text-[#1a1a2e] outline-none transition-colors placeholder:text-[#b0aac4] focus:border-[#5E2CED]"
            />
            <input
              type="url"
              name="websiteUrl"
              placeholder="Website URL"
              autoComplete="url"
              required
              className="h-12 rounded-xl border border-[#e7e2f4] px-4 text-sm text-[#1a1a2e] outline-none transition-colors placeholder:text-[#b0aac4] focus:border-[#5E2CED]"
            />
            <input
              type="text"
              name="mainKeywords"
              placeholder="Main Keywords"
              required
              className="h-12 rounded-xl border border-[#e7e2f4] px-4 text-sm text-[#1a1a2e] outline-none transition-colors placeholder:text-[#b0aac4] focus:border-[#5E2CED]"
            />
            <input
              type="text"
              name="location"
              defaultValue="Sri Lanka"
              required
              className="h-12 rounded-xl border border-[#e7e2f4] px-4 text-sm text-[#1a1a2e] outline-none transition-colors focus:border-[#5E2CED]"
            />
            <button
              type="submit"
              className="md:col-span-2 h-12.5 rounded-xl bg-[#5E2CED] px-5.5 text-sm font-bold text-white transition-colors hover:bg-[#4d21cc]"
            >
              Free Audit
            </button>
          </div>
        </form>

        {/* Trust Badge */}
        <div className="flex items-center gap-4">
          <div className="flex">
            <div className="w-8.5 h-8.5 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-extrabold relative bg-[#e0d8fb] text-[#5E2CED] z-5">AK</div>
            <div className="w-8.5 h-8.5 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-extrabold relative bg-[#d8f5eb] text-[#0f6e56] z-4 -ml-2">SM</div>
            <div className="w-8.5 h-8.5 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-extrabold relative bg-[#fde8d8] text-[#993c1d] z-3 -ml-2">NP</div>
            <div className="w-8.5 h-8.5 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-extrabold relative bg-[#fce4ef] text-[#99355a] z-2 -ml-2">RJ</div>
            <div className="w-8.5 h-8.5 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-extrabold relative bg-[#dbeafe] text-[#1e40af] z-1 -ml-2">DL</div>
          </div>
          <div>
            <div className="flex gap-0.5 mb-0.5 items-center">
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="12" height="12" viewBox="0 0 16 16" fill="#5E2CED" aria-hidden="true">
                  <path d="M8 1l1.85 3.75L14 5.35l-3 2.92.71 4.13L8 10.25l-3.71 2.15L5 8.27 2 5.35l4.15-.6L8 1z"/>
                </svg>
              ))}
              <span className="text-[12.5px] font-bold text-[#1a1a2e] ml-1">Trusted by +500</span>
            </div>
            <p className="text-[11.5px] text-[#6b6b7e]">Sri Lankan Businesses &amp; Agencies</p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Dashboard UI Mockup */}
      <div className="relative flex justify-center lg:justify-end w-full">
        {/* Glow effect */}
        <div className="absolute -top-7.5 -right-7.5 w-90 height-[360px] rounded-full bg-[radial-gradient(circle,rgba(94,44,237,0.09)_0%,transparent_70%)] pointer-events-none"></div>
        
        {/* Main Dashboard Card */}
        <div className="bg-white rounded-2xl border border-[#ede8fc] overflow-hidden w-full max-w-130 shadow-[0_8px_40px_rgba(94,44,237,0.12),0_2px_8px_rgba(0,0,0,0.05)] z-10">
          
          {/* Top Bar */}
          <div className="bg-[#1e1b2e] p-[10px_14px] flex items-center gap-2">
            <div className="flex gap-1.25">
              <div className="w-2.25 h-2.25 rounded-full bg-[#ff5f57]"></div>
              <div className="w-2.25 h-2.25 rounded-full bg-[#febc2e]"></div>
              <div className="w-2.25 h-2.25 rounded-full bg-[#28c840]"></div>
            </div>
            <div className="flex items-center gap-1.5 ml-1.5">
              <div className="w-4.5 h-4.5 rounded bg-[#5E2CED] flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 13C4 11 6 9 8 10C10 11 11 7 13 5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-[11px] color-[#c4bfdb] text-[#c4bfdb] font-medium">SEO Audit Dashboard — GrowDigitally</span>
            </div>
          </div>

          {/* Layout Body */}
          <div className="flex">
            {/* Sidebar */}
            <div className="bg-[#1e1b2e] w-9.5 flex flex-col items-center py-3.5 gap-3 shrink-0">
              <div className="w-6.5 h-6.5 rounded-md bg-[#5E2CED] flex items-center justify-center cursor-pointer">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" aria-hidden="true"><path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round"/></svg>
              </div>
              <div className="w-6.5 h-6.5 rounded-md flex items-center justify-center cursor-pointer">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b6888" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 8v8M8 12h8"/></svg>
              </div>
              <div className="w-6.5 h-6.5 rounded-mdflex items-center justify-center cursor-pointer">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b6888" strokeWidth="2" aria-hidden="true"><path d="M3 12l3-4 3 2 3-5 3 3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="w-6.5 h-6.5 rounded-mdflex items-center justify-center cursor-pointer">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b6888" strokeWidth="2" aria-hidden="true"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 20h8M12 18v2" strokeLinecap="round"/></svg>
              </div>
            </div>

            {/* Main Diagnostics Panel */}
            <div className="flex-1 p-3.5 bg-[#f9f8ff]">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs font-bold text-[#1a1a2e] mb-px">yourbusiness.lk</p>
                  <p className="text-[10px] text-[#9090a8]">SEO Audit Summary</p>
                </div>
                {/* Score Radial Circle */}
                <div className="relative w-13 h-13 shrink-0">
                  <svg width="52" height="52" viewBox="0 0 52 52">
                    <circle cx="26" cy="26" r="20" fill="none" stroke="#ede8fc" strokeWidth="5"/>
                    <circle cx="26" cy="26" r="20" fill="none" stroke="#5E2CED" strokeWidth="5"
                      strokeDasharray="98.2 125.7"
                      strokeDashoffset="31.4"
                      strokeLinecap="round"
                      className="origin-[26px_26px] -rotate-90"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[11px] font-extrabold text-[#5E2CED] line-height-[1]">78</span>
                    <span className="text-[8px] text-[#9090a8]">/100</span>
                  </div>
                </div>
              </div>

              {/* Metric Item: On-Page */}
              <div className="flex items-center justify-between py-2 border-b border-[#ede8f5]">
                <span className="text-[11px] text-[#4a4a6a] font-medium">On-Page Score</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold flex items-center gap-1E text-[#16a34a]">
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="#16a34a" aria-hidden="true"><path d="M5 1L9 7H1L5 1Z"/></svg>84/100
                  </span>
                  <span className="text-[10px] text-[#5E2CED] font-semibold cursor-pointer">View report ›</span>
                </div>
              </div>

              {/* Metric Item: Backlinks */}
              <div className="flex items-center justify-between py-2 border-b border-[#ede8f5]">
                <span className="text-[11px] text-[#4a4a6a] font-medium">Backlinks</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold flex items-center gap-1E text-[#16a34a]">
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="#16a34a" aria-hidden="true"><path d="M5 1L9 7H1L5 1Z"/></svg>142
                  </span>
                  <span className="text-[10px] text-[#5E2CED] font-semibold cursor-pointer">View report ›</span>
                </div>
              </div>

              {/* Metric Item: Page Speed */}
              <div className="flex items-center justify-between py-2 border-b border-[#ede8f5]">
                <span className="text-[11px] text-[#4a4a6a] font-medium">Page Speed</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold flex items-center gap-1E text-[#dc2626]">
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="#dc2626" aria-hidden="true"><path d="M5 9L9 3H1L5 9Z"/></svg>2.3s
                  </span>
                  <span className="text-[10px] text-[#5E2CED] font-semibold cursor-pointer">View report ›</span>
                </div>
              </div>

              {/* Metric Item: Site Issues */}
              <div className="flex items-center justify-between py-2">
                <span className="text-[11px] text-[#4a4a6a] font-medium">Site Issues</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold flex items-center gap-1E text-[#16a34a]">No critical issues</span>
                  <span className="text-[10px] text-[#5E2CED] font-semibold cursor-pointer">View report ›</span>
                </div>
              </div>
            </div>

            {/* Right Side Panel Recommendations */}
            <div className="w-41.25shrink-0 bg-white border-l border-[#ede8f5] p-3">
              <p className="text-[10.5px] font-bold text-[#1a1a2e] mb-0.5">Top Recommendations</p>
              <p className="text-[9.5px] text-[#9090a8] mb-2.5">Critical fixes for your site</p>

              {/* Mini Item 1 */}
              <div className="mb-3">
                <p className="text-[10px] font-semibold text-[#1a1a2e] mb-0.5">Technical SEO</p>
                <p className="text-[9px] text-[#9090a8] mb-1.5">SEO Score</p>
                <div className="relative w-9.5 h-9.5 mb-2">
                  <svg width="38" height="38" viewBox="0 0 38 38">
                    <circle cx="19" cy="19" r="14" fill="none" stroke="#f0edf9" strokeWidth="4"/>
                    <circle cx="19" cy="19" r="14" fill="none" stroke="#f59e0b" strokeWidth="4"
                      strokeDasharray="63.6 87.9"
                      strokeDashoffset="22"
                      strokeLinecap="round"
                      className="origin-[19px_19px] -rotate-90"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] font-extrabold text-[#f59e0b]">72</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true"><circle cx="5" cy="5" r="4.5" fill="#fee2e2"/><path d="M3 5h4" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  <span className="text-[9px] text-[#6b6b7e]">Fix meta descriptions</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true"><circle cx="5" cy="5" r="4.5" fill="#fee2e2"/><path d="M3 5h4" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  <span className="text-[9px] text-[#6b6b7e]">Improve page speed</span>
                </div>
              </div>

              {/* Mini Item 2 */}
              <div>
                <p className="text-[10px] font-semibold text-[#1a1a2e] mb-0.5">Content Quality</p>
                <p className="text-[9px] text-[#9090a8] mb-1.5">SEO Score</p>
                <div className="relative w-9.5 h-9.5 mb-2">
                  <svg width="38" height="38" viewBox="0 0 38 38">
                    <circle cx="19" cy="19" r="14" fill="none" stroke="#f0edf9" strokeWidth="4"/>
                    <circle cx="19" cy="19" r="14" fill="none" stroke="#5E2CED" strokeWidth="4"
                      strokeDasharray="74.8 87.9"
                      strokeDashoffset="22"
                      strokeLinecap="round"
                      className="origin-[19px_19px] -rotate-90"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] font-extrabold text-[#5E2CED]">85</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true"><circle cx="5" cy="5" r="4.5" fill="#fee2e2"/><path d="M3 5h4" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  <span className="text-[9px] text-[#6b6b7e]">Add structured data</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true"><circle cx="5" cy="5" r="4.5" fill="#fee2e2"/><path d="M3 5h4" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  <span className="text-[9px] text-[#6b6b7e]">Internal link gaps</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
