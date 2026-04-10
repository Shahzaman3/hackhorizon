const features = [
    {
        icon: (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9l-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13 2v7h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        title: 'Smart Invoice Builder',
        desc: 'Create GST-compliant invoices in seconds with auto-filled templates, line-item calculations, and PDF export.',
    },
    {
        icon: (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        title: 'Buyer-Seller Collaboration',
        desc: 'Buyers can view, approve, flag, or dispute invoices in real-time — no email chains, no confusion.',
    },
    {
        icon: (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        title: 'Real-time Analytics',
        desc: 'Track revenue trends, overdue amounts, and GST summaries with interactive charts and exportable reports.',
    },
    {
        icon: (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" strokeWidth="2" />
            </svg>
        ),
        title: 'Payment Tracking',
        desc: 'Automatically sync payment statuses from Razorpay, PayU, and bank feeds — always know what\'s owed.',
    },
    {
        icon: (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        title: 'GST Compliance Engine',
        desc: 'Auto-compute IGST, CGST, SGST. Generate GSTR-1 ready summaries and stay audit-proof.',
    },
    {
        icon: (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        title: 'Smart Notifications',
        desc: 'Get instant alerts for due dates, payment receipts, disputes, and approval requests via email or in-app.',
    },
];

export default function Features() {
    return (
        <section id="features" className="py-24 bg-bg">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="inline-block bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
                        Features
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-dark mb-4"
                        style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        Everything you need to
                        <br />manage B2B invoicing
                    </h2>
                    <p className="text-secondary text-lg max-w-xl mx-auto">
                        From creation to payment, InvoiceSync handles every step of your invoice lifecycle.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map(({ icon, title, desc }) => (
                        <div
                            key={title}
                            className="group bg-white/60 backdrop-blur-sm border border-card/60 rounded-2xl p-6 hover:bg-white hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                {icon}
                            </div>
                            <h3 className="text-dark font-bold text-lg mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                {title}
                            </h3>
                            <p className="text-secondary text-sm leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
