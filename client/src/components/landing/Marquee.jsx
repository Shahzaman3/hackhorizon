import { useEffect, useRef } from 'react';

const logos = [
    'Zoho Books', 'Tally ERP', 'QuickBooks', 'FreshBooks', 'Wave', 'Xero',
    'Razorpay', 'Stripe', 'PayU', 'ClearTax', 'Instamojo', 'BillDesk',
];

export default function Marquee() {
    const track = useRef(null);

    return (
        <section className="bg-dark py-10 overflow-hidden border-y border-white/5">
            <p className="text-center text-white/40 text-xs font-semibold uppercase tracking-widest mb-6">
                Trusted integrations &amp; partners
            </p>
            <div className="relative">
                <div
                    ref={track}
                    className="flex gap-12 items-center w-max"
                    style={{ animation: 'marquee 28s linear infinite' }}
                >
                    {[...logos, ...logos].map((logo, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors duration-200 whitespace-nowrap select-none"
                        >
                            <div className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-white/60">{logo[0]}</span>
                            </div>
                            <span className="text-sm font-medium">{logo}</span>
                        </div>
                    ))}
                </div>
            </div>
            <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
        </section>
    );
}
