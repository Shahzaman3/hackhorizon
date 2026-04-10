import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const sellerNav = [
    { to: '/seller-dashboard', label: 'Dashboard', icon: '▪' },
    { to: '/seller-dashboard/invoices', label: 'Invoices', icon: '▪' },
    { to: '/seller-dashboard/clients', label: 'Clients', icon: '▪' },
    { to: '/seller-dashboard/payments', label: 'Payments', icon: '▪' },
    { to: '/seller-dashboard/gst', label: 'GST Reports', icon: '▪' },
    { to: '/seller-dashboard/settings', label: 'Settings', icon: '▪' },
];

const buyerNav = [
    { to: '/buyer-dashboard', label: 'Dashboard', icon: '▪' },
    { to: '/buyer-dashboard/invoices', label: 'Invoices', icon: '▪' },
    { to: '/buyer-dashboard/approvals', label: 'Approvals', icon: '▪' },
    { to: '/buyer-dashboard/disputes', label: 'Disputes', icon: '▪' },
    { to: '/buyer-dashboard/settings', label: 'Settings', icon: '▪' },
];

const navIcons = {
    Dashboard: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
            <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
        </svg>
    ),
    Invoices: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    Clients: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
    Payments: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
            <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" strokeWidth="2" />
        </svg>
    ),
    'GST Reports': (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    Approvals: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    Disputes: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    Settings: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="2" />
        </svg>
    ),
};

export default function Sidebar({ role = 'seller' }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const navItems = role === 'seller' ? sellerNav : buyerNav;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="w-60 bg-dark flex flex-col h-screen sticky top-0 border-r border-white/5 flex-shrink-0">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/5">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <div>
                    <span className="text-white font-bold text-sm block" style={{ fontFamily: 'Plus Jakarta Sans' }}>InvoiceSync</span>
                    <span className="text-white/30 text-xs capitalize">{role} workspace</span>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
                <p className="text-white/25 text-xs font-bold uppercase tracking-widest px-3 mb-2">Menu</p>
                {navItems.map(({ to, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={label === 'Dashboard'}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${isActive
                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                : 'text-white/50 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <span className="flex-shrink-0">{navIcons[label]}</span>
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* User */}
            <div className="px-3 py-4 border-t border-white/5">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-primary/30 border border-primary/50 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {user?.name?.[0]?.toUpperCase() || (role === 'seller' ? 'S' : 'B')}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-semibold truncate">{user?.name || `Demo ${role}`}</p>
                        <p className="text-white/30 text-xs truncate">{user?.email || `demo.${role}@invoicesync.io`}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 text-sm w-full transition-all mt-1"
                >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-medium">Sign out</span>
                </button>
            </div>
        </aside>
    );
}
