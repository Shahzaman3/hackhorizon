import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../shared/Button';

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const links = ['Features', 'Why Us', 'Pricing', 'Testimonials'];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/95 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span className="text-white font-bold text-lg" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        InvoiceSync
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {links.map((l) => (
                        <a
                            key={l}
                            href={`#${l.toLowerCase().replace(' ', '-')}`}
                            className="text-white/70 hover:text-white text-sm font-medium transition-colors duration-150"
                        >
                            {l}
                        </a>
                    ))}
                </div>

                {/* CTA */}
                <div className="hidden md:flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/login')}
                        className="text-white/80 hover:text-white hover:bg-white/10">
                        Log in
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => navigate('/login')}>
                        Get Started
                    </Button>
                </div>

                {/* Mobile hamburger */}
                <button onClick={() => setOpen(!open)} className="md:hidden text-white p-1.5">
                    {open ? (
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                    ) : (
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                    )}
                </button>
            </div>

            {/* Mobile menu */}
            {open && (
                <div className="md:hidden bg-dark border-t border-white/10 px-6 py-4 flex flex-col gap-4">
                    {links.map((l) => (
                        <a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`}
                            className="text-white/70 hover:text-white text-sm font-medium"
                            onClick={() => setOpen(false)}>
                            {l}
                        </a>
                    ))}
                    <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                        <Button variant="ghost" className="text-white/80 hover:bg-white/10 w-full" onClick={() => navigate('/login')}>Log in</Button>
                        <Button variant="primary" className="w-full" onClick={() => navigate('/login')}>Get Started</Button>
                    </div>
                </div>
            )}
        </nav>
    );
}
