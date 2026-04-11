import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const monthOptions = [
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Feb' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Apr' },
  { value: 5, label: 'May' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Aug' },
  { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dec' },
];

const toFixed2 = (value) => Number(value || 0).toFixed(2);

const confidenceBadge = (score = 100) => {
  if (score >= 85) return 'bg-[#047857]/10 text-[#047857]';
  if (score >= 65) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
};

export default function GstReturnsPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getUTCFullYear());
  const [month, setMonth] = useState(now.getUTCMonth() + 1);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showOnlyFlagged, setShowOnlyFlagged] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const latest = rows[0] || null;

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/dashboard/returns/history?year=${year}&month=${month}`);
      setRows(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load GST return history');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError('');
      setSuccess('');
      await api.post('/dashboard/returns/generate', { year, month });
      setSuccess('GST return generated successfully.');
      await fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate GST return');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (id) => {
    try {
      setDownloadingId(id);
      setError('');
      const res = await api.get(`/dashboard/returns/${id}/export.csv`, { responseType: 'blob' });

      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const contentDisposition = res.headers?.['content-disposition'] || '';
      const fileNameMatch = contentDisposition.match(/filename="?([^\"]+)"?/i);
      const fileName = fileNameMatch?.[1] || `gst_return_${year}_${month}.csv`;

      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to download CSV');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleViewIssues = async (id) => {
    try {
      setDetailsLoading(true);
      setError('');
      const res = await api.get(`/dashboard/returns/${id}`);
      setSelectedArtifact(res.data?.data || null);
      setShowOnlyFlagged(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch return artifact details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const lineItems = useMemo(() => {
    if (!selectedArtifact) return [];
    return selectedArtifact.role === 'seller'
      ? (selectedArtifact.sections?.gstr1_b2b_outward || [])
      : (selectedArtifact.sections?.gstr2b_inward_itc || []);
  }, [selectedArtifact]);

  const visibleLineItems = useMemo(() => {
    if (!showOnlyFlagged) return lineItems;
    return lineItems.filter((row) => Array.isArray(row.flags) && row.flags.length > 0);
  }, [lineItems, showOnlyFlagged]);

  const currentRolePath = useMemo(() => {
    return location.pathname.startsWith('/buyer') ? '/buyer' : '/seller';
  }, [location.pathname]);

  const jumpToInvoices = (risk) => {
    navigate(`${currentRolePath}/invoices?risk=${encodeURIComponent(risk)}`);
  };

  const mapFlagToRisk = (flag) => {
    if (flag === 'UNCONFIRMED_BLOCKCHAIN') return 'Unconfirmed Chain';
    if (flag === 'UNPAID_INVOICE') return 'Unpaid';
    return 'Needs Review';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white border border-border rounded-[2.5rem] p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h3 className="text-xl font-black text-text" style={{ fontFamily: 'Plus Jakarta Sans' }}>GST Return Studio</h3>
            <p className="text-[10px] font-bold text-muted-2 uppercase tracking-widest mt-2">Generate versioned monthly return artifacts and export filings.</p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-2">
              <span className="text-[9px] font-black text-muted-2 uppercase tracking-widest">Month</span>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="px-4 py-3 rounded-xl border border-border bg-surface-2/20 text-sm font-bold text-text"
              >
                {monthOptions.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[9px] font-black text-muted-2 uppercase tracking-widest">Year</span>
              <input
                type="number"
                value={year}
                min={2000}
                max={2100}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-28 px-4 py-3 rounded-xl border border-border bg-surface-2/20 text-sm font-bold text-text"
              />
            </label>

            <button
              onClick={handleGenerate}
              disabled={generating || loading}
              className="px-6 py-3 bg-text text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#047857] transition-all disabled:opacity-60"
            >
              {generating ? 'Generating...' : 'Generate Return'}
            </button>
          </div>
        </div>

        {(error || success) && (
          <div className="mt-6">
            {error && <p className="text-[11px] font-bold text-red-600">{error}</p>}
            {success && <p className="text-[11px] font-bold text-[#047857]">{success}</p>}
          </div>
        )}
      </div>

      {latest && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
            <p className="text-[9px] font-black text-muted-2 uppercase tracking-widest mb-1">Latest Confidence</p>
            <p className={`inline-flex px-3 py-1 rounded-full text-sm font-black ${confidenceBadge(latest.reconciliation?.confidenceScore || 100)}`}>
              {latest.reconciliation?.confidenceScore ?? 100}%
            </p>
          </div>
          <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
            <p className="text-[9px] font-black text-muted-2 uppercase tracking-widest mb-1">Mismatch Invoices</p>
            <p className="text-xl font-black text-text">{latest.reconciliation?.mismatchInvoices || 0}</p>
          </div>
          <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
            <p className="text-[9px] font-black text-muted-2 uppercase tracking-widest mb-1">Unconfirmed On-chain</p>
            <p className="text-xl font-black text-text">{latest.reconciliation?.unconfirmedBlockchainCount || 0}</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-border flex items-center justify-between">
          <h4 className="text-[10px] font-black text-text uppercase tracking-[0.2em]">Generated Artifacts</h4>
          <button
            onClick={fetchHistory}
            className="px-4 py-2 rounded-xl border border-border text-[9px] font-black text-muted-2 uppercase tracking-widest hover:bg-surface-2"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-[10px] font-black text-muted-2 uppercase tracking-widest">Loading return history...</div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-[10px] font-black text-muted-2 uppercase tracking-widest">No return artifacts for selected period.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-205 text-left">
              <thead>
                <tr className="text-[9px] font-black text-muted-2 uppercase tracking-widest border-b border-border">
                  <th className="px-8 py-4">Period</th>
                  <th className="px-8 py-4">Version</th>
                  <th className="px-8 py-4">Invoices</th>
                  <th className="px-8 py-4">Taxable</th>
                  <th className="px-8 py-4">Total Tax</th>
                  <th className="px-8 py-4">Gross</th>
                  <th className="px-8 py-4">Confidence</th>
                  <th className="px-8 py-4">Mismatches</th>
                  <th className="px-8 py-4">Generated</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row._id} className="border-b border-border/70 hover:bg-surface-2/20">
                    <td className="px-8 py-4 text-sm font-bold text-text">{String(row.period?.month || month).padStart(2, '0')}/{row.period?.year || year}</td>
                    <td className="px-8 py-4 text-sm font-bold text-text">v{row.version}</td>
                    <td className="px-8 py-4 text-sm font-bold text-text">{row.summary?.totalInvoices || 0}</td>
                    <td className="px-8 py-4 text-sm font-bold text-text">Rs. {toFixed2(row.summary?.taxableValue)}</td>
                    <td className="px-8 py-4 text-sm font-bold text-text">Rs. {toFixed2(row.summary?.grandTax)}</td>
                    <td className="px-8 py-4 text-sm font-bold text-text">Rs. {toFixed2(row.summary?.grossAmount)}</td>
                    <td className="px-8 py-4 text-sm font-bold text-text">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black ${confidenceBadge(row.reconciliation?.confidenceScore || 100)}`}>
                        {row.reconciliation?.confidenceScore ?? 100}%
                      </span>
                    </td>
                    <td className="px-8 py-4 text-sm font-bold text-text">{row.reconciliation?.mismatchInvoices || 0}</td>
                    <td className="px-8 py-4 text-sm font-bold text-muted">{new Date(row.generatedAt || row.createdAt).toLocaleString('en-GB')}</td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewIssues(row._id)}
                          disabled={detailsLoading}
                          className="px-4 py-2 rounded-xl border border-border text-[9px] font-black uppercase tracking-widest text-muted hover:bg-surface-2 transition-all disabled:opacity-60"
                        >
                          {detailsLoading && selectedArtifact?._id !== row._id ? 'Loading...' : 'View Issues'}
                        </button>
                        <button
                          onClick={() => handleDownload(row._id)}
                          disabled={downloadingId === row._id}
                          className="px-4 py-2 rounded-xl bg-[#047857]/10 text-[#047857] text-[9px] font-black uppercase tracking-widest hover:bg-[#047857] hover:text-white transition-all disabled:opacity-60"
                        >
                          {downloadingId === row._id ? 'Downloading...' : 'Download CSV'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedArtifact && (
        <div className="bg-white border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-border flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-[10px] font-black text-text uppercase tracking-[0.2em]">Artifact Drill-down</h4>
              <p className="text-[10px] font-bold text-muted-2 mt-1">
                Period {String(selectedArtifact.period?.month || '').padStart(2, '0')}/{selectedArtifact.period?.year} | v{selectedArtifact.version}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowOnlyFlagged((v) => !v)}
                className="px-4 py-2 rounded-xl border border-border text-[9px] font-black uppercase tracking-widest text-muted hover:bg-surface-2"
              >
                {showOnlyFlagged ? 'Show All' : 'Show Flagged Only'}
              </button>
              <button
                onClick={() => setSelectedArtifact(null)}
                className="px-4 py-2 rounded-xl border border-border text-[9px] font-black uppercase tracking-widest text-muted-2 hover:bg-surface-2"
              >
                Close
              </button>
            </div>
          </div>

          <div className="px-8 py-5 border-b border-border bg-surface-2/10 flex flex-wrap items-center gap-2">
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black ${confidenceBadge(selectedArtifact.reconciliation?.confidenceScore || 100)}`}>
              Confidence: {selectedArtifact.reconciliation?.confidenceScore ?? 100}%
            </span>
            <button
              onClick={() => jumpToInvoices('Needs Review')}
              className="inline-flex px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-700 hover:opacity-80"
            >
              Mismatch: {selectedArtifact.reconciliation?.mismatchInvoices || 0}
            </button>
            <button
              onClick={() => jumpToInvoices('Unconfirmed Chain')}
              className="inline-flex px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-700 hover:opacity-80"
            >
              Unconfirmed: {selectedArtifact.reconciliation?.unconfirmedBlockchainCount || 0}
            </button>
          </div>

          {visibleLineItems.length === 0 ? (
            <div className="p-10 text-center text-[10px] font-black text-muted-2 uppercase tracking-widest">No rows for this filter.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-205 text-left">
                <thead>
                  <tr className="text-[9px] font-black text-muted-2 uppercase tracking-widest border-b border-border">
                    <th className="px-8 py-4">Invoice</th>
                    <th className="px-8 py-4">Counterparty</th>
                    <th className="px-8 py-4">Gross</th>
                    <th className="px-8 py-4">Blockchain</th>
                    <th className="px-8 py-4">Payment</th>
                    <th className="px-8 py-4">Flags</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleLineItems.map((row) => (
                    <tr key={row.invoiceId || row.invoiceNumber} className="border-b border-border/70 hover:bg-surface-2/20">
                      <td className="px-8 py-4 text-sm font-bold text-text">{row.invoiceNumber}</td>
                      <td className="px-8 py-4 text-sm font-bold text-text">{row.counterpartyGstin || '--'}</td>
                      <td className="px-8 py-4 text-sm font-bold text-text">Rs. {toFixed2(row.grossAmount)}</td>
                      <td className="px-8 py-4 text-sm font-bold text-text uppercase">{row.blockchainStatus || '--'}</td>
                      <td className="px-8 py-4 text-sm font-bold text-text uppercase">{row.paymentStatus || '--'}</td>
                      <td className="px-8 py-4">
                        {Array.isArray(row.flags) && row.flags.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {row.flags.map((flag) => (
                              <button
                                key={flag}
                                onClick={() => jumpToInvoices(mapFlagToRisk(flag))}
                                className="inline-flex px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wide bg-red-100 text-red-700 hover:opacity-80"
                              >
                                {flag.replaceAll('_', ' ')}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] font-black text-[#047857] uppercase tracking-wide">No issues</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
