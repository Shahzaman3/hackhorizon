import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function TopBar({ title, subtitle }) {
    const { user } = useAuth();
    const [notifOpen, setNotifOpen] = useState(false);

    return (
        <header className="sticky top-0 z-30 bg-bg/90 backdrop-blur-md border-b border-card/40 px-6 py-4 flex items-center justify-between gap-4">
            {/* Left */}
            <div>
                <h1 className="text-dark font-bold text-xl" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                    {title}
                </h1>
                {subtitle && <p className="text-secondary text-xs mt-0.5">{subtitle}</p>}
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="hidden sm:flex items-center gap-2 bg-white/60 border border-card/50 rounded-xl px-3 py-2 text-sm text-secondary hover:border-primary/30 transition-all focus-within:border-primary/40 focus-within:shadow-sm focus-within:shadow-primary/10">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                        <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search invoices..."
                        className="bg-transparent outline-none text-dark placeholder-secondary/60 text-xs w-36"
                    />
                </div>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setNotifOpen(!notifOpen)}
                        className="relative w-9 h-9 rounded-xl bg-white/60 border border-card/50 flex items-center justify-center text-secondary hover:text-dark hover:border-primary/30 transition-all"
                    >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                    </button>

                    {notifOpen && (
                        <div className="absolute right-0 top-11 w-72 bg-white rounded-2xl shadow-2xl border border-card/40 z-50 overflow-hidden">
                            <div className="px-4 py-3 border-b border-card/30 flex items-center justify-between">
                                <span className="font-bold text-dark text-sm" style={{ fontFamily: 'Plus Jakarta Sans' }}>Notifications</span>
                                <button onClick={() => setNotifOpen(false)} className="text-secondary hover:text-dark text-xs">Mark all read</button>
                            </div>
                            {[
                                { msg: 'INV-2402 approved by Tata Consultancy', time: '2m ago', dot: 'bg-primary' },
                                { msg: 'Payment received for INV-2398 — ₹45,000', time: '1h ago', dot: 'bg-green-500' },
                                { msg: 'INV-2395 overdue by 5 days', time: '3h ago', dot: 'bg-red-500' },
                            ].map(({ msg, time, dot }) => (
                                <div key={msg} className="px-4 py-3 border-b border-card/20 hover:bg-bg/50 transition-colors flex items-start gap-3 cursor-pointer">
                                    <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                                    <div>
                                        <p className="text-dark text-xs">{msg}</p>
                                        <p className="text-secondary text-xs mt-0.5">{time}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="px-4 py-2.5 text-center">
                                <button className="text-primary text-xs font-semibold hover:text-dark transition-colors">
                                    View all notifications →
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-xl bg-dark flex items-center justify-center text-white text-xs font-bold flex-shrink-0 cursor-pointer hover:bg-primary transition-colors">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
            </div>
        </header>
    );
}
