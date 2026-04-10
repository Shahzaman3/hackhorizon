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
  { label: "Audit Log",      icon: "activity",path: "/seller/audit" },
  { label: "Settings",       icon: "settings",path: "/seller/settings" },
];

const buyerNav = [
  { label: "Overview",           icon: "grid",   path: "/buyer/dashboard" },
  { label: "Received Invoices",  icon: "file",   path: "/buyer/invoices" },
  { label: "Request Invoice",    icon: "inbox",  path: "/buyer/requests" },
  { label: "GST Summary",        icon: "chart",  path: "/buyer/gst" },
  { label: "Audit Log",          icon: "activity",path: "/buyer/audit" },
  { label: "Settings",           icon: "settings",path: "/buyer/settings" },
];

const NavIcon = ({ type, active }) => {
  const cls = `w-4 h-4 flex-shrink-0 transition-all duration-300 ${active ? 'text-[#047857]' : 'text-[#728279] group-hover:text-[#047857] group-hover:scale-110'}`;
  const icons = {
    grid:   <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    file:   <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    upload: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
    inbox:  <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>,
    chart:  <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    rupee:  <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    activity:<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    settings: <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l1.6-1.6a1 1 0 000-1.4l-1.6-1.6a1 1 0 00-1.4 0l-1.6 1.6z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
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
    <div className={`w-[260px] flex-shrink-0 flex flex-col bg-[#FDFBF7] border-r border-[#E5E2D9] z-40 transition-transform duration-300 h-full fixed md:relative inset-y-0 left-0 md:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full shadow-none'}`}>

      {/* Top: Logo */}
      <div className="px-6 py-8 flex flex-col items-center">
        {isOpen && (
          <button
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-xl bg-[#F4F1EA] text-[#4D6357] hover:text-[#047857] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-[#047857] rounded-xl flex items-center justify-center font-bold text-sm text-[#FDFBF7] shadow-xl shadow-[#047857]/20 group-hover:scale-105 transition-transform">
            IS
          </div>
          <span className="text-[#0A2518] font-bold text-xl tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>InvoiceSync</span>
        </div>

        <div className="mt-6 w-full flex items-center justify-center">
          <div className="inline-flex items-center gap-2 bg-[#F4F1EA] border border-[#E5E2D9] text-[#047857] text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.15em]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#047857] animate-pulse" />
            {role === 'seller' ? 'Seller Hub' : 'Buyer Hub'}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar px-5 py-2 flex flex-col gap-1.5">
        <div className="mb-4 text-[10px] font-bold text-[#728279] uppercase tracking-[0.2em] px-3">Main Navigation</div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 group ${
                isActive
                  ? 'bg-[#047857] text-[#FDFBF7] shadow-lg shadow-[#047857]/20 translate-x-1'
                  : 'text-[#4D6357] hover:bg-[#F4F1EA] hover:text-[#0A2518]'
              }`}
            >
              <NavIcon type={item.icon} active={isActive} />
              <span style={{ fontFamily: 'Inter' }}>{item.label}</span>
              {isActive && (
                 <div className="ml-auto w-1 h-5 bg-[#FDFBF7]/40 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: User + Actions */}
      <div className="p-6 bg-[#F4F1EA]/50 border-t border-[#E5E2D9]">
        {user && (
          <div className="flex items-center gap-3 mb-6 bg-white p-3 rounded-2xl border border-[#E5E2D9] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#047857] flex-shrink-0 flex items-center justify-center text-[#FDFBF7] font-bold text-sm shadow-md shadow-[#047857]/20">
              {getInitials(user.name)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-[#0A2518] truncate leading-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>{user.name}</span>
              <span className="text-[10px] text-[#728279] truncate font-medium mt-0.5">{user.email}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleSwitchRole}
            disabled={switching}
            className="w-full bg-white border border-[#E5E2D9] rounded-xl py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#4D6357] hover:bg-[#047857] hover:text-[#FDFBF7] hover:border-[#047857] transition-all duration-300 flex justify-center items-center gap-2.5 disabled:opacity-50 shadow-sm"
          >
            {switching ? (
              <span className="w-3.5 h-3.5 border-2 border-[#047857]/30 border-t-[#047857] rounded-full spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            )}
            <span style={{ fontFamily: 'Plus Jakarta Sans' }}>
              {switching ? 'Switching...' : `Switch to ${role === 'seller' ? 'Buyer' : 'Seller'}`}
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-[#FFFFFF]/50 hover:bg-red-50 border border-[#E5E2D9] hover:border-red-100 rounded-xl py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#728279] hover:text-red-500 transition-all duration-300 flex items-center justify-center gap-2.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span style={{ fontFamily: 'Plus Jakarta Sans' }}>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
