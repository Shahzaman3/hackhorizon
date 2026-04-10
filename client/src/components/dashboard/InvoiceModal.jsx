import { useState } from 'react';
import StatusBadge from './StatusBadge';
import BlockchainBadge from './BlockchainBadge';
import api from '../../api/axios';

export default function InvoiceModal({ invoice, onClose, role = 'seller', onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [inlineAction, setInlineAction] = useState(null);
  const [actionNote, setActionNote] = useState('');

  if (!invoice) return null;

  const totalTax = (invoice.tax?.cgst || 0) + (invoice.tax?.sgst || 0) + (invoice.tax?.igst || 0);

  const handleAction = async (actionType) => {
    if (actionType === 'accepted') {
      setLoading(true);
      try {
        await api.patch(`/invoices/${invoice.id || invoice._id}/status`, { status: "accepted", note: "" });
        if (onRefresh) onRefresh();
        onClose();
      } catch (e) {
        console.error(e);
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
    setLoading(true);
    try {
      await api.patch(`/invoices/${invoice.id || invoice._id}/status`, { status: inlineAction, note: actionNote });
      if (onRefresh) onRefresh();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async () => {
    setLoading(true);
    try {
      await api.patch(`/invoices/${invoice.id || invoice._id}/payment`, { paymentStatus: 'paid' });
      if (onRefresh) onRefresh();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'accepted') return '#4ade80';
    if (s === 'rejected') return '#f87171';
    if (s === 'modified') return '#60a5fa';
    return '#eab308';
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#111a15] border border-[#243124] rounded-2xl w-full max-w-lg flex flex-col max-h-[90vh] shadow-2xl animate-scale-in overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-[#243124] flex-shrink-0">
          <div>
            <span className="font-mono font-bold text-lg text-[#4ade80] tracking-wide">{invoice.invoiceNumber}</span>
            <div className="text-[11px] text-[#3d5945] mt-1 uppercase tracking-wider font-semibold">
              {new Date(invoice.date || invoice.createdAt).toLocaleDateString('en-GB')}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <BlockchainBadge status={invoice.blockchainStatus} />
            <StatusBadge status={invoice.status} />
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-[#192319] border border-[#243124] flex items-center justify-center text-[#6b8f76] hover:text-white hover:bg-[#2e4030] transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto custom-scrollbar flex-1">
          <div className="p-6">

            {/* GSTINs */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { label: 'Seller GSTIN', value: invoice.sellerGstin },
                { label: 'Buyer GSTIN',  value: invoice.buyerGstin },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#0f1812] border border-[#243124] rounded-xl p-4">
                  <div className="text-[10px] uppercase tracking-[0.14em] font-bold text-[#3d5945] mb-1.5">{label}</div>
                  <div className="text-sm font-mono font-semibold text-white truncate">{value}</div>
                </div>
              ))}
            </div>

            {/* Amount Block */}
            <div className="bg-[#0f1812] border border-[#243124] rounded-xl p-5 mb-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.14em] font-bold text-[#3d5945] mb-2">Total Amount</div>
                  <div className="text-3xl font-extrabold text-white" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                    ₹{invoice.amount?.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.14em] font-bold text-[#3d5945] mb-2">Tax Breakdown</div>
                  <div className="text-xl font-bold text-white mb-1">₹{totalTax.toLocaleString('en-IN')}</div>
                  <div className="text-[11px] text-[#3d5945] font-medium">
                    CGST ₹{invoice.tax?.cgst || 0} · SGST ₹{invoice.tax?.sgst || 0} · IGST ₹{invoice.tax?.igst || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#0f1812] border border-[#243124] rounded-xl p-4">
                <div className="text-[10px] uppercase tracking-[0.14em] font-bold text-[#3d5945] mb-2">Payment Status</div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border inline-block ${
                  invoice.paymentStatus === 'paid'
                    ? 'bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20'
                    : 'bg-[#f87171]/10 text-[#f87171] border-[#f87171]/20'
                }`}>
                  {invoice.paymentStatus || 'unpaid'}
                </span>
              </div>
              <div className="bg-[#0f1812] border border-[#243124] rounded-xl p-4">
                <div className="text-[10px] uppercase tracking-[0.14em] font-bold text-[#3d5945] mb-2">Record Date</div>
                <div className="text-sm font-semibold text-white">
                  {new Date(invoice.createdAt || invoice.date).toLocaleDateString('en-GB')}
                </div>
              </div>
            </div>

            {/* Status History */}
            <div>
              <h4 className="text-[10px] font-bold text-[#3d5945] uppercase tracking-[0.14em] mb-4">Status History</h4>
              <div className="flex flex-col gap-4">
                {invoice.history && invoice.history.length > 0 ? (
                  invoice.history.map((h, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="relative flex-shrink-0 mt-1">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getStatusColor(h.status) }} />
                        {i < invoice.history.length - 1 && (
                          <div className="absolute top-3 left-[4.5px] w-px h-6 bg-[#243124]" />
                        )}
                      </div>
                      <div className="flex flex-col flex-1 pb-2">
                        <span className="text-sm font-bold text-white capitalize">{h.status}</span>
                        {h.note && <span className="text-xs text-[#6b8f76] mt-0.5 italic">"{h.note}"</span>}
                      </div>
                      <span className="text-[10px] text-[#3d5945] font-semibold uppercase tracking-wider flex-shrink-0">
                        {new Date(h.date).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: getStatusColor(invoice.status) }} />
                    <div>
                      <span className="text-sm font-bold text-white capitalize">{invoice.status}</span>
                      <p className="text-xs text-[#3d5945] mt-0.5">Invoice initially created</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#243124] flex-shrink-0">
          {role === 'seller' && invoice.paymentStatus !== 'paid' && (
            <button
              onClick={markAsPaid}
              disabled={loading}
              className="w-full bg-[#4ade80] hover:bg-[#86efac] text-[#0a0f0d] rounded-xl py-3.5 text-sm font-bold transition-all disabled:opacity-50 shadow-lg shadow-[#4ade80]/20 hover:shadow-[#4ade80]/35"
              style={{ fontFamily: 'Plus Jakarta Sans' }}
            >
              {loading ? 'Processing...' : 'Mark as Paid'}
            </button>
          )}

          {role === 'buyer' && invoice.status?.toLowerCase() === 'pending' && (
            <div className="flex flex-col gap-3">
              {!inlineAction ? (
                <div className="flex gap-2">
                  {[
                    { type: 'accepted', label: 'Accept',  cls: 'bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20 hover:bg-[#4ade80]/20' },
                    { type: 'rejected', label: 'Reject',  cls: 'bg-[#f87171]/10 text-[#f87171] border-[#f87171]/20 hover:bg-[#f87171]/20' },
                    { type: 'modified', label: 'Modify',  cls: 'bg-[#60a5fa]/10 text-[#60a5fa] border-[#60a5fa]/20 hover:bg-[#60a5fa]/20' },
                  ].map(({ type, label, cls }) => (
                    <button
                      key={type}
                      onClick={() => handleAction(type)}
                      disabled={loading}
                      className={`flex-1 border rounded-xl py-3 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 ${cls}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-[#0f1812] border border-[#243124] rounded-xl p-4 flex flex-col gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b8f76]">
                    {inlineAction === 'rejected' ? 'Rejection Reason' : 'Modification Details'}
                  </span>
                  <textarea
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    placeholder={inlineAction === 'rejected' ? 'Why are you rejecting this invoice?' : 'What needs to be changed?'}
                    className="text-sm bg-[#192319] border border-[#243124] rounded-lg px-3 py-2.5 w-full resize-none outline-none focus:border-[#4ade80]/40 text-white placeholder-[#3d5945] transition-colors"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setInlineAction(null)} className="text-xs font-bold text-[#3d5945] hover:text-[#6b8f76] px-3 py-2 transition-colors">
                      Cancel
                    </button>
                    <button
                      onClick={submitAction}
                      disabled={loading}
                      className={`text-xs font-bold text-white px-5 py-2 rounded-lg shadow-sm disabled:opacity-50 transition-colors ${
                        inlineAction === 'rejected' ? 'bg-[#f87171]/80 hover:bg-[#f87171]' : 'bg-[#60a5fa]/80 hover:bg-[#60a5fa]'
                      }`}
                    >
                      {loading ? 'Working...' : 'Confirm'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <style>{`
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
          .animate-scale-in { animation: scaleIn 0.25s cubic-bezier(.16,1,.3,1) forwards; }
        `}</style>
      </div>
    </div>
  );
}
