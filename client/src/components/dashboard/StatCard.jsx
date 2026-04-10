import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { v: 10 }, { v: 12 }, { v: 11 }, { v: 15 }, { v: 14 }, { v: 18 }, { v: 16 }
];

export default function StatCard({ label, value, sub, color, chartData = mockChartData }) {
  const accentMap = {
    'border-primary':     { dot: '#047857', glow: 'rgba(4, 120, 87, 0.05)', line: '#047857' },
    'border-green-500':   { dot: '#16a34a', glow: 'rgba(22, 163, 74, 0.05)', line: '#16a34a' },
    'border-yellow-500':  { dot: '#ca8a04', glow: 'rgba(202, 138, 4, 0.05)', line: '#ca8a04' },
    'border-blue-500':    { dot: '#2563eb', glow: 'rgba(37, 99, 235, 0.05)', line: '#2563eb' },
    'border-red-400':     { dot: '#dc2626', glow: 'rgba(220, 38, 38, 0.05)', line: '#dc2626' },
    'border-orange-400':  { dot: '#ea580c', glow: 'rgba(234, 88, 12, 0.05)', line: '#ea580c' },
  };
  const accent = accentMap[color] || accentMap['border-primary'];

  return (
    <div className="bg-white border border-[#E5E2D9] rounded-[1.5rem] p-6 flex flex-col gap-3 hover:border-[#047857]/30 hover:shadow-xl hover:shadow-[#047857]/5 transition-all duration-500 group relative overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-[#F4F1EA]/50 pointer-events-none" />

      {/* Label Group */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent.dot }} />
          <span className="text-[11px] font-bold text-[#4D6357] uppercase tracking-[0.14em]">{label}</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#F4F1EA] flex items-center justify-center group-hover:bg-[#047857]/10 transition-colors">
           <svg className="w-4 h-4 text-[#047857]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
           </svg>
        </div>
      </div>

      {/* Value */}
      <div className="flex items-end justify-between mt-1">
        <div className="flex flex-col">
          <div className="text-[1.85rem] font-extrabold text-[#0A2518] leading-none tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            {value}
          </div>
          <div className="text-[11px] text-[#728279] font-medium mt-3 flex items-center gap-1.5">
             <span className="text-[#047857] font-bold">+12%</span>
             {sub}
          </div>
        </div>

        {/* Sparkline Area */}
        <div className="w-24 h-12 flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <Area 
                type="monotone" 
                dataKey="v" 
                stroke={accent.line} 
                strokeWidth={2} 
                fill={`url(#gradient-${accent.line})`} 
                fillOpacity={0.15} 
              />
              <defs>
                <linearGradient id={`gradient-${accent.line}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accent.line} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={accent.line} stopOpacity={0}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
