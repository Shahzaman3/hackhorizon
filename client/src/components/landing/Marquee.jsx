const row1 = [
  'Tata Ventures', 'Infosys Supply', 'Wipro Traders', 'Reliance B2B', 'HCL Commerce',
  'Mahindra Goods', 'Birla Exports', 'HDFC Trade', 'Bajaj Suppliers', 'Sun Pharma B2B'
];

const row2 = [
  'Adani Logistics', 'Zomato Business', 'Swiggy Partners', 'Flipkart Wholesale',
  'Nykaa Trade', 'Meesho Sellers', 'Razorpay Biz', 'Zepto Commerce', 'Groww Business', 'Paytm B2B'
];

const allCompanies = [...row1, ...row2];

const companyLogos = {
  'Tata Ventures': 'TV',
  'Infosys Supply': 'IS',
  'Wipro Traders': 'WT',
  'Reliance B2B': 'RB',
  'HCL Commerce': 'HC',
  'Mahindra Goods': 'MG',
  'Birla Exports': 'BE',
  'HDFC Trade': 'HT',
  'Bajaj Suppliers': 'BS',
  'Sun Pharma B2B': 'SP',
  'Adani Logistics': 'AL',
  'Zomato Business': 'ZB',
  'Swiggy Partners': 'SG',
  'Flipkart Wholesale': 'FW',
  'Nykaa Trade': 'NT',
  'Meesho Sellers': 'MS',
  'Razorpay Biz': 'RZ',
  'Zepto Commerce': 'ZC',
  'Groww Business': 'GB',
  'Paytm B2B': 'PB',
};

const mergedDuplicated = [...allCompanies, ...allCompanies];

export default function Marquee() {
  return (
    <div className="group relative w-full overflow-hidden py-4 px-0">
      <div className="absolute left-0 top-0 h-full w-24 sm:w-32 bg-linear-to-r from-[#FDFBF7] via-[#FDFBF7]/60 to-transparent z-20 pointer-events-none backdrop-blur-sm" />
      <div className="absolute right-0 top-0 h-full w-24 sm:w-32 bg-linear-to-l from-[#FDFBF7] via-[#FDFBF7]/60 to-transparent z-20 pointer-events-none backdrop-blur-sm" />

      <div
        className="flex w-max gap-4 group-hover:[animation-play-state:paused]"
        style={{ animation: 'scrollContinuous 60s linear infinite' }}
      >
        {mergedDuplicated.map((name, i) => (
          <div key={`marquee-${i}`} className="flex items-center gap-2 shrink-0 px-4 py-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white bg-[#065F46] border border-[#047857]/35"
              style={{ fontFamily: 'Plus Jakarta Sans' }}
            >
              {companyLogos[name]}
            </div>
            <span
              className="text-sm font-semibold text-[#4D6357] whitespace-nowrap hover:text-[#0A2518] transition-colors duration-300 cursor-default"
              style={{ fontFamily: 'Plus Jakarta Sans' }}
            >
              {name}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes scrollContinuous {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
