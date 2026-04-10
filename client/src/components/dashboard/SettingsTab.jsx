import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';

export default function SettingsTab() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', gstin: '', type: 'seller' });

  const handleAddBusiness = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/business', formData);
      setUser(res.data.user);
      setFormData({ name: '', gstin: '', type: 'seller' });
      alert('Business successfully linked!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add business');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#E5E2D9] rounded-[2.5rem] p-10 lg:max-w-4xl shadow-sm animate-fade-in">
      <div className="flex flex-col mb-10 pb-8 border-b border-[#E5E2D9]">
         <h3 className="font-extrabold text-2xl text-[#0A2518] tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>Organization Profiles</h3>
         <p className="text-sm font-medium text-[#728279] mt-2">Manage multiple GSTINs and business units across your supply chain.</p>
      </div>
      
      <div className="mb-12">
        <h4 className="text-[10px] font-black text-[#728279] uppercase tracking-[0.2em] mb-6">Established Entities</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Profile */}
            {user?.gstin && (
              <div className="bg-[#F4F1EA]/30 border border-[#047857]/20 rounded-3xl p-6 flex flex-col relative overflow-hidden group hover:border-[#047857] transition-all">
                <div className="absolute top-0 right-0 px-3 py-1.5 bg-[#047857] text-[#FDFBF7] text-[10px] font-black rounded-bl-2xl uppercase tracking-widest shadow-lg">ACTIVE</div>
                <div className="flex items-center gap-4 mb-4 text-[#047857]">
                   <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                   <span className="font-black text-[#0A2518] text-lg tracking-tight">Personal Workspace</span>
                </div>
                <span className="text-[11px] font-black text-[#728279] uppercase tracking-widest mb-1">Taxation ID</span>
                <span className="text-sm font-bold font-mono text-[#0A2518] uppercase tracking-wider">{user.gstin}</span>
              </div>
            )}
            
            {/* Secondary Profiles */}
            {user?.businesses?.map((b, idx) => (
              <div key={idx} className="bg-white border border-[#E5E2D9] rounded-3xl p-6 flex flex-col hover:border-[#047857]/30 transition-all shadow-sm">
                <div className="flex items-center gap-4 mb-4 text-[#728279]">
                   <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                   <span className="font-black text-[#0A2518] text-lg tracking-tight">{b.name}</span>
                </div>
                <span className="text-[11px] font-black text-[#728279] uppercase tracking-widest mb-1">GSTIN Number</span>
                <span className="text-sm font-bold font-mono text-[#0A2518] uppercase tracking-wider">{b.gstin}</span>
                <div className="mt-4 inline-flex items-center gap-2 text-[10px] font-black text-[#047857] uppercase tracking-widest bg-[#047857]/5 w-fit px-3 py-1 rounded-lg">
                   {b.type}
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="pt-10 border-t border-[#E5E2D9]">
        <h4 className="text-[10px] font-black text-[#728279] uppercase tracking-[0.2em] mb-8">Register Branch / Subsidiary</h4>
        
        <form onSubmit={handleAddBusiness} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-[#4D6357] uppercase tracking-[0.15em] ml-1">Trade Name</label>
            <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Acme Logistics India" className="w-full bg-[#F4F1EA]/50 border border-[#E5E2D9] rounded-2xl px-5 py-4 text-sm font-bold text-[#0A2518] outline-none focus:border-[#047857] transition-all placeholder-[#A2A9A5]" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-[#4D6357] uppercase tracking-[0.15em] ml-1">GSTIN Registration</label>
            <input required type="text" maxLength={15} value={formData.gstin} onChange={(e) => setFormData({...formData, gstin: e.target.value.toUpperCase()})} placeholder="15-digit code..." className="w-full bg-[#F4F1EA]/50 border border-[#E5E2D9] rounded-2xl px-5 py-4 text-sm font-bold font-mono uppercase outline-none focus:border-[#047857] transition-all placeholder-[#A2A9A5]" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-[#4D6357] uppercase tracking-[0.15em] ml-1">Profile Classification</label>
            <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full h-[58px] bg-[#F4F1EA]/50 border border-[#E5E2D9] rounded-2xl px-5 py-4 text-sm font-bold text-[#0A2518] outline-none focus:border-[#047857] appearance-none cursor-pointer transition-all">
                <option value="seller">Seller / Vendor</option>
                <option value="buyer">Buyer / Client</option>
                <option value="both">Dual (Buy & Sell)</option>
            </select>
          </div>
          
          <div className="flex items-end">
             <button type="submit" disabled={loading} className="w-full h-[58px] bg-[#0A2518] hover:bg-[#047857] text-white font-black uppercase tracking-widest py-4 rounded-2xl text-[11px] transition-all shadow-xl shadow-[#0A2518]/10 disabled:opacity-50 flex items-center justify-center gap-3">
               {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full spin" />}
               {loading ? 'Processing...' : 'Link Corporate Profile'}
             </button>
          </div>
        </form>
      </div>

    </div>
  );
}
