import { useNavigate } from 'react-router-dom';
import Button from '../shared/Button';

export default function Hero() {
    const navigate = useNavigate();

    return (
        <section className="relative min-h-screen bg-dark flex flex-col items-center justify-center overflow-hidden pt-16">
            {/* Background gradient blobs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/15 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-1.5 mb-8">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-semibold text-card uppercase tracking-widest">
                        B2B Invoice Collaboration Platform
                    </span>
                </div>

                {/* Headline */}
                <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6"
                    style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Sync Invoices.{' '}
                    <span className="text-transparent bg-clip-text"
                        style={{ backgroundImage: 'linear-gradient(135deg, #6B9071, #AEC3B0)' }}>
                        Close Deals.
                    </span>
                    <br />Grow Faster.
                </h1>

                {/* Subheadline */}
                <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
                    InvoiceSync streamlines B2B invoicing with real-time collaboration, GST compliance,
                    and an AI-powered analytics dashboard — all in one place.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                    <Button size="lg" variant="primary" onClick={() => navigate('/login')}
                        className="text-base shadow-xl shadow-primary/30">
                        Start Free Trial
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Button>
                    <Button size="lg" variant="outline"
                        className="border-white/30 text-white hover:bg-white/10 hover:border-white/50">
                        Watch Demo
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            <path d="M10 8l6 4-6 4V8z" fill="currentColor" />
                        </svg>
                    </Button>
                </div>

                {/* Trust stats */}
                <div className="flex flex-wrap justify-center gap-8 text-center">
                    {[
                        { val: '10K+', label: 'Invoices Processed' },
                        { val: '98%', label: 'Uptime SLA' },
                        { val: '500+', label: 'Businesses Trust Us' },
                        { val: '4.9★', label: 'Average Rating' },
                    ].map(({ val, label }) => (
                        <div key={label}>
                            <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{val}</div>
                            <div className="text-xs text-white/50 mt-0.5">{label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
