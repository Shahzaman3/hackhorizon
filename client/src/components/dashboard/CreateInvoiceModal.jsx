import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';

export default function CreateInvoiceModal({ onClose, onCreated }) {
  const { user } = useAuth();

  const sellerBusinesses = [];
  if (user?.gstin) sellerBusinesses.push({ name: 'Primary Profile', gstin: user.gstin });
  if (user?.businesses) {
    sellerBusinesses.push(...user.businesses.filter(b => b.type === 'seller' || b.type === 'both'));
  }

  const [form, setForm] = useState({
    sellerGstin: sellerBusinesses[0]?.gstin || '',
    invoiceNumber: '',
    buyerGstin: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    tax: { cgst: '', sgst: '', igst: '' },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('tax.')) {
      const key = name.split('.')[1];
      setForm((f) => ({ ...f, tax: { ...f.tax, [key]: value } }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/invoices', {
        invoiceNumber: form.invoiceNumber,
        sellerGstin:   form.sellerGstin,
        buyerGstin:    form.buyerGstin.toUpperCase(),
        amount:        Number(form.amount),
        date:          form.date,
        tax: {
          cgst: Number(form.tax.cgst) || 0,
          sgst: Number(form.tax.sgst) || 0,
          igst: Number(form.tax.igst) || 0,
        },
      });
      onCreated();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create invoice.');
    } finally {
      setLoading(false);
    }
  };

  const labelCls = "text-[10px] font-black text-[#728279] uppercase tracking-[0.2em] mb-2 px-1 block";
  const inputCls = "w-full bg-[#F4F1EA]/50 border border-[#E5E2D9] rounded-2xl px-5 py-3.5 text-sm font-bold text-[#0A2518] focus:border-[#047857] outline-none transition-all placeholder-[#A2A9A5]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A2518]/60 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white border border-[#E5E2D9] rounded-[2.5rem] shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-center flex-1 min-h-[400px]">
             <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#047857]/20 to-transparent flex items-center justify-center mb-6 relative">
               <div className="absolute inset-0 rounded-full border-2 border-[#047857]/30 border-t-[#047857] animate-spin" />
               <svg className="w-8 h-8 text-[#047857]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
               </svg>
             </div>
             <h2 className="font-extrabold text-[#0A2518] text-xl tracking-tight mb-3" style={{ fontFamily: 'Plus Jakarta Sans' }}>Cryptographic Sealing...</h2>
             <p className="text-[13px] text-[#728279] font-medium leading-relaxed max-w-[280px]">
               Generating an immutable hash and anchoring it to the blockchain ledger. <br/><br/>This usually takes 10-15 seconds. Please keep this window open.
             </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-[#E5E2D9] bg-[#F4F1EA]/10 flex-shrink-0">
              <div>
                <h2 className="font-extrabold text-[#0A2518] text-xl tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>Draft Document</h2>
                <p className="text-[10px] text-[#728279] mt-1 uppercase font-black tracking-widest leading-none">Initialize a new financial record</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white border border-[#E5E2D9] flex items-center justify-center text-[#728279] hover:text-[#047857] hover:border-[#047857]/30 transition-all shadow-sm"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M18 6L6 18M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 py-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar flex-1">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-[11px] px-5 py-4 rounded-2xl font-black flex items-center gap-3 animate-fade-in shadow-sm">
                   <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   {error}
                </div>
              )}

              <div className="space-y-6">
                {sellerBusinesses.length > 1 && (
                  <div className="space-y-2">
                    <label className={labelCls}>Issuing Profile</label>
                    <select
                      name="sellerGstin"
                      value={form.sellerGstin}
                      onChange={handle}
                      required
                      className={`${inputCls} h-[54px] appearance-none cursor-pointer`}
                    >
                      {sellerBusinesses.map(b => (
                        <option key={b.gstin} value={b.gstin}>{b.name} ({b.gstin})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className={labelCls}>Invoice Reference</label>
                     <input type="text" name="invoiceNumber" value={form.invoiceNumber} onChange={handle} required placeholder="e.g. INV-2024-001" className={inputCls} />
                   </div>
                   <div className="space-y-2">
                     <label className={labelCls}>Filing Date</label>
                     <input type="date" name="date" value={form.date} onChange={handle} required className={inputCls} />
                   </div>
                </div>

                <div className="space-y-2">
                  <label className={labelCls}>Purchaser GSTIN</label>
                  <input type="text" name="buyerGstin" maxLength={15} value={form.buyerGstin} onChange={handle} required placeholder="Enter 15-digit GSTIN..." className={`${inputCls} font-mono uppercase tracking-wider`} />
                </div>

                <div className="space-y-2">
                  <label className={labelCls}>Taxable Value (₹)</label>
                  <input type="number" name="amount" value={form.amount} onChange={handle} required placeholder="Enter gross amount..." className={`${inputCls} text-lg`} />
                </div>

                {/* GST */}
                <div className="bg-[#FDFBF7] p-6 rounded-[1.5rem] border border-[#E5E2D9]/60 space-y-5">
                  <p className="text-[10px] font-black text-[#728279] uppercase tracking-[0.25em]">Statutory Tax Fields</p>
                  <div className="grid grid-cols-3 gap-4">
                    {['cgst', 'sgst', 'igst'].map((t) => (
                      <div key={t} className="space-y-2">
                        <label className="text-[9px] font-black text-[#A2A9A5] uppercase tracking-widest block text-center">{t}</label>
                        <input
                          type="number"
                          name={`tax.${t}`}
                          value={form.tax[t]}
                          onChange={handle}
                          placeholder="0"
                          className="w-full bg-white border border-[#E5E2D9] rounded-xl px-3 py-3 text-sm font-bold text-[#0A2518] text-center focus:border-[#047857] outline-none shadow-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 pb-2">
                <button
                   type="submit"
                   disabled={loading}
                   className="w-full bg-[#0A2518] hover:bg-[#047857] text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#0A2518]/10 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spin" />}
                  {loading ? 'Transmitting...' : 'Certify & Transmit'}
                </button>
                <button
                   type="button"
                   onClick={onClose}
                   className="w-full py-4 text-[10px] font-black text-[#728279] uppercase tracking-widest hover:bg-[#F4F1EA] rounded-2xl transition-all"
                >
                  Discard Changes
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
