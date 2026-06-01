/* ─────────────────────────────────────────────────────────────
   servicesData.js
   GrowDigitally — Full services data array
   All 9 SEO Audit components with complete page template data
───────────────────────────────────────────────────────────── */

export const services = [
  /* ────────────────────────────────────────────────
     1. EXECUTIVE SUMMARY
  ──────────────────────────────────────────────── */
  {
    id: "executive-summary",
    slug: "executive-summary",
    category: "AUDIT REPORT",
    categoryLabel: "Executive Summary",

    /* Hero */
    heroHeadline: "See your website's full SEO health — at a glance.",
    heroSubheadline:
      "Your Executive Summary gives you an overall SEO score, an AI-driven visibility index, and a complete breakdown of what passed, what failed, and what needs urgent attention — all in one clear snapshot.",
    heroPrimaryCta: "Get Free Audit",
    heroSecondaryCta: "See Pricing",
    heroTrustText: "Trusted by +500 Sri Lankan Businesses & Agencies",

    /* Problem block */
    problemTag: "THE PROBLEM",
    problemHeadline: "You don't know your website's real SEO health.",
    problemBody:
      "Most businesses guess at what's wrong with their SEO. Without a clear score and summary, you waste time fixing the wrong things while critical issues go unnoticed. You might think your site is healthy while it's silently losing rankings every single day. Without a structured summary, there's no starting point, no prioritisation, and no way to measure progress.",

    /* What we give */
    whatWeGiveTag: "WHAT YOU GET",
    whatWeGiveHeadline: "A clear score. Not vague observations.",
    whatWeGiveItems: [
      {
        title: "Overall SEO Score",
        description:
          "Every website gets a score out of 100, based on technical health, on-page quality, backlink strength, and performance metrics.",
      },
      {
        title: "AI Visibility Index",
        description:
          "An additional metric that measures how well your site is structured for AI-driven search engines and crawlers.",
      },
      {
        title: "Audit Breakdown",
        description:
          "A full count of passed checks, failed checks, and warnings — so you know exactly how many issues need fixing and at what priority.",
      },
      {
        title: "Actionable Next Steps",
        description:
          "Every failed check includes a specific recommended action. Not 'improve your content' — but exactly what to fix and why.",
      },
    ],

    /* Use cases */
    useCases: [
      {
        audience: "Small Businesses",
        description: "Understand your SEO baseline and know where to focus your limited time and budget.",
        linkLabel: "See the small business use case",
      },
      {
        audience: "Digital Agencies",
        description: "Present clients with a clear score and summary they can understand without technical knowledge.",
        linkLabel: "See the agency use case",
      },
      {
        audience: "E-commerce Brands",
        description: "Track your overall SEO score across product and category pages.",
        linkLabel: "See the e-commerce use case",
      },
      {
        audience: "Startups",
        description: "Establish your SEO baseline from day one and track improvement over time.",
        linkLabel: "See the startup use case",
      },
    ],

    /* CTA banner */
    ctaHeadline: "Your website has a score. Do you know what it is?",
    ctaButtonLabel: "Get Your Free SEO Audit",

    /* Reviews (3 pulled from the global pool, customised per service) */
    reviews: [
      {
        quote:
          "The executive summary was the first time I actually understood what state my website was in. A score, a breakdown, and clear priorities — exactly what I needed.",
        name: "Ashan Perera",
        role: "Founder",
        company: "StyleMart.lk",
        initials: "AP",
        avatarBg: "#e0d8fb",
        avatarColor: "#5E2CED",
      },
      {
        quote:
          "I share the executive summary with every client before we start work. It sets clear expectations and justifies the project scope immediately.",
        name: "Nimasha Fernando",
        role: "SEO Director",
        company: "Pixel Agency",
        initials: "NF",
        avatarBg: "#d8f5eb",
        avatarColor: "#0f6e56",
      },
      {
        quote:
          "Seeing a score out of 100 made it real. Our site was at 38. Six weeks later it's at 71. That kind of visibility changes how you make decisions.",
        name: "Kasun Wijesinghe",
        role: "Founder",
        company: "BuildPro Lanka",
        initials: "KW",
        avatarBg: "#fef9c3",
        avatarColor: "#854d0e",
      },
    ],

    /* Meta */
    metaTitle: "Executive Summary — GrowDigitally SEO Audit",
    metaDescription:
      "Get a complete SEO score, AI visibility index, and full audit breakdown for your website. Delivered to WhatsApp after expert review.",
  },

  /* ────────────────────────────────────────────────
     2. ACTIONABLE RECOMMENDATIONS
  ──────────────────────────────────────────────── */
  {
    id: "actionable-recommendations",
    slug: "actionable-recommendations",
    category: "AUDIT REPORT",
    categoryLabel: "Actionable Recommendations",

    heroHeadline: "Stop guessing. Start fixing the right things first.",
    heroSubheadline:
      "Your Actionable Recommendations report gives you a prioritised list of critical SEO issues to fix — ranked by impact, explained in plain language, with a specific action for each one.",
    heroPrimaryCta: "Get Free Audit",
    heroSecondaryCta: "See Pricing",
    heroTrustText: "Trusted by +500 Sri Lankan Businesses & Agencies",

    problemTag: "THE PROBLEM",
    problemHeadline: "You have SEO issues but no idea where to start.",
    problemBody:
      "Generic SEO tools give you a list of hundreds of issues with no indication of which ones actually matter. You end up spending hours on low-impact fixes while the issues that are actually costing you rankings go untouched. Without clear prioritisation, SEO feels overwhelming — and most businesses give up or fix the wrong things entirely.",

    whatWeGiveTag: "WHAT YOU GET",
    whatWeGiveHeadline: "Prioritised fixes. Not endless to-do lists.",
    whatWeGiveItems: [
      {
        title: "Critical Issues First",
        description:
          "Every issue is ranked by impact — critical, warning, or informational — so you know exactly what to tackle first.",
      },
      {
        title: "Plain Language Explanations",
        description:
          "Each issue is explained in clear, jargon-free language so your team can understand and act on it without needing an SEO background.",
      },
      {
        title: "Specific Fix Instructions",
        description:
          "Not 'improve your metadata' — but exactly what to change, where to change it, and what the correct version should look like.",
      },
      {
        title: "Expert-Reviewed Priority Order",
        description:
          "Our team reviews the AI-generated recommendations and reorders them based on your specific website and market context.",
      },
    ],

    useCases: [
      {
        audience: "Small Businesses",
        description: "Fix the issues that will actually move your rankings without wasting time on low-impact changes.",
        linkLabel: "See the small business use case",
      },
      {
        audience: "Digital Agencies",
        description: "Deliver a clear, prioritised fix list to clients that justifies your monthly retainer.",
        linkLabel: "See the agency use case",
      },
      {
        audience: "E-commerce Brands",
        description: "Identify which product page issues are costing you the most organic traffic.",
        linkLabel: "See the e-commerce use case",
      },
      {
        audience: "Startups",
        description: "Build your SEO foundation correctly from the start with a ranked list of what to fix first.",
        linkLabel: "See the startup use case",
      },
    ],

    ctaHeadline: "Know exactly what to fix. In the right order.",
    ctaButtonLabel: "Get Your Prioritised Recommendations",

    reviews: [
      {
        quote:
          "Finally, an SEO report where I didn't have to figure out what to do next. Everything was ranked and explained. We fixed the top 5 issues and saw results within three weeks.",
        name: "Dilanka Rathnayake",
        role: "Marketing Manager",
        company: "CeylonTravels",
        initials: "DR",
        avatarBg: "#fce4ef",
        avatarColor: "#99355a",
      },
      {
        quote:
          "The recommendations were specific enough that I could hand them directly to our developer. No interpretation needed.",
        name: "Tharindi Wickrama",
        role: "Digital Strategy Manager",
        company: "LuxeHomes.lk",
        initials: "TW",
        avatarBg: "#f3e8ff",
        avatarColor: "#6b21a8",
      },
      {
        quote:
          "Most tools give you 200 issues. GrowDigitally gave us 12 that actually mattered. That focus made all the difference.",
        name: "Priyantha Silva",
        role: "Chief Marketing Officer",
        company: "MediCare Lanka",
        initials: "PS",
        avatarBg: "#dcfce7",
        avatarColor: "#166534",
      },
    ],

    metaTitle: "Actionable Recommendations — GrowDigitally SEO Audit",
    metaDescription:
      "Get a prioritised list of critical SEO fixes for your website. Expert-reviewed and delivered to your WhatsApp.",
  },

  /* ────────────────────────────────────────────────
     3. COMPETITOR INTELLIGENCE
  ──────────────────────────────────────────────── */
  {
    id: "competitor-intelligence",
    slug: "competitor-intelligence",
    category: "AUDIT REPORT",
    categoryLabel: "Competitor Intelligence",

    heroHeadline: "See exactly how your competitors are beating you.",
    heroSubheadline:
      "Your Competitor Intelligence report surfaces the top 5 competitors in your market, compares their domain authority, traffic estimates, keyword gaps, and backlink profiles — so you know exactly where to focus to outrank them.",
    heroPrimaryCta: "Get Free Audit",
    heroSecondaryCta: "See Pricing",
    heroTrustText: "Trusted by +500 Sri Lankan Businesses & Agencies",

    problemTag: "THE PROBLEM",
    problemHeadline: "Your competitors are outranking you and you don't know why.",
    problemBody:
      "While you focus on your own website, your competitors are quietly climbing above you in search results — capturing the traffic and customers that should be yours. Without knowing what they're doing right, you're fighting blind. You can't close a gap you can't see. And by the time you notice you've lost ground, they've built an SEO lead that takes months to recover.",

    whatWeGiveTag: "WHAT YOU GET",
    whatWeGiveHeadline: "Know your competition. Beat them strategically.",
    whatWeGiveItems: [
      {
        title: "Top 5 Competitor Breakdown",
        description:
          "Automatically identifies the 5 websites competing most directly with you for your target keywords in the Sri Lankan market.",
      },
      {
        title: "Domain Authority Comparison",
        description:
          "Side-by-side comparison of domain authority scores so you understand the gap and how much link-building you need.",
      },
      {
        title: "Keyword Gap Analysis",
        description:
          "Discover the keywords your competitors rank for that you don't — these are your fastest traffic opportunities.",
      },
      {
        title: "Traffic & Backlink Estimates",
        description:
          "Estimated monthly organic traffic and backlink counts for each competitor, giving you a realistic benchmark to target.",
      },
    ],

    useCases: [
      {
        audience: "Small Businesses",
        description: "Find the local competitors taking your customers and learn exactly what they're doing better.",
        linkLabel: "See the small business use case",
      },
      {
        audience: "Digital Agencies",
        description: "Give clients competitive context that makes your SEO strategy impossible to argue with.",
        linkLabel: "See the agency use case",
      },
      {
        audience: "E-commerce Brands",
        description: "See which online stores are ranking for your product keywords and why.",
        linkLabel: "See the e-commerce use case",
      },
      {
        audience: "Startups",
        description: "Enter your market with eyes open — know who you're competing against from day one.",
        linkLabel: "See the startup use case",
      },
    ],

    ctaHeadline: "Your competitors are visible online. Are you?",
    ctaButtonLabel: "Analyse Your Competitors Now",

    reviews: [
      {
        quote:
          "The competitor intelligence section was a revelation. We found two competitors ranking for 40+ keywords we hadn't even considered. We're now targeting all of them.",
        name: "Shalini Mendis",
        role: "Growth Lead",
        company: "FreshMart.lk",
        initials: "SM",
        avatarBg: "#dbeafe",
        avatarColor: "#1e40af",
      },
      {
        quote:
          "I finally understood why we were losing to a smaller competitor. Their backlink profile was significantly stronger in one specific niche. That insight was worth the entire audit.",
        name: "Ruwan Jayasekara",
        role: "E-commerce Manager",
        company: "TechZone.lk",
        initials: "RJ",
        avatarBg: "#fde8d8",
        avatarColor: "#993c1d",
      },
      {
        quote:
          "Our clients always ask 'what are competitors doing?' Now I have a data-backed answer that takes minutes to prepare instead of days.",
        name: "Nimasha Fernando",
        role: "SEO Director",
        company: "Pixel Agency",
        initials: "NF",
        avatarBg: "#d8f5eb",
        avatarColor: "#0f6e56",
      },
    ],

    metaTitle: "Competitor Intelligence — GrowDigitally SEO Audit",
    metaDescription:
      "Analyse your top 5 SEO competitors, uncover keyword gaps, and find out why they're outranking you. Expert-reviewed report delivered to WhatsApp.",
  },

  /* ────────────────────────────────────────────────
     4. TOP-PERFORMING PAGES
  ──────────────────────────────────────────────── */
  {
    id: "top-performing-pages",
    slug: "top-performing-pages",
    category: "AUDIT REPORT",
    categoryLabel: "Top-Performing Pages",

    heroHeadline: "Find the pages driving your traffic — and the ones killing it.",
    heroSubheadline:
      "Your Top-Performing Pages report identifies which pages on your domain are generating the most organic traffic and authority, and which underperforming pages are dragging your overall score down.",
    heroPrimaryCta: "Get Free Audit",
    heroSecondaryCta: "See Pricing",
    heroTrustText: "Trusted by +500 Sri Lankan Businesses & Agencies",

    problemTag: "THE PROBLEM",
    problemHeadline: "You don't know which pages are actually working.",
    problemBody:
      "Most website owners optimise every page the same way, without knowing which ones are responsible for most of their traffic — and which ones are hurting their rankings. You could be spending hours improving pages that already perform well, while your highest-potential pages sit undiscovered and under-optimised. Without page-level visibility, SEO investment gets spread too thin to make a real impact.",

    whatWeGiveTag: "WHAT YOU GET",
    whatWeGiveHeadline: "Page-level clarity. Site-wide results.",
    whatWeGiveItems: [
      {
        title: "High-Traffic Page Identification",
        description:
          "Pinpoints the pages generating the most organic sessions so you know where your SEO is already working.",
      },
      {
        title: "High-Authority Page Detection",
        description:
          "Identifies pages with the strongest backlink profiles — your most powerful pages for internal linking strategy.",
      },
      {
        title: "Underperforming Page Flags",
        description:
          "Surfaces pages with high potential but low performance, giving you quick wins that can significantly boost overall traffic.",
      },
      {
        title: "Page-Level Opportunity Scores",
        description:
          "Each flagged page comes with a simple opportunity score so you can prioritise where to focus your optimisation effort.",
      },
    ],

    useCases: [
      {
        audience: "Small Businesses",
        description: "Double down on what's already working instead of starting from scratch.",
        linkLabel: "See the small business use case",
      },
      {
        audience: "Digital Agencies",
        description: "Show clients exactly which pages to prioritise in the next sprint for maximum ROI.",
        linkLabel: "See the agency use case",
      },
      {
        audience: "E-commerce Brands",
        description: "Find your best-performing product categories and replicate that structure across underperformers.",
        linkLabel: "See the e-commerce use case",
      },
      {
        audience: "Startups",
        description: "Identify which content is gaining traction earliest and invest more in those topics.",
        linkLabel: "See the startup use case",
      },
    ],

    ctaHeadline: "Find out which pages are winning — and which are losing.",
    ctaButtonLabel: "Identify Your Top Pages",

    reviews: [
      {
        quote:
          "We had no idea our blog was driving 60% of our organic traffic. The top-performing pages report made us rethink our entire content strategy.",
        name: "Chamara Bandara",
        role: "Head of Growth",
        company: "Edulink Sri Lanka",
        initials: "CB",
        avatarBg: "#ffedd5",
        avatarColor: "#9a3412",
      },
      {
        quote:
          "Three underperforming service pages were flagged. We optimised them in two weeks and they're now ranking on page one for their target keywords.",
        name: "Ashan Perera",
        role: "Founder",
        company: "StyleMart.lk",
        initials: "AP",
        avatarBg: "#e0d8fb",
        avatarColor: "#5E2CED",
      },
      {
        quote:
          "The opportunity scores made it easy to decide what to work on next. No debate, no guesswork — just clear prioritisation.",
        name: "Tharindi Wickrama",
        role: "Digital Strategy Manager",
        company: "LuxeHomes.lk",
        initials: "TW",
        avatarBg: "#f3e8ff",
        avatarColor: "#6b21a8",
      },
    ],

    metaTitle: "Top-Performing Pages — GrowDigitally SEO Audit",
    metaDescription:
      "Identify your highest-traffic pages, hidden opportunities, and underperforming URLs. Expert-reviewed SEO report delivered to WhatsApp.",
  },

  /* ────────────────────────────────────────────────
     5. BACKLINK PROFILE
  ──────────────────────────────────────────────── */
  {
    id: "backlink-profile",
    slug: "backlink-profile",
    category: "AUDIT REPORT",
    categoryLabel: "Backlink Profile",

    heroHeadline: "Understand the links building — or breaking — your authority.",
    heroSubheadline:
      "Your Backlink Profile report evaluates your current backlinks, referring domains, domain authority, and includes a comprehensive spam score analysis to protect your rankings from toxic links.",
    heroPrimaryCta: "Get Free Audit",
    heroSecondaryCta: "See Pricing",
    heroTrustText: "Trusted by +500 Sri Lankan Businesses & Agencies",

    problemTag: "THE PROBLEM",
    problemHeadline: "Your backlink profile could be quietly hurting your rankings.",
    problemBody:
      "Backlinks are one of Google's most important ranking factors — but not all links help you. Toxic or spammy backlinks can trigger a Google penalty that tanks your rankings overnight. And if you don't know what's in your backlink profile, you can't protect yourself. Meanwhile, your competitors are actively building high-quality links while yours remain unknown and unmanaged.",

    whatWeGiveTag: "WHAT YOU GET",
    whatWeGiveHeadline: "Know exactly what's linking to you — and whether it's helping.",
    whatWeGiveItems: [
      {
        title: "Total Backlink Count",
        description:
          "Full count of all inbound links pointing to your domain, broken down by referring domain and link type.",
      },
      {
        title: "Domain Authority Score",
        description:
          "Your current domain authority rating benchmarked against your top competitors so you know where you stand.",
      },
      {
        title: "Referring Domain Analysis",
        description:
          "A breakdown of which domains are linking to you, their authority scores, and the anchor text being used.",
      },
      {
        title: "Spam Score Analysis",
        description:
          "A comprehensive check for toxic and spammy backlinks that could be flagged by Google — with a clear spam percentage score and disavow recommendations.",
      },
    ],

    useCases: [
      {
        audience: "Small Businesses",
        description: "Make sure the links pointing to your site are helping, not hurting your local rankings.",
        linkLabel: "See the small business use case",
      },
      {
        audience: "Digital Agencies",
        description: "Audit client backlink profiles before starting link-building campaigns to avoid penalties.",
        linkLabel: "See the agency use case",
      },
      {
        audience: "E-commerce Brands",
        description: "Protect high-value product pages from toxic link penalties that could disappear your rankings.",
        linkLabel: "See the e-commerce use case",
      },
      {
        audience: "Startups",
        description: "Start link-building on a clean foundation and understand the baseline you're growing from.",
        linkLabel: "See the startup use case",
      },
    ],

    ctaHeadline: "Find out if your backlinks are helping or hurting you.",
    ctaButtonLabel: "Audit Your Backlink Profile",

    reviews: [
      {
        quote:
          "We discovered 34 toxic backlinks that had been dragging our domain authority down for months. The spam score report told us exactly which ones to disavow.",
        name: "Ruwan Jayasekara",
        role: "E-commerce Manager",
        company: "TechZone.lk",
        initials: "RJ",
        avatarBg: "#fde8d8",
        avatarColor: "#993c1d",
      },
      {
        quote:
          "The referring domain breakdown showed us which partnerships were actually sending link equity our way. We doubled down on those relationships.",
        name: "Priyantha Silva",
        role: "Chief Marketing Officer",
        company: "MediCare Lanka",
        initials: "PS",
        avatarBg: "#dcfce7",
        avatarColor: "#166534",
      },
      {
        quote:
          "Before GrowDigitally, we had no idea what our backlink profile looked like. Turns out it was a mess. Now it's clean and our rankings are recovering.",
        name: "Kasun Wijesinghe",
        role: "Founder",
        company: "BuildPro Lanka",
        initials: "KW",
        avatarBg: "#fef9c3",
        avatarColor: "#854d0e",
      },
    ],

    metaTitle: "Backlink Profile — GrowDigitally SEO Audit",
    metaDescription:
      "Evaluate your backlinks, domain authority, and spam score. Protect your rankings from toxic links. Expert-reviewed and delivered to WhatsApp.",
  },

  /* ────────────────────────────────────────────────
     6. ORGANIC INSIGHTS
  ──────────────────────────────────────────────── */
  {
    id: "organic-insights",
    slug: "organic-insights",
    category: "AUDIT REPORT",
    categoryLabel: "Organic Insights",

    heroHeadline: "Understand your organic traffic — and where it's really coming from.",
    heroSubheadline:
      "Your Organic Insights report breaks down your current organic traffic trends, identifies your core ranking keywords, and shows you exactly which search terms are driving visits to your website.",
    heroPrimaryCta: "Get Free Audit",
    heroSecondaryCta: "See Pricing",
    heroTrustText: "Trusted by +500 Sri Lankan Businesses & Agencies",

    problemTag: "THE PROBLEM",
    problemHeadline: "You're getting traffic but you don't know where it's coming from.",
    problemBody:
      "Organic traffic without context is meaningless. If you don't know which keywords are driving visits, which pages those visitors land on, or whether that traffic is growing or declining — you can't make smart decisions. You might be ranking for the wrong keywords, missing your best opportunities, or slowly losing ground without any visibility into the trend.",

    whatWeGiveTag: "WHAT YOU GET",
    whatWeGiveHeadline: "Real organic data. Clear traffic trends.",
    whatWeGiveItems: [
      {
        title: "Organic Traffic Trend",
        description:
          "A clear view of how your organic traffic has moved over time — growing, declining, or plateaued — with context on what's driving each change.",
      },
      {
        title: "Core Ranking Keywords",
        description:
          "The keywords your website is currently ranking for, their search volumes, and their positions in Google search results.",
      },
      {
        title: "Keyword Opportunity Map",
        description:
          "Keywords where you rank on page 2 or 3 — the highest-value quick wins that a small optimisation push could move to page 1.",
      },
      {
        title: "Search Intent Breakdown",
        description:
          "Classification of your ranking keywords by search intent (informational, navigational, transactional) so you know which ones convert.",
      },
    ],

    useCases: [
      {
        audience: "Small Businesses",
        description: "Find out which searches are already bringing customers to your door and how to get more of them.",
        linkLabel: "See the small business use case",
      },
      {
        audience: "Digital Agencies",
        description: "Show clients their organic performance data with clear trends and keyword-level attribution.",
        linkLabel: "See the agency use case",
      },
      {
        audience: "E-commerce Brands",
        description: "Identify which product searches are driving revenue and which categories are underperforming.",
        linkLabel: "See the e-commerce use case",
      },
      {
        audience: "Startups",
        description: "Understand early traction in organic search and identify the keywords worth doubling down on.",
        linkLabel: "See the startup use case",
      },
    ],

    ctaHeadline: "Discover the keywords bringing customers to your website.",
    ctaButtonLabel: "Unlock Your Organic Insights",

    reviews: [
      {
        quote:
          "We were ranking on page 2 for 18 high-value keywords. Two months of targeted optimisation later, 11 of them are on page 1. That one insight paid for itself many times over.",
        name: "Shalini Mendis",
        role: "Growth Lead",
        company: "FreshMart.lk",
        initials: "SM",
        avatarBg: "#dbeafe",
        avatarColor: "#1e40af",
      },
      {
        quote:
          "The search intent breakdown changed how we write content. We were writing informational posts for transactional keywords. No wonder they weren't converting.",
        name: "Chamara Bandara",
        role: "Head of Growth",
        company: "Edulink Sri Lanka",
        initials: "CB",
        avatarBg: "#ffedd5",
        avatarColor: "#9a3412",
      },
      {
        quote:
          "Finally seeing our organic traffic trend in context made it clear we had a seasonality problem, not an SEO problem. That saved us from making expensive mistakes.",
        name: "Dilanka Rathnayake",
        role: "Marketing Manager",
        company: "CeylonTravels",
        initials: "DR",
        avatarBg: "#fce4ef",
        avatarColor: "#99355a",
      },
    ],

    metaTitle: "Organic Insights — GrowDigitally SEO Audit",
    metaDescription:
      "See your organic traffic trends, ranking keywords, and page-2 quick wins. Expert-reviewed SEO report delivered to your WhatsApp.",
  },

  /* ────────────────────────────────────────────────
     7. ON-PAGE OPTIMISATION SCORE
  ──────────────────────────────────────────────── */
  {
    id: "on-page-optimisation",
    slug: "on-page-optimisation",
    category: "AUDIT REPORT",
    categoryLabel: "On-Page Optimisation Score",

    heroHeadline: "Find out if your pages are actually optimised for search.",
    heroSubheadline:
      "Your On-Page Optimisation Score evaluates title tags, meta descriptions, heading structure, and internal linking across your key pages — with a score and specific fixes for every element that's underperforming.",
    heroPrimaryCta: "Get Free Audit",
    heroSecondaryCta: "See Pricing",
    heroTrustText: "Trusted by +500 Sri Lankan Businesses & Agencies",

    problemTag: "THE PROBLEM",
    problemHeadline: "Your pages look good but Google can't read them properly.",
    problemBody:
      "On-page SEO is the foundation of every page's ability to rank. Missing title tags, duplicate meta descriptions, broken heading hierarchies, and poor internal linking all send the wrong signals to search engines — even if your content is excellent. Most businesses focus on content quality while their on-page fundamentals remain broken, silently limiting how high every page can rank.",

    whatWeGiveTag: "WHAT YOU GET",
    whatWeGiveHeadline: "Every on-page element checked. Every issue flagged.",
    whatWeGiveItems: [
      {
        title: "Title Tag Audit",
        description:
          "Checks every page's title tag for length, keyword inclusion, uniqueness, and formatting — with rewrite suggestions for underperforming titles.",
      },
      {
        title: "Meta Description Review",
        description:
          "Evaluates meta descriptions for length, relevance, and click-worthiness — flags missing, duplicate, or truncated descriptions.",
      },
      {
        title: "Heading Structure Analysis",
        description:
          "Checks H1–H6 hierarchy for correct usage, keyword signals, and structural issues that confuse search engine crawlers.",
      },
      {
        title: "Internal Linking Assessment",
        description:
          "Identifies pages with too few internal links, broken links, or missing anchor text — and recommends link structure improvements.",
      },
    ],

    useCases: [
      {
        audience: "Small Businesses",
        description: "Make sure every page on your site is correctly telling Google what it's about.",
        linkLabel: "See the small business use case",
      },
      {
        audience: "Digital Agencies",
        description: "Run on-page audits for every client page before publishing new content or relaunching sites.",
        linkLabel: "See the agency use case",
      },
      {
        audience: "E-commerce Brands",
        description: "Audit product and category pages at scale for missing titles, duplicate metas, and heading issues.",
        linkLabel: "See the e-commerce use case",
      },
      {
        audience: "Startups",
        description: "Get on-page fundamentals right from the start so new pages rank faster.",
        linkLabel: "See the startup use case",
      },
    ],

    ctaHeadline: "Your pages might look great. Are they optimised?",
    ctaButtonLabel: "Score Your On-Page SEO",

    reviews: [
      {
        quote:
          "6 of our 8 service pages had duplicate meta descriptions. We had no idea. Fixing them alone pushed three pages from position 11 to position 4.",
        name: "Ashan Perera",
        role: "Founder",
        company: "StyleMart.lk",
        initials: "AP",
        avatarBg: "#e0d8fb",
        avatarColor: "#5E2CED",
      },
      {
        quote:
          "The heading structure analysis was an eye-opener. We had multiple H1 tags on every page because of our theme. A quick fix and our pages started ranking.",
        name: "Kasun Wijesinghe",
        role: "Founder",
        company: "BuildPro Lanka",
        initials: "KW",
        avatarBg: "#fef9c3",
        avatarColor: "#854d0e",
      },
      {
        quote:
          "Internal linking was completely broken on our blog. Pages with great content had zero internal links pointing to them. Now they're getting traffic.",
        name: "Chamara Bandara",
        role: "Head of Growth",
        company: "Edulink Sri Lanka",
        initials: "CB",
        avatarBg: "#ffedd5",
        avatarColor: "#9a3412",
      },
    ],

    metaTitle: "On-Page Optimisation Score — GrowDigitally SEO Audit",
    metaDescription:
      "Audit title tags, meta descriptions, headings, and internal links. Get specific fixes for every on-page SEO issue. Delivered to WhatsApp.",
  },

  /* ────────────────────────────────────────────────
     8. PERFORMANCE METRICS
  ──────────────────────────────────────────────── */
  {
    id: "performance-metrics",
    slug: "performance-metrics",
    category: "AUDIT REPORT",
    categoryLabel: "Performance Metrics",

    heroHeadline: "Slow pages lose rankings. Find out how fast yours really are.",
    heroSubheadline:
      "Your Performance Metrics report gives you precise speed scores for both mobile and desktop, Core Web Vitals assessments, and specific fixes to improve load time — because Google uses speed as a direct ranking factor.",
    heroPrimaryCta: "Get Free Audit",
    heroSecondaryCta: "See Pricing",
    heroTrustText: "Trusted by +500 Sri Lankan Businesses & Agencies",

    problemTag: "THE PROBLEM",
    problemHeadline: "A slow website is silently destroying your rankings and conversions.",
    problemBody:
      "Google has used page speed as a ranking factor since 2018, and Core Web Vitals became an official ranking signal in 2021. A website that loads in 4 seconds loses up to 80% of mobile visitors before they even see your content. And despite this, most Sri Lankan business websites have never been properly benchmarked for speed. You could be losing rankings and customers every single day because of fixable performance issues.",

    whatWeGiveTag: "WHAT YOU GET",
    whatWeGiveHeadline: "Real speed scores. Real fixes. Real rankings improvement.",
    whatWeGiveItems: [
      {
        title: "Mobile Speed Score",
        description:
          "Your page speed score on mobile devices — the environment where over 70% of Sri Lankan web traffic originates.",
      },
      {
        title: "Desktop Speed Score",
        description:
          "Your desktop performance score benchmarked against your top competitors so you can see exactly how you compare.",
      },
      {
        title: "Core Web Vitals Assessment",
        description:
          "Largest Contentful Paint (LCP), First Input Delay (FID), and Cumulative Layout Shift (CLS) scores with pass/fail ratings against Google's thresholds.",
      },
      {
        title: "Prioritised Speed Fixes",
        description:
          "A specific list of optimisations ranked by impact — from image compression to render-blocking resources to server response time.",
      },
    ],

    useCases: [
      {
        audience: "Small Businesses",
        description: "Make sure your website doesn't lose customers because it loads too slowly on mobile.",
        linkLabel: "See the small business use case",
      },
      {
        audience: "Digital Agencies",
        description: "Deliver performance reports that prove the value of technical optimisation work to clients.",
        linkLabel: "See the agency use case",
      },
      {
        audience: "E-commerce Brands",
        description: "Speed up product and checkout pages — every second of load time improvement increases conversions.",
        linkLabel: "See the e-commerce use case",
      },
      {
        audience: "Startups",
        description: "Launch with a fast website and avoid building technical debt that becomes expensive to fix later.",
        linkLabel: "See the startup use case",
      },
    ],

    ctaHeadline: "How fast is your website? Find out before your customers do.",
    ctaButtonLabel: "Test Your Page Speed",

    reviews: [
      {
        quote:
          "Our mobile speed score was 34/100. We had no idea. After following the GrowDigitally recommendations, it's now 81/100 and our bounce rate dropped by 40%.",
        name: "Tharindi Wickrama",
        role: "Digital Strategy Manager",
        company: "LuxeHomes.lk",
        initials: "TW",
        avatarBg: "#f3e8ff",
        avatarColor: "#6b21a8",
      },
      {
        quote:
          "The Core Web Vitals breakdown helped us convince our CTO to prioritise performance. Two sprints later, we passed all three metrics and saw a ranking boost.",
        name: "Shalini Mendis",
        role: "Growth Lead",
        company: "FreshMart.lk",
        initials: "SM",
        avatarBg: "#dbeafe",
        avatarColor: "#1e40af",
      },
      {
        quote:
          "Images were the culprit. 14MB of uncompressed images on our homepage. The report flagged it immediately and the fix took our developer one hour.",
        name: "Ruwan Jayasekara",
        role: "E-commerce Manager",
        company: "TechZone.lk",
        initials: "RJ",
        avatarBg: "#fde8d8",
        avatarColor: "#993c1d",
      },
    ],

    metaTitle: "Performance Metrics — GrowDigitally SEO Audit",
    metaDescription:
      "Get mobile and desktop speed scores, Core Web Vitals ratings, and prioritised fixes. Expert-reviewed SEO report delivered to WhatsApp.",
  },

  /* ────────────────────────────────────────────────
     9. TECHNICAL SEO AUDIT
  ──────────────────────────────────────────────── */
  {
    id: "technical-seo-audit",
    slug: "technical-seo-audit",
    category: "AUDIT REPORT",
    categoryLabel: "Technical SEO Audit",

    heroHeadline: "Find every technical issue blocking your website from ranking.",
    heroSubheadline:
      "Your Technical SEO Audit is an in-depth scan of your website's crawlability, indexing health, structured data, site speed, XML sitemap, robots.txt, and 60+ additional technical factors — with clear fixes for every issue found.",
    heroPrimaryCta: "Get Free Audit",
    heroSecondaryCta: "See Pricing",
    heroTrustText: "Trusted by +500 Sri Lankan Businesses & Agencies",

    problemTag: "THE PROBLEM",
    problemHeadline: "Technical issues are blocking Google from seeing your website properly.",
    problemBody:
      "You can have the best content in your industry and still not rank — because of invisible technical barriers that prevent Google from crawling, indexing, or understanding your website. Broken canonical tags, missing sitemaps, blocked resources, schema errors, and crawl depth issues can all cap your rankings no matter how much time you invest in content or links. These issues are invisible to the naked eye but visible to every search engine crawler.",

    whatWeGiveTag: "WHAT YOU GET",
    whatWeGiveHeadline: "70+ technical checks. Every issue explained.",
    whatWeGiveItems: [
      {
        title: "Crawlability & Indexing Check",
        description:
          "Verifies that all key pages are accessible to Google's crawler and correctly indexed — and flags any pages that are blocked or excluded.",
      },
      {
        title: "Schema & Structured Data Scan",
        description:
          "Checks for missing, invalid, or incomplete structured data markup that prevents rich results and reduces click-through rates.",
      },
      {
        title: "Sitemap & Robots.txt Validation",
        description:
          "Validates your XML sitemap format and submission status, and checks robots.txt for rules that may be accidentally blocking crawlers.",
      },
      {
        title: "60+ Additional Technical Checks",
        description:
          "Covers canonical tags, redirect chains, HTTPS status, broken links, page depth, duplicate content, hreflang, and more — all in one comprehensive scan.",
      },
    ],

    useCases: [
      {
        audience: "Small Businesses",
        description: "Make sure Google can actually find, crawl, and index every page on your website correctly.",
        linkLabel: "See the small business use case",
      },
      {
        audience: "Digital Agencies",
        description: "Run technical audits as part of every client onboarding and site migration process.",
        linkLabel: "See the agency use case",
      },
      {
        audience: "E-commerce Brands",
        description: "Audit large product catalogues for crawl depth issues, duplicate content, and indexing problems.",
        linkLabel: "See the e-commerce use case",
      },
      {
        audience: "Startups",
        description: "Catch technical errors before they become ranking problems that take months to recover from.",
        linkLabel: "See the startup use case",
      },
    ],

    ctaHeadline: "Technical issues are invisible. Until they're not.",
    ctaButtonLabel: "Run Your Technical SEO Audit",

    reviews: [
      {
        quote:
          "Our entire blog was accidentally blocked in robots.txt. Every post we'd written over two years was deindexed. The technical audit caught it in minutes.",
        name: "Priyantha Silva",
        role: "Chief Marketing Officer",
        company: "MediCare Lanka",
        initials: "PS",
        avatarBg: "#dcfce7",
        avatarColor: "#166534",
      },
      {
        quote:
          "GrowDigitally found 47 technical issues we had no idea existed. Fixed the critical ones and saw a 34% increase in organic traffic within a month.",
        name: "Dilanka Rathnayake",
        role: "Marketing Manager",
        company: "CeylonTravels",
        initials: "DR",
        avatarBg: "#fce4ef",
        avatarColor: "#99355a",
      },
      {
        quote:
          "The schema scan found errors across 200+ product pages that were preventing rich results in Google. Fixing them increased our CTR by 22%.",
        name: "Ruwan Jayasekara",
        role: "E-commerce Manager",
        company: "TechZone.lk",
        initials: "RJ",
        avatarBg: "#fde8d8",
        avatarColor: "#993c1d",
      },
    ],

    metaTitle: "Technical SEO Audit — GrowDigitally SEO Audit",
    metaDescription:
      "70+ technical SEO checks covering crawlability, indexing, schema, sitemaps, and more. Expert-reviewed report delivered to WhatsApp.",
  },
];

/* ── Helper: get service by slug ── */
export const getServiceBySlug = (slug) =>
  services.find((s) => s.slug === slug) || null;

/* ── Helper: get all slugs (for route generation) ── */
export const getAllServiceSlugs = () => services.map((s) => s.slug);

export default services;