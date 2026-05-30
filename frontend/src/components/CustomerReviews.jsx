/* ─────────────────────────────────────────────
   CustomerReviews.jsx  — Section 7
   GrowDigitally · React + Tailwind CSS
───────────────────────────────────────────── */

/* ── Avatar initials placeholder ── */
const Avatar = ({ initials, bg, color }) => (
  <div
    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-[13px] font-bold"
    style={{ background: bg, color }}
  >
    {initials}
  </div>
);

/* ── Star rating ── */
const Stars = ({ count = 5 }) => (
  <div className="flex items-center gap-0.5 mb-4">
    {[...Array(count)].map((_, i) => (
      <svg key={i} width="14" height="14" viewBox="0 0 16 16" fill="#5E2CED" aria-hidden="true">
        <path d="M8 1l1.85 3.75L14 5.35l-3 2.92.71 4.13L8 10.25l-3.71 2.15L5 8.27 2 5.35l4.15-.6L8 1z" />
      </svg>
    ))}
  </div>
);

/* ── Single review card ── */
const ReviewCard = ({ quote, name, role, company, initials, avatarBg, avatarColor }) => (
  <div
    className="
      bg-white rounded-2xl border border-[#ede8f5] p-6
      flex flex-col justify-between
      hover:border-[#c4b5f7] hover:shadow-[0_4px_24px_rgba(94,44,237,0.08)]
      transition-all duration-200
    "
    
  >
    {/* Quote */}
    <div className="flex-1">
      <Stars />
      <p className="text-[14px] text-[#3a3a4a] leading-[1.72] m-0">
        {quote}
      </p>
    </div>

    {/* Divider */}
    <div className="border-t border-[#f0edf9] my-5" />

    {/* Author */}
    <div className="flex items-center gap-3">
      <Avatar initials={initials} bg={avatarBg} color={avatarColor} />
      <div>
        <p className="text-[14px] font-bold text-[#1a1a2e] m-0 leading-tight">{name}</p>
        <p className="text-[12.5px] text-[#9090a8] m-0 mt-0.5">
          {role}{company ? ` · ${company}` : ""}
        </p>
      </div>
    </div>
  </div>
);

/* ── Reviews data — all GrowDigitally / Sri Lanka context ── */
const reviews = [
  {
    quote:
      "The GrowDigitally audit blew my mind. We had no idea our product pages were missing meta descriptions. Fixed them in a week and our organic impressions jumped 40% in the first month.",
    name: "Ashan Perera",
    role: "Founder",
    company: "StyleMart.lk",
    initials: "AP",
    avatarBg: "#e0d8fb",
    avatarColor: "#5E2CED",
  },
  {
    quote:
      "Managing 15+ client websites used to be a nightmare. The audit report gives us a clear priority list for each site. Our clients are seeing real ranking improvements within weeks.",
    name: "Nimasha Fernando",
    role: "SEO Director",
    company: "Pixel Agency",
    initials: "NF",
    avatarBg: "#d8f5eb",
    avatarColor: "#0f6e56",
  },
  {
    quote:
      "We had over 3,000 product pages and had no clue which ones had technical issues. GrowDigitally's audit found patterns in underperforming pages that manual reviews would have missed entirely.",
    name: "Ruwan Jayasekara",
    role: "E-commerce Manager",
    company: "TechZone.lk",
    initials: "RJ",
    avatarBg: "#fde8d8",
    avatarColor: "#993c1d",
  },
  {
    quote:
      "Finally, an SEO report that speaks plain language. I could share it with my team and they actually understood what needed fixing. The WhatsApp delivery was a brilliant touch.",
    name: "Dilanka Rathnayake",
    role: "Marketing Manager",
    company: "CeylonTravels",
    initials: "DR",
    avatarBg: "#fce4ef",
    avatarColor: "#99355a",
  },
  {
    quote:
      "The competitor intelligence section alone was worth it. We discovered two competitors outranking us on keywords we didn't even know existed. Now we're targeting them strategically.",
    name: "Shalini Mendis",
    role: "Growth Lead",
    company: "FreshMart.lk",
    initials: "SM",
    avatarBg: "#dbeafe",
    avatarColor: "#1e40af",
  },
  {
    quote:
      "The expert review step made all the difference. It's not just raw data — the GrowDigitally team added context and prioritised the fixes that actually moved the needle for our rankings.",
    name: "Kasun Wijesinghe",
    role: "Founder",
    company: "BuildPro Lanka",
    initials: "KW",
    avatarBg: "#fef9c3",
    avatarColor: "#854d0e",
  },
  {
    quote:
      "GrowDigitally identified 52 technical issues we didn't know existed. Fixed the critical ones in a week and saw a 34% increase in organic traffic within a month. Incredible ROI.",
    name: "Priyantha Silva",
    role: "Chief Marketing Officer",
    company: "MediCare Lanka",
    initials: "PS",
    avatarBg: "#dcfce7",
    avatarColor: "#166534",
  },
  {
    quote:
      "We thought our website was fully optimised. The audit showed our mobile speed score was 38/100 and our backlink profile had toxic links dragging us down. Game-changer report.",
    name: "Tharindi Wickrama",
    role: "Digital Strategy Manager",
    company: "LuxeHomes.lk",
    initials: "TW",
    avatarBg: "#f3e8ff",
    avatarColor: "#6b21a8",
  },
  {
    quote:
      "The on-page optimisation breakdown gave us a complete picture we never had before — content gaps, heading issues, and internal link problems all in one place, delivered to WhatsApp.",
    name: "Chamara Bandara",
    role: "Head of Growth",
    company: "Edulink Sri Lanka",
    initials: "CB",
    avatarBg: "#ffedd5",
    avatarColor: "#9a3412",
  },
];

/* ══════════════════════════════════════════
   CUSTOMER REVIEWS SECTION
══════════════════════════════════════════ */
const CustomerReviews = () => {
  return (
    <section
      className="w-full bg-[#faf9ff] py-20 px-12"
      
    >
      <div className="max-w-7xl mx-auto">

        {/* ── Section header — centered ── */}
        <div className="text-center mb-14">
          <h2 className="text-[54px] font-extrabold text-[#1a1a2e] leading-[1.1] tracking-[-1px] mb-4">
            Customer Reviews
          </h2>
          <p className="text-[16px] text-[#5a5a74] leading-[1.65] max-w-130 mx-auto">
            See why Sri Lankan businesses and digital agencies trust GrowDigitally to uncover their SEO opportunities.
          </p>
        </div>

        {/* ── 3 × 3 grid ── */}
        <div className="grid grid-cols-3 gap-5">
          {reviews.map((r, i) => (
            <ReviewCard key={i} {...r} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default CustomerReviews;