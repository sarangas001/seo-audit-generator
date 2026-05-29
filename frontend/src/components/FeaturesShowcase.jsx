export default function FeaturesShowcase() {
  const features = [
    {
      title: 'Deep Domain Analysis',
      description: 'Stop Drowning in URL Lists. Start Making Strategic Decisions. Every other SEO tool treats your site as a flat list of URLs. We understand it\'s a structured organization of page types, and optimize accordingly.',
      points: [
        'Scan entire website for technical issues',
        'Get domain authority score and improvements',
        'Get top-performing pages and opportunities'
      ],
      ctaText: 'Run your Deep Analysis',
      ctaSecondary: 'Learn more',
      imagePosition: 'right'
    },
    {
      title: 'AI Visibility Tracking',
      description: 'See exactly how your website appears across ChatGPT, Google, Gemini, and other major AI engines. Track citations, monitor visibility, and optimize your presence in the AI age.',
      points: [
        'Monitor 6+ AI engines simultaneously',
        'Real-time citation tracking',
        'AI content performance metrics'
      ],
      ctaText: 'Start AI Tracking',
      ctaSecondary: 'View examples',
      imagePosition: 'left'
    },
    {
      title: 'Competitor Intelligence',
      description: 'Know exactly what your competitors are doing. Compare rankings, backlinks, technical health, and content strategies. Get insights to stay ahead of the competition.',
      points: [
        'Analyze top 10 competitors automatically',
        'Compare on 50+ metrics',
        'Get actionable competitive insights'
      ],
      ctaText: 'Compare Competitors',
      ctaSecondary: 'See analysis',
      imagePosition: 'right'
    }
  ];

  return (
    <div className="relative bg-[#faf9ff] overflow-hidden">

      {/* Header Section */}
      <div className="relative z-10 px-6 py-16 md:px-36 text-center">
        <div className="inline-flex items-center justify-center gap-2 border border-[#d8a85c] bg-[#fff4e6] rounded-full px-4 py-1.5 mb-6">
          <span className="text-[11px] font-bold tracking-wider text-[#d8a85c] uppercase">
            ◉ Find &amp; Fix SEO Issues In Minutes, Not Weeks ◉
          </span>
        </div>

        <h2 className="text-4xl md:text-5xl font-extrabold text-[#1a1a2e] leading-[1.3] mb-4 max-w-4xl mx-auto">
          SEO Site Checkup's <span className="text-[#5E2CED]">Features</span>
        </h2>

        <p className="text-[15px] text-[#5a5a74] leading-relaxed max-w-3xl mx-auto mb-16">
          Complete SEO intelligence without the chaos. Track traditional rankings, monitor AI visibility across 6 engines, audit 70+ technical factors, and get white-label reports, all automatically organized by page type.
        </p>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 px-6 md:px-36">
        {features.map((feature, index) => (
          <div key={index} className="mb-20 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Text Content - Left or Right based on imagePosition */}
              <div className={feature.imagePosition === 'right' ? 'lg:order-1' : 'lg:order-2'}>
                <h3 className="text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-4 leading-[1.2]">
                  {feature.title}
                </h3>

                <p className="text-[15px] text-[#5a5a74] leading-relaxed mb-6">
                  {feature.description}
                </p>

                {/* Checkmark Points */}
                <div className="space-y-3 mb-8">
                  {feature.points.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-0.5">
                        <circle cx="10" cy="10" r="9" stroke="#16a34a" strokeWidth="2"/>
                        <path d="M7 10L9 12L13 8" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-[14px] text-[#1a1a2e] font-medium">{point}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex items-center gap-3">
                  <button className="bg-[#5E2CED] hover:bg-[#4d21cc] text-white font-bold py-3 px-6 rounded-lg transition-colors">
                    {feature.ctaText}
                  </button>
                  <button className="text-[#5E2CED] font-semibold hover:text-[#4d21cc] transition-colors">
                    {feature.ctaSecondary}
                  </button>
                </div>
              </div>

              {/* Image/Mock - Right or Left based on imagePosition */}
              <div className={feature.imagePosition === 'right' ? 'lg:order-2' : 'lg:order-1'}>
                <div className="relative bg-linear-to-br from-[#1e1b2e] to-[#2a2637] rounded-2xl p-1 shadow-xl overflow-hidden min-h-100 flex items-center justify-center">
                  {/* Actual Image Placeholder */}
                  <div className="absolute inset-1 bg-white rounded-2xl overflow-hidden">
                    {/* Mock Dashboard/UI */}
                    <div className="h-full flex flex-col">
                      {/* Header */}
                      <div className="bg-[#1e1b2e] h-12 flex items-center px-4 gap-2 shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        <span className="text-xs text-gray-400 ml-2">Dashboard View</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6 overflow-y-auto">
                        {index === 0 && (
                          <>
                            <div className="mb-4">
                              <div className="h-4 bg-[#e0d8fb] rounded w-2/3 mb-2"></div>
                              <div className="h-3 bg-[#f0ebff] rounded w-1/2"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="bg-[#f8f5ff] rounded p-3">
                                <div className="h-3 bg-[#e0d8fb] rounded w-2/3 mb-1"></div>
                                <div className="h-5 bg-[#5E2CED] rounded w-1/2 mt-2"></div>
                              </div>
                              <div className="bg-[#f8f5ff] rounded p-3">
                                <div className="h-3 bg-[#e0d8fb] rounded w-2/3 mb-1"></div>
                                <div className="h-5 bg-[#5E2CED] rounded w-1/2 mt-2"></div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="h-3 bg-[#f0ebff] rounded"></div>
                              <div className="h-3 bg-[#f0ebff] rounded"></div>
                              <div className="h-3 bg-[#f0ebff] rounded w-2/3"></div>
                            </div>
                          </>
                        )}

                        {index === 1 && (
                          <>
                            <div className="flex items-center gap-4 mb-6">
                              <div className="w-16 h-16 rounded-full bg-linear-to-br from-[#5E2CED] to-[#7c3aed] opacity-20"></div>
                              <div>
                                <div className="h-4 bg-[#e0d8fb] rounded w-24 mb-2"></div>
                                <div className="h-3 bg-[#f0ebff] rounded w-32"></div>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mb-4">
                              {[1, 2, 3].map(i => (
                                <div key={i} className="bg-[#f8f5ff] rounded p-2 text-center">
                                  <div className="h-5 bg-[#5E2CED] rounded w-1/2 mx-auto mb-1"></div>
                                  <div className="h-2 bg-[#e0d8fb] rounded w-2/3 mx-auto"></div>
                                </div>
                              ))}
                            </div>
                            <div className="space-y-2">
                              <div className="h-2 bg-[#f0ebff] rounded"></div>
                              <div className="h-2 bg-[#f0ebff] rounded w-3/4"></div>
                            </div>
                          </>
                        )}

                        {index === 2 && (
                          <>
                            <div className="mb-4">
                              <div className="h-3 bg-[#e0d8fb] rounded w-1/2 mb-3"></div>
                              {[1, 2, 3].map(i => (
                                <div key={i} className="flex justify-between items-center mb-2 p-2 bg-[#f8f5ff] rounded">
                                  <div className="h-3 bg-[#e0d8fb] rounded w-1/3"></div>
                                  <div className="h-3 bg-[#5E2CED] rounded w-1/6"></div>
                                </div>
                              ))}
                            </div>
                            <div className="bg-[#f0ebff] rounded p-3">
                              <div className="h-3 bg-[#e0d8fb] rounded w-1/2 mb-2"></div>
                              <div className="h-3 bg-[#e0d8fb] rounded w-2/3"></div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Replace with: <img src="path/to/image.png" alt={feature.title} className="w-full h-full object-cover" /> */}
                </div>
              </div>
            </div>

            {/* Divider */}
            {index < features.length - 1 && (
              <div className="my-16 border-t border-[#e0d8fb]"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
