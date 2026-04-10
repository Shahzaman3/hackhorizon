import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import StatCard from '../components/dashboard/StatCard';
import InvoiceTable from '../components/dashboard/InvoiceTable';
import Button from '../components/shared/Button';

const invoices = [
    { id: 'INV-2401', client: 'BuildTech Supplies', amount: '₹1,24,000', gst: '₹22,320', status: 'Approved', dueDate: '10 Apr 2026' },
    { id: 'INV-2402', client: 'CoreMaterials Co.', amount: '₹87,500', gst: '₹15,750', status: 'Pending', dueDate: '15 Apr 2026' },
    { id: 'INV-2403', client: 'Apex Logistics', amount: '₹2,03,400', gst: '₹36,612', status: 'Disputed', dueDate: '05 Apr 2026' },
    { id: 'INV-2404', client: 'Nexgen Software', amount: '₹56,200', gst: '₹10,116', status: 'Pending', dueDate: '20 Apr 2026' },
    { id: 'INV-2405', client: 'Prime Electronics', amount: '₹1,78,000', gst: '₹32,040', status: 'Approved', dueDate: '25 Apr 2026' },
    { id: 'INV-2406', client: 'Digital Ventures', amount: '₹95,600', gst: '₹17,208', status: 'Paid', dueDate: '02 Apr 2026' },
];

const ApprovalCard = ({ inv }) => (
    <div className="flex items-center gap-4 bg-white/70 border border-card/50 rounded-xl p-4 hover:border-primary/30 hover:shadow-md transition-all">
        <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
            </svg>
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-dark text-sm font-semibold truncate" style={{ fontFamily: 'Plus Jakarta Sans' }}>{inv.id}</p>
            <p className="text-secondary text-xs truncate">{inv.client} · {inv.amount}</p>
        </div>
        <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-[#2a4128] transition-colors">
                Approve
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-red-400 text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors">
                Dispute
            </button>
        </div>
    </div>
);

const statIcons = {
    total: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    pending: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
    approved: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
    disputed: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
};

export default function BuyerDashboard() {
    const pending = invoices.filter((i) => i.status === 'Pending');

    return (
        <div className="flex min-h-screen bg-bg">
            <Sidebar role="buyer" />
            <div className="flex-1 flex flex-col min-w-0">
                <TopBar
                    title="Buyer Dashboard"
                    subtitle="Review and manage invoices from your vendors"
                />
                <main className="flex-1 p-6 flex flex-col gap-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard label="Total Received" value="54" change="6 new" changeType="up" accent icon={statIcons.total} />
                        <StatCard label="Pending Approval" value="12" change="4 this week" changeType="up" icon={statIcons.pending} />
                        <StatCard label="Approved" value="38" change="↑ 5" changeType="up" icon={statIcons.approved} />
                        <StatCard label="Disputed" value="4" change="↓ 2" changeType="down" icon={statIcons.disputed} />
                    </div>

                    {/* Main content */}
                    <div className="grid lg:grid-cols-3 gap-5">
                        {/* Pending approvals panel */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/70 border border-card/50 rounded-2xl overflow-hidden">
                                <div className="px-5 py-4 border-b border-card/30 flex items-center justify-between">
                                    <h3 className="font-bold text-dark text-sm" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                                        Pending Approvals
                                    </h3>
                                    <span className="bg-yellow-500/10 text-yellow-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                        {pending.length}
                                    </span>
                                </div>
                                <div className="p-3 flex flex-col gap-2">
                                    {pending.map((inv) => <ApprovalCard key={inv.id} inv={inv} />)}
                                    {pending.length === 0 && (
                                        <p className="text-center text-secondary text-sm py-8">All caught up! ✓</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Invoice table */}
                        <div className="lg:col-span-2">
                            <InvoiceTable invoices={invoices} role="buyer" />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
