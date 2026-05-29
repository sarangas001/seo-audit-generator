import { useState } from "react";
import Logo from "../../assets/logo.png";

const ChevronIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    className="opacity-50"
  >
    <path
      d="M4 6l4 4 4-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const navItems = [
  { label: "Services", hasDropdown: true },
  { label: "Solutions", hasDropdown: true },
  { label: "Free SEO Audit", hasDropdown: false },
  { label: "Pricing", hasDropdown: false },
  { label: "Resources", hasDropdown: false },
];

const NavLinks = () => {
  const [activeItem, setActiveItem] = useState(null);

  return (
    <ul className="flex items-center gap-1 list-none m-0 p-0">
      {navItems.map((item) => (
        <li key={item.label} className="relative">
          <button
            className={`
              font-[Plus_Jakarta_Sans,sans-serif] text-[14.5px] font-medium text-[#3a3a4a]
              bg-transparent border-none cursor-pointer px-3.5 py-2 rounded-lg
              flex items-center gap-1.5 whitespace-nowrap transition-all duration-150
              hover:bg-[#f5f0ff] hover:text-[#5E2CED]
              ${activeItem === item.label ? "bg-[#f5f0ff] text-[#5E2CED]" : ""}
            `}
            onClick={() =>
              setActiveItem(activeItem === item.label ? null : item.label)
            }
          >
            {item.label}
            {item.hasDropdown && <ChevronIcon />}
          </button>
        </li>
      ))}
    </ul>
  );
};

const NavBar = () => {
  return (
    <nav
      className="bg-white border-b border-[#f0edf9] px-12 h-[68px] flex items-center justify-between w-full"
      role="navigation"
      aria-label="GrowDigitally main navigation"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <img src={Logo} alt="GrowDigitally Logo" className="h-8 w-auto" />
      <NavLinks />
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <button
          className="
            font-[Plus_Jakarta_Sans,sans-serif] text-sm font-semibold text-white
            bg-[#5E2CED] border-none rounded-lg px-5 py-2.5 cursor-pointer whitespace-nowrap
            transition-all duration-150 hover:bg-[#4a1fd4] active:scale-[0.98]
          "
        >
          Get Free Audit
        </button>
      </div>
    </nav>
  );
};

export default NavBar;