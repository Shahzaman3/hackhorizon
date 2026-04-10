import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';

const sellerNav = [
  { label: "Overview",       icon: "grid",    path: "/seller/dashboard" },
  { label: "My Invoices",    icon: "file",    path: "/seller/invoices" },
  { label: "Upload Invoice", icon: "upload",  path: "/seller/upload" },
  { label: "Requests",       icon: "inbox",   path: "/seller/requests" },
  { label: "GST Summary",    icon: "chart",   path: "/seller/gst" },
  { label: "Payments",       icon: "rupee",   path: "/seller/payments" },
];

const buyerNav = [
  { label: "Overview",           icon: "grid",   path: "/buyer/dashboard" },
  { label: "Received Invoices",  icon: "file",   path: "/buyer/invoices" },
  { label: "Request Invoice",    icon: "inbox",  path: "/buyer/requests" },
  { label: "GST Summary",        icon: "chart",  path: "/buyer/gst" },
];

const NavIcon = ({ type, active }) => {
  const cls = `w-4 h-4 flex-shrink-0 transition-colors ${active ? 'text-[#4ade80]' : 'text-[#3d5945] group-hover:text-[#6b8f76]'}`;
  const icons = {
    grid:   <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    file:   <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    upload: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
    inbox:  <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>,
    chart:  <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    rupee:  <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  };
  return icons[type] || null;
};

export default function Sidebar({ role: overrideRole, isOpen, onClose }) {
  const { user, switchRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [switching, setSwitching] = useState(false);

  const role = user?.role || 'seller';
  const navItems = role === 'seller' ? sellerNav : buyerNav;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleSwitchRole = async () => {
    setSwitching(true);
    try {
      const newRole = role === 'seller' ? 'buyer' : 'seller';
      const res = await api.post('/auth/switch-role', { role: newRole });
      const { token } = res.data.data;
      switchRole(token, newRole);
      navigate(`/${newRole}/dashboard`, { replace: true });
    } catch (err) {
      console.error('Failed to switch role', err);
    } finally {
      setSwitching(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`w-[240px] flex-shrink-0 flex flex-col bg-[#080c0a] border-r border-[#111a15] z-40 transition-transform duration-300 h-full fixed md:relative inset-y-0 left-0 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

      {/* Top: Logo */}
      <div className="px-5 py-5 border-b border-[#111a15]">
        {isOpen && (
          <button
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-[#111a15] text-[#6b8f76] hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-[#4ade80] rounded-lg flex items-center justify-center font-bold text-sm text-[#0a0f0d] shadow-lg shadow-[#4ade80]/25">IS</div>
          <span className="text-white font-bold text-[16px] tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>InvoiceSync</span>
        </div>

        <div className="mt-3 inline-flex items-center gap-1.5 bg-[#4ade80]/10 border border-[#4ade80]/15 text-[#4ade80] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
          {role === 'seller' ? 'Seller' : 'Buyer'}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                isActive
                  ? 'bg-[#4ade80]/10 text-white'
                  : 'text-[#3d5945] hover:bg-[#111a15] hover:text-[#6b8f76]'
              }`}
            >
              <NavIcon type={item.icon} active={isActive} />
              <span>{item.label}</span>
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4ade80]" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: User + Actions */}
      <div className="p-4 border-t border-[#111a15]">
        {user && (
          <div className="flex items-center gap-3 mb-4 px-1">
            <div className="w-8 h-8 rounded-full bg-[#4ade80]/15 border border-[#4ade80]/20 flex-shrink-0 flex items-center justify-center text-[#4ade80] font-bold text-xs" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              {getInitials(user.name)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-white truncate" style={{ fontFamily: 'Plus Jakarta Sans' }}>{user.name}</span>
              <span className="text-[10px] text-[#3d5945] truncate font-medium">{user.email}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={handleSwitchRole}
            disabled={switching}
            className="w-full bg-[#111a15] border border-[#243124] rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider text-[#6b8f76] hover:bg-[#4ade80]/10 hover:text-[#4ade80] hover:border-[#4ade80]/20 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {switching ? (
              <span className="w-3 h-3 border-2 border-[#4ade80]/30 border-t-[#4ade80] rounded-full spin" />
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            )}
            {switching ? 'Switching...' : `Switch to ${role === 'seller' ? 'Buyer' : 'Seller'}`}
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-[#111a15] border border-[#243124] rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider text-[#6b8f76] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
