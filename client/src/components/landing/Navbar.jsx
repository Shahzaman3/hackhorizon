import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('');
  const { user, token } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features',     href: '#features' },
    { name: 'Why Us',       href: '#whyus' },
    { name: 'Pricing',      href: '#pricing' },
    { name: 'Testimonials', href: '#testimonials' },
  ];

  return (
    <nav
      className={`sticky top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#FDFBF7]/90 backdrop-blur-xl border-b border-[#0A2518]/5 shadow-lg shadow-black/40'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-[70px] px-6 md:px-10">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-8 h-8 bg-[#047857] rounded-lg flex items-center justify-center font-bold text-[13px] text-[#FDFBF7] shadow-lg shadow-[#047857]/30 group-hover:shadow-[#047857]/50 transition-shadow">
            IS
          </div>
          <span className="text-[#0A2518] font-bold text-[17px] tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            InvoiceSync
          </span>
        </Link>

        {/* Center Nav (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setActiveLink(link.name)}
              className="relative text-sm font-medium transition-colors duration-200 group py-1"
            >
              <span className={`transition-colors duration-200 ${
                activeLink === link.name 
                  ? "text-[#0A2518]" 
                  : "text-[#4D6357] group-hover:text-[#0A2518]"
              }`}>
                {link.name}
              </span>
              <span 
                className={`absolute bottom-0 left-0 h-[2px] bg-[#047857] transition-all duration-300 ${
                  activeLink === link.name ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </a>
          ))}
        </div>

        {/* Right Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {token && user ? (
            <Link
              to={`/${user.role === 'buyer' ? 'buyer' : 'seller'}/dashboard`}
              className="text-sm font-bold text-[#FDFBF7] bg-[#047857] hover:bg-[#065F46] px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-[#047857]/20 hover:shadow-[#047857]/40 hover:scale-[1.02]"
              style={{ fontFamily: 'Plus Jakarta Sans' }}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-[#4D6357] hover:text-[#0A2518] px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-bold text-[#FDFBF7] bg-[#047857] hover:bg-[#065F46] px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-[#047857]/20 hover:shadow-[#047857]/40 hover:scale-[1.02]"
                style={{ fontFamily: 'Plus Jakarta Sans' }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-[#0A2518]/10 text-[#0A2518] hover:bg-[#0A2518]/5 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[70px] left-0 w-full bg-[#FDFBF7]/95 backdrop-blur-xl border-b border-[#0A2518]/5 animate-fade-in">
          <div className="flex flex-col items-center gap-6 py-8 px-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => {
                  setActiveLink(link.name);
                  setMobileMenuOpen(false);
                }}
                className={`text-base font-medium transition-colors ${
                  activeLink === link.name ? 'text-[#047857]' : 'text-[#4D6357] hover:text-[#0A2518]'
                }`}
              >
                {link.name}
              </a>
            ))}
            <div className="flex flex-col w-full gap-3 mt-2 border-t border-[#0A2518]/5 pt-6">
              {token && user ? (
                <Link
                  to={`/${user.role === 'buyer' ? 'buyer' : 'seller'}/dashboard`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl bg-[#047857] text-[#FDFBF7] text-sm font-bold hover:bg-[#065F46] transition-colors shadow-lg shadow-[#047857]/20"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-xl border border-[#0A2518]/10 text-sm font-semibold text-[#0A2518] hover:bg-[#0A2518]/5 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-xl bg-[#047857] text-[#FDFBF7] text-sm font-bold hover:bg-[#065F46] transition-colors shadow-lg shadow-[#047857]/20"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
