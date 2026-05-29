export default function OtherFeatures() {
  const features = [
    {
      icon: '⚡',
      title: 'Site Speed & Outage',
      description: 'Monitor uptime and page load speed across all key pages.',
      points: [
        'Real-time uptime monitoring',
        'Page speed tracking',
        'Instant alerts'
      ],
      link: 'More on Site Speed & Outage'
    },
    {
      icon: '🔗',
      title: 'Backlinks Checker',
      description: 'Track referring domains, authority, and new link growth.',
      points: [
        'Monitor backlink profile',
        'Analyze link quality',
        'Spot toxic links'
      ],
      link: 'More on Backlinks Checker'
    },
    {
      icon: '🎯',
      title: 'Top Keywords',
      description: 'Identify your highest-performing keywords and traffic drivers.',
      points: [
        'Discover which keywords drive traffic',
        'Track performance trends',
        'Find quick-win opportunities'
      ],
      link: 'More on Top Keywords'
    },
    {
      icon: '📊',
      title: 'Keyword Position Tracker',
      description: 'Monitor keyword rankings across pages, countries, and SERPs.',
      points: [
        'Daily rank tracking',
        'Multi-location monitoring',
        'Competitor comparison'
      ],
      link: 'More on Keyword Position Tracker'
    },
    {
      icon: '🔍',
      title: 'Keyword Research',
      description: 'Find high-intent keyword ideas to grow your organic reach.',
      points: [
        'Discover untapped keywords',
        'Analyze keyword difficulty',
        'Get content ideas'
      ],
      link: 'More on Keyword Research'
    },
    {
      icon: '📄',
      title: 'White Label Reports',
      description: 'Generate branded SEO reports ready for clients or teams.',
      points: [
        'Customize layout and branding',
        'Export and share reports instantly',
        'Customize what metrics you show'
      ],
      link: 'More on White Label Reports'
    }
  ];

  return (
    <div className="relative bg-white overflow-hidden py-20">
      
      {/* Geometric Background Pattern */}
      

      {/* Content */}
      <div className="relative z-10 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Header */}
        <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-16">
          Other Features
        </h2>

        {/* Features Grid - 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white border border-[#ddd8f0] rounded-xl p-8 hover:shadow-lg transition-shadow">
              
              {/* Icon & Title */}
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl shrink-0">{feature.icon}</span>
                <h3 className="text-lg font-bold text-[#1a1a2e]">
                  {feature.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-sm text-[#5a5a74] leading-relaxed mb-4">
                {feature.description}
              </p>

              {/* Checkmark Points */}
              <div className="space-y-2 mb-6">
                {feature.points.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-0.5">
                      <circle cx="10" cy="10" r="9" stroke="#16a34a" strokeWidth="2"/>
                      <path d="M7 10L9 12L13 8" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-sm text-[#5a5a74]">{point}</span>
                  </div>
                ))}
              </div>

              {/* Link */}
              <a href="#" className="text-[#5E2CED] font-semibold text-sm hover:text-[#8661eb] transition-colors flex items-center gap-1">
                {feature.link}
                <span>›</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
