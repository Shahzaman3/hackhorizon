import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function AuditFeed() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/dashboard/audit');
        setLogs(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getActionStyles = (action) => {
    switch (action) {
      case 'Created Invoice': return 'text-[#047857] bg-[#047857]/5 border-[#047857]/10';
      case 'Updated Status': return 'text-purple-600 bg-purple-50 border-purple-100';
      case 'Updated Payment': return 'text-emerald-700 bg-emerald-50 border-emerald-100';
      case 'Created Request': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'Fulfilled Request': return 'text-cyan-700 bg-cyan-50 border-cyan-100';
      default: return 'text-[#728279] bg-[#F4F1EA] border-[#E5E2D9]';
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
         <span className="w-10 h-10 border-4 border-[#047857]/20 border-t-[#047857] rounded-full spin" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E5E2D9] rounded-[2.5rem] p-10 h-full flex flex-col shadow-sm">
      <div className="mb-10">
         <h3 className="font-extrabold text-xl text-[#0A2518] tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>Security & Audit Distribution</h3>
         <p className="text-sm font-medium text-[#728279] mt-2">Historical immutable records of all system state changes.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-60">
            <div className="w-16 h-16 rounded-full bg-[#F4F1EA] flex items-center justify-center mb-4">
               <svg className="w-8 h-8 text-[#A2A9A5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-sm font-bold text-[#A2A9A5] uppercase tracking-widest">No audit events found</span>
          </div>
        ) : (
          <div className="relative border-l-2 border-[#E5E2D9] ml-4 pl-10 space-y-10 py-4">
            {logs.map((log) => (
              <div key={log._id} className="relative group animate-fade-in">
                {/* Timeline junction */}
                <div className="absolute -left-[49px] top-1 w-6 h-6 bg-white border-2 border-[#E5E2D9] rounded-xl flex items-center justify-center group-hover:border-[#047857] transition-all group-hover:scale-110 shadow-sm z-10">
                   <div className="w-2 h-2 rounded-full bg-[#D1CFC2] group-hover:bg-[#047857]" />
                </div>
                
                <div className="flex flex-col gap-3 bg-[#F4F1EA]/20 border border-[#E5E2D9]/60 p-6 rounded-[1.5rem] hover:border-[#047857]/30 hover:bg-white hover:shadow-xl hover:shadow-[#047857]/5 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <span className={`text-[9px] font-black w-fit uppercase tracking-[0.14em] px-3 py-1.5 rounded-lg border shadow-sm ${getActionStyles(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="text-[10px] font-black text-[#A2A9A5] uppercase tracking-widest flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                  
                  <p className="text-sm font-bold text-[#4D6357] leading-relaxed">
                    {log.details}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-2 pt-4 border-t border-[#E5E2D9]/60">
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-black text-[#A2A9A5] uppercase tracking-[0.2em]">ENTITY</span>
                       <span className="text-[10px] font-black text-[#047857] bg-[#047857]/5 px-2 py-0.5 rounded-md border border-[#047857]/10 font-mono italic">{log.entityId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-black text-[#A2A9A5] uppercase tracking-[0.2em]">IDENTIFIER</span>
                       <span className="text-[10px] font-black text-[#0A2518] bg-white border border-[#E5E2D9] px-2 py-0.5 rounded-md font-mono">{log.businessGstin || 'INTERNAL_SYS'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
