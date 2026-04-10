import { Link } from 'react-router-dom';

const links = {
    Product: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
    Company: ['About', 'Careers', 'Blog', 'Press'],
    Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'],
    Support: ['Help Centre', 'API Docs', 'Status', 'Contact'],
};

export default function Footer() {
    return (
        <footer className="bg-dark border-t border-white/5">
            {/* CTA Banner */}
            <div className="border-b border-white/5">
                <div className="max-w-6xl mx-auto px-6 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                            Ready to sync your invoicing?
                        </h3>
                        <p className="text-white/45 text-sm">Start your 14-day free trial. No credit card required.</p>
                    </div>
                    <Link
                        to="/login"
                        className="flex-shrink-0 bg-primary hover:bg-[#2a4128] text-white font-bold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-primary/30 text-sm"
                        style={{ fontFamily: 'Plus Jakarta Sans' }}
                    >
                        Get started for free →
                    </Link>
                </div>
            </div>

            {/* Main footer */}
            <div className="max-w-6xl mx-auto px-6 py-14">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span className="text-white font-bold text-sm" style={{ fontFamily: 'Plus Jakarta Sans' }}>InvoiceSync</span>
                        </div>
                        <p className="text-white/35 text-xs leading-relaxed">
                            B2B Invoice collaboration platform built for modern Indian businesses.
                        </p>
                    </div>

                    {/* Link groups */}
                    {Object.entries(links).map(([group, items]) => (
                        <div key={group}>
                            <h4 className="text-white/70 text-xs font-bold uppercase tracking-widest mb-4">{group}</h4>
                            <ul className="flex flex-col gap-2.5">
                                {items.map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-white/35 hover:text-white/70 text-xs transition-colors">
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3">
                    <p className="text-white/25 text-xs">© 2026 InvoiceSync. All rights reserved.</p>
                    <p className="text-white/25 text-xs">Made with ♥ for Indian businesses · GST Compliant Platform</p>
                </div>
            </div>
        </footer>
    );
}
