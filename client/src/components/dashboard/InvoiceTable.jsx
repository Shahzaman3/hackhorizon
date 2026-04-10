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
        alert("Invoice accepted successfully");
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
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear().toString().slice(2)}`;
  };

  const columns = role === 'seller'
    ? ['Invoice No.', 'Buyer GSTIN', 'Amount', 'Tax', 'Date', 'Status', 'Integrity', 'Payment', 'Action']
    : ['Invoice No.', 'Seller GSTIN', 'Amount', 'Tax', 'Date', 'Status', 'Integrity', 'Action'];

  const filterBtn = (f) => (
    <button
      key={f}
      onClick={() => setFilter(f)}
      className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-200 border ${
        filter === f
          ? 'bg-[#4ade80] text-[#0a0f0d] border-[#4ade80] shadow-md shadow-[#4ade80]/20'
          : 'bg-[#192319] text-[#6b8f76] border-[#243124] hover:border-[#2e4030] hover:text-white'
      }`}
    >
      {f}
    </button>
  );

  return (
    <div className="bg-[#111a15] border border-[#243124] rounded-2xl flex flex-col overflow-hidden">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-5 border-b border-[#243124] gap-4">
        <h3 className="font-bold text-base text-white" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          {title}
        </h3>
        <div className="flex gap-2 flex-wrap">
          {['All', 'Pending', 'Accepted', 'Rejected'].map(filterBtn)}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-[#0f1812] border-b border-[#243124]">
              {columns.map((col) => (
                <th key={col} className="px-5 py-3 text-[10px] font-bold text-[#3d5945] uppercase tracking-[0.14em] whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((inv) => {
                const totalTax = (inv.tax?.cgst || 0) + (inv.tax?.sgst || 0) + (inv.tax?.igst || 0);
                const isPaid = inv.paymentStatus === 'paid';
                const invId = inv.id || inv._id;

                return (
                  <React.Fragment key={invId}>
                    <tr
                      className="border-b border-[#1a2a1f] hover:bg-[#192319] transition-colors cursor-pointer group"
                      onClick={() => onRowClick && onRowClick(inv)}
                    >
                      <td className="px-5 py-3.5 font-mono text-xs font-bold text-[#4ade80]">{inv.invoiceNumber}</td>
                      <td className="px-5 py-3.5 text-xs text-[#6b8f76] font-mono tracking-wide">
                        {role === 'seller' ? inv.buyerGstin : inv.sellerGstin}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-white text-sm">₹{inv.amount?.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-xs text-[#6b8f76]">₹{totalTax?.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-xs text-[#3d5945] font-medium">{formatDate(inv.date)}</td>

                      {role === 'seller' ? (
                        <>
                          <td className="px-5 py-3.5"><StatusBadge status={inv.status} /></td>
                          <td className="px-5 py-3.5"><BlockchainBadge status={inv.blockchainStatus} /></td>
                          <td className="px-5 py-3.5">
                            <button
                              onClick={(e) => handlePaymentToggle(inv, e)}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border transition-all ${
                                isPaid
                                  ? 'bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20 hover:bg-[#4ade80]/20'
                                  : 'bg-[#f87171]/10 text-[#f87171] border-[#f87171]/20 hover:bg-[#f87171]/20'
                              }`}
                            >
                              {isPaid ? 'Paid' : 'Unpaid'}
                            </button>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-xs font-bold text-[#4ade80] opacity-0 group-hover:opacity-100 transition-opacity">
                              View →
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-5 py-3.5"><StatusBadge status={inv.status} /></td>
                          <td className="px-5 py-3.5"><BlockchainBadge status={inv.blockchainStatus} /></td>
                          <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                            {inv.status?.toLowerCase() === 'pending' ? (
                              <div className="flex gap-1.5">
                                <button
                                  onClick={(e) => handleBuyerActionClick(inv, 'accepted', e)}
                                  className="bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20 hover:bg-[#4ade80]/20 text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={(e) => handleBuyerActionClick(inv, 'rejected', e)}
                                  className="bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/20 hover:bg-[#f87171]/20 text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={(e) => handleBuyerActionClick(inv, 'modified', e)}
                                  className="bg-[#60a5fa]/10 text-[#60a5fa] border border-[#60a5fa]/20 hover:bg-[#60a5fa]/20 text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all"
                                >
                                  Modify
                                </button>
                              </div>
                            ) : (
                              <span
                                onClick={() => onRowClick && onRowClick(inv)}
                                className="text-xs font-bold text-[#4ade80] hover:text-white cursor-pointer transition-colors"
                              >
                                Details →
                              </span>
                            )}
                          </td>
                        </>
                      )}
                    </tr>

                    {/* Inline Action Row */}
                    {inlineAction?.id === invId && (
                      <tr className="bg-[#0f1812] border-b border-[#243124]">
                        <td colSpan={columns.length} className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <svg className="w-4 h-4 text-[#3d5945] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            <input
                              type="text"
                              value={actionNote}
                              onChange={(e) => setActionNote(e.target.value)}
                              placeholder={inlineAction.type === 'rejected' ? 'Reason for rejection...' : 'What needs to be changed?'}
                              className="text-xs bg-[#192319] border border-[#243124] rounded-lg px-4 py-2.5 flex-1 min-w-0 outline-none focus:border-[#4ade80]/40 text-white placeholder-[#3d5945] font-medium"
                              autoFocus
                            />
                            <button
                              onClick={(e) => submitInlineAction(inv, e)}
                              className={`text-xs font-bold px-4 py-2.5 rounded-lg text-white transition-colors ${
                                inlineAction.type === 'rejected'
                                  ? 'bg-[#f87171]/80 hover:bg-[#f87171]'
                                  : 'bg-[#60a5fa]/80 hover:bg-[#60a5fa]'
                              }`}
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setInlineAction(null)}
                              className="text-xs font-bold text-[#3d5945] hover:text-[#6b8f76] px-2 py-2.5 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-[#192319] border border-[#243124] flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#3d5945]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-[#3d5945]">No invoices found</span>
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
