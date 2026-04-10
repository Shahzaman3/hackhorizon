import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import BlockchainBadge from './BlockchainBadge';
import api from '../../api/axios';

export default function InvoiceTable({ title = "Invoices", invoices = [], role = "seller", onRowClick, onRefresh }) {
  const [filter, setFilter] = useState('All');
  const [inlineAction, setInlineAction] = useState(null);
  const [actionNote, setActionNote] = useState('');

  const filteredInvoices = invoices.filter(inv => {
    if (filter === 'All') return true;
    return inv.status?.toLowerCase() === filter.toLowerCase();
  });

  const handlePaymentToggle = async (inv, e) => {
    e.stopPropagation();
    if (role !== 'seller') return;
    try {
      const newStatus = inv.paymentStatus === 'paid' ? 'unpaid' : 'paid';
      await api.patch(`/invoices/${inv.id || inv._id}/payment`, { paymentStatus: newStatus });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to toggle payment status', err);
    }
  };

  const handleBuyerActionClick = async (inv, actionType, e) => {
    e.stopPropagation();
    if (actionType === 'accepted') {
      try {
        await api.patch(`/invoices/${inv.id || inv._id}/status`, { status: "accepted", note: "" });
        if (onRefresh) onRefresh();
      } catch (err) {
        console.error('Failed to accept invoice', err);
      }
    } else {
      const invId = inv.id || inv._id;
      if (inlineAction?.id === invId && inlineAction?.type === actionType) {
        setInlineAction(null);
      } else {
        setInlineAction({ id: invId, type: actionType });
        setActionNote('');
      }
    }
  };

  const submitInlineAction = async (inv, e) => {
    e.stopPropagation();
    try {
      await api.patch(`/invoices/${inv.id || inv._id}/status`, { status: inlineAction.type, note: actionNote });
      setInlineAction(null);
      setActionNote('');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to submit updated status action', err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
  };

  const columns = role === 'seller'
    ? ['Identifier', 'Recipient', 'Gross Amount', 'Tax Portion', 'Issuance', 'Lifecycle', 'Integrity', 'Settlement', 'Action']
    : ['Identifier', 'Issuer', 'Gross Amount', 'Tax Portion', 'Issuance', 'Lifecycle', 'Integrity', 'Action'];

  const filterBtn = (f) => (
    <button
      key={f}
      onClick={() => setFilter(f)}
      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.14em] transition-all duration-300 border ${
        filter === f
          ? 'bg-[#047857] text-white border-[#047857] shadow-lg shadow-[#047857]/20'
          : 'bg-white text-[#4D6357] border-[#E5E2D9] hover:border-[#047857]/40 hover:text-[#0A2518] shadow-sm'
      }`}
    >
      {f}
    </button>
  );

  return (
    <div className="bg-white flex flex-col overflow-hidden">
      {/* Table Local Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-8 py-6 border-b border-[#E5E2D9] gap-4 bg-[#F4F1EA]/10">
        <h3 className="font-extrabold text-[#0A2518] text-lg tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          {title}
        </h3>
        <div className="flex gap-2.5 flex-wrap">
          {['All', 'Pending', 'Accepted', 'Rejected'].map(filterBtn)}
        </div>
      </div>

      {/* Table Interface */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-[#F4F1EA]/30 border-b border-[#E5E2D9]">
              {columns.map((col) => (
                <th key={col} className="px-8 py-4 text-[10px] font-black text-[#728279] uppercase tracking-[0.18em] whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E2D9]/60">
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((inv) => {
                const totalTax = (inv.tax?.cgst || 0) + (inv.tax?.sgst || 0) + (inv.tax?.igst || 0);
                const isPaid = inv.paymentStatus === 'paid';
                const invId = inv.id || inv._id;

                return (
                  <React.Fragment key={invId}>
                    <tr
                      className="hover:bg-[#F4F1EA]/20 transition-all cursor-pointer group animate-fade-in"
                      onClick={() => onRowClick && onRowClick(inv)}
                    >
                      <td className="px-8 py-5.5 font-black text-[#0A2518] text-[13px] tracking-tight">{inv.invoiceNumber}</td>
                      <td className="px-8 py-5.5">
                        <div className="flex flex-col">
                           <span className="text-[12px] font-black text-[#047857] uppercase tracking-wider">{role === 'seller' ? inv.buyerGstin : inv.sellerGstin}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5.5 font-black text-[#0A2518] text-[14px]">₹{inv.amount?.toLocaleString('en-IN')}</td>
                      <td className="px-8 py-5.5 text-[12px] font-bold text-[#4D6357]">₹{totalTax?.toLocaleString('en-IN')}</td>
                      <td className="px-8 py-5.5 text-[11px] text-[#728279] font-bold uppercase tracking-widest">{formatDate(inv.date)}</td>

                      {role === 'seller' ? (
                        <>
                          <td className="px-8 py-5.5"><StatusBadge status={inv.status} /></td>
                          <td className="px-8 py-5.5"><BlockchainBadge status={inv.blockchainStatus} /></td>
                          <td className="px-8 py-5.5">
                            <button
                              onClick={(e) => handlePaymentToggle(inv, e)}
                              className={`text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-[0.12em] border transition-all duration-300 ${
                                isPaid
                                  ? 'bg-[#047857]/5 text-[#047857] border-[#047857]/20 hover:bg-[#047857] hover:text-white'
                                  : 'bg-[#dc2626]/5 text-[#dc2626] border-[#dc2626]/20 hover:bg-[#dc2626] hover:text-white'
                              }`}
                            >
                              {isPaid ? 'Settled' : 'Outstanding'}
                            </button>
                          </td>
                          <td className="px-8 py-5.5 text-right">
                             <div className="w-8 h-8 rounded-full bg-[#F4F1EA] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:bg-[#047857] group-hover:text-white scale-90 group-hover:scale-100 shadow-sm">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7"/></svg>
                             </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-8 py-5.5"><StatusBadge status={inv.status} /></td>
                          <td className="px-8 py-5.5"><BlockchainBadge status={inv.blockchainStatus} /></td>
                          <td className="px-8 py-5.5" onClick={(e) => e.stopPropagation()}>
                            {inv.status?.toLowerCase() === 'pending' ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => handleBuyerActionClick(inv, 'accepted', e)}
                                  className="bg-[#047857] text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl hover:bg-[#065F46] transition-all shadow-lg shadow-[#047857]/10"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={(e) => handleBuyerActionClick(inv, 'rejected', e)}
                                  className="bg-white border border-[#dc2626]/30 text-[#dc2626] text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl hover:bg-[#dc2626] hover:text-white transition-all shadow-sm"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                               <div className="w-8 h-8 rounded-full bg-[#F4F1EA] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:bg-[#047857] group-hover:text-white scale-90 group-hover:scale-100 shadow-sm">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7"/></svg>
                               </div>
                            )}
                          </td>
                        </>
                      )}
                    </tr>

                    {/* Inline Action View */}
                    {inlineAction?.id === invId && (
                      <tr className="bg-[#F4F1EA]/20 animate-scale-in">
                        <td colSpan={columns.length} className="px-8 py-6">
                          <div className="flex items-center gap-5 bg-white p-4 rounded-2xl border border-[#E5E2D9] shadow-inner shadow-[#0A2518]/5">
                            <div className="w-10 h-10 rounded-xl bg-[#dc2626]/10 flex items-center justify-center text-[#dc2626]">
                               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <input
                              type="text"
                              value={actionNote}
                              onChange={(e) => setActionNote(e.target.value)}
                              placeholder={inlineAction.type === 'rejected' ? 'Provide a formal reason for rejection...' : 'Specify required modification detail...'}
                              className="text-sm bg-transparent border-b-2 border-[#E5E2D9] focus:border-[#047857] rounded-none px-1 py-2 flex-1 outline-none text-[#0A2518] placeholder-[#A2A9A5] font-bold transition-all"
                              autoFocus
                            />
                            <div className="flex gap-2">
                               <button
                                 onClick={(e) => submitInlineAction(inv, e)}
                                 className="text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl bg-[#047857] text-white hover:bg-[#065F46] shadow-lg shadow-[#047857]/10"
                               >
                                 Confirm Action
                               </button>
                               <button
                                 onClick={() => setInlineAction(null)}
                                 className="text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl text-[#728279] hover:bg-[#F4F1EA]"
                               >
                                 Cancel
                               </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-8 py-32 text-center">
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-[#F4F1EA] flex items-center justify-center relative overflow-hidden">
                       <svg className="w-10 h-10 text-[#A2A9A5] relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                       <div className="absolute inset-0 bg-gradient-to-tr from-[#047857]/5 to-transparent animate-pulse" />
                    </div>
                    <div className="space-y-1">
                       <h5 className="text-lg font-black text-[#0A2518]">No ledger entries found</h5>
                       <p className="text-xs font-medium text-[#728279]">Your historical records will manifest here once generated.</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
