import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import StatCard from '../components/dashboard/StatCard';
import InvoiceTable from '../components/dashboard/InvoiceTable';
import InvoiceModal from '../components/dashboard/InvoiceModal';
import CreateInvoiceModal from '../components/dashboard/CreateInvoiceModal';
import api from '../api/axios';
import { BarChart, Bar, ResponsiveContainer, Tooltip } from 'recharts';

export default function SellerDashboard() {
  const { tab = 'dashboard' } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [gstData, setGstData] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <div className="flex bg-[#0a0f0d] h-screen overflow-hidden">
        <Sidebar role="seller" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <span className="w-10 h-10 border-2 border-[#4ade80]/20 border-t-[#4ade80] rounded-full spin" />
            <span className="text-sm text-[#3d5945] font-medium">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0f0d] relative">
      <Sidebar role="seller" isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar title="Seller Overview" onMenuClick={() => setMobileMenuOpen(true)} />

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-7 space-y-6">

          {/* Create Invoice FAB */}
          <div className={`flex justify-between items-center ${tab !== 'dashboard' ? 'hidden' : ''}`}>
            <div>
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Plus Jakarta Sans' }}>Dashboard</h2>
              <p className="text-xs text-[#3d5945] mt-0.5">Here's what's happening with your invoices</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-[#4ade80] hover:bg-[#86efac] text-[#0a0f0d] rounded-xl px-5 py-2.5 text-sm font-bold transition-all shadow-lg shadow-[#4ade80]/20 hover:shadow-[#4ade80]/35 hover:scale-[1.02]"
              style={{ fontFamily: 'Plus Jakarta Sans' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              New Invoice
            </button>
          </div>

          {/* Stat Cards */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${tab !== 'dashboard' ? 'hidden' : ''}`}>
            <StatCard label="Total Invoices"  value={stats?.totalInvoices || 0}                         sub="All time"               color="border-primary"     />
            <StatCard label="Accepted"        value={stats?.acceptedCount || 0}                         sub="Confirmed by buyer"     color="border-green-500"   />
            <StatCard label="Pending"         value={stats?.pendingCount || 0}                          sub="Awaiting buyer action"  color="border-yellow-500"  />
            <StatCard label="GST Collected"   value={`₹${fmtCurrency(stats?.totals?.grand || 0)}`}     sub="On accepted invoices"   color="border-blue-500"    />
          </div>

          {/* Invoice Table + GST Card */}
          <div className={`grid grid-cols-1 lg:grid-cols-3 gap-5 ${tab !== 'dashboard' && tab !== 'invoices' && tab !== 'gst' && tab !== 'payments' ? 'hidden' : ''}`}>
            <div className={`lg:col-span-2 ${tab === 'gst' ? 'hidden' : ''}`}>
              <InvoiceTable
                title={tab === 'payments' ? "Paid Invoices" : "Invoices"}
                invoices={tab === 'payments' ? invoices.filter(inv => inv.paymentStatus === 'paid') : invoices}
                role="seller"
                onRowClick={(inv) => setSelectedInvoice(inv)}
                onRefresh={fetchData}
              />
            </div>

            {/* GST Summary */}
            <div className={`bg-[#111a15] border border-[#243124] rounded-2xl p-6 flex flex-col ${tab === 'invoices' || tab === 'payments' ? 'hidden' : ''} ${tab === 'gst' ? 'lg:col-span-3 max-w-2xl' : ''}`}>
              <h3 className="font-bold text-base text-white mb-5" style={{ fontFamily: 'Plus Jakarta Sans' }}>GST Breakdown</h3>

              <div className="flex flex-col gap-4 mb-5">
                {[
                  { label: 'CGST', value: gstData?.totals?.cgst || 0 },
                  { label: 'SGST', value: gstData?.totals?.sgst || 0 },
                  { label: 'IGST', value: gstData?.totals?.igst || 0 },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#3d5945]">{label}</span>
                    <span className="font-bold text-sm text-white">₹{fmtCurrency(value)}</span>
                  </div>
                ))}
                <div className="border-t border-[#243124] pt-4 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6b8f76]">Total GST</span>
                  <span className="font-bold text-lg text-[#4ade80]">
                    ₹{fmtCurrency((gstData?.totals?.cgst || 0) + (gstData?.totals?.sgst || 0) + (gstData?.totals?.igst || 0))}
                  </span>
                </div>
              </div>

              <div className="h-[140px] w-full mt-auto">
                {gstData?.breakdown && gstData.breakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gstData.breakdown}>
                      <Tooltip
                        cursor={{ fill: 'rgba(74,222,128,0.04)' }}
                        contentStyle={{ background: '#192319', border: '1px solid #243124', borderRadius: '10px', fontSize: '12px', color: '#e8f5ec' }}
                      />
                      <Bar dataKey="total" fill="#4ade80" radius={[4, 4, 0, 0]} opacity={0.8} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-[#3d5945] bg-[#0f1812] rounded-xl border border-[#243124] font-medium">
                    No GST history yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Requests */}
          <div className={`${tab !== 'dashboard' && tab !== 'requests' ? 'hidden' : ''}`}>
            <h3 className="font-bold text-base text-white mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Incoming Invoice Requests
            </h3>

            {requests.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {requests.map((req) => (
                  <div
                    key={req._id || req.id}
                    className="bg-[#111a15] border border-[#243124] rounded-2xl p-5 w-64 flex flex-col justify-between hover:border-[#2e4030] transition-all duration-300"
                  >
                    <div>
                      <div className="font-mono text-xs font-bold text-[#4ade80] tracking-wide mb-2">{req.buyerGstin}</div>
                      <div className="text-xs text-[#6b8f76] italic min-h-[36px] leading-relaxed">"{req.note || 'No additional note provided'}"</div>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-[#3d5945] mt-3">
                        {new Date(req.date || req.createdAt).toLocaleDateString('en-GB')}
                      </div>
                    </div>
                    <button
                      onClick={() => handleFulfillRequest(req._id || req.id)}
                      className="w-full bg-[#4ade80]/10 border border-[#4ade80]/20 text-[#4ade80] text-xs font-bold px-3 py-2.5 rounded-xl hover:bg-[#4ade80]/20 transition-all mt-4"
                    >
                      Fulfill Request
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 bg-[#111a15] border border-dashed border-[#243124] rounded-2xl">
                <div className="w-12 h-12 rounded-2xl bg-[#192319] border border-[#243124] flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-[#3d5945]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-[#3d5945]">No incoming requests</span>
              </div>
            )}
          </div>

        </div>
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
