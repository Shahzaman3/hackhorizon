import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import StatCard from '../components/dashboard/StatCard';
import InvoiceTable from '../components/dashboard/InvoiceTable';
import InvoiceModal from '../components/dashboard/InvoiceModal';
import CreateInvoiceModal from '../components/dashboard/CreateInvoiceModal';
import StatusBadge from '../components/dashboard/StatusBadge';
import SettingsTab from '../components/dashboard/SettingsTab';
import AuditFeed from '../components/dashboard/AuditFeed';
import api from '../api/axios';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';

export default function SellerDashboard() {
  const { tab = 'overview' } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [gstData, setGstData] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sparkline mock data for stats
  const [chartData, setChartData] = useState([
    { v: 400 }, { v: 500 }, { v: 450 }, { v: 600 }, { v: 580 }, { v: 700 }, { v: 750 }
  ]);

  const fetchData = async () => {
    try {
      const [dashRes, invRes, reqRes, gstRes] = await Promise.all([
        api.get('/dashboard/seller'),
        api.get('/invoices/sent'),
        api.get('/requests/incoming'),
        api.get('/dashboard/gst')
      ]);
      setStats(dashRes.data?.data || null);
      setInvoices(invRes.data?.data || []);
      setRequests(reqRes.data?.data || []);
      setGstData(gstRes.data?.data || null);
    } catch (err) {
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (tab === 'upload') {
      setShowCreateModal(true);
      navigate('/seller/dashboard', { replace: true });
    }
  }, [tab, navigate]);

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/dashboard/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'InvoiceSync_GST_Collected.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export CSV', err);
    }
  };

  const handleFulfillRequest = async (id) => {
    try {
      await api.patch(`/requests/${id}/fulfill`);
      fetchData();
    } catch (err) {
      console.error('Failed to fulfill request:', err);
    }
  };

  const fmtCurrency = (val) => {
    if (!val && val !== 0) return '--';
    return val.toLocaleString('en-IN');
  };

  if (loading) {
    return (
      <div className="flex bg-[#FDFBF7] h-screen overflow-hidden">
        <Sidebar role="seller" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
             <span className="w-12 h-12 border-4 border-[#047857]/20 border-t-[#047857] rounded-full spin" />
             <span className="text-sm text-[#4D6357] font-bold tracking-widest uppercase">System Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FDFBF7] relative">
      <Sidebar role="seller" isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-[#0A2518]/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar title="Merchant Console" onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 lg:p-12 space-y-10">

          {/* PAGE HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="animate-fade-up">
              <div className="text-[10px] font-bold text-[#047857] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                 <span className="w-4 h-px bg-[#047857]/30" />
                 Revenue & Compliance
              </div>
              <h2 className="text-3xl font-extrabold text-[#0A2518] tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                {tab === 'overview' ? 'Seller Insights' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </h2>
              <p className="text-sm text-[#728279] mt-2 font-medium max-w-lg leading-relaxed">
                Analyze your invoice performance, manage distribution, and track GST collections with high-fidelity reporting.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
               <button onClick={() => setShowCreateModal(true)} className="px-6 py-3 bg-[#047857] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#065F46] transition-all shadow-xl shadow-[#047857]/20 flex items-center gap-2.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                  Generate Invoice
               </button>
            </div>
          </div>

          {/* OVERVIEW CONTENT */}
          {tab === 'overview' && (
            <div className="space-y-10 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard label="Circulated Invoices"  value={stats?.totalInvoices || 0}                         sub="Across all clients"      color="border-primary"     />
                 <StatCard label="Total Accepted"       value={stats?.acceptedCount || 0}                         sub="Verified by buyers"      color="border-green-500"   />
                 <StatCard label="Awaiting Review"      value={stats?.pendingCount || 0}                          sub="Pending confirmation"    color="border-yellow-500"  />
                 <StatCard label="Tax Liabilities"      value={`₹${fmtCurrency(stats?.totals?.grand || 0)}`}     sub="Collected GST"           color="border-blue-500"    />
              </div>

              {/* Central Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                
                {/* Main Table Container */}
                <div className="xl:col-span-8 bg-white border border-[#E5E2D9] rounded-[2.5rem] overflow-hidden shadow-sm">
                  <InvoiceTable
                    title="Recent Financial Events"
                    invoices={invoices.slice(0, 10)}
                    role="seller"
                    onRowClick={(inv) => setSelectedInvoice(inv)}
                    onRefresh={fetchData}
                  />
                  <div className="p-8 bg-[#F4F1EA]/20 border-t border-[#E5E2D9] flex justify-center">
                     <button onClick={() => navigate('/seller/invoices')} className="text-[11px] font-black text-[#047857] hover:text-[#065F46] uppercase tracking-widest transition-colors flex items-center gap-2">
                        Inspect Complete Ledger
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                     </button>
                  </div>
                </div>

                {/* Sidebar Cards */}
                <div className="xl:col-span-4 space-y-8">
                  
                  {/* Revenue Growth Chart */}
                  <div className="bg-white border border-[#E5E2D9] rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex flex-col mb-8">
                       <h3 className="font-extrabold text-[#0A2518] text-lg" style={{ fontFamily: 'Plus Jakarta Sans' }}>Invoice Volume</h3>
                       <p className="text-[11px] font-bold text-[#728279] uppercase tracking-widest mt-1">Growth Index</p>
                    </div>

                    <div className="h-[200px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E2D9/50" />
                            <Area type="monotone" dataKey="v" stroke="#047857" strokeWidth={3} fill="url(#revGrad)" fillOpacity={1} />
                            <defs>
                               <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#047857" stopOpacity={0.15}/>
                                  <stop offset="95%" stopColor="#047857" stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                         </AreaChart>
                       </ResponsiveContainer>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4">
                       <div className="p-4 bg-[#F4F1EA]/50 rounded-2xl border border-[#E5E2D9]">
                          <span className="text-[10px] font-black text-[#728279] uppercase tracking-widest block mb-1">Growth</span>
                          <span className="text-lg font-black text-[#047857] tracking-tight">+ 24.5%</span>
                       </div>
                       <div className="p-4 bg-[#F4F1EA]/50 rounded-2xl border border-[#E5E2D9]">
                          <span className="text-[10px] font-black text-[#728279] uppercase tracking-widest block mb-1">Accuracy</span>
                          <span className="text-lg font-black text-[#0A2518] tracking-tight">99.9%</span>
                       </div>
                    </div>
                  </div>

                  {/* Incoming Requests Quick View */}
                  <div className="bg-white border border-[#E5E2D9] rounded-[2.5rem] p-8 shadow-sm">
                     <div className="flex items-center justify-between mb-6">
                        <h4 className="font-extrabold text-[#0A2518] uppercase tracking-wider text-xs">Awaiting Fulfillment</h4>
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                     </div>

                     {requests.length > 0 ? (
                       <div className="space-y-4">
                          {requests.slice(0, 3).map(req => (
                             <div key={req._id} className="p-4 bg-[#F4F1EA]/30 rounded-2xl border border-[#E5E2D9] hover:border-[#047857]/30 transition-all cursor-pointer">
                                <div className="flex justify-between items-center mb-1">
                                   <span className="text-xs font-bold text-[#0A2518]">{req.buyerGstin}</span>
                                   <span className="text-[9px] font-black text-[#728279]">Just Now</span>
                                </div>
                                <p className="text-[11px] text-[#4D6357] truncate font-medium">"{req.note || 'No note'}"</p>
                             </div>
                          ))}
                          <button onClick={() => navigate('/seller/requests')} className="w-full text-center py-2 text-[10px] font-black text-[#047857] uppercase tracking-widest">
                             Handle All Requests ({requests.length})
                          </button>
                       </div>
                     ) : (
                       <div className="py-10 text-center flex flex-col items-center">
                          <div className="w-12 h-12 rounded-2xl bg-[#F4F1EA] flex items-center justify-center mb-4">
                             <svg className="w-6 h-6 text-[#A2A9A5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          </div>
                          <span className="text-[11px] font-bold text-[#728279]">No pending requests</span>
                       </div>
                     )}
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TABLE VIEWS (Invoices, Payments) */}
          {(tab === 'invoices' || tab === 'payments') && (
            <div className="animate-fade-in bg-white border border-[#E5E2D9] rounded-[2.5rem] overflow-hidden shadow-sm">
                <InvoiceTable
                  title={tab === 'payments' ? "Disbursement Ledger" : "Document Archive"}
                  invoices={tab === 'payments' ? invoices.filter(inv => inv.paymentStatus === 'paid') : invoices}
                  role="seller"
                  onRowClick={(inv) => setSelectedInvoice(inv)}
                  onRefresh={fetchData}
                />
            </div>
          )}

          {/* GST ANALYTICS */}
          {tab === 'gst' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in items-start">
               <div className="lg:col-span-8 bg-white border border-[#E5E2D9] rounded-[2.5rem] p-10 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 pb-6 border-b border-[#E5E2D9]">
                     <div>
                        <h3 className="text-2xl font-black text-[#0A2518]" style={{ fontFamily: 'Plus Jakarta Sans' }}>GST Collection Stream</h3>
                        <p className="text-sm font-medium text-[#728279] mt-1">Consolidated view of tax collected on behalf of the government.</p>
                     </div>
                     <button onClick={handleExportCSV} className="px-5 py-2.5 bg-[#F4F1EA] border border-[#E5E2D9] rounded-xl text-xs font-black text-[#0A2518] uppercase tracking-widest hover:bg-[#047857] hover:text-white transition-all transition-colors flex items-center gap-2">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export GSTR-1
                     </button>
                  </div>

                  <div className="h-[400px] w-full">
                    {gstData?.breakdown && gstData.breakdown.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={gstData.breakdown}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E2D9" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={11} fontWeight={900} stroke="#728279" dy={10} />
                          <YAxis axisLine={false} tickLine={false} fontSize={11} fontWeight={900} stroke="#728279" />
                          <Tooltip
                            cursor={{ fill: '#047857', opacity: 0.03 }}
                            contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E2D9', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', fontSize: '13px', fontWeight: 700 }}
                          />
                          <Bar 
                            dataKey="total" 
                            fill="#047857" 
                            radius={[8, 8, 0, 0]} 
                            barSize={50}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-sm font-black text-[#728279] uppercase tracking-widest">
                        Initializing Data Stream...
                      </div>
                    )}
                  </div>
               </div>

               <div className="lg:col-span-4 bg-white border border-[#E5E2D9] rounded-[2.5rem] p-10 shadow-sm space-y-8">
                  <h4 className="text-xs font-black text-[#0A2518] uppercase tracking-[0.2em]">Summary Statistics</h4>
                  
                  <div className="space-y-6">
                    <div className="p-6 bg-[#047857]/5 rounded-[2rem] border border-[#047857]/10">
                       <span className="text-[10px] font-bold text-[#4D6357] uppercase tracking-widest block mb-2">Total Liability</span>
                       <span className="text-3xl font-black text-[#047857] tracking-tight">₹{fmtCurrency(gstData?.totals?.grand || 0)}</span>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-[#E5E2D9]">
                       {[
                         { label: 'CGST (Central)', value: gstData?.totals?.cgst || 0 },
                         { label: 'SGST (State)', value: gstData?.totals?.sgst || 0 },
                         { label: 'IGST (Integrated)', value: gstData?.totals?.igst || 0 },
                       ].map(({ label, value }) => (
                         <div key={label} className="flex items-center justify-between text-[11px] font-bold px-1">
                            <span className="text-[#728279] uppercase tracking-wide">{label}</span>
                            <span className="text-[#0A2518] font-black">₹{fmtCurrency(value)}</span>
                         </div>
                       ))}
                    </div>
                  </div>
               </div>
            </div>
          )}

          {/* OTHERS */}
          {tab === 'audit' && (
            <div className="max-w-5xl animate-fade-in"><AuditFeed /></div>
          )}
          {tab === 'settings' && (
            <div className="max-w-5xl animate-fade-in"><SettingsTab /></div>
          )}
          {tab === 'requests' && (
            <div className="animate-fade-in flex flex-col gap-8">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-[#0A2518] tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>Supply Chain Requests</h3>
                  <span className="px-4 py-1.5 bg-[#F4F1EA] text-[10px] font-black text-[#047857] uppercase tracking-widest rounded-full">{requests.length} Pending</span>
               </div>
               
               {requests.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.map(req => (
                      <div key={req._id} className="bg-white border border-[#E5E2D9] rounded-[2rem] p-8 shadow-sm hover:border-[#047857]/30 transition-all group flex flex-col items-center text-center">
                         <div className="w-16 h-16 bg-[#F4F1EA] rounded-3xl flex items-center justify-center mb-6 text-[#047857] group-hover:scale-110 transition-transform duration-500">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                         </div>
                         <span className="text-[10px] font-black text-[#728279] uppercase tracking-widest mb-1">Purchaser GSTIN</span>
                         <span className="text-base font-black text-[#0A2518] mb-4">{req.buyerGstin}</span>
                         <p className="text-sm font-medium text-[#4D6357] italic mb-8">"{req.note || 'Requested upload for matching records'}"</p>
                         <button 
                            onClick={() => handleFulfillRequest(req._id)}
                            className="w-full py-4 bg-[#047857] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-[#047857]/10 hover:shadow-[#047857]/20 transition-all"
                         >
                            Upload Document
                         </button>
                      </div>
                    ))}
                 </div>
               ) : (
                 <div className="bg-white border border-[#E5E2D9] rounded-[3rem] p-20 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-[#F4F1EA] rounded-full flex items-center justify-center mb-8">
                       <svg className="w-10 h-10 text-[#A2A9A5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                    </div>
                    <h4 className="text-xl font-black text-[#0A2518]">Quiet for now</h4>
                    <p className="text-sm font-medium text-[#728279] mt-2">Incoming invoice requests from buyers will populate here.</p>
                 </div>
               )}
            </div>
          )}

        </main>
      </div>

      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          role="seller"
          onRefresh={fetchData}
        />
      )}

      {showCreateModal && (
        <CreateInvoiceModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { setShowCreateModal(false); fetchData(); }}
        />
      )}
    </div>
  );
}
