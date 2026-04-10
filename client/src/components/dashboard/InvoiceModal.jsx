import { useEffect } from 'react';
import StatusBadge from './StatusBadge';
import Button from '../shared/Button';

export default function InvoiceModal({ invoice, onClose, role = 'seller' }) {
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    if (!invoice) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-card/30">
                    <div>
                        <h2 className="font-bold text-dark text-lg" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                            {invoice.id}
                        </h2>
                        <p className="text-secondary text-xs mt-0.5">{invoice.client}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <StatusBadge status={invoice.status} />
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg bg-bg hover:bg-card/40 flex items-center justify-center text-secondary hover:text-dark transition-all"
                        >
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {[
                            { label: 'Invoice Amount', val: invoice.amount },
                            { label: 'GST Amount', val: invoice.gst || '—' },
                            { label: 'Due Date', val: invoice.dueDate },
                            { label: 'Issued On', val: invoice.date || invoice.dueDate },
                        ].map(({ label, val }) => (
                            <div key={label} className="bg-bg rounded-xl p-3.5">
                                <p className="text-secondary text-xs mb-1">{label}</p>
                                <p className="text-dark font-bold text-sm" style={{ fontFamily: 'Plus Jakarta Sans' }}>{val}</p>
                            </div>
                        ))}
                    </div>

                    {/* Items table */}
                    <h4 className="text-dark font-bold text-sm mb-3" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                        Line Items
                    </h4>
                    <div className="rounded-xl border border-card/40 overflow-hidden mb-5">
                        <table className="w-full text-xs">
                            <thead className="bg-bg">
                                <tr>
                                    {['Description', 'Qty', 'Rate', 'Total'].map((h) => (
                                        <th key={h} className="px-3 py-2.5 text-left text-secondary font-semibold uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {(invoice.items || [
                                    { desc: 'Professional Services', qty: 1, rate: invoice.amount, total: invoice.amount },
                                ]).map((item, i) => (
                                    <tr key={i} className="border-t border-card/20">
                                        <td className="px-3 py-2.5 text-dark font-medium">{item.desc}</td>
                                        <td className="px-3 py-2.5 text-secondary">{item.qty}</td>
                                        <td className="px-3 py-2.5 text-secondary">{item.rate}</td>
                                        <td className="px-3 py-2.5 text-dark font-bold">{item.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Notes */}
                    {invoice.notes && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-5">
                            <p className="text-yellow-700 text-xs">{invoice.notes}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2">
                        {role === 'seller' ? (
                            <>
                                <Button variant="primary" size="sm">
                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Download PDF
                                </Button>
                                <Button variant="outline" size="sm">Send Reminder</Button>
                                <Button variant="ghost" size="sm">Edit Invoice</Button>
                            </>
                        ) : (
                            <>
                                <Button variant="primary" size="sm">✓ Approve</Button>
                                <Button variant="outline" size="sm" className="border-red-400 text-red-500 hover:bg-red-50">
                                    Dispute
                                </Button>
                                <Button variant="ghost" size="sm">
                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Download
                                </Button>
                            </>
                        )}
                        <Button variant="ghost" size="sm" onClick={onClose} className="ml-auto text-secondary">
                            Close
                        </Button>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes animateIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-in { animation: animateIn 0.2s ease-out; }
      `}</style>
        </div>
    );
}
