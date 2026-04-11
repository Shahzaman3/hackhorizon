import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { user } = useAuth();
  const dashboardPath = `/${user?.role === 'buyer' ? 'buyer' : 'seller'}/overview`;

  const productLinks = ["Features", "Pricing", "Dashboard", "API Docs", "Changelog"];
  const companyLinks = ["About", "Blog", "Careers", "Press Kit", "Contact"];
  const legalLinks   = ["Privacy Policy", "Terms of Service", "Cookie Policy", "GST Compliance", "Security"];

  return (
    <footer className="bg-dark relative overflow-hidden border-t border-border">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-200 h-75 bg-[#047857]/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Top nav section */}
      <div className="mx-auto max-w-7xl px-6 sm:px-8 pt-16 pb-10 relative z-10">

        {/* Brand - always full width, centered */}
        <div className="flex flex-col items-center mb-12 lg:hidden">
          <div className="flex items-center gap-1.5 mb-4">
            <img src="/logo.png" alt="InvoiceSync logo" className="w-14 h-14 object-contain" />
            <span className="text-text font-bold text-[17px] tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              InvoiceSync
            </span>
          </div>
          <p className="text-[11px] text-muted leading-relaxed max-w-55 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
            The smartest way for Indian businesses to collaborate on invoices - GST-ready, real-time, and built for scale.
          </p>
        </div>

        {/* Links grid - 3 cols on mobile/tablet, 4 cols on desktop */}
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-10 lg:gap-8">

          {/* Col 1 - Brand (desktop only) */}
          <div className="hidden lg:flex flex-col items-center">
            <div className="flex items-center gap-1.5 mb-4">
              <img src="/logo.png" alt="InvoiceSync logo" className="w-14 h-14 object-contain" />
              <span className="text-text font-bold text-[17px] tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                InvoiceSync
              </span>
            </div>
            <p className="text-[11px] text-muted leading-relaxed max-w-50 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
              The smartest way for Indian businesses to collaborate on invoices - GST-ready, real-time, and built for scale.
            </p>
          </div>

          {/* Col - Product */}
          <div className="flex flex-col items-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-muted-2 mb-4">Product</p>
            <ul className="space-y-2.5 text-center">
              {productLinks.map((item) => (
                <li key={item}>
                  <Link
                    to={item === 'Dashboard' && user ? dashboardPath : '/'}
                    className="text-[10px] sm:text-[11px] uppercase tracking-widest text-muted hover:text-[#047857] transition-colors duration-200"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col - Company */}
          <div className="flex flex-col items-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-muted-2 mb-4">Company</p>
            <ul className="space-y-2.5 text-center">
              {companyLinks.map((item) => (
                <li key={item}>
                  <Link to="/" className="text-[10px] sm:text-[11px] uppercase tracking-widest text-muted hover:text-[#047857] transition-colors duration-200">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col - Legal */}
          <div className="flex flex-col items-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-muted-2 mb-4">Legal</p>
            <ul className="space-y-2.5 text-center">
              {legalLinks.map((item) => (
                <li key={item}>
                  <Link to="/" className="text-[10px] sm:text-[11px] uppercase tracking-widest text-muted hover:text-[#047857] transition-colors duration-200">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Giant INVOICESYNC */}
      <div className="relative w-full overflow-hidden flex flex-col items-center">
        <div className="w-full overflow-hidden flex justify-center mt-2">
          <h2
            className="font-black uppercase text-text/5 leading-none w-full text-center select-none"
            style={{
              fontSize: 'clamp(36px, 15vw, 340px)',
              letterSpacing: '-0.02em',
              lineHeight: 0.85,
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
          >
            INVOICESYNC
          </h2>
        </div>

        {/* Subscribe */}
        <div className="flex flex-col items-center gap-1 pt-8 pb-10 relative z-10 w-full max-w-sm mx-auto px-6">
          <h4 className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-3">Newsletter</h4>
          <div className="w-full flex">
            <input
              type="email"
              placeholder="Work email address"
              className="bg-surface border border-border border-r-0 rounded-l-xl px-4 py-2.5 text-sm text-text placeholder-muted-2 flex-1 min-w-0 outline-none focus:border-[#047857]/40 transition-colors"
            />
            <button className="bg-[#047857] hover:bg-[#065F46] text-dark rounded-r-xl px-4 text-sm font-bold transition-colors shadow-lg shadow-[#047857]/20 whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto max-w-7xl px-6 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between border-t border-border relative z-10 gap-4">
        <p className="text-[9px] uppercase tracking-[0.18em] text-muted-2 text-center sm:text-left">
          (c) {currentYear} InvoiceSync. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          {['Twitter', 'LinkedIn', 'Github'].map((social) => (
            <Link key={social} to="/" className="text-[9px] uppercase tracking-[0.18em] text-muted-2 hover:text-[#047857] transition-colors duration-200">
              {social}
            </Link>
          ))}
        </div>
        <p className="text-[9px] uppercase tracking-[0.18em] text-muted-2 text-center sm:text-right">
          Mumbai / Delhi / Bengaluru
        </p>
      </div>

    </footer>
  );
}