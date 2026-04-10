import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import StatCard from '../components/dashboard/StatCard';
import InvoiceTable from '../components/dashboard/InvoiceTable';
import GSTChart from '../components/dashboard/GSTChart';
import Button from '../components/shared/Button';

const invoices = [
    { id: 'INV-2401', client: 'Reliance Industries', amount: '₹1,24,000', gst: '₹22,320', status: 'Paid', dueDate: '10 Apr 2026' },
    { id: 'INV-2402', client: 'Tata Consultancy Services', amount: '₹87,500', gst: '₹15,750', status: 'Pending', dueDate: '15 Apr 2026' },
    { id: 'INV-2403', client: 'Infosys Limited', amount: '₹2,03,400', gst: '₹36,612', status: 'Overdue', dueDate: '05 Apr 2026' },
    { id: 'INV-2404', client: 'Wipro Technologies', amount: '₹56,200', gst: '₹10,116', status: 'Draft', dueDate: '20 Apr 2026' },
    { id: 'INV-2405', client: 'HCL Technologies', amount: '₹1,78,000', gst: '₹32,040', status: 'Approved', dueDate: '25 Apr 2026' },
    { id: 'INV-2406', client: 'L&T Finance', amount: '₹95,600', gst: '₹17,208', status: 'Paid', dueDate: '02 Apr 2026' },
];

const statIcons = {
    revenue: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    invoices: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    pending: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
    overdue: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
};

export default function SellerDashboard() {
    return (
        <div className="flex min-h-screen bg-bg">
            <Sidebar role="seller" />
            <div className="flex-1 flex flex-col min-w-0">
                <TopBar
                    title="Seller Dashboard"
                    subtitle="Welcome back — here's your revenue overview"
                />
                <main className="flex-1 p-6 flex flex-col gap-6">
                    {/* Quick action */}
                    <div className="flex items-center justify-between">
                        <div />
                        <Button variant="primary" size="md"
                            icon={
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                                    <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            }
                        >
                            New Invoice
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            label="Total Revenue"
                            value="₹8.4L"
                            change="12.5% this month"
                            changeType="up"
                            accent
                            icon={statIcons.revenue}
                        />
                        <StatCard
                            label="Total Invoices"
                            value="167"
                            change="8 new"
                            changeType="up"
                            icon={statIcons.invoices}
                        />
                        <StatCard
                            label="Pending Amount"
                            value="₹2.1L"
                            change="3 invoices"
                            changeType="up"
                            icon={statIcons.pending}
                        />
                        <StatCard
                            label="Overdue"
                            value="₹43K"
                            change="2 overdue"
                            changeType="down"
                            icon={statIcons.overdue}
                        />
                    </div>

                    {/* Charts */}
                    <GSTChart />

                    {/* Invoice Table */}
                    <InvoiceTable invoices={invoices} role="seller" />
                </main>
            </div>
        </div>
    );
}
