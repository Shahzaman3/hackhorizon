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
                 <div className="space-y-8 animate-fade-in">
                   {/* Top Summary Bento */}
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {statCards.map((s, idx) => (
                        <div key={idx} className={`bg-white border-l-4 ${s.color} border-[#E5E2D9] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative`}>
                           <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#047857]/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                           <span className="text-[10px] font-black text-[#728279] uppercase tracking-widest block mb-1">{s.label}</span>
                           <h4 className="text-2xl font-black text-[#0A2518] tracking-tight">{s.value}</h4>
                           <p className="text-[9px] font-bold text-[#A2A9A5] uppercase tracking-tight mt-2 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#047857]" /> {s.sub}
                           </p>
                        </div>
                      ))}
                   </div>

                   {/* Main Bento Layout */}
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                     
                     {/* Analytical Layer (Revenue Flux + Compliance) */}
                     <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 bg-white border border-[#E5E2D9] rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group h-[480px] flex flex-col">
                           <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#047857]/10 to-transparent rounded-full translate-x-32 -translate-y-32 blur-3xl opacity-60" />
                           <div className="flex items-center justify-between mb-8 relative z-10 flex-shrink-0">
                             <div>
                                <h3 className="text-lg font-black text-[#0A2518]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Revenue Stream Analytics</h3>
                                <p className="text-[10px] font-black text-[#A2A9A5] uppercase tracking-widest">Temporal Billing Breakdown (6M)</p>
                             </div>
                             <div className="px-4 py-1.5 bg-[#F4F1EA] rounded-full text-[9px] font-black text-[#4D6357] uppercase tracking-widest border border-[#E5E2D9] shadow-sm">Real-time Stream</div>
                           </div>
                           <div className="flex-1 w-full relative z-10 min-h-0">
                              <RevenueFluxChart data={data.gstData?.breakdown} />
                           </div>
                        </div>

                        <div className="lg:col-span-4 bg-white border border-[#E5E2D9] rounded-[2.5rem] p-8 shadow-sm flex flex-col h-full">
                           <h3 className="text-[10px] font-black text-[#0A2518] uppercase tracking-[0.25em] mb-8 text-center">Settlement Status</h3>
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
                                <div className="h-full flex items-center justify-center text-[10px] font-black text-[#A2A9A5] uppercase tracking-widest border border-dashed border-[#E5E2D9] rounded-3xl">Neutral Sync</div>
                              )}
                              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                 <span className="text-2xl font-black text-[#0A2518]">{data.stats?.totalSent || 0}</span>
                                 <span className="text-[9px] font-bold text-[#728279] uppercase tracking-widest leading-none leading-none">Aggregate Docs</span>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Primary Ledger Section - FULL WIDTH as requested */}
                     <div className="lg:col-span-12">
                        <div className="bg-white border border-[#E5E2D9] rounded-[2.5rem] overflow-hidden shadow-sm">
                           <div className="px-10 py-7 border-b border-[#E5E2D9] flex justify-between items-center bg-[#F4F1EA]/5 flex-wrap gap-6">
                              <div>
                                 <h3 className="font-black text-[#0A2518] text-lg" style={{ fontFamily: 'Plus Jakarta Sans' }}>Transactional Ledger</h3>
                                 <p className="text-[10px] font-bold text-[#A2A9A5] uppercase tracking-widest mt-1">Exhaustive Merchant Record Archive</p>
                              </div>
                              <button onClick={() => navigate('/seller/invoices')} className="px-6 py-3 bg-[#047857]/5 text-[10px] font-black text-[#047857] uppercase tracking-widest rounded-2xl hover:bg-[#047857] hover:text-white transition-all shadow-sm">Archive Access →</button>
                           </div>
                           <InvoiceTable invoices={data.invoices.slice(0, 8)} role="seller" onRowClick={setSelectedInvoice} onRefresh={fetchData} />
                        </div>
                     </div>

                     {/* Compliance Matrix + Audit Trail */}
                     <div className="lg:col-span-6">
                        <div className="bg-white border border-[#E5E2D9] rounded-[2.5rem] p-8 shadow-sm h-full flex flex-col">
                           <h3 className="text-[10px] font-black text-[#0A2518] uppercase tracking-[0.25em] mb-10">Tax Compliance Matrix</h3>
                           <div className="space-y-7 flex-1 flex flex-col justify-center">
                              {[
                                { l: 'CGST', v: data.stats?.gstCollected?.totalCgst || 0, c: '#047857', p: (data.stats?.gstCollected?.totalCgst / data.stats?.totalBilled) * 100 || 0 },
                                { l: 'SGST', v: data.stats?.gstCollected?.totalSgst || 0, c: '#065F46', p: (data.stats?.gstCollected?.totalSgst / data.stats?.totalBilled) * 100 || 0 },
                                { l: 'IGST', v: data.stats?.gstCollected?.totalIgst || 0, c: '#0A2518', p: (data.stats?.gstCollected?.totalIgst / data.stats?.totalBilled) * 100 || 0 },
                              ].map(g => (
                                <div key={g.l} className="space-y-3.5">
                                   <div className="flex justify-between items-center">
                                      <div className="flex items-center gap-2">
                                         <span className="w-1.5 h-1.5 rounded-full bg-[#E5E2D9]" />
                                         <span className="text-[10px] font-black uppercase tracking-widest text-[#728279]">{g.l}</span>
                                      </div>
                                      <span className="text-[11px] font-black text-[#0A2518]">₹{fmtCurrency(g.v)}</span>
                                   </div>
                                   <div className="h-2.5 w-full bg-[#F4F1EA] rounded-full overflow-hidden shadow-inner">
                                      <div className="h-full rounded-full transition-all duration-1000 shadow-sm" style={{ width: `${Math.max(5, Math.min(100, g.p * 15))}%`, backgroundColor: g.c }} />
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                     </div>

                     <div className="lg:col-span-6">
                        <div className="bg-[#0A2518] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group h-full">
                           <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-12 -translate-y-12 blur-3xl" />
                           <h3 className="text-[10px] font-black uppercase tracking-[0.25em] mb-8 relative z-10 flex items-center gap-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#047857] animate-pulse" /> Final Verification Ledger
                           </h3>
                           <div className="space-y-6 relative z-10">
                              {data.auditLogs.slice(0, 4).map((log, idx) => (
                                <div key={idx} className="flex gap-4 group/item">
                                   <div className="w-0.5 h-10 bg-white/10 rounded-full" />
                                   <div className="flex-1 min-w-0">
                                      <p className="text-[11px] font-bold text-white/90 leading-tight group-hover/item:text-white transition-colors truncate capitalize">{log.details}</p>
                                      <span className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-1.5 block">TEMPORAL LOG</span>
                                   </div>
                                </div>
                              ))}
                              <button onClick={() => navigate('/seller/audit')} className="w-full text-center py-4 bg-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest mt-6 border border-white/5 hover:bg-white hover:text-[#0A2518] transition-all">Audit Archive Stream</button>
                           </div>
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
                  <div className="space-y-10 animate-fade-in">
                     <div className="flex items-center justify-between">
                        <div className="space-y-1">
                           <h3 className="text-xl font-black text-[#0A2518]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Merchant Fulfillment Hub</h3>
                           <p className="text-[10px] font-bold text-[#A2A9A5] uppercase tracking-widest">Active Prompts from Strategic Counterparties</p>
                        </div>
                        <div className="px-5 py-2.5 bg-white border border-[#E5E2D9] rounded-xl text-[10px] font-black text-[#0A2518] uppercase tracking-widest shadow-sm">
                           Pending Responses: {data.requests.length}
                        </div>
                     </div>

                     {data.requests.length === 0 ? (
                        <div className="h-[400px] flex flex-col items-center justify-center text-center bg-white border border-[#E5E2D9] border-dashed rounded-[3rem]">
                           <div className="w-20 h-20 rounded-full bg-[#F4F1EA] flex items-center justify-center mb-6 text-[#728279]">
                              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                           </div>
                           <h4 className="text-lg font-black text-[#0A2518] mb-2 uppercase tracking-wide">Neutral Flux</h4>
                           <p className="text-[11px] text-[#A2A9A5] font-bold uppercase tracking-widest leading-relaxed max-w-[280px]">No inbound document requests detected at this time.</p>
                        </div>
                     ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                           {data.requests.map(req => (
                              <div key={req._id} className="bg-white border border-[#E5E2D9] rounded-[2.5rem] p-8 shadow-sm flex flex-col h-full group hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden">
                                 <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#047857]/5 to-transparent rounded-full translate-x-12 -translate-y-12 blur-2xl group-hover:scale-150 transition-all duration-700" />
                                 
                                 <div className="w-14 h-14 bg-[#F4F1EA] rounded-2xl flex items-center justify-center mb-8 text-[#047857] group-hover:bg-[#047857] group-hover:text-white transition-all duration-300 shadow-sm relative z-10">
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                 </div>

                                 <div className="flex-1 relative z-10">
                                    <span className="text-[10px] font-black text-[#A2A9A5] uppercase tracking-widest mb-1 block">Inbound Pulse from</span>
                                    <h5 className="text-base font-black text-[#0A2518] mb-8 group-hover:text-[#047857] transition-colors">{req.buyerGstin}</h5>
                                    
                                    <div className="pt-6 border-t border-[#E5E2D9]/60 flex items-center justify-between">
                                       <div className="flex items-center gap-2">
                                          <div className="w-1.5 h-1.5 rounded-full bg-[#E5E2D9]" />
                                          <span className="text-[9px] font-black text-[#728279] uppercase tracking-widest">Document Status</span>
                                       </div>
                                       <span className="text-[10px] font-black text-[#047857] uppercase tracking-tight">Pending Dispatch</span>
                                    </div>
                                 </div>

                                 <button className="w-full mt-10 py-4 bg-[#0A2518] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#0A2518]/10 hover:bg-[#047857] transition-all relative z-10 active:scale-95">
                                    Submit Fulfillment
                                 </button>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               )}
               {tab === 'payments' && (
                  <div className="space-y-10 animate-fade-in">
                     <div className="flex items-center justify-between">
                        <div className="space-y-1">
                           <h3 className="text-xl font-black text-[#0A2518]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Receivables & Liquidity</h3>
                           <p className="text-[10px] font-bold text-[#A2A9A5] uppercase tracking-widest">Digital Asset & Fiat Accrual Ledger</p>
                        </div>
                        <div className="px-5 py-3 bg-[#0A2518] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#0A2518]/20">
                           Total Accrued: ₹{fmtCurrency(data.stats?.totalBilled || 0)}
                        </div>
                     </div>

                     <div className="bg-white border border-[#E5E2D9] rounded-[3rem] overflow-hidden shadow-sm">
                        <div className="px-10 py-7 border-b border-[#E5E2D9] flex justify-between items-center bg-[#F4F1EA]/10">
                           <div className="flex items-center gap-4">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#047857] animate-pulse" />
                              <span className="text-[11px] font-black text-[#0A2518] uppercase tracking-widest">Consolidated Liquidity Stream</span>
                           </div>
                        </div>
                        <InvoiceTable 
                           title="Settlement History" 
                           invoices={data.invoices} 
                           role="seller" 
                           onRowClick={setSelectedInvoice} 
                           onRefresh={fetchData} 
                        />
                     </div>
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
