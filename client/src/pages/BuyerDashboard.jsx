import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import StatCard from '../components/dashboard/StatCard';
import InvoiceTable from '../components/dashboard/InvoiceTable';
import InvoiceModal from '../components/dashboard/InvoiceModal';
import StatusBadge from '../components/dashboard/StatusBadge';
import SettingsTab from '../components/dashboard/SettingsTab';
import AuditFeed from '../components/dashboard/AuditFeed';
import api from '../api/axios';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function BuyerDashboard() {
  const { tab = 'overview' } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [gstData, setGstData] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [reqSellerGstin, setReqSellerGstin] = useState('');
  const [reqNote, setReqNote] = useState('');
  const [reqLoading, setReqLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [dashRes, invRes, reqRes, gstRes] = await Promise.all([
        api.get('/dashboard/buyer'),
        api.get('/invoices/received'),
        api.get('/requests/mine'),
        api.get('/dashboard/gst')
      ]);
      setStats(dashRes.data?.data || null);
      setInvoices(invRes.data?.data || []);
      setMyRequests(reqRes.data?.data || []);
      setGstData(gstRes.data?.data || null);
    } catch (err) {
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setReqLoading(true);
    try {
      await api.post('/requests', { sellerGstin: reqSellerGstin.toUpperCase(), note: reqNote });
      alert('Request sent successfully');
      setReqSellerGstin('');
      setReqNote('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request');
    } finally {
      setReqLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/dashboard/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'InvoiceSync_GST_Return.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.log('Failed to export CSV', err);
    }
  };

  const fmtCurrency = (val) => {
    if (!val && val !== 0) return '--';
    return val.toLocaleString('en-IN');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex bg-[#FDFBF7] h-screen overflow-hidden">
        <Sidebar role="buyer" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <span className="w-12 h-12 border-4 border-[#047857]/20 border-t-[#047857] rounded-full spin" />
            <span className="text-sm text-[#4D6357] font-bold tracking-widest uppercase">Initializing...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FDFBF7] relative">
      <Sidebar role="buyer" isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-[#0A2518]/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar title="Buyer Experience" onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 lg:p-12 space-y-10">

          {/* PAGE HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="animate-fade-up">
              <div className="text-[10px] font-bold text-[#047857] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                 <span className="w-4 h-px bg-[#047857]/30" />
                 Compliance Dashboard
              </div>
              <h2 className="text-3xl font-extrabold text-[#0A2518] tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)} View
              </h2>
              <p className="text-sm text-[#728279] mt-2 font-medium max-w-lg">
                Manage your supply chain compliance, track GST input taxing, and review received invoices from all your vendors.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
               <button className="px-5 py-2.5 bg-white border border-[#E5E2D9] rounded-xl text-xs font-bold text-[#4D6357] hover:border-[#047857]/30 transition-all shadow-sm">
                  Filter Period
               </button>
               <button onClick={handleExportCSV} className="px-5 py-2.5 bg-[#047857] text-white rounded-xl text-xs font-bold hover:bg-[#065F46] transition-all shadow-lg shadow-[#047857]/20 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Export Data
               </button>
            </div>
          </div>

          {/* OVERVIEW CONTENT */}
          {tab === 'overview' && (
            <div className="space-y-10 animate-fade-in">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Invoices Received" value={stats?.totalReceived || 0}                        sub="Records found"       color="border-primary"      />
                <StatCard label="Pending Approval"   value={stats?.pendingCount || 0}                        sub="Action required"      color="border-yellow-500"   />
                <StatCard label="Input GST Credits"  value={`₹${fmtCurrency(stats?.totals?.grand || 0)}`}   sub="Tax claimable"        color="border-red-400"      />
                <StatCard label="Net Payable"        value={`₹${fmtCurrency(stats?.totalOutstanding || 0)}`} sub="To suppliers"         color="border-orange-400"   />
              </div>

              {/* Central Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                
                {/* Main Table Container */}
                <div className="xl:col-span-8 bg-white border border-[#E5E2D9] rounded-[2rem] overflow-hidden shadow-sm">
                  <InvoiceTable
                    title="Latest Acquisitions"
                    invoices={invoices.slice(0, 10)}
                    role="buyer"
                    onRowClick={(inv) => setSelectedInvoice(inv)}
                    onRefresh={fetchData}
                  />
                  <div className="p-6 bg-[#F4F1EA]/30 border-t border-[#E5E2D9] flex justify-center">
                     <button onClick={() => navigate('/buyer/invoices')} className="text-xs font-bold text-[#047857] hover:underline uppercase tracking-widest">
                        View All Invoices
                     </button>
                  </div>
                </div>

                {/* Sidebar Cards */}
                <div className="xl:col-span-4 space-y-8">
                  
                  {/* GST Credit Bar Chart */}
                  <div className="bg-white border border-[#E5E2D9] rounded-[2rem] p-8 shadow-sm">
                    <div className="flex flex-col mb-8 text-center border-b border-[#E5E2D9] pb-6">
                       <h3 className="font-extrabold text-[#0A2518] text-lg" style={{ fontFamily: 'Plus Jakarta Sans' }}>GST Breakdown</h3>
                       <p className="text-[11px] font-bold text-[#728279] uppercase tracking-widest mt-1">Current Billing Cycle</p>
                    </div>

                    <div className="space-y-5">
                      {[
                        { label: 'CGST', value: gstData?.totals?.cgst || 0, color: '#047857' },
                        { label: 'SGST', value: gstData?.totals?.sgst || 0, color: '#047857' },
                        { label: 'IGST', value: gstData?.totals?.igst || 0, color: '#065F46' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="space-y-3">
                          <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-[#4D6357]">
                             <span>{label}</span>
                             <span className="text-[#0A2518]">₹{fmtCurrency(value)}</span>
                          </div>
                          <div className="h-1.5 w-full bg-[#F4F1EA] rounded-full overflow-hidden">
                             <div 
                                className="h-full rounded-full transition-all duration-1000" 
                                style={{ width: `${Math.min(100, (value / (gstData?.totals?.grand || 1)) * 100)}%`, backgroundColor: color }} 
                             />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-[#E5E2D9] flex justify-between items-center">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-extrabold text-[#728279] uppercase tracking-widest">Total ITC</span>
                          <span className="text-2xl font-black text-[#047857] mt-1">₹{fmtCurrency(gstData?.totals?.grand || 0)}</span>
                       </div>
                       <div className="w-12 h-12 bg-[#047857]/5 rounded-2xl flex items-center justify-center text-[#047857]">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                       </div>
                    </div>
                  </div>

                  {/* Missing Invoice Request Card */}
                  <div className="bg-[#047857] rounded-[2rem] p-8 text-white shadow-xl shadow-[#047857]/20 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-10 -translate-y-10 blur-3xl group-hover:scale-150 transition-transform duration-700" />
                     
                     <h3 className="font-bold text-lg mb-2 relative z-10" style={{ fontFamily: 'Plus Jakarta Sans' }}>Missing something?</h3>
                     <p className="text-white/70 text-sm mb-6 relative z-10 leading-relaxed font-medium">Request a digital invoice from your seller directly within the platform.</p>
                     <button onClick={() => navigate('/buyer/requests')} className="bg-white text-[#047857] rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-[#FDFBF7] transition-all relative z-10 shadow-lg">
                        Submit a Request
                     </button>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* INVOICES TAB */}
          {tab === 'invoices' && (
            <div className="animate-fade-in">
               <div className="bg-white border border-[#E5E2D9] rounded-[2rem] overflow-hidden shadow-sm">
                  <InvoiceTable
                    title="Comprehensive History"
                    invoices={invoices}
                    role="buyer"
                    onRowClick={(inv) => setSelectedInvoice(inv)}
                    onRefresh={fetchData}
                  />
               </div>
            </div>
          )}

          {/* REQUESTS TAB */}
          {tab === 'requests' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in items-start">
              
              {/* Form Side */}
              <div className="lg:col-span-4 sticky top-[100px] space-y-6">
                <div className="bg-white border border-[#E5E2D9] rounded-[2rem] p-8 shadow-sm">
                  <h3 className="font-extrabold text-[#0A2518] text-xl mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>New Request</h3>
                  <p className="text-xs text-[#728279] font-medium mb-8">We'll notify the vendor as soon as you submit.</p>
                  
                  <form onSubmit={handleRequestSubmit} className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-[#728279] uppercase tracking-[0.2em]">Seller GSTIN</label>
                      <input
                        type="text"
                        required
                        maxLength="15"
                        value={reqSellerGstin}
                        onChange={(e) => setReqSellerGstin(e.target.value.toUpperCase())}
                        placeholder="e.g. 27AAPFU0939F1ZV"
                        className="w-full bg-[#F4F1EA]/50 border border-[#E5E2D9] rounded-2xl px-5 py-4 text-sm font-bold text-[#0A2518] focus:border-[#047857] outline-none transition-all placeholder-[#A2A9A5]"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-[#728279] uppercase tracking-[0.2em]">Note to Seller</label>
                      <textarea
                        rows={4}
                        value={reqNote}
                        onChange={(e) => setReqNote(e.target.value)}
                        placeholder="Mention order ID or date..."
                        className="w-full bg-[#F4F1EA]/50 border border-[#E5E2D9] rounded-2xl px-5 py-4 text-sm font-medium text-[#0A2518] focus:border-[#047857] outline-none transition-all placeholder-[#A2A9A5] resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={reqLoading}
                      className="w-full bg-[#047857] text-white rounded-2xl py-4 font-bold text-sm shadow-xl shadow-[#047857]/20 hover:bg-[#065F46] disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                    >
                      {reqLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spin" />}
                      {reqLoading ? 'Processing...' : 'Submit Request'}
                    </button>
                  </form>
                </div>
              </div>

              {/* List Side */}
              <div className="lg:col-span-8 bg-white border border-[#E5E2D9] rounded-[2rem] p-8 min-h-[500px]">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#E5E2D9]">
                   <h4 className="text-sm font-black text-[#0A2518] uppercase tracking-[0.14em]">Request History</h4>
                   <span className="text-[10px] font-bold text-[#728279] px-3 py-1 bg-[#F4F1EA] rounded-full uppercase tracking-widest">{myRequests.length} Total</span>
                </div>

                {myRequests.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {myRequests.map((req) => (
                      <div key={req._id || req.id} className="p-5 border border-[#E5E2D9] rounded-2xl hover:border-[#047857]/30 transition-all flex items-center gap-6 group">
                        <div className="w-12 h-12 rounded-xl bg-[#F4F1EA] flex items-center justify-center flex-shrink-0 group-hover:bg-[#047857]/5 transition-colors">
                           <svg className="w-6 h-6 text-[#728279] group-hover:text-[#047857] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-3 mb-1">
                              <span className="font-bold text-[#0A2518] truncate">{req.sellerGstin}</span>
                              <span className="text-[10px] font-bold text-[#728279] px-2 py-0.5 bg-[#F4F1EA] border border-[#E5E2D9] rounded uppercase tracking-tighter">Vendor</span>
                           </div>
                           <p className="text-xs text-[#728279] font-medium truncate">"{req.note || 'No note added'}"</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 text-right">
                           <StatusBadge status={req.status} />
                           <span className="text-[10px] font-black text-[#A2A9A5] uppercase tracking-widest">{formatDate(req.date || req.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 rounded-full bg-[#F4F1EA] flex items-center justify-center mb-6">
                       <svg className="w-10 h-10 text-[#A2A9A5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    </div>
                    <h5 className="text-lg font-bold text-[#0A2518] mb-1">No requests match your filters</h5>
                    <p className="text-xs text-[#728279] font-medium">Any invoice requests you send will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* GST TAB */}
          {tab === 'gst' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in items-start">
               
               {/* Analysis Card */}
               <div className="lg:col-span-8 bg-white border border-[#E5E2D9] rounded-[2rem] p-10 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                     <div>
                        <h3 className="text-xl font-extrabold text-[#0A2518]" style={{ fontFamily: 'Plus Jakarta Sans' }}>GST Performance</h3>
                        <p className="text-xs text-[#728279] font-medium mt-1">Detailed breakdown of tax claims and history.</p>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-1 bg-[#047857]/5 border border-[#047857]/10 rounded-lg text-[10px] font-bold text-[#047857] uppercase tracking-widest">
                           <span className="w-1.5 h-1.5 rounded-full bg-[#047857]" />
                           Live Claims
                        </div>
                     </div>
                  </div>

                  {/* Chart Area */}
                  <div className="h-[350px] w-full bg-[#F4F1EA]/20 rounded-[1.5rem] p-6 border border-[#E5E2D9]/50">
                    {gstData?.breakdown && gstData.breakdown.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={gstData.breakdown}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E2D9" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={10} fontWeight={700} stroke="#728279" dy={10} />
                          <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight={700} stroke="#728279" tickFormatter={(v) => `₹${v/1000}k`} />
                          <Tooltip
                            cursor={{ fill: '#047857', opacity: 0.03 }}
                            contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E2D9', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', fontSize: '12px' }}
                          />
                          <Bar 
                            dataKey="total" 
                            name="Total GST" 
                            fill="#047857" 
                            radius={[6, 6, 0, 0]} 
                            barSize={40}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-sm font-bold text-[#728279]">
                        Insufficient data for GST analytics
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 p-8 bg-[#F4F1EA]/30 rounded-[1.5rem] border border-[#E5E2D9]">
                     {[
                       { l: 'Avg Monthly ITC', v: `₹${fmtCurrency(24500)}`, c: 'text-[#047857]' },
                       { l: 'Projected Carryforward', v: `₹${fmtCurrency(12430)}`, c: 'text-[#4D6357]' },
                       { l: 'Compliance Level', v: 'High (98%)', c: 'text-[#047857]' },
                     ].map(({ l, v, c }) => (
                       <div key={l} className="space-y-1">
                          <span className="text-[10px] font-black text-[#A2A9A5] uppercase tracking-widest">{l}</span>
                          <span className={`block text-lg font-black ${c}`}>{v}</span>
                       </div>
                     ))}
                  </div>
               </div>

               {/* Summary Side */}
               <div className="lg:col-span-4 bg-white border border-[#E5E2D9] rounded-[2rem] p-8 shadow-sm space-y-8">
                  <h4 className="text-sm font-black text-[#0A2518] uppercase tracking-[0.14em] mb-2">Claim Summary</h4>
                  
                  <div className="space-y-6">
                    <div className="p-5 bg-[#F4F1EA]/50 rounded-2xl border border-[#E5E2D9]">
                       <span className="text-[10px] font-bold text-[#728279] uppercase tracking-widest block mb-1">Total Input Credits</span>
                       <span className="text-2xl font-black text-[#0A2518]">₹{fmtCurrency(gstData?.totals?.grand || 0)}</span>
                    </div>

                    <div className="space-y-4">
                       {[
                         { label: 'Central Tax (CGST)', value: gstData?.totals?.cgst || 0 },
                         { label: 'State Tax (SGST)', value: gstData?.totals?.sgst || 0 },
                         { label: 'Integrated Tax (IGST)', value: gstData?.totals?.igst || 0 },
                       ].map(({ label, value }) => (
                         <div key={label} className="flex items-center justify-between text-xs font-bold px-1">
                            <span className="text-[#4D6357]">{label}</span>
                            <span className="text-[#0A2518]">₹{fmtCurrency(value)}</span>
                         </div>
                       ))}
                    </div>
                    
                    <button onClick={handleExportCSV} className="w-full bg-[#F4F1EA] hover:bg-[#E5E2D9] text-[#0A2518] rounded-xl py-4 text-xs font-black uppercase tracking-widest transition-all">
                       Download Returns Report
                    </button>
                  </div>
               </div>
            </div>
          )}

          {/* AUDIT TAB */}
          {tab === 'audit' && (
            <div className="max-w-4xl animate-fade-in">
              <AuditFeed />
            </div>
          )}

          {/* SETTINGS TAB */}
          {tab === 'settings' && (
            <div className="max-w-4xl animate-fade-in">
              <SettingsTab />
            </div>
          )}

        </main>
      </div>

      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          role="buyer"
        />
      )}
    </div>
  );
}
