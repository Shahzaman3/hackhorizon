import { useState } from 'react';
import StatusBadge from './StatusBadge';
import InvoiceModal from './InvoiceModal';

export default function InvoiceTable({ invoices = [], role = 'seller' }) {
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const statuses = ['All', 'Paid', 'Pending', 'Overdue', 'Draft', 'Approved', 'Disputed'];

    const filtered = invoices.filter((inv) => {
        const matchSearch =
            inv.id?.toLowerCase().includes(search.toLowerCase()) ||
            inv.client?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <>
            <div className="bg-white/70 border border-card/50 rounded-2xl overflow-hidden">
                {/* Table header controls */}
                <div className="px-5 py-4 border-b border-card/30 flex flex-wrap items-center gap-3">
                    <h3 className="font-bold text-dark text-sm flex-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                        Invoices
                    </h3>
                    {/* Search */}
                    <div className="flex items-center gap-2 bg-bg border border-card/50 rounded-xl px-3 py-2 text-xs text-secondary w-44">
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            className="bg-transparent outline-none text-dark placeholder-secondary/50 w-full"
                        />
                    </div>
                    {/* Status filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-bg border border-card/50 rounded-xl px-3 py-2 text-xs text-secondary outline-none cursor-pointer hover:border-primary/30 transition-colors"
                    >
                        {statuses.map((s) => <option key={s}>{s}</option>)}
                    </select>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-bg/50 border-b border-card/30">
                                {['Invoice ID', 'Client / Vendor', 'Amount', 'GST', 'Status', 'Due Date', ''].map((h) => (
                                    <th key={h} className="px-5 py-3 text-left text-secondary text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-5 py-12 text-center text-secondary text-sm">
                                        No invoices found
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((inv) => (
                                    <tr
                                        key={inv.id}
                                        className="border-b border-card/20 hover:bg-bg/40 transition-colors cursor-pointer"
                                        onClick={() => setSelected(inv)}
                                    >
                                        <td className="px-5 py-3.5 font-mono text-xs text-secondary">{inv.id}</td>
                                        <td className="px-5 py-3.5 font-semibold text-dark">{inv.client}</td>
                                        <td className="px-5 py-3.5 font-bold text-dark">{inv.amount}</td>
                                        <td className="px-5 py-3.5 text-secondary text-xs">{inv.gst || '—'}</td>
                                        <td className="px-5 py-3.5"><StatusBadge status={inv.status} /></td>
                                        <td className="px-5 py-3.5 text-secondary text-xs">{inv.dueDate}</td>
                                        <td className="px-5 py-3.5">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelected(inv); }}
                                                className="text-primary hover:text-dark text-xs font-semibold px-2.5 py-1 rounded-lg hover:bg-primary/10 transition-all"
                                            >
                                                View →
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-card/20 flex items-center justify-between">
                    <span className="text-secondary text-xs">{filtered.length} of {invoices.length} invoices</span>
                    <div className="flex gap-1">
                        {[1, 2, 3].map((p) => (
                            <button key={p} className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${p === 1 ? 'bg-primary text-white' : 'text-secondary hover:bg-bg'}`}>
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {selected && <InvoiceModal invoice={selected} onClose={() => setSelected(null)} role={role} />}
        </>
    );
}
