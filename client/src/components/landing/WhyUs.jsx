const reasons = [
    {
        num: '01',
        title: 'Built for Indian B2B',
        desc: 'GST-native, INR-first, with TDS handling, e-way bill support, and MSME compliance baked in from day one.',
    },
    {
        num: '02',
        title: 'Real Collaboration, Not Just Sharing',
        desc: 'Buyers and sellers work in the same workspace — approve, dispute, and negotiate without leaving the platform.',
    },
    {
        num: '03',
        title: 'No Setup Headaches',
        desc: 'Go live in under 5 minutes. Connect your existing Tally or Zoho Books data with one-click import.',
    },
    {
        num: '04',
        title: 'Enterprise-grade Security',
        desc: 'End-to-end encryption, role-based access control, audit trails, and SOC 2 compliant infrastructure.',
    },
];

export default function WhyUs() {
    return (
        <section id="why-us" className="py-24 bg-dark">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left text */}
                    <div>
                        <span className="inline-block text-xs font-bold uppercase tracking-widest text-secondary mb-4">
                            Why InvoiceSync?
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6"
                            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                            We're not just
                            <br />another invoicing tool
                        </h2>
                        <p className="text-white/50 text-lg leading-relaxed mb-8">
                            Most tools are built for accountants. InvoiceSync is built for the entire
                            revenue chain — founders, finance teams, and their partners.
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {['R', 'T', 'A', 'S'].map((l, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-secondary/40 border-2 border-dark flex items-center justify-center text-white text-xs font-bold">
                                        {l}
                                    </div>
                                ))}
                            </div>
                            <span className="text-white/50 text-sm">Join 500+ Indian businesses</span>
                        </div>
                    </div>

                    {/* Right: reason cards */}
                    <div className="flex flex-col gap-4">
                        {reasons.map(({ num, title, desc }) => (
                            <div key={num} className="group flex gap-5 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-primary/30 rounded-2xl p-5 transition-all duration-300">
                                <span className="text-primary/50 text-2xl font-black flex-shrink-0" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                                    {num}
                                </span>
                                <div>
                                    <h3 className="text-white font-bold text-base mb-1.5" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                                        {title}
                                    </h3>
                                    <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
