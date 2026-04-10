import { useState } from 'react';
import api from '../../api/axios';
import Button from '../shared/Button';

export default function CreateInvoiceModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    invoiceNumber: '',
    buyerGstin: '',
    amount: '',
    date: '',
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

  const inputCls = "w-full bg-[#0f1812] border border-[#243124] focus:border-[#4ade80]/50 focus:ring-2 focus:ring-[#4ade80]/10 text-white rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder-[#3d5945] font-medium";
  const labelCls = "block text-[11px] font-bold text-[#6b8f76] uppercase tracking-[0.12em] mb-2";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-[#111a15] border border-[#243124] rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
        style={{ animation: 'animateIn 0.2s cubic-bezier(.16,1,.3,1)' }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center p-10 text-center flex-1">
            <div className="w-16 h-16 rounded-full bg-[#4ade80]/10 border border-[#4ade80]/20 flex items-center justify-center mb-5">
              <svg className="w-8 h-8 text-[#4ade80] animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="font-bold text-white text-[19px] tracking-wide mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>Pending Verification</h2>
            <p className="text-sm text-[#6b8f76] leading-relaxed">
              Generating a cryptographic hash and securing it on the blockchain. This usually takes about 10-15 seconds. Please don't close this window.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#243124] flex-shrink-0">
              <div>
                <h2 className="font-bold text-white text-[17px]" style={{ fontFamily: 'Plus Jakarta Sans' }}>New Invoice</h2>
                <p className="text-[11px] text-[#3d5945] mt-0.5">Fill in the details to create an invoice</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-[#192319] border border-[#243124] flex items-center justify-center text-[#6b8f76] hover:text-white hover:bg-[#2e4030] transition-all"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5 overflow-y-auto custom-scrollbar flex-1">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl font-medium">
                  {error}
                </div>
              )}

              {[
                { label: 'Invoice Number',    name: 'invoiceNumber', type: 'text',   placeholder: 'INV-2401',         mono: false },
                { label: 'Buyer GSTIN',       name: 'buyerGstin',    type: 'text',   placeholder: '27AAPFU0939F1ZV',  mono: true  },
                { label: 'Invoice Amount (₹)', name: 'amount',       type: 'number', placeholder: '100000',           mono: false },
                { label: 'Invoice Date',      name: 'date',          type: 'date',   placeholder: '',                 mono: false },
              ].map(({ label, name, type, placeholder, mono }) => (
                <div key={name}>
                  <label className={labelCls}>{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={form[name]}
                    onChange={handle}
                    required
                    placeholder={placeholder}
                    className={`${inputCls} ${mono ? 'font-mono tracking-wider' : ''}`}
                  />
                </div>
              ))}

              {/* GST Fields */}
              <div>
                <p className={labelCls}>GST Breakdown <span className="normal-case text-[#3d5945] font-medium">(optional)</span></p>
                <div className="grid grid-cols-3 gap-3">
                  {['cgst', 'sgst', 'igst'].map((t) => (
                    <div key={t}>
                      <label className="block text-[10px] font-bold text-[#3d5945] uppercase mb-1.5">{t}</label>
                      <input
                        type="number"
                        name={`tax.${t}`}
                        value={form.tax[t]}
                        onChange={handle}
                        placeholder="0"
                        className={inputCls}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <Button type="submit" variant="primary" size="md" loading={loading} className="flex-1">
                  Create Invoice
                </Button>
                <Button type="button" variant="ghost" size="md" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </form>
          </>
        )}
      </div>

      <style>{`
        @keyframes animateIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
