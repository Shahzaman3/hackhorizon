import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const productLinks  = ["Features", "Pricing", "Dashboard", "API Docs", "Changelog"];
  const companyLinks  = ["About", "Blog", "Careers", "Press Kit", "Contact"];
  const legalLinks    = ["Privacy Policy", "Terms of Service", "Cookie Policy", "GST Compliance", "Security"];

  return (
    <footer className="bg-[#FDFBF7] relative overflow-hidden border-t border-[#FFFFFF]">
      {/* subtle glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#047857]/3 rounded-full blur-[130px] pointer-events-none" />

      {/* Top nav section */}
      <div className="mx-auto max-w-7xl px-8 pt-16 pb-10 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 text-center">

          {/* Col 1 — Brand */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-2.5 w-max mb-4">
              <div className="w-8 h-8 bg-[#047857] rounded-lg flex items-center justify-center font-bold text-[13px] text-[#FDFBF7] shadow-lg shadow-[#047857]/30">
                IS
              </div>
              <span className="text-[#0A2518] font-bold text-[17px] tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                InvoiceSync
              </span>
            </div>
            <p className="text-[11px] text-[#4D6357] leading-relaxed max-w-[200px]" style={{ fontFamily: 'Inter, sans-serif' }}>
              The smartest way for Indian businesses to collaborate on invoices — GST-ready, real-time, and built for scale.
            </p>
          </div>

          {/* Col 2 — Product */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#728279] mb-4">Product</p>
            <ul className="space-y-2.5">
              {productLinks.map((item) => (
                <li key={item}>
                  <Link to="/" className="text-[11px] uppercase tracking-[0.12em] text-[#4D6357] hover:text-[#047857] transition-colors duration-200">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Company */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#728279] mb-4">Company</p>
            <ul className="space-y-2.5">
              {companyLinks.map((item) => (
                <li key={item}>
                  <Link to="/" className="text-[11px] uppercase tracking-[0.12em] text-[#4D6357] hover:text-[#047857] transition-colors duration-200">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Legal */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#728279] mb-4">Legal</p>
            <ul className="space-y-2.5">
              {legalLinks.map((item) => (
                <li key={item}>
                  <Link to="/" className="text-[11px] uppercase tracking-[0.12em] text-[#4D6357] hover:text-[#047857] transition-colors duration-200">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Giant INVOICESYNC section */}
      <div className="relative w-full overflow-hidden flex flex-col items-center">

        {/* INVOICESYNC — giant dark on dark */}
        <div className="w-full overflow-hidden flex justify-center mt-2">
          <h2
            className="font-black uppercase text-[#0A2518]/5 leading-none w-full text-center select-none"
            style={{
              fontSize: 'clamp(60px, 15vw, 340px)',
              letterSpacing: '-0.02em',
              lineHeight: 0.85,
              fontFamily: 'Plus Jakarta Sans, sans-serif'
            }}
          >
            INVOICESYNC
          </h2>
        </div>

        {/* Subscribe — below giant typography */}
        <div className="flex flex-col items-center gap-1 pt-8 pb-10 relative z-10 w-full max-w-sm mx-auto px-6">
          <h4 className="text-[10px] font-bold text-[#4D6357] uppercase tracking-[0.2em] mb-3">Newsletter</h4>
          <div className="w-full flex">
            <input
              type="email"
              placeholder="Work email address"
              className="bg-[#FFFFFF] border border-[#E5E2D9] border-r-0 rounded-l-xl px-4 py-2.5 text-sm text-[#0A2518] placeholder-[#728279] flex-1 outline-none focus:border-[#047857]/40 transition-colors"
            />
            <button className="bg-[#047857] hover:bg-[#065F46] text-[#FDFBF7] rounded-r-xl px-4 text-sm font-bold transition-colors shadow-lg shadow-[#047857]/20 whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="mx-auto max-w-7xl px-8 py-5 flex flex-col sm:flex-row items-center justify-between border-t border-[#FFFFFF] relative z-10 gap-5">
        <p className="text-[9px] uppercase tracking-[0.18em] text-[#728279] text-center sm:text-left">
          © {currentYear} InvoiceSync. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          {['Twitter', 'LinkedIn', 'Github'].map((social) => (
            <Link key={social} to="/" className="text-[9px] uppercase tracking-[0.18em] text-[#728279] hover:text-[#047857] transition-colors duration-200">
              {social}
            </Link>
          ))}
        </div>
        <p className="text-[9px] uppercase tracking-[0.18em] text-[#728279] text-center sm:text-right">
          Mumbai / Delhi / Bengaluru
        </p>
      </div>

    </footer>
  );
}
