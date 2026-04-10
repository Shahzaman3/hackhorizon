import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import StatCard from '../components/dashboard/StatCard';
import InvoiceTable from '../components/dashboard/InvoiceTable';
import InvoiceModal from '../components/dashboard/InvoiceModal';
import CreateInvoiceModal from '../components/dashboard/CreateInvoiceModal';
import SettingsTab from '../components/dashboard/SettingsTab';
import AuditFeed from '../components/dashboard/AuditFeed';
import { StatSkeleton, ChartSkeleton, TableSkeleton, CardSkeleton } from '../components/dashboard/SkeletonLoader';
import api from '../api/axios';
import { 
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, 
  Cell, Pie, PieChart 
} from 'recharts';

// PERFORMANCE OPTIMIZATION: Memoized Charts
const RevenueFluxChart = ({ data }) => {
  const chartData = useMemo(() => data ? [...data].reverse() : [], [data]);
  
  if (!chartData.length) return (
     <div className="h-full flex items-center justify-center text-[10px] font-black text-[#A2A9A5] uppercase tracking-widest border border-dashed border-[#E5E2D9] rounded-3xl bg-[#F4F1EA]/10">
        Awaiting Temporal Data Flow...
     </div>
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="sellerOverGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#047857" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#047857" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E2D9" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={10} fontWeight={800} stroke="#728279" dy={10} />
        <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight={800} stroke="#728279" />
        <Tooltip
          cursor={{ stroke: '#047857', strokeWidth: 1 }}
          contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E2D9', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', fontSize: '12px' }}
        />
        <Area type="monotone" dataKey="total" stroke="#047857" strokeWidth={4} fill="url(#sellerOverGrad)" animationDuration={1200} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default function SellerDashboard() {
  const { tab = 'overview' } = useParams();
  const navigate = useNavigate();
  
  // Data State
  const [data, setData] = useState({ stats: null, invoices: [], requests: [], gstData: null, auditLogs: [] });
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // OPTIMIZATION: Unified Data sync
  const fetchData = useCallback(async () => {
    try {
      const [dashRes, invRes, reqRes, gstRes, auditRes] = await Promise.all([
        api.get('/dashboard/seller'),
        api.get('/invoices/sent'),
        api.get('/requests/incoming'),
        api.get('/dashboard/gst'),
        api.get('/dashboard/audit')
      ]);
      setData({
        stats: dashRes.data?.data || null,
        invoices: invRes.data?.data || [],
        requests: reqRes.data?.data || [],
        gstData: gstRes.data?.data || null,
        auditLogs: auditRes.data?.data || []
      });
    } catch (err) {
      console.error('Inbound data sync error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Tab check
  useEffect(() => {
    if (tab === 'upload') {
      setShowCreateModal(true);
      navigate('/seller/overview', { replace: true });
    }
  }, [tab, navigate]);

  // Memos
  const fmtCurrency = (val) => (!val && val !== 0 ? '--' : val.toLocaleString('en-IN'));
  const statusDist = useMemo(() => {
    const s = data.stats;
    return [
      { name: 'Accepted', value: s?.acceptedCount || 0, color: '#047857' },
      { name: 'Pending', value: s?.pendingCount || 0, color: '#ca8a04' },
      { name: 'Rejected', value: s?.rejectedCount || 0, color: '#dc2626' },
    ].filter(d => d.value > 0);
  }, [data.stats]);

  const statCards = useMemo(() => [
    { label: "Sent Invoices",  value: data.stats?.totalSent || 0,   sub: "Volume Cycle",    color: "border-primary" },
    { label: "Billed Revenue", value: `₹${fmtCurrency(data.stats?.totalBilled || 0)}`, sub: "Gross Flux", color: "border-emerald-500" },
    { label: "GST Accrued",    value: `₹${fmtCurrency(data.stats?.gstCollected?.grandTotalGst || 0)}`, sub: "Tax Summary", color: "border-blue-500" },
    { label: "In Review",      value: data.stats?.pendingCount || 0,  sub: "Awaiting Action", color: "border-yellow-500" },
  ], [data.stats]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#FDFBF7] relative antialiased group/root">
      <Sidebar role="seller" isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-[#0A2518]/40 backdrop-blur-sm z-30 md:hidden animate-fade-in" onClick={() => setMobileMenuOpen(false)} />
      )}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar title="Merchant Intelligence Control" onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-8 lg:p-10 space-y-8 scroll-smooth">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-up">
            <div>
               <div className="text-[10px] font-bold text-[#047857] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                  <span className="w-4 h-px bg-[#047857]/30" /> Integrated Performance Hub
               </div>
               <h2 className="text-3xl font-extrabold text-[#0A2518] tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                 {tab === 'overview' ? 'Consolidated Overview' : tab.charAt(0).toUpperCase() + tab.slice(1)}
               </h2>
            </div>
            
            <div className="flex items-center gap-3">
               <button onClick={() => setShowCreateModal(true)} className="px-6 py-3 bg-[#0A2518] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#047857] transition-all shadow-xl shadow-[#0A2518]/10 flex items-center gap-2.5 active:scale-95">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                  New Document
               </button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-10 animate-fade-in">
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"><StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton /></div>
               <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                  <div className="xl:col-span-8 space-y-8"><ChartSkeleton /><TableSkeleton /></div>
                  <div className="xl:col-span-4 space-y-8"><CardSkeleton /><CardSkeleton /></div>
               </div>
            </div>
          ) : (
            <div className="transition-all duration-700">
               {tab === 'overview' && (
                 <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in">
                    <div className="xl:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                       {statCards.map((s, idx) => <StatCard key={idx} {...s} />)}
                    </div>

                    <div className="xl:col-span-8 space-y-8">
                       <div className="bg-white border border-[#E5E2D9] rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-[#047857]/5 rounded-full translate-x-20 -translate-y-20 blur-3xl" />
                          <div className="flex items-center justify-between mb-10 relative z-10">
                             <div>
                                <h3 className="text-lg font-black text-[#0A2518]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Revenue Flux</h3>
                                <p className="text-[10px] font-bold text-[#A2A9A5] uppercase tracking-widest">TEMPORAL BILLING ANALYSIS (6M)</p>
                             </div>
                          </div>
                          <div className="h-[320px] w-full relative z-10">
                             <RevenueFluxChart data={data.gstData?.breakdown} />
                          </div>
                       </div>

                       <div className="bg-white border border-[#E5E2D9] rounded-[2.5rem] overflow-hidden shadow-sm">
                          <div className="px-8 py-6 border-b border-[#E5E2D9] flex justify-between items-center bg-[#F4F1EA]/10">
                             <h3 className="font-black text-[#0A2518] text-base tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>Transactional Ledger</h3>
                             <button onClick={() => navigate('/seller/invoices')} className="text-[10px] font-black text-[#047857] uppercase tracking-[0.2em] hover:opacity-70 transition-all">Archive Access →</button>
                          </div>
                          <InvoiceTable invoices={data.invoices.slice(0, 8)} role="seller" onRowClick={setSelectedInvoice} onRefresh={fetchData} />
                       </div>
                    </div>

                    <div className="xl:col-span-4 space-y-8">
                       <div className="bg-white border border-[#E5E2D9] rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
                          <h3 className="text-[10px] font-black text-[#0A2518] uppercase tracking-[0.25em] mb-8 text-center">Lifecycle Status</h3>
                          <div className="h-[220px] w-full relative">
                             {statusDist.length > 0 ? (
                               <ResponsiveContainer width="100%" height="100%">
                                 <PieChart>
                                    <Pie data={statusDist} innerRadius={70} outerRadius={90} paddingAngle={6} dataKey="value" stroke="none">
                                      {statusDist.map((u, i) => <Cell key={i} fill={u.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5E2D9', fontSize: '11px', fontWeight: 800 }} />
                                 </PieChart>
                               </ResponsiveContainer>
                             ) : (
                               <div className="h-full flex items-center justify-center text-[10px] font-black text-[#A2A9A5] uppercase tracking-widest">No Active Metrics</div>
                             )}
                             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-black text-[#0A2518]">{data.stats?.totalSent || 0}</span>
                                <span className="text-[9px] font-bold text-[#728279] uppercase tracking-widest leading-none">Total Docs</span>
                             </div>
                          </div>
                       </div>

                       <div className="bg-white border border-[#E5E2D9] rounded-[2.5rem] p-8 shadow-sm">
                          <h3 className="text-[10px] font-black text-[#0A2518] uppercase tracking-[0.25em] mb-8">Compliance Bars</h3>
                          <div className="space-y-6">
                             {[
                               { l: 'CGST', v: data.stats?.gstCollected?.totalCgst || 0, c: '#047857', p: (data.stats?.gstCollected?.totalCgst / data.stats?.totalBilled) * 100 || 0 },
                               { l: 'SGST', v: data.stats?.gstCollected?.totalSgst || 0, c: '#065F46', p: (data.stats?.gstCollected?.totalSgst / data.stats?.totalBilled) * 100 || 0 },
                               { l: 'IGST', v: data.stats?.gstCollected?.totalIgst || 0, c: '#0A2518', p: (data.stats?.gstCollected?.totalIgst / data.stats?.totalBilled) * 100 || 0 },
                             ].map(g => (
                               <div key={g.l} className="space-y-2">
                                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#728279]">
                                     <span>{g.l}</span>
                                     <span className="text-[#0A2518]">₹{fmtCurrency(g.v)}</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-[#F4F1EA] rounded-full overflow-hidden">
                                     <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.max(5, Math.min(100, g.p * 15))}%`, backgroundColor: g.c }} />
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>

                       <div className="bg-[#0A2518] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-12 -translate-y-12 blur-3xl group-hover:scale-150 transition-transform duration-700" />
                          <h3 className="text-[10px] font-black uppercase tracking-[0.25em] mb-6 relative z-10 flex items-center gap-3">
                             <span className="w-1.5 h-1.5 rounded-full bg-[#047857] animate-pulse" /> Final Verification Ledger
                          </h3>
                          <div className="space-y-6 relative z-10">
                             {data.auditLogs.slice(0, 3).map((log, idx) => (
                               <div key={idx} className="flex gap-4 group/item">
                                  <div className="w-1 h-full min-h-[40px] bg-white/5 rounded-full" />
                                  <div className="flex-1 min-w-0">
                                     <p className="text-[11px] font-black text-white/80 leading-snug group-hover/item:text-white transition-colors truncate">{log.details}</p>
                                     <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1 block">RECENTLY RECORDED</span>
                                  </div>
                               </div>
                             ))}
                             <button onClick={() => navigate('/seller/audit')} className="w-full text-center py-2 text-[10px] font-black text-[#047857] uppercase tracking-widest pt-4 hover:text-white transition-all">Audit Ledger →</button>
                          </div>
                       </div>
                    </div>
                 </div>
               )}

               {tab === 'invoices' && (
                 <div className="bg-white border border-[#E5E2D9] rounded-[2.5rem] overflow-hidden shadow-sm">
                    <InvoiceTable title="Exhaustive Sales Record" invoices={data.invoices} role="seller" onRowClick={setSelectedInvoice} onRefresh={fetchData} />
                 </div>
               )}
               {tab === 'requests' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                     {data.requests.map(req => (
                        <div key={req._id} className="bg-white border border-[#E5E2D9] rounded-[2.5rem] p-8 shadow-sm flex flex-col items-center text-center group hover:-translate-y-1 transition-all">
                           <div className="w-16 h-16 bg-[#F4F1EA] rounded-3xl flex items-center justify-center mb-6 text-[#047857] group-hover:bg-[#047857] group-hover:text-white transition-all duration-300">
                              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                           </div>
                           <span className="text-[10px] font-black text-[#A2A9A5] uppercase tracking-widest mb-1">PROMPT FROM BUYER</span>
                           <span className="text-base font-black text-[#0A2518] mb-8">{req.buyerGstin}</span>
                           <button className="w-full py-4 bg-[#0A2518] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#0A2518]/10 hover:bg-[#047857] transition-all">Submit Fulfillment</button>
                        </div>
                     ))}
                  </div>
               )}
               {tab === 'gst' && <AuditFeed />}
               {tab === 'audit' && <AuditFeed />}
               {tab === 'settings' && <SettingsTab />}
            </div>
          )}
        </main>
      </div>

      {selectedInvoice && (
        <InvoiceModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} role="seller" onRefresh={fetchData} />
      )}

      {showCreateModal && (
        <CreateInvoiceModal onClose={() => setShowCreateModal(false)} onCreated={() => { setShowCreateModal(false); fetchData(); }} />
      )}
    </div>
  );
}
