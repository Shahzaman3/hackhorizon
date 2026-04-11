import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('');
  const { user } = useAuth();

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
          ? 'bg-dark/90 backdrop-blur-xl border-b border-text/5 shadow-lg shadow-black/40'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-[70px] px-6 md:px-10">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <img src="/logo.png" alt="InvoiceSync logo" className="w-14 h-14 object-contain" />
          <span className="text-text font-bold text-[17px] tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
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
                  ? "text-text" 
                  : "text-muted group-hover:text-text"
              }`}>
                {link.name}
              </span>
              <span 
                className={`absolute bottom-0 left-0 h-0.5 bg-[#047857] transition-all duration-300 ${
                  activeLink === link.name ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </a>
          ))}
        </div>

        {/* Right Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link
              to={`/${user.role === 'buyer' ? 'buyer' : 'seller'}/overview`}
              className="text-sm font-bold text-dark bg-[#047857] hover:bg-[#065F46] px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-[#047857]/20 hover:shadow-[#047857]/40 hover:scale-[1.02]"
              style={{ fontFamily: 'Plus Jakarta Sans' }}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-muted hover:text-text px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-bold text-dark bg-[#047857] hover:bg-[#065F46] px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-[#047857]/20 hover:shadow-[#047857]/40 hover:scale-[1.02]"
                style={{ fontFamily: 'Plus Jakarta Sans' }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-text/10 text-text hover:bg-text/5 transition-colors"
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
        <div className="md:hidden absolute top-17.5 left-0 w-full bg-dark/95 backdrop-blur-xl border-b border-text/5 animate-fade-in">
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
                  activeLink === link.name ? 'text-[#047857]' : 'text-muted hover:text-text'
                }`}
              >
                {link.name}
              </a>
            ))}
            <div className="flex flex-col w-full gap-3 mt-2 border-t border-text/5 pt-6">
              {user ? (
                <Link
                  to={`/${user.role === 'buyer' ? 'buyer' : 'seller'}/overview`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl bg-[#047857] text-dark text-sm font-bold hover:bg-[#065F46] transition-colors shadow-lg shadow-[#047857]/20"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-xl border border-text/10 text-sm font-semibold text-text hover:bg-text/5 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-xl bg-[#047857] text-dark text-sm font-bold hover:bg-[#065F46] transition-colors shadow-lg shadow-[#047857]/20"
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
