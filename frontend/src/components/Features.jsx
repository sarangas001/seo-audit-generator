export default function Features() {
  return (
    <div className="relative min-h-screen bg-white px-6 py-20 md:px-36 grid grid-cols-1 lg:grid-cols-2 items-center gap-12 overflow-hidden">
      {/* Geometric Background Pattern */}
      

      {/* LEFT COLUMN: Features List */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 border border-[#e0d8fb] bg-[#f8f5ff] rounded-full px-4 py-1.5 mb-6">
          <span className="text-[11px] font-bold tracking-wider text-[#5E2CED] uppercase">
            Powerful Features
          </span>
        </div>

        <h2 className="text-4xl md:text-5xl font-extrabold text-[#1a1a2e] leading-[1.2] mb-4">
          Complete SEO Analysis in <span className="text-[#5E2CED]">Minutes</span>
        </h2>

        <p className="text-[15px] text-[#5a5a74] leading-relaxed max-w-lg mb-8">
          Our AI-powered audit tool scans your website thoroughly and delivers actionable insights to improve rankings and drive more organic traffic.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="border-l-3 border-[#5E2CED] pl-4">
            <div className="text-3xl font-bold text-[#5E2CED] mb-1">200+</div>
            <div className="text-sm text-[#5a5a74]">SEO Factors Analyzed</div>
          </div>
          <div className="border-l-3 border-[#5E2CED] pl-4">
            <div className="text-3xl font-bold text-[#5E2CED] mb-1">&lt;5 min</div>
            <div className="text-sm text-[#5a5a74]">Audit Complete</div>
          </div>
          <div className="border-l-3 border-[#5E2CED] pl-4">
            <div className="text-3xl font-bold text-[#5E2CED] mb-1">100%</div>
            <div className="text-sm text-[#5a5a74]">WhatsApp Delivery</div>
          </div>
          <div className="border-l-3 border-[#5E2CED] pl-4">
            <div className="text-3xl font-bold text-[#5E2CED] mb-1">Free</div>
            <div className="text-sm text-[#5a5a74]">Always Complimentary</div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="space-y-4">
          <div className="flex items-start gap-4 bg-white border border-[#e7e2f4] rounded-xl p-4 hover:border-[#5E2CED] transition-colors">
            <div className="w-12 h-12 rounded-lg bg-[#f0ebff] flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" stroke="#5E2CED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="13 2 13 9 20 9" stroke="#5E2CED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-[#1a1a2e] mb-1">Detailed Reports</h4>
              <p className="text-sm text-[#5a5a74]">Comprehensive PDF reports with prioritized fixes</p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white border border-[#e7e2f4] rounded-xl p-4 hover:border-[#5E2CED] transition-colors">
            <div className="w-12 h-12 rounded-lg bg-[#f0ebff] flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="1" stroke="#5E2CED" strokeWidth="2"/>
                <path d="M12 5v2M12 17v2M5 12h2m9 0h2" stroke="#5E2CED" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="8" stroke="#5E2CED" strokeWidth="2"/>
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-[#1a1a2e] mb-1">Technical SEO</h4>
              <p className="text-sm text-[#5a5a74]">Site speed, mobile, schema, and crawlability checks</p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-white border border-[#e7e2f4] rounded-xl p-4 hover:border-[#5E2CED] transition-colors">
            <div className="w-12 h-12 rounded-lg bg-[#f0ebff] flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#5E2CED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-[#1a1a2e] mb-1">Competitor Analysis</h4>
              <p className="text-sm text-[#5a5a74]">See how you stack up against top competitors</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Image Showcase */}
      <div className="relative z-10">
        <div className="bg-linear-to-br from-[#f8f5ff] to-[#f0ebff] rounded-2xl p-8 border border-[#e0d8fb] min-h-125 flex items-center justify-center">
          {/* Image Container - Placeholder for actual image */}
          <div className="relative w-full">
            {/* Main Dashboard Mock Image */}
            <div className="bg-white rounded-xl shadow-lg border border-[#e0d8fb] overflow-hidden">
              {/* Header */}
              <div className="bg-[#1e1b2e] h-10 flex items-center px-4 gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-4">
                  <div className="h-4 bg-[#e0d8fb] rounded w-48 mb-2"></div>
                  <div className="h-3 bg-[#f0ebff] rounded w-32"></div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <div className="h-3 bg-[#e0d8fb] rounded w-32"></div>
                    <div className="h-3 bg-[#f0ebff] rounded w-16"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-3 bg-[#e0d8fb] rounded w-40"></div>
                    <div className="h-3 bg-[#f0ebff] rounded w-20"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-3 bg-[#e0d8fb] rounded w-28"></div>
                    <div className="h-3 bg-[#f0ebff] rounded w-16"></div>
                  </div>
                </div>

                {/* Score Circle */}
                <div className="flex justify-end">
                  <div className="w-20 h-20 rounded-full bg-linear-to-br from-[#5E2CED] to-[#7c3aed] opacity-20 flex items-center justify-center">
                    <span className="text-sm font-bold text-[#5E2CED]">78/100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -top-4 -left-4 bg-white rounded-lg shadow-md p-3 max-w-30 border border-[#e0d8fb]">
              <div className="text-xs font-bold text-[#5E2CED] mb-1">Speed Score</div>
              <div className="text-lg font-bold text-[#1a1a2e]">92/100</div>
            </div>

            <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-md p-3 max-w-30 border border-[#e0d8fb]">
              <div className="text-xs font-bold text-[#5E2CED] mb-1">SEO Health</div>
              <div className="text-lg font-bold text-[#1a1a2e]">Excellent</div>
            </div>
          </div>

          {/* Replace with actual image: */}
          {/* <img src="path/to/dashboard-image.png" alt="SEO Audit Dashboard" className="rounded-lg" /> */}
        </div>
      </div>
    </div>
  );
}
