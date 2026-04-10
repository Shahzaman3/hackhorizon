import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import StatCard from '../components/dashboard/StatCard';
import InvoiceTable from '../components/dashboard/InvoiceTable';
import InvoiceModal from '../components/dashboard/InvoiceModal';
import SettingsTab from '../components/dashboard/SettingsTab';
import AuditFeed from '../components/dashboard/AuditFeed';
import StatusBadge from '../components/dashboard/StatusBadge';
import { StatSkeleton, ChartSkeleton, TableSkeleton, CardSkeleton } from '../components/dashboard/SkeletonLoader';
import api from '../api/axios';
import { 
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, 
  PieChart, Pie, Cell 
} from 'recharts';

// PERFORMANCE OPTIMIZATION: Memoized Chart Component
const FluxChart = ({ data }) => {
  const chartData = useMemo(() => data ? [...data].reverse() : [], [data]);
  
  if (!chartData.length) return (
     <div className="h-full flex items-center justify-center text-[10px] font-black text-[#A2A9A5] uppercase tracking-widest border border-dashed border-[#E5E2D9] rounded-[2.5rem] bg-[#F4F1EA]/10 font-sans">
        Aggregating Stream...
     </div>
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="buyerOverviewGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#047857" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#047857" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E2D9" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={10} fontWeight={900} stroke="#728279" dy={10} />
        <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight={900} stroke="#728279" />
        <Tooltip contentStyle={{ borderRadius: '20px', border: '1px solid #E5E2D9', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', fontSize: '13px', fontWeight: 900 }} />
        <Area type="monotone" dataKey="total" stroke="#047857" strokeWidth={5} fill="url(#buyerOverviewGrad)" animationDuration={1000} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default function BuyerDashboard() {
  const { tab = 'overview' } = useParams();
  const navigate = useNavigate();
  
  // States
  const [data, setData] = useState({ stats: null, invoices: [], myRequests: [], gstData: null, auditLogs: [] });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // OPTIMIZATION: Consolidated data fetching with better error handling
  const fetchData = useCallback(async () => {
    try {
      const [dashRes, invRes, reqRes, gstRes, auditRes] = await Promise.all([
        api.get('/dashboard/buyer'),
        api.get('/invoices/received'),
        api.get('/requests/mine'),
        api.get('/dashboard/gst'),
        api.get('/dashboard/audit')
      ]);
      setData({
        stats: dashRes.data?.data || null,
        invoices: invRes.data?.data || [],
        myRequests: reqRes.data?.data || [],
        gstData: gstRes.data?.data || null,
        auditLogs: auditRes.data?.data || []
      });
    } catch (err) {
      console.error('Core data sync failure:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Helpers
  const fmtCurrency = (val) => (!val && val !== 0 ? '--' : val.toLocaleString('en-IN'));
  const formatDate = (dateStr) => (!dateStr ? '--' : new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }));

  // Chart Memos
  const statusDist = useMemo(() => {
    const s = data.stats;
    return [
      { name: 'Accepted', value: s?.acceptedCount || 0, color: '#047857' },
      { name: 'Pending', value: s?.pendingCount || 0, color: '#ca8a04' },
      { name: 'Rejected', value: s?.rejectedCount || 0, color: '#dc2626' },
    ].filter(d => d.value > 0);
  }, [data.stats]);

  const statsList = useMemo(() => [
    { label: "ITC Credits",   value: `₹${fmtCurrency(data.stats?.gstPayable?.grandTotalGst || 0)}`, sub: "Accepted Stream", color: "border-emerald-500" },
    { label: "Review Queue",  value: data.stats?.pendingCount || 0, sub: "Pending Action", color: "border-yellow-500" },
    { label: "Documents",     value: data.stats?.totalReceived || 0, sub: "Total Received", color: "border-primary" },
    { label: "Net Payable",   value: `₹${fmtCurrency(data.stats?.totalAmountPayable || 0)}`, sub: "Settlement Due", color: "border-red-400" },
  ], [data.stats]);

  // Optimized Layout Return
  return (
    <div className="flex h-screen overflow-hidden bg-[#FDFBF7] relative antialiased">
      <Sidebar role="buyer" isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-[#0A2518]/40 backdrop-blur-sm z-30 md:hidden animate-fade-in" onClick={() => setMobileMenuOpen(false)} />
      )}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar title="Strategic Procurement Hub" onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-8 lg:p-10 space-y-8 scroll-smooth">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-up">
            <div>
               <div className="text-[10px] font-black text-[#047857] uppercase tracking-[0.25em] mb-3 flex items-center gap-3">
                  <span className="w-6 h-px bg-[#047857]/30" /> Real-time Compliance View
               </div>
               <h2 className="text-3xl font-extrabold text-[#0A2518] tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>Unified Master Portal</h2>
            </div>
            {tab === 'overview' && (
              <button onClick={() => navigate('/buyer/requests')} className="px-6 py-3 bg-[#0A2518] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#047857] transition-all shadow-xl shadow-[#0A2518]/10 hover:-translate-y-0.5 active:scale-95">
                Submit New Request
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-10">
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"><StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton /></div>
               <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                  <div className="xl:col-span-8 space-y-10"><ChartSkeleton /><TableSkeleton /></div>
                  <div className="xl:col-span-4 space-y-10"><CardSkeleton /><CardSkeleton /></div>
               </div>
            </div>
          ) : (
            <div className="animate-fade-in transition-opacity duration-500">
               {tab === 'overview' && (
                 <div className="space-y-8 animate-fade-in">
                   {/* Top Summary Bento */}
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {statsList.map((s, idx) => (
                        <div key={idx} className={`bg-white border-l-4 ${s.color} border-[#E5E2D9] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative`}>
                           <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#047857]/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                           <span className="text-[10px] font-black text-[#728279] uppercase tracking-widest block mb-1">{s.label}</span>
                           <h4 className="text-2xl font-black text-[#0A2518] tracking-tight">{s.value}</h4>
                           <p className="text-[9px] font-bold text-[#A2A9A5] uppercase tracking-tight mt-2 flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-[#047857]" /> {s.sub}
                           </p>
                        </div>
                      ))}
                   </div>

                   {/* Main Bento Layout */}
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                     
                     {/* Analytical Layer (Chart + Map) */}
                     <div className="lg:col-span-8">
                        <div className="bg-white border border-[#E5E2D9] rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group h-[480px] flex flex-col">
                           <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#047857]/10 to-transparent rounded-full translate-x-32 -translate-y-32 blur-3xl" />
                           <div className="flex items-center justify-between mb-8 relative z-10 flex-shrink-0">
                             <div>
                                <h3 className="text-lg font-black text-[#0A2518]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Accrual Flux Analytics</h3>
                                <p className="text-[10px] font-black text-[#A2A9A5] uppercase tracking-widest">Real-time Integrated ITC Stream</p>
                             </div>
                             <div className="px-4 py-1.5 bg-[#F4F1EA] rounded-full text-[9px] font-black text-[#4D6357] uppercase tracking-widest border border-[#E5E2D9]">Live Matrix</div>
                           </div>
                           <div className="flex-1 w-full relative z-10 min-h-0">
                              <FluxChart data={data.gstData?.breakdown} />
                           </div>
                        </div>
                     </div>

                     <div className="lg:col-span-4 h-full">
                        <div className="bg-white border border-[#E5E2D9] rounded-[2.5rem] p-8 shadow-sm h-full flex flex-col">
                           <h3 className="text-[10px] font-black text-[#0A2518] uppercase tracking-[0.25em] mb-8 text-center">Lifecycle Map</h3>
                           <div className="flex-1 w-full relative min-h-[220px]">
                              {statusDist.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                     <Pie data={statusDist} innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none">
                                       {statusDist.map((u, i) => <Cell key={i} fill={u.color} />)}
                                     </Pie>
                                     <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #E5E2D9', fontSize: '11px', fontWeight: 900 }} />
                                  </PieChart>
                                </ResponsiveContainer>
                              ) : (
                                <div className="h-full flex items-center justify-center text-[10px] font-black text-[#A2A9A5] uppercase tracking-widest border border-dashed border-[#E5E2D9] rounded-3xl">Neutral Data</div>
                              )}
                              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                 <span className="text-2xl font-black text-[#0A2518]">{data.stats?.totalReceived || 0}</span>
                                 <span className="text-[9px] font-bold text-[#728279] uppercase tracking-widest">Aggregate</span>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Primary Ledger Section - FULL WIDTH as requested */}
                     <div className="lg:col-span-12">
                        <div className="bg-white border border-[#E5E2D9] rounded-[2.5rem] overflow-hidden shadow-sm">
                           <div className="px-10 py-7 border-b border-[#E5E2D9] flex justify-between items-center bg-[#F4F1EA]/5 flex-wrap gap-6">
                              <div>
                                 <h3 className="font-black text-[#0A2518] text-lg" style={{ fontFamily: 'Plus Jakarta Sans' }}>Latest Procurements</h3>
                                 <p className="text-[10px] font-bold text-[#A2A9A5] uppercase tracking-widest mt-1">High-fidelity Transactional Ledger</p>
                              </div>
                              <button onClick={() => navigate('/buyer/invoices')} className="px-6 py-3 bg-[#047857]/5 text-[10px] font-black text-[#047857] uppercase tracking-widest rounded-2xl hover:bg-[#047857] hover:text-white transition-all shadow-sm">Consolidated Archive →</button>
                           </div>
                           <InvoiceTable title="Invoice Detail View" invoices={data.invoices.slice(0, 8)} role="buyer" onRowClick={setSelectedInvoice} onRefresh={fetchData} />
                        </div>
                     </div>

                     {/* Secondary Support Layer */}
                     <div className="lg:col-span-6">
                        <div className="bg-[#0A2518] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group h-full">
                           <div className="absolute bottom-0 left-0 w-full h-1 bg-[#047857]" />
                           <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-12 -translate-y-12 blur-3xl" />
                           <h3 className="text-[10px] font-black uppercase tracking-[0.25em] mb-8 relative z-10 flex items-center gap-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#047857] animate-pulse" /> Final Verification Ledger
                           </h3>
                           <div className="space-y-6 relative z-10">
                              {data.auditLogs.slice(0, 4).map((log, idx) => (
                                <div key={idx} className="flex gap-4 group/item">
                                   <div className="w-0.5 h-10 bg-white/10 rounded-full" />
                                   <div className="flex-1 min-w-0">
                                      <p className="text-[11px] font-bold text-white/90 leading-tight truncate group-hover/item:text-white transition-colors">{log.details}</p>
                                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block mt-1.5">{formatDate(log.createdAt)}</span>
                                   </div>
                                </div>
                              ))}
                              <button onClick={() => navigate('/buyer/audit')} className="w-full text-center py-4 bg-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest mt-6 border border-white/5 hover:bg-white hover:text-[#0A2518] transition-all">Full Audit Stream</button>
                           </div>
                        </div>
                     </div>

                     <div className="lg:col-span-6">
                        <div className="bg-white border border-[#E5E2D9] rounded-[2.5rem] p-8 shadow-sm h-full">
                           <h3 className="text-[10px] font-black text-[#0A2518] uppercase tracking-[0.25em] mb-8">Request Sync Flux</h3>
                           <div className="space-y-4">
                              {data.myRequests.slice(0, 3).map(req => (
                                <div key={req._id} className="p-5 bg-[#F4F1EA]/20 border border-[#E5E2D9]/40 rounded-3xl hover:border-[#047857]/30 transition-all cursor-pointer group">
                                   <div className="flex justify-between items-center mb-1">
                                      <span className="text-[11px] font-black text-[#0A2518]">{req.sellerGstin}</span>
                                      <StatusBadge status={req.status} />
                                   </div>
                                   <span className="text-[9px] font-black text-[#A2A9A5] uppercase tracking-widest">{formatDate(req.createdAt)}</span>
                                </div>
                              ))}
                              <button onClick={() => navigate('/buyer/requests')} className="w-full py-4 text-[9px] font-black text-[#047857] uppercase tracking-widest mt-4 border-t border-[#E5E2D9]/60 hover:opacity-60 transition-opacity">Pipeline Archive →</button>
                           </div>
                        </div>
                     </div>

                   </div>
                 </div>
               )}

               {/* Dedicated Tab Routing */}
               {tab === 'invoices' && (
                 <div className="bg-white border border-[#E5E2D9] rounded-[3rem] overflow-hidden shadow-sm lg:p-4">
                    <InvoiceTable title="Exhaustive Procurement Ledger" invoices={data.invoices} role="buyer" onRowClick={setSelectedInvoice} onRefresh={fetchData} />
                 </div>
               )}
               {tab === 'gst' && <AuditFeed />}
               {tab === 'audit' && <AuditFeed />}
               {tab === 'settings' && <SettingsTab />}
                {tab === 'payments' && (
                   <div className="space-y-10 animate-fade-in">
                      <div className="flex items-center justify-between">
                         <div className="space-y-1">
                            <h3 className="text-xl font-black text-[#0A2518]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Settlement & Liquidity</h3>
                            <p className="text-[10px] font-bold text-[#A2A9A5] uppercase tracking-widest">Digital Rupee & Fiat Payment Ledger</p>
                         </div>
                         <div className="px-5 py-3 bg-[#047857] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#047857]/20">
                            Total Outstanding: ₹{fmtCurrency(data.stats?.totalAmountPayable || 0)}
                         </div>
                      </div>

                      <div className="bg-white border border-[#E5E2D9] rounded-[3rem] overflow-hidden shadow-sm">
                         <div className="px-10 py-7 border-b border-[#E5E2D9] flex justify-between items-center bg-[#F4F1EA]/10">
                            <div className="flex items-center gap-4">
                               <div className="w-1.5 h-1.5 rounded-full bg-[#047857] animate-pulse" />
                               <span className="text-[11px] font-black text-[#0A2518] uppercase tracking-widest">Active Settlement Queue</span>
                            </div>
                         </div>
                         <InvoiceTable 
                            title="Active Dues" 
                            invoices={data.invoices.filter(i => i.status !== 'accepted')} 
                            role="buyer" 
                            onRowClick={setSelectedInvoice} 
                            onRefresh={fetchData} 
                         />
                      </div>
                   </div>
                )}
                {tab === 'requests' && (
                   <div className="space-y-10 animate-fade-in">
                      <div className="flex items-center justify-between">
                         <div className="space-y-1">
                            <h3 className="text-xl font-black text-[#0A2518]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Pipeline Sync Hub</h3>
                            <p className="text-[10px] font-bold text-[#A2A9A5] uppercase tracking-widest">Active Procurement & Settlement Requests</p>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="px-5 py-2.5 bg-white border border-[#E5E2D9] rounded-xl text-[10px] font-black text-[#0A2518] uppercase tracking-widest shadow-sm">
                               Total Active: {data.myRequests.length}
                            </div>
                         </div>
                      </div>

                      {data.myRequests.length === 0 ? (
                        <div className="h-[400px] flex flex-col items-center justify-center text-center bg-white border border-[#E5E2D9] border-dashed rounded-[3rem]">
                           <div className="w-20 h-20 rounded-full bg-[#F4F1EA] flex items-center justify-center mb-6 text-[#728279]">
                              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                           </div>
                           <h4 className="text-lg font-black text-[#0A2518] mb-2 uppercase tracking-wide">Empty Stream</h4>
                           <p className="text-[11px] text-[#A2A9A5] font-bold uppercase tracking-widest">Initiate a new procurement request to begin sync.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                           {data.myRequests.map(req => (
                              <div key={req._id} className="bg-white border border-[#E5E2D9] rounded-[2.5rem] p-8 shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden flex flex-col h-full">
                                 <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#047857]/5 to-transparent rounded-full translate-x-12 -translate-y-12 blur-2xl group-hover:scale-150 transition-all duration-700" />
                                 
                                 <div className="flex justify-between items-start mb-10 relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-[#F4F1EA] text-[#047857] flex items-center justify-center group-hover:bg-[#047857] group-hover:text-white transition-all duration-300">
                                       <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                    </div>
                                    <StatusBadge status={req.status} />
                                 </div>

                                 <div className="flex-1 relative z-10">
                                    <span className="text-[10px] font-black text-[#A2A9A5] uppercase tracking-widest block mb-1">Target Counterparty</span>
                                    <h5 className="text-base font-black text-[#0A2518] tracking-tight mb-8 group-hover:text-[#047857] transition-colors">{req.sellerGstin}</h5>
                                    
                                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#E5E2D9]/60">
                                       <div>
                                          <span className="text-[9px] font-black text-[#728279] uppercase tracking-widest block mb-1">Temporal ID</span>
                                          <span className="text-[11px] font-bold text-[#0A2518]">{formatDate(req.createdAt)}</span>
                                       </div>
                                       <div>
                                          <span className="text-[9px] font-black text-[#728279] uppercase tracking-widest block mb-1">Document Status</span>
                                          <span className="text-[11px] font-bold text-[#4D6357] uppercase">{req.status}</span>
                                       </div>
                                    </div>
                                 </div>

                                 <button className="w-full mt-10 py-4 bg-[#F4F1EA]/50 border border-[#E5E2D9] text-[#728279] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0A2518] hover:text-white hover:border-[#0A2518] transition-all relative z-10">
                                    Cancel Request
                                 </button>
                              </div>
                           ))}
                        </div>
                      )}
                   </div>
                )}
            </div>
          )}
        </main>
      </div>

      {selectedInvoice && (
        <InvoiceModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} role="buyer" onRefresh={fetchData} />
      )}
    </div>
  );
}
