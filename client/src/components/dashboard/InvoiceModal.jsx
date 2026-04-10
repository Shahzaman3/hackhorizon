import { useState } from 'react';
import StatusBadge from './StatusBadge';
import BlockchainBadge from './BlockchainBadge';
import api from '../../api/axios';

export default function InvoiceModal({ invoice, onClose, role = 'seller', onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [inlineAction, setInlineAction] = useState(null);
  const [actionNote, setActionNote] = useState('');
  const [error, setError] = useState('');

  if (!invoice) return null;

  const totalTax = (invoice.tax?.cgst || 0) + (invoice.tax?.sgst || 0) + (invoice.tax?.igst || 0);

  const handleAction = async (actionType) => {
    setError('');
    const invId = invoice._id || invoice.id;
    if (actionType === 'accepted') {
      setLoading(true);
      try {
        await api.patch(`/invoices/${invId}/status`, { status: "accepted", note: "" });
        if (onRefresh) onRefresh();
        onClose();
      } catch (e) {
        console.error(e);
        setError(e?.response?.data?.message || 'Action failed. Counterparty authority issue.');
      } finally {
        setLoading(false);
      }
    } else {
      if (inlineAction === actionType) {
        setInlineAction(null);
      } else {
        setInlineAction(actionType);
        setActionNote('');
      }
    }
  };

  const submitAction = async () => {
    setError('');
    setLoading(true);
    const invId = invoice._id || invoice.id;
    try {
      await api.patch(`/invoices/${invId}/status`, { status: inlineAction, note: actionNote });
      if (onRefresh) onRefresh();
      onClose();
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || 'Sync failure. Validation mismatch.');
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async () => {
    setError('');
    setLoading(true);
    const invId = invoice._id || invoice.id;
    try {
      await api.patch(`/invoices/${invId}/payment`, { paymentStatus: 'paid' });
      if (onRefresh) onRefresh();
      onClose();
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || 'Settlement failed. Unauthorized mutation.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'accepted') return '#047857';
    if (s === 'rejected') return '#dc2626';
    if (s === 'modified') return '#2563eb';
    return '#ca8a04';
  };

  return (
    <div className="fixed inset-0 bg-[#0A2518]/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-[#E5E2D9] rounded-[2.5rem] w-full max-w-xl flex flex-col max-h-[90vh] shadow-2xl animate-scale-in overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-start p-8 border-b border-[#E5E2D9] flex-shrink-0 bg-[#F4F1EA]/10">
          <div className="flex flex-col gap-1.5">
            <span className="font-black text-2xl text-[#0A2518] tracking-tighter" style={{ fontFamily: 'Plus Jakarta Sans' }}>{invoice.invoiceNumber}</span>
            <div className="text-[10px] text-[#728279] uppercase tracking-[0.2em] font-black">
               Issued on {new Date(invoice.date || invoice.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <BlockchainBadge status={invoice.blockchainStatus} />
            <StatusBadge status={invoice.status} />
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white border border-[#E5E2D9] flex items-center justify-center text-[#728279] hover:text-[#047857] hover:border-[#047857]/30 transition-all shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto custom-scrollbar flex-1">
          <div className="p-8 space-y-10">

            {/* Stakeholders */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: 'Merchant / Seller', value: invoice.sellerGstin, icon: 'M' },
                { label: 'Purchaser / Buyer',  value: invoice.buyerGstin, icon: 'P' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="bg-[#F4F1EA]/20 border border-[#E5E2D9] rounded-3xl p-5 relative group overflow-hidden">
                  <div className="absolute -right-2 -bottom-2 text-6xl font-black text-[#047857]/5 group-hover:scale-110 transition-transform">{icon}</div>
                  <div className="text-[9px] uppercase tracking-[0.18em] font-black text-[#728279] mb-2">{label}</div>
                  <div className="text-sm font-mono font-black text-[#0A2518] uppercase tracking-wider relative z-10">{value}</div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="bg-[#0A2518] rounded-[2rem] p-8 text-[#FDFBF7] shadow-xl shadow-[#0A2518]/20 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-12 -translate-y-12 blur-3xl" />
               <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-2">
                   <div className="text-[10px] uppercase tracking-[0.2em] font-black text-white/50">Settlement Amount</div>
                   <div className="text-4xl font-black tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                     ₹{invoice.amount?.toLocaleString('en-IN')}
                   </div>
                   <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/10">
                      <span className={`w-1.5 h-1.5 rounded-full ${invoice.paymentStatus === 'paid' ? 'bg-[#4ade80]' : 'bg-red-400 animate-pulse'}`} />
                      {invoice.paymentStatus || 'unpaid'}
                   </div>
                 </div>
                 
                 <div className="flex flex-col justify-center border-l border-white/10 pl-10">
                    <div className="text-[10px] uppercase tracking-[0.2em] font-black text-white/50 mb-4">Statutory Tax Components</div>
                    <div className="space-y-3">
                       {[
                         { l: 'Central Tax (CGST)', v: invoice.tax?.cgst || 0 },
                         { l: 'State Tax (SGST)', v: invoice.tax?.sgst || 0 },
                         { l: 'Integrated (IGST)', v: invoice.tax?.igst || 0 },
                       ].map(({l, v}) => (
                         <div key={l} className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-white/40">{l}</span>
                            <span>₹{v.toLocaleString()}</span>
                         </div>
                       ))}
                    </div>
                 </div>
               </div>
            </div>

            {/* Compliance History */}
            <div className="bg-white border border-[#E5E2D9] rounded-[2rem] p-8 space-y-6 shadow-sm">
              <h4 className="text-[10px] font-black text-[#728279] uppercase tracking-[0.25em] flex items-center gap-3">
                 <span className="w-6 h-px bg-[#E5E2D9]" />
                 Lifecycle Audit Trail
              </h4>
              <div className="space-y-8">
                {invoice.history && invoice.history.length > 0 ? (
                  invoice.history.map((h, i) => (
                    <div key={i} className="flex items-start gap-5 group animate-fade-in">
                      <div className="relative flex-shrink-0 mt-1">
                        <div className="w-5 h-5 rounded-lg border-2 border-white shadow-md z-10 relative" style={{ backgroundColor: getStatusColor(h.status) }} />
                        {i < invoice.history.length - 1 && (
                          <div className="absolute top-5 left-[9px] w-0.5 h-10 bg-[#E5E2D9]" />
                        )}
                      </div>
                      <div className="flex flex-col flex-1 pb-4">
                        <div className="flex items-center justify-between mb-1">
                           <span className="text-sm font-black text-[#0A2518] capitalize leading-none">{h.status} event</span>
                           <span className="text-[10px] text-[#A2A9A5] font-black uppercase tracking-widest">
                              {new Date(h.date).toLocaleDateString('en-GB', { day:'2-digit', month: 'short' })}
                           </span>
                        </div>
                        {h.note && <span className="text-[11px] text-[#728279] mt-1 font-medium bg-[#F4F1EA]/50 p-2 rounded-lg border border-[#E5E2D9]/40 italic">"{h.note}"</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-start gap-4">
                    <div className="w-4 h-4 rounded-full mt-1 flex-shrink-0 bg-[#ca8a04] shadow-sm shadow-[#ca8a04]/20" />
                    <div>
                      <span className="text-sm font-black text-[#0A2518] capitalize">{invoice.status}</span>
                      <p className="text-[11px] text-[#728279] mt-1 font-medium italic">Record initialized on the network.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-[#E5E2D9] flex-shrink-0 bg-[#F4F1EA]/10">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl animate-shake">
               <p className="text-[10px] font-black text-red-600 uppercase tracking-widest text-center">{error}</p>
            </div>
          )}
          {role === 'seller' && invoice.paymentStatus !== 'paid' && (
            <button
              onClick={markAsPaid}
              disabled={loading}
              className="w-full bg-[#047857] hover:bg-[#065F46] text-white rounded-2xl py-5 text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-xl shadow-[#047857]/20 flex items-center justify-center gap-3"
              style={{ fontFamily: 'Plus Jakarta Sans' }}
            >
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spin" />}
              {loading ? 'Finalizing...' : 'Certify Final Settlement'}
            </button>
          )}

          {role === 'buyer' && invoice.status?.toLowerCase() === 'pending' && (
            <div className="flex flex-col gap-4">
              {!inlineAction ? (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { type: 'accepted', label: 'Approve',  cls: 'bg-[#047857] text-white shadow-[#047857]/20' },
                    { type: 'rejected', label: 'Dispute',   cls: 'bg-white text-[#dc2626] border-[#dc2626]/20' },
                    { type: 'modified', label: 'Request Revision',  cls: 'bg-[#F4F1EA] text-[#4D6357]' },
                  ].map(({ type, label, cls }) => (
                    <button
                      key={type}
                      onClick={() => handleAction(type)}
                      disabled={loading}
                      className={`h-14 flex items-center justify-center border rounded-2xl text-[10px] font-black uppercase tracking-[0.14em] transition-all duration-300 disabled:opacity-50 shadow-lg ${cls}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-[#E5E2D9] rounded-3xl p-6 flex flex-col gap-5 shadow-2xl animate-scale-in">
                  <div className="flex items-center gap-3 text-[#dc2626]">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                     <span className="text-[10px] font-black uppercase tracking-[0.2em]">Formal Feedback Required</span>
                  </div>
                  <textarea
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    placeholder={inlineAction === 'rejected' ? 'Explain the specific inaccuracies...' : 'List the items requiring correction...'}
                    className="text-sm bg-[#F4F1EA]/30 border border-[#E5E2D9] rounded-2xl px-5 py-4 w-full h-32 resize-none outline-none focus:border-[#047857] text-[#0A2518] placeholder-[#A2A9A5] font-bold transition-all shadow-inner"
                    autoFocus
                  />
                  <div className="flex gap-4">
                    <button onClick={() => setInlineAction(null)} className="flex-1 h-14 text-[10px] font-black uppercase tracking-widest text-[#728279] hover:bg-[#F4F1EA] rounded-2xl transition-all">
                      Cancel
                    </button>
                    <button
                      onClick={submitAction}
                      disabled={loading}
                      className="flex-2 h-14 bg-[#0A2518] text-white px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#0A2518]/20 hover:bg-[#047857] transition-all"
                    >
                      {loading ? 'Submitting...' : 'Confirm Submission'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
