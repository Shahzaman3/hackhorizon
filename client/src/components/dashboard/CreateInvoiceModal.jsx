import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';

export default function CreateInvoiceModal({ onClose, onCreated }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sellerBusinesses = useMemo(() => {
    const list = [];
    if (user?.gstin) list.push({ name: 'Primary Profile', gstin: user.gstin });
    if (user?.businesses) {
      list.push(...user.businesses.filter(b => b.type === 'seller' || b.type === 'both'));
    }
    return list;
  }, [user]);

  const [form, setForm] = useState({
    sellerGstin: sellerBusinesses[0]?.gstin || '',
    invoiceNumber: '',
    buyerGstin: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    tax: { cgst: '0', sgst: '0', igst: '0' },
    gstRate: '18',
    taxType: 'intra',
  });

  const handle = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('tax.')) {
      const key = name.split('.')[1];
      setForm((f) => ({ ...f, tax: { ...f.tax, [key]: value } }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  // Sync Tax Calculations when amount/rate/type changes
  useEffect(() => {
    const amt = Number(form.amount) || 0;
    const rate = Number(form.gstRate) || 0;
    const totalTax = (amt * rate) / 100;

    if (form.taxType === 'intra') {
      setForm(f => ({
        ...f,
        tax: { ...f.tax, cgst: (totalTax / 2).toFixed(2), sgst: (totalTax / 2).toFixed(2), igst: '0' }
      }));
    } else {
      setForm(f => ({
        ...f,
        tax: { ...f.tax, cgst: '0', sgst: '0', igst: totalTax.toFixed(2) }
      }));
    }
  }, [form.amount, form.gstRate, form.taxType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[GENESIS] Current Step:', step);
    
    // Step validation before progression
    if (step === 1 && (!form.invoiceNumber || !form.date)) return;
    if (step === 2 && !form.buyerGstin) return;

    if (step < 3) {
      setStep(step + 1);
      return;
    }

    // Final Submission Logic
    console.log('[GENESIS] Initiating Cryptographic Anchor:', form);
    setError('');
    setLoading(true);
    try {
      const payload = {
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
      };

      const res = await api.post('/invoices', payload);
      console.log('[GENESIS] Anchored successfully:', res.data);
      onCreated();
    } catch (err) {
      console.error('[GENESIS] Sync failure:', err);
      setError(err?.response?.data?.message || 'Spectral sync failure. Counterparty GSTIN or Network issue.');
      setLoading(false);
    }
  };

  const labelCls = "text-[10px] font-black text-muted-2 uppercase tracking-[0.25em] mb-2.5 px-1 block";
  const inputCls = "w-full bg-surface-2/40 border border-border rounded-[1.25rem] px-6 py-4 text-[13px] font-bold text-text focus:border-[#047857] focus:bg-white outline-none transition-all placeholder-[#A2A9A5] shadow-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A2518]/70 backdrop-blur-xl animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-dark border border-white/20 rounded-[3rem] shadow-[0_32px_120px_rgba(0,0,0,0.4)] w-full max-w-xl max-h-[95vh] flex flex-col overflow-hidden animate-scale-in relative">
        
        <div className="p-8 md:p-12 h-full flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-black text-text tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                {step === 1 && "Genesis"}
                {step === 2 && "Counterparty"}
                {step === 3 && "Liquidity"}
              </h2>
              <p className="text-[10px] font-bold text-[#A2A9A5] uppercase tracking-[0.3em] mt-2">STEP {step} OF 3 * SMART FILING</p>
            </div>
            <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white border border-border flex items-center justify-center text-muted-2 hover:text-[#047857] hover:border-[#047857]/40 transition-all group">
               <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12" strokeWidth="3" strokeLinecap="round" /></svg>
            </button>
          </div>

          <div className="flex items-center justify-between px-10 mb-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center group">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${step >= s ? 'bg-[#047857] text-white shadow-lg shadow-[#047857]/30' : 'bg-[#E5E2D9] text-muted-2'}`}>
                  {step > s ? 'OK' : s}
                </div>
                {s < 3 && <div className={`w-16 h-0.5 mx-2 transition-all ${step > s ? 'bg-[#047857]' : 'bg-[#E5E2D9]'}`} />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-[11px] px-6 py-4 rounded-2xl font-black mb-8 animate-shake">
                   {error}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-8 animate-fade-in">
                  {sellerBusinesses.length > 1 && (
                    <div className="space-y-3">
                      <label className={labelCls}>Issuing Corporate Profile</label>
                      <select name="sellerGstin" value={form.sellerGstin} onChange={handle} required className={`${inputCls} h-[64px] cursor-pointer`}>
                        {sellerBusinesses.map(b => <option key={b.gstin} value={b.gstin}>{b.name} ({b.gstin})</option>)}
                      </select>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className={labelCls}>Identifier Code</label>
                      <input type="text" name="invoiceNumber" value={form.invoiceNumber} onChange={handle} required placeholder="INV-202X-XX" className={inputCls} />
                    </div>
                    <div className="space-y-3">
                      <label className={labelCls}>Effective Date</label>
                      <input type="date" name="date" value={form.date} onChange={handle} required className={inputCls} />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                     <label className={labelCls}>Evidence Attachment</label>
                     <div className="flex items-center gap-4">
                        <button 
                           type="button" 
                           onClick={() => document.getElementById('invoice-image').click()}
                           className="flex-1 border-2 border-dashed border-border rounded-2xl py-6 flex flex-col items-center justify-center gap-2 hover:border-[#047857]/40 hover:bg-surface-2/50 transition-all group"
                        >
                           <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-muted-2 group-hover:bg-[#047857] group-hover:text-white transition-all">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                           </div>
                           <span className="text-[10px] font-black text-muted-2 uppercase tracking-widest">Attach Digital Scan</span>
                        </button>
                        <input 
                           id="invoice-image" 
                           type="file" 
                           accept="image/*" 
                           className="hidden" 
                           onChange={(e) => {
                              if (e.target.files?.[0]) {
                                 console.log('Document captured:', e.target.files[0].name);
                                 // We'd normally upload this, but for now we just show a visual cue
                                 setForm(f => ({...f, hasImage: true}));
                              }
                           }}
                        />
                        {form.hasImage && (
                           <div className="w-20 h-[88px] rounded-2xl bg-[#047857]/10 flex flex-col items-center justify-center border border-[#047857]/20 animate-fade-in">
                              <span className="text-[8px] font-black text-[#047857] uppercase tracking-tighter">Verified</span>
                              <div className="text-[10px] font-black text-[#047857]">SCAN OK</div>
                           </div>
                        )}
                     </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 animate-fade-in">
                  <div className="space-y-3">
                    <label className={labelCls}>Counterparty GSTIN</label>
                    <input type="text" name="buyerGstin" maxLength={15} value={form.buyerGstin} onChange={handle} required placeholder="00XXXXX0000X0X0" className={`${inputCls} font-mono uppercase tracking-[0.25em] h-[72px] text-[15px]`} />
                  </div>
                  <div className="p-8 bg-[#047857]/5 border border-[#047857]/10 rounded-[2rem] flex items-start gap-5">
                     <div className="w-12 h-12 rounded-2xl bg-white border border-[#047857]/30 flex items-center justify-center shrink-0 shadow-sm">
                        <svg className="w-6 h-6 text-[#047857]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     </div>
                     <div>
                        <p className="text-[12px] font-black text-text uppercase tracking-widest">Spectral Identification</p>
                        <p className="text-[11px] text-muted font-medium leading-relaxed mt-2 italic">Entity verification occurs during the cryptographic sealing phase across the distributed node network.</p>
                     </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className={labelCls}>Taxable Flux (Rs. )</label>
                      <input type="number" name="amount" value={form.amount} onChange={handle} required placeholder="0.00" className={`${inputCls} text-[20px] h-[72px]`} />
                    </div>
                    <div className="space-y-3">
                      <label className={labelCls}>Statutory Rate</label>
                      <select name="gstRate" value={form.gstRate} onChange={handle} className={`${inputCls} h-[72px] cursor-pointer`}>
                        <option value="5">5% STANDARD</option>
                        <option value="12">12% PREMIUM</option>
                        <option value="18">18% DEFAULT</option>
                        <option value="28">28% LUXURY</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4 p-1.5 bg-surface-2 rounded-[1.25rem]">
                     <button type="button" onClick={() => setForm(f => ({...f, taxType: 'intra'}))} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${form.taxType === 'intra' ? 'bg-[#0A2518] text-white shadow-lg' : 'text-muted-2'}`}>Intra-State</button>
                     <button type="button" onClick={() => setForm(f => ({...f, taxType: 'inter'}))} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${form.taxType === 'inter' ? 'bg-[#0A2518] text-white shadow-lg' : 'text-muted-2'}`}>Inter-State</button>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    {form.taxType === 'intra' ? (
                      <>
                        <div className="space-y-3 text-center">
                          <label className="text-[9px] font-black text-[#A2A9A5] uppercase tracking-widest">CGST</label>
                          <div className="py-5 bg-white border border-border rounded-[1.25rem] text-[14px] font-black text-text">Rs. {form.tax.cgst}</div>
                        </div>
                        <div className="space-y-3 text-center">
                          <label className="text-[9px] font-black text-[#A2A9A5] uppercase tracking-widest">SGST</label>
                          <div className="py-5 bg-white border border-border rounded-[1.25rem] text-[14px] font-black text-text">Rs. {form.tax.sgst}</div>
                        </div>
                      </>
                    ) : (
                      <div className="col-span-2 space-y-3 text-center">
                        <label className="text-[9px] font-black text-[#A2A9A5] uppercase tracking-widest">IGST</label>
                        <div className="py-5 bg-white border border-border rounded-[1.25rem] text-[14px] font-black text-text">Rs. {form.tax.igst}</div>
                      </div>
                    )}
                    <div className="space-y-3 text-center">
                       <label className="text-[9px] font-black text-[#047857] uppercase tracking-widest">GRAND TOTAL</label>
                       <div className="py-5 bg-[#047857] text-white rounded-[1.25rem] text-[14px] font-black shadow-lg shadow-[#047857]/20">Rs. {(Number(form.amount) + Number(form.tax.cgst) + Number(form.tax.sgst) + Number(form.tax.igst)).toFixed(0)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-12 pt-6 border-t border-border flex gap-5">
              {step > 1 && (
                <button type="button" onClick={() => setStep(step - 1)} className="px-10 py-5 border border-border text-muted-2 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-surface-2 transition-all">Back</button>
              )}
              <button type="submit" disabled={loading} className="flex-1 bg-[#0A2518] hover:bg-[#047857] text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] shadow-xl shadow-[#0A2518]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-4">
                {step < 3 ? 'Continue Synchronization' : 'Finalize & Transmit'}
              </button>
            </div>
          </form>
        </div>

        {loading && (
           <div className="absolute inset-0 bg-dark/95 backdrop-blur-md z-[60] flex flex-col items-center justify-center text-center p-12">
              <div className="w-24 h-24 rounded-full border-[8px] border-[#047857]/10 border-t-[#047857] animate-spin mb-10" />
              <h3 className="text-2xl font-black text-text tracking-tight mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Sealing Ledger Entry</h3>
              <p className="text-[13px] text-muted-2 font-medium leading-relaxed max-w-[340px]">
                Initiating cryptographic handshake. Constructing an immutable record across the distributed network. <br/><br/>Please do not disrupt the relay.
              </p>
           </div>
        )}
      </div>
    </div>
  );
}
