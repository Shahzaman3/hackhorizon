export default function StatusBadge({ status }) {
  const normalizedStatus = status?.toLowerCase() || 'pending';

  const styles = {
    pending:  'bg-amber-50 text-amber-700 border-amber-100',
    accepted: 'bg-[#047857]/5 text-[#047857] border-[#047857]/10',
    rejected: 'bg-red-50 text-red-600 border-red-100',
    modified: 'bg-blue-50 text-blue-600 border-blue-100',
  };

  const dots = {
    pending:  '#b45309',
    accepted: '#047857',
    rejected: '#dc2626',
    modified: '#2563eb',
  };

  const badgeClass = styles[normalizedStatus] || styles.pending;
  const dotColor   = dots[normalizedStatus]   || dots.pending;

  return (
    <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] px-3 py-1.5 rounded-full border shadow-sm transition-all duration-300 ${badgeClass}`}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse" style={{ backgroundColor: dotColor }} />
      {status || 'Pending'}
    </span>
  );
}
