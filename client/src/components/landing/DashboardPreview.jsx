export default function DashboardPreview() {
    const invoices = [
        { id: 'INV-2401', client: 'Reliance Industries', amount: '₹1,24,000', status: 'Paid', date: '10 Apr 2026' },
        { id: 'INV-2402', client: 'Tata Consultancy', amount: '₹87,500', status: 'Pending', date: '09 Apr 2026' },
        { id: 'INV-2403', client: 'Infosys Ltd.', amount: '₹2,03,400', status: 'Overdue', date: '05 Apr 2026' },
        { id: 'INV-2404', client: 'Wipro Technologies', amount: '₹56,200', status: 'Draft', date: '03 Apr 2026' },
    ];

    const statusColors = {
        Paid: 'bg-primary/20 text-primary',
        Pending: 'bg-yellow-500/20 text-yellow-400',
        Overdue: 'bg-red-500/20 text-red-400',
        Draft: 'bg-white/10 text-white/50',
    };

    return (
        <section className="py-24 bg-dark">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-14">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4"
                        style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        A dashboard built for{' '}
                        <span className="text-transparent bg-clip-text"
                            style={{ backgroundImage: 'linear-gradient(135deg, #6B9071, #AEC3B0)' }}>
                            clarity
                        </span>
                    </h2>
                    <p className="text-white/50 text-lg max-w-xl mx-auto">
                        Track every invoice, every rupee — in real time. No spreadsheets, no chaos.
                    </p>
                </div>

                {/* Mock dashboard card */}
                <div className="rounded-2xl border border-white/10 bg-[#0a1f15] overflow-hidden shadow-2xl shadow-black/50">
                    {/* Top bar */}
                    <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
                        <div className="flex gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-red-500/70" />
                            <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                            <span className="w-3 h-3 rounded-full bg-green-500/70" />
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5">
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
                                <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" stroke="white" strokeWidth="2" strokeOpacity=".4" />
                            </svg>
                            <span className="text-white/30 text-xs">app.invoicesync.io/dashboard</span>
                        </div>
                        <div className="w-16" />
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-4 gap-px bg-white/5">
                        {[
                            { label: 'Total Revenue', val: '₹8.4L', change: '+12.5%' },
                            { label: 'Paid', val: '142', change: '+8' },
                            { label: 'Pending', val: '23', change: '-3' },
                            { label: 'Overdue', val: '5', change: '+2' },
                        ].map(({ label, val, change }) => (
                            <div key={label} className="bg-[#0a1f15] px-5 py-4">
                                <p className="text-white/40 text-xs mb-1">{label}</p>
                                <p className="text-white text-xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>{val}</p>
                                <p className="text-xs text-secondary mt-0.5">{change} this month</p>
                            </div>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/5">
                                    {['Invoice ID', 'Client', 'Amount', 'Status', 'Date'].map((h) => (
                                        <th key={h} className="px-5 py-3 text-left text-white/30 text-xs font-semibold uppercase tracking-wider">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv) => (
                                    <tr key={inv.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                                        <td className="px-5 py-3.5 text-white/80 font-mono text-xs">{inv.id}</td>
                                        <td className="px-5 py-3.5 text-white font-medium">{inv.client}</td>
                                        <td className="px-5 py-3.5 text-white font-semibold">{inv.amount}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[inv.status]}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-white/40 text-xs">{inv.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}
