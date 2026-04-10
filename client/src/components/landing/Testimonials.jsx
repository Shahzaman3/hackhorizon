const testimonials = [
    {
        name: 'Priya Sharma',
        role: 'CFO, NexTrade Solutions',
        avatar: 'P',
        rating: 5,
        text: "InvoiceSync cut our invoice processing time by 60%. The buyer collaboration portal is a game-changer — our clients love being able to approve invoices directly.",
    },
    {
        name: 'Arjun Mehta',
        role: 'Founder, SupplyBridge India',
        avatar: 'A',
        rating: 5,
        text: "We handle 300+ invoices a month across 50 buyers. InvoiceSync keeps everything organised and the GST compliance features save us hours every quarter.",
    },
    {
        name: 'Sneha Patil',
        role: 'Head of Finance, Orbis Manufacturing',
        avatar: 'S',
        rating: 5,
        text: "The real-time analytics give our leadership team instant visibility into cash flow. We closed our funding round with clean books thanks to InvoiceSync.",
    },
    {
        name: 'Rajesh Kumar',
        role: 'Director, Vertex Exports',
        avatar: 'R',
        rating: 5,
        text: "Switching from manual Excel sheets to InvoiceSync was seamless. The automated payment reminders alone recovered over ₹15L in outstanding dues.",
    },
];

export default function Testimonials() {
    return (
        <section id="testimonials" className="py-24 bg-bg">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-14">
                    <span className="inline-block bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
                        Testimonials
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-dark mb-4"
                        style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        Loved by finance teams
                        <br />across India
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {testimonials.map(({ name, role, avatar, rating, text }, i) => (
                        <div
                            key={name}
                            className={`rounded-2xl p-7 border transition-all duration-300 hover:shadow-xl ${i % 2 === 0
                                    ? 'bg-dark text-white border-white/10 hover:border-primary/30'
                                    : 'bg-white/70 text-dark border-card/60 hover:border-primary/30'
                                }`}
                        >
                            {/* Stars */}
                            <div className="flex gap-1 mb-4">
                                {Array.from({ length: rating }).map((_, j) => (
                                    <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="#375534">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                ))}
                            </div>

                            {/* Quote */}
                            <p className={`text-sm leading-relaxed mb-6 ${i % 2 === 0 ? 'text-white/65' : 'text-secondary'}`}>
                                "{text}"
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                                    {avatar}
                                </div>
                                <div>
                                    <p className={`font-semibold text-sm ${i % 2 === 0 ? 'text-white' : 'text-dark'}`}
                                        style={{ fontFamily: 'Plus Jakarta Sans' }}>
                                        {name}
                                    </p>
                                    <p className={`text-xs ${i % 2 === 0 ? 'text-white/40' : 'text-secondary'}`}>{role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
