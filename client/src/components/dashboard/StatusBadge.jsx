const statusConfig = {
    Paid: { bg: 'bg-green-500/10', text: 'text-green-600', dot: 'bg-green-500' },
    Pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-600', dot: 'bg-yellow-500' },
    Overdue: { bg: 'bg-red-500/10', text: 'text-red-500', dot: 'bg-red-500' },
    Draft: { bg: 'bg-secondary/10', text: 'text-secondary', dot: 'bg-secondary' },
    Approved: { bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary' },
    Disputed: { bg: 'bg-orange-500/10', text: 'text-orange-500', dot: 'bg-orange-500' },
};

export default function StatusBadge({ status }) {
    const config = statusConfig[status] || statusConfig.Draft;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {status}
        </span>
    );
}
