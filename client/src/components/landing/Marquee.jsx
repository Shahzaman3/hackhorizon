const row1 = [
  'Tata Ventures', 'Infosys Supply', 'Wipro Traders', 'Reliance B2B', 'HCL Commerce',
  'Mahindra Goods', 'Birla Exports', 'HDFC Trade', 'Bajaj Suppliers', 'Sun Pharma B2B'
];

const row2 = [
  'Adani Logistics', 'Zomato Business', 'Swiggy Partners', 'Flipkart Wholesale',
  'Nykaa Trade', 'Meesho Sellers', 'Razorpay Biz', 'Zepto Commerce', 'Groww Business', 'Paytm B2B'
];

const row1Duplicated = [...row1, ...row1];
const row2Duplicated = [...row2, ...row2];

export default function Marquee() {
  return (
    <section className="bg-[#FDFBF7] py-14 overflow-hidden border-y border-white/[0.04]">
      <p className="text-[11px] font-semibold text-[#728279] text-center mb-8 uppercase tracking-[0.18em]">
        Trusted by leading businesses across India
      </p>

      {/* Row 1 — scrolls left */}
      <div className="relative w-full flex overflow-hidden mb-4 group">
        {/* fade edges */}
        <div className="absolute left-0 top-0 w-24 h-full bg-gradient-to-r from-[#FDFBF7] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-[#FDFBF7] to-transparent z-10 pointer-events-none" />

        <div
          className="flex w-max gap-3 group-hover:[animation-play-state:paused]"
          style={{ animation: 'scrollLeft 35s linear infinite' }}
        >
          {row1Duplicated.map((name, i) => (
            <div
              key={`r1-${i}`}
              className="flex-shrink-0 px-5 py-2 rounded-full border border-[#E5E2D9] bg-[#FFFFFF] text-[#4D6357] text-xs font-semibold whitespace-nowrap hover:border-[#047857]/40 hover:text-[#0A2518] hover:bg-[#F4F1EA] transition-all cursor-default"
              style={{ fontFamily: 'Plus Jakarta Sans' }}
            >
              {name}
            </div>
          ))}
        </div>
      </div>

      {/* Row 2 — scrolls right */}
      <div className="relative w-full flex overflow-hidden group">
        <div className="absolute left-0 top-0 w-24 h-full bg-gradient-to-r from-[#FDFBF7] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-[#FDFBF7] to-transparent z-10 pointer-events-none" />

        <div
          className="flex w-max gap-3 group-hover:[animation-play-state:paused]"
          style={{ animation: 'scrollRight 35s linear infinite' }}
        >
          {row2Duplicated.map((name, i) => (
            <div
              key={`r2-${i}`}
              className="flex-shrink-0 px-5 py-2 rounded-full border border-[#E5E2D9] bg-[#FFFFFF] text-[#4D6357] text-xs font-semibold whitespace-nowrap hover:border-[#047857]/40 hover:text-[#0A2518] hover:bg-[#F4F1EA] transition-all cursor-default"
              style={{ fontFamily: 'Plus Jakarta Sans' }}
            >
              {name}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scrollLeft {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes scrollRight {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}
