import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';

export default function TopBar({ title, onMenuClick }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-[80px] bg-[#FDFBF7] border-b border-[#E5E2D9] flex items-center justify-between px-6 md:px-10 sticky top-0 z-30 flex-shrink-0">
      
      {/* Left: Branding/Title */}
      <div className="flex items-center gap-5">
        <button
          onClick={onMenuClick}
          className="md:hidden w-11 h-11 flex items-center justify-center rounded-2xl bg-white border border-[#E5E2D9] text-[#728279] hover:text-[#047857] hover:border-[#047857]/30 transition-all shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex flex-col">
          <h1 className="font-extrabold text-[1.125rem] text-[#0A2518] leading-tight flex items-center gap-3" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            {title || 'Overview'}
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#047857]/30" />
          </h1>
          <p className="text-[11px] text-[#728279] font-bold uppercase tracking-[0.15em] mt-1.5 hidden sm:block">
            {formattedDate}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        
        {/* Search Bar */}
        <div className="relative hidden lg:block group">
          <input
            type="text"
            placeholder="Search documents..."
            className="bg-white border border-[#E5E2D9] rounded-2xl px-5 py-2.5 pl-11 text-sm w-56 group-hover:w-64 focus:w-80 focus:border-[#047857]/50 focus:ring-4 focus:ring-[#047857]/5 outline-none transition-all duration-500 text-[#0A2518] placeholder-[#728279] font-medium shadow-sm"
          />
          <svg className="w-4 h-4 text-[#728279] absolute left-4 top-1/2 -translate-y-1/2 group-hover:text-[#047857] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setShowDropdown(!showDropdown)}
            className={`w-11 h-11 border rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300 group shadow-sm ${showDropdown ? 'bg-[#047857] border-[#047857]' : 'bg-white border-[#E5E2D9] hover:border-[#047857]/40 hover:bg-[#F4F1EA]'}`}
          >
            <svg className={`w-5 h-5 transition-colors ${showDropdown ? 'text-white' : 'text-[#4D6357] group-hover:text-[#047857]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className={`min-w-[18px] h-[18px] px-1.5 bg-[#dc2626] rounded-full flex items-center justify-center text-[9px] font-black text-white absolute -top-1.5 -right-1.5 border-4 ${showDropdown ? 'border-[#047857]' : 'border-[#FDFBF7]'} shadow-sm transition-colors`}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>

          {/* Panel */}
          {showDropdown && (
            <div className="absolute right-0 top-[60px] w-80 bg-white border border-[#E5E2D9] rounded-[2rem] shadow-2xl shadow-[#0A2518]/10 overflow-hidden flex flex-col z-50 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="px-6 py-5 border-b border-[#E5E2D9] flex items-center justify-between bg-[#F4F1EA]/30">
                <h3 className="text-sm font-bold text-[#0A2518]" style={{ fontFamily: 'Plus Jakarta Sans' }}>Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllAsRead} className="text-[10px] font-extrabold uppercase tracking-widest text-[#047857] hover:text-[#065F46] transition-colors underline underline-offset-4 decoration-2">
                    Mark Read
                  </button>
                )}
              </div>
              
              <div className="max-h-[380px] overflow-y-auto custom-scrollbar flex flex-col">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-[#F4F1EA] rounded-full flex items-center justify-center">
                       <svg className="w-6 h-6 text-[#728279]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                    </div>
                    <span className="text-xs font-bold text-[#728279]">No new notifications</span>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n._id} className={`p-5 border-b border-[#E5E2D9]/60 hover:bg-[#F4F1EA]/20 transition-all flex flex-col gap-2 cursor-pointer relative ${!n.isRead ? 'bg-[#047857]/5' : ''}`}>
                      <div className="flex items-start justify-between gap-3">
                        <span className={`text-[13px] font-bold ${!n.isRead ? 'text-[#0A2518]' : 'text-[#4D6357]'}`}>{n.title}</span>
                        {!n.isRead && (
                          <div className="w-2 h-2 rounded-full bg-[#047857] mt-1 shadow-lg shadow-[#047857]/40" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#728279] leading-relaxed font-medium line-clamp-2">{n.message}</p>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#A2A9A5] mt-1">
                        {new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', day:'numeric', month: 'short' }).format(new Date(n.createdAt))}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-3 pl-3 border-l border-[#E5E2D9]">
          <div className="hidden sm:flex flex-col items-end mr-1">
             <span className="text-xs font-bold text-[#0A2518] leading-none" style={{ fontFamily: 'Plus Jakarta Sans' }}>{user?.name || 'User'}</span>
             <span className="text-[10px] text-[#728279] font-semibold mt-1 uppercase tracking-wider">{user?.role}</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#047857] flex flex-shrink-0 items-center justify-center font-bold text-sm text-white shadow-lg shadow-[#047857]/20 border-2 border-white hover:scale-105 transition-transform cursor-pointer">
            {getInitials(user?.name)}
          </div>
        </div>

      </div>
    </div>
  );
}
