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
                 <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                   <div className="xl:col-span-8 space-y-10">
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {statsList.map((s, idx) => <StatCard key={idx} {...s} />)}
                     </div>

                     <div className="bg-white border border-[#E5E2D9] rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-[#047857]/5 rounded-full translate-x-32 -translate-y-32 blur-3xl opacity-60" />
                        <div className="flex items-center justify-between mb-10 relative z-10">
                           <div className="scale-effect">
                              <h3 className="text-lg font-black text-[#0A2518]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Accrual Intelligence</h3>
                              <p className="text-[10px] font-black text-[#A2A9A5] uppercase tracking-widest mt-1">Integrated ITC Flux Analytics</p>
                           </div>
                        </div>
                        <div className="h-[340px] w-full relative z-10">
                           <FluxChart data={data.gstData?.breakdown} />
                        </div>
                     </div>

                     <div className="bg-white border border-[#E5E2D9] rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="px-10 py-8 border-b border-[#E5E2D9] flex justify-between items-center bg-[#F4F1EA]/10">
                           <h3 className="font-black text-[#0A2518] text-base tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>Transactional Activity Stream</h3>
                           <button onClick={() => navigate('/buyer/invoices')} className="text-[10px] font-black text-[#047857] uppercase tracking-[0.2em] hover:opacity-70 transition-all">Consolidated View →</button>
                        </div>
                        <InvoiceTable invoices={data.invoices.slice(0, 8)} role="buyer" onRowClick={setSelectedInvoice} onRefresh={fetchData} />
                     </div>
                   </div>

                   <div className="xl:col-span-4 space-y-10">
                     <div className="bg-white border border-[#E5E2D9] rounded-[2.5rem] p-8 shadow-sm relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#047857]/5 to-transparent pointer-events-none opacity-40 shadow-inner" />
                        <h3 className="text-[10px] font-black text-[#0A2518] uppercase tracking-[0.25em] mb-10 text-center relative z-10">Approval Distribution</h3>
                        <div className="h-[240px] w-full relative z-10">
                           {statusDist.length > 0 ? (
                             <ResponsiveContainer width="100%" height="100%">
                               <PieChart>
                                  <Pie data={statusDist} innerRadius={80} outerRadius={100} paddingAngle={6} dataKey="value" stroke="none">
                                    {statusDist.map((u, i) => <Cell key={i} fill={u.color} />)}
                                  </Pie>
                                  <Tooltip contentStyle={{ borderRadius: '15px', border: '1px solid #E5E2D9', fontSize: '11px', fontWeight: 900 }} />
                               </PieChart>
                             </ResponsiveContainer>
                           ) : (
                             <div className="h-full flex items-center justify-center text-[10px] font-black text-[#A2A9A5] uppercase tracking-widest">Awaiting Verification</div>
                           )}
                           <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none scale-in">
                              <span className="text-3xl font-black text-[#0A2518]">{data.stats?.totalReceived || 0}</span>
                              <span className="text-[9px] font-bold text-[#728279] uppercase tracking-[0.2em]">Total Docs</span>
                           </div>
                        </div>
                        <div className="mt-8 grid grid-cols-2 gap-3 relative z-10">
                           {statusDist.map(d => (
                             <div key={d.name} className="flex items-center gap-2 p-2 bg-white/50 border border-[#E5E2D9]/40 rounded-xl shadow-sm hover:scale-[1.03] transition-transform">
                                <span className="w-2h-2 rounded-full" style={{ backgroundColor: d.color }} />
                                <span className="text-[9px] font-black text-[#4D6357] uppercase">{d.name}</span>
                             </div>
                           ))}
                        </div>
                     </div>

                     <div className="bg-white border border-[#E5E2D9] rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                           <h3 className="text-[10px] font-black text-[#0A2518] uppercase tracking-[0.25em]">Critical Feed</h3>
                           <div className="w-8 h-8 rounded-xl bg-[#F4F1EA] flex items-center justify-center text-[#728279]"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
                        </div>
                        <div className="space-y-4">
                           {data.myRequests.slice(0, 3).map(req => (
                             <div key={req._id} className="p-5 bg-[#FDFBF7] border border-[#E5E2D9] rounded-3xl hover:border-[#047857]/30 transition-all cursor-pointer group hover:bg-white overflow-hidden relative">
                                <div className="flex justify-between items-center mb-1">
                                   <span className="text-[11px] font-black text-[#0A2518]">{req.sellerGstin}</span>
                                   <StatusBadge status={req.status} />
                                </div>
                                <p className="text-[11px] text-[#4D6357] italic opacity-70 mb-4 line-clamp-1 truncate">"{req.note || 'Detail update'}"</p>
                                <span className="text-[9px] font-black text-[#A2A9A5] uppercase tracking-widest">{formatDate(req.createdAt)}</span>
                             </div>
                           ))}
                           <button onClick={() => navigate('/buyer/requests')} className="w-full text-center py-4 mt-2 text-[10px] font-black text-[#047857] uppercase tracking-widest pt-6 border-t border-[#E5E2D9]/60 hover:opacity-60 transition-opacity">Request Pipeline →</button>
                        </div>
                     </div>

                     <div className="bg-[#0A2518] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-[#0A2518]/30 relative overflow-hidden group hover:shadow-[#0A2518]/50 transition-shadow duration-500">
                        <div className="absolute top-0 left-0 w-full h-1 bg-[#047857]" />
                        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-12 translate-y-12 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] mb-8 relative z-10 flex items-center gap-3">
                           <span className="w-2 h-2 rounded-full bg-[#047857] animate-pulse" /> Verified Immutable Trail
                        </h3>
                        <div className="space-y-6 relative z-10">
                           {data.auditLogs.slice(0, 4).map((log, idx) => (
                             <div key={idx} className="flex gap-4 group/item">
                                <div className="w-1 h-full min-h-[30px] bg-white/5 rounded-full pt-1" />
                                <div className="flex-1 min-w-0">
                                   <p className="text-[11px] font-black text-white/90 leading-snug truncate group-hover/item:text-white transition-colors">{log.details}</p>
                                   <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest block mt-1">{formatDate(log.createdAt)}</span>
                                </div>
                             </div>
                           ))}
                           <button onClick={() => navigate('/buyer/audit')} className="w-full text-center py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] mt-6 border border-white/10 hover:bg-[#FDFBF7] hover:text-[#0A2518] hover:border-white transition-all active:scale-95">Audit Archive</button>
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
               {tab === 'requests' && (
                  <div className="flex h-64 items-center justify-center text-[10px] font-black text-[#A2A9A5] uppercase tracking-widest border border-dashed border-[#E5E2D9] rounded-[2.5rem] bg-[#F4F1EA]/10">
                    Request Module Active...
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
