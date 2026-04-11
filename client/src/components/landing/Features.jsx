import { useState } from "react";

const tabs = [
  {
    id: "upload",
    label: "Invoice Upload",
    heading: "Instantly create GST-ready invoices",
    desc: "Sellers can create and upload invoices instantly with all GST-required fields. Set buyer GSTIN, add tax breakdowns (CGST, SGST, IGST), and submit in seconds.",
    image: "/invoiceupload.png",
  },
  {
    id: "validation",
    label: "Buyer Validation",
    heading: "One-click approval workflow",
    desc: "Buyers get a clean dashboard showing all received invoices. Accept, reject, or request modification with a single click. Every action is logged for full audit trail.",
    image: "/buyervalidation.png",
  },
  {
    id: "tracking",
    label: "Status Tracking",
    heading: "Know exactly where your money is",
    desc: "Every invoice moves through a clear lifecycle: Pending → Accepted / Rejected / Modified. Color-coded badges make status instantly scannable.",
    image: "/statustracking.png",
  },
  {
    id: "gst",
    label: "GST Summary",
    heading: "Automated tax calculations",
    desc: "Auto-calculated GST dashboard showing CGST, SGST, and IGST breakdowns. Separate views for GST collected (seller) and GST payable (buyer).",
    image: "/gstsummary.png",
  },
  {
    id: "payments",
    label: "Payment Tracking",
    heading: "Reconcile faster than ever",
    desc: "Sellers mark invoices as Paid or Unpaid with one click. Buyers see outstanding amounts at a glance. Dashboard tiles show pending amounts.",
    image: "/payment.png",
  },
  {
    id: "requests",
    label: "Invoice Requests",
    heading: "Stop chasing over email",
    desc: "Buyers can request missing invoices directly from the platform. Sellers see all incoming requests in one place and can fulfil them instantly.",
    image: "/request.png",
  }
];

const Features = () => {
  const [active, setActive] = useState("upload");
  const current = tabs.find((t) => t.id === active);

  return (
    <section
      id="features"
      className="pt-20 pb-32 px-4 sm:px-6 bg-[#FDFBF7] relative overflow-hidden"
    >
      {/* Background Grid and Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div 
          className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#047857]/5 rounded-full blur-[100px]"
        />
        <div 
          className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-[#065F46]/5 rounded-full blur-[100px]"
        />
      </div>

      {/* heading */}
      <div className="relative z-10 text-center mb-12">
        <h2 
          className="text-[clamp(28px,5vw,56px)] font-bold tracking-tight leading-tight text-[#0A2518]"
          style={{ fontFamily: 'Plus Jakarta Sans' }}
        >
          One platform.
          <br />
          <span className="text-[#047857] ">
            Infinite clarity.
          </span>
        </h2>
      </div>

      <div className="max-w-7xl mx-auto">

        {/* desktop tabs */}
        <div className="hidden sm:flex flex-wrap justify-center border-b border-[#E5E2D9] mb-12 relative z-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`px-5 py-3 text-sm font-semibold transition-all duration-200 relative border-b-2 -mb-px ${
                active === tab.id
                  ? "text-[#047857] border-[#047857] drop-shadow-[0_0_8px_rgba(74,222,128,0.3)]"
                  : "text-[#4D6357] border-transparent hover:text-[#0A2518] hover:border-[#047857]/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* mobile tabs */}
        <div className="flex sm:hidden overflow-x-auto pb-0 mb-8 scrollbar-hide border-b border-[#E5E2D9]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`flex-shrink-0 px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-all duration-200 whitespace-nowrap ${
                active === tab.id
                  ? "text-[#047857] border-[#047857]"
                  : "text-[#4D6357] border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* content */}
        <div className="flex flex-col lg:flex-row gap-8 items-start relative z-10">

          {/* left text */}
          <div
            key={active + "-text"}
            className="animate-fadeIn w-full lg:w-[300px] xl:w-[340px] flex-shrink-0"
          >
            {/* glass badge */}
            <div
              className="inline-flex items-center px-3 py-1.5 rounded-full border border-[#047857]/20 text-xs font-semibold text-[#0A2518] mb-5 backdrop-blur-md"
              style={{
                background: "rgba(74, 222, 128, 0.08)",
                boxShadow: "inset 0 1px 0 rgba(74, 222, 128, 0.15)",
              }}
            >
              {current.label}
            </div>

            <h3 
              className="text-[clamp(20px,2.5vw,34px)] font-bold text-[#0A2518] leading-tight tracking-tight mb-4"
              style={{ fontFamily: 'Plus Jakarta Sans' }}
            >
              {current.heading}
            </h3>

            <p className="text-[#4D6357] text-sm leading-relaxed mb-7">
              {current.desc}
            </p>

            {/* list */}
            <div className="hidden lg:flex flex-col gap-2">
              {tabs
                .filter((t) => t.id !== active)
                .slice(0, 5)
                .map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActive(tab.id)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-[#E5E2D9] text-sm text-[#4D6357] hover:text-[#0A2518] hover:border-[#047857]/30 transition-all text-left bg-transparent w-full group"
                  >
                    <span className="font-medium">{tab.label}</span>
                    <span className="ml-auto opacity-40 text-xs text-[#047857] group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                ))}
            </div>
          </div>

          {/* right image/video mock */}
          <div
            key={active + "-img"}
            className="animate-fadeIn rounded-2xl overflow-hidden border border-[#E5E2D9] bg-[#FFFFFF] flex flex-col w-full flex-1 min-w-0"
            style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}
          >
            {/* Mac Browser Header */}
            <div className="bg-[#F4F1EA] px-4 py-2.5 flex items-center gap-2 border-b border-[#E5E2D9]">
              {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                <div
                  key={c}
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: c }}
                />
              ))}
              <div className="ml-3 text-xs text-[#4D6357] bg-[#FDFBF7] px-3 py-1 rounded-md border border-[#E5E2D9] truncate tracking-wider">
                app.invoicesync.com/{active}
              </div>
            </div>
            
            {/* Image Display Area */}
            <div className="relative aspect-[16/10] w-full h-full overflow-hidden bg-[#FDFBF7] p-4 sm:p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#047857]/5 via-transparent to-transparent z-10 pointer-events-none" />
              <img 
                src={current.image} 
                alt={current.label} 
                className="w-full h-full object-contain animate-fade-in transition-transform duration-700 hover:scale-[1.03]"
              />
              <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.02)] pointer-events-none z-20" />
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease forwards;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default Features;
