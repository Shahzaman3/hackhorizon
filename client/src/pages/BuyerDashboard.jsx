import { useState, useEffect } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import StatCard from '../components/dashboard/StatCard';
import InvoiceTable from '../components/dashboard/InvoiceTable';
import InvoiceModal from '../components/dashboard/InvoiceModal';
import StatusBadge from '../components/dashboard/StatusBadge';
import api from '../api/axios';
import { BarChart, Bar, ResponsiveContainer, Tooltip } from 'recharts';

export default function BuyerDashboard() {
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

  const fmtCurrency = (val) => {
    if (!val && val !== 0) return '--';
    return val.toLocaleString('en-IN');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('en-GB');
  };

  if (loading) {
    return (
      <div className="flex bg-[#FDFBF7] h-screen overflow-hidden">
        <Sidebar role="buyer" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <span className="w-10 h-10 border-2 border-[#047857]/20 border-t-[#047857] rounded-full spin" />
            <span className="text-sm text-[#728279] font-medium">Loading dashboard...</span>
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar title="Buyer Overview" onMenuClick={() => setMobileMenuOpen(true)} />

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-7 space-y-6">

          {/* Page header */}
          <div>
            <h2 className="text-lg font-bold text-[#0A2518]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Dashboard</h2>
            <p className="text-xs text-[#728279] mt-0.5">Review and manage your received invoices</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Invoices Received" value={stats?.totalReceived || 0}                        sub="From all sellers"       color="border-primary"      />
            <StatCard label="Pending Review"     value={stats?.pendingCount || 0}                        sub="Needs your action"      color="border-yellow-500"   />
            <StatCard label="GST Payable"        value={`₹${fmtCurrency(stats?.totals?.grand || 0)}`}   sub="On accepted invoices"   color="border-red-400"      />
            <StatCard label="Outstanding"        value={`₹${fmtCurrency(stats?.totalOutstanding || 0)}`} sub="Unpaid invoices"       color="border-orange-400"   />
          </div>

          {/* Invoice Table + GST Card */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2">
              <InvoiceTable
                title="Received Invoices"
                invoices={invoices}
                role="buyer"
                onRowClick={(inv) => setSelectedInvoice(inv)}
                onRefresh={fetchData}
              />
            </div>

            {/* GST Summary */}
            <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-2xl p-6 flex flex-col">
              <h3 className="font-bold text-base text-[#0A2518] mb-5" style={{ fontFamily: 'Plus Jakarta Sans' }}>My GST Payable</h3>

              <div className="flex flex-col gap-4 mb-5">
                {[
                  { label: 'CGST', value: gstData?.cgst || 0 },
                  { label: 'SGST', value: gstData?.sgst || 0 },
                  { label: 'IGST', value: gstData?.igst || 0 },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#728279]">{label}</span>
                    <span className="font-bold text-sm text-[#0A2518]">₹{fmtCurrency(value)}</span>
                  </div>
                ))}
                <div className="border-t border-[#E5E2D9] pt-4 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4D6357]">Total GST</span>
                  <span className="font-bold text-lg text-[#047857]">
                    ₹{fmtCurrency((gstData?.cgst || 0) + (gstData?.sgst || 0) + (gstData?.igst || 0))}
                  </span>
                </div>
              </div>

              <div className="h-[140px] w-full mt-auto">
                {gstData?.history && gstData.history.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gstData.history}>
                      <Tooltip
                        cursor={{ fill: 'rgba(74,222,128,0.04)' }}
                        contentStyle={{ background: '#F4F1EA', border: '1px solid #E5E2D9', borderRadius: '10px', fontSize: '12px', color: '#0A2518' }}
                      />
                      <Bar dataKey="total" fill="#047857" radius={[4, 4, 0, 0]} opacity={0.8} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-[#728279] bg-[#0f1812] rounded-xl border border-[#E5E2D9] font-medium">
                    No GST history yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Request Section */}
          <div className="flex gap-5 flex-wrap lg:flex-nowrap items-start">

            {/* Request Form */}
            <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-2xl p-6 w-full lg:max-w-sm flex-shrink-0">
              <h3 className="font-bold text-base text-[#0A2518] mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                Request a Missing Invoice
              </h3>
              <p className="text-xs text-[#728279] mb-6">Ask a seller to upload an invoice you're missing</p>

              <form onSubmit={handleRequestSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#4D6357] uppercase tracking-[0.12em] mb-2">Seller GSTIN</label>
                  <input
                    type="text"
                    required
                    maxLength="15"
                    value={reqSellerGstin}
                    onChange={(e) => setReqSellerGstin(e.target.value)}
                    placeholder="27AAPFU0939F1ZV"
                    className="w-full bg-[#0f1812] border border-[#E5E2D9] rounded-xl px-4 py-3 text-sm text-[#0A2518] font-mono uppercase placeholder-[#728279] outline-none focus:border-[#047857]/40 focus:ring-2 focus:ring-[#047857]/8 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#4D6357] uppercase tracking-[0.12em] mb-2">Note <span className="normal-case text-[#728279] font-medium">(optional)</span></label>
                  <textarea
                    rows={3}
                    value={reqNote}
                    onChange={(e) => setReqNote(e.target.value)}
                    placeholder="e.g. Invoice for March order of 500 units"
                    className="w-full bg-[#0f1812] border border-[#E5E2D9] rounded-xl px-4 py-3 text-sm text-[#0A2518] placeholder-[#728279] outline-none focus:border-[#047857]/40 focus:ring-2 focus:ring-[#047857]/8 transition-all resize-none font-medium"
                  />
                </div>
                <button
                  type="submit"
                  disabled={reqLoading}
                  className="w-full bg-[#047857] hover:bg-[#065F46] text-[#FDFBF7] rounded-xl py-3 text-sm font-bold transition-all shadow-lg shadow-[#047857]/20 disabled:opacity-50"
                  style={{ fontFamily: 'Plus Jakarta Sans' }}
                >
                  {reqLoading ? 'Sending...' : 'Send Request'}
                </button>
              </form>
            </div>

            {/* Requests List */}
            <div className="flex-1 bg-[#FFFFFF] border border-[#E5E2D9] rounded-2xl p-6 min-h-[300px]">
              <h4 className="text-[11px] font-bold text-[#728279] uppercase tracking-[0.14em] mb-5">Your Requests</h4>

              {myRequests.length > 0 ? (
                <div className="flex flex-col divide-y divide-[#E5E2D9]">
                  {myRequests.map((req) => (
                    <div key={req._id || req.id} className="flex items-start gap-4 py-4 group">
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-mono text-sm font-bold text-[#0A2518] tracking-wide">{req.sellerGstin}</span>
                        <span className="text-xs text-[#4D6357] mt-1 italic truncate">"{req.note || 'No additional note provided'}"</span>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <StatusBadge status={req.status} />
                        <span className="text-[10px] uppercase font-semibold tracking-wider text-[#728279]">
                          {formatDate(req.date || req.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 rounded-2xl bg-[#F4F1EA] border border-[#E5E2D9] flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-[#728279]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-[#728279]">No requests sent yet</span>
                </div>
              )}
            </div>
          </div>

        </div>
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
