import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const monthlyData = [
    { month: 'Nov', revenue: 310000, gst: 55800 },
    { month: 'Dec', revenue: 420000, gst: 75600 },
    { month: 'Jan', revenue: 380000, gst: 68400 },
    { month: 'Feb', revenue: 490000, gst: 88200 },
    { month: 'Mar', revenue: 620000, gst: 111600 },
    { month: 'Apr', revenue: 840000, gst: 151200 },
];

const gstBreakdown = [
    { name: 'CGST', value: 50400 },
    { name: 'SGST', value: 50400 },
    { name: 'IGST', value: 50400 },
];

const COLORS = ['#375534', '#6B9071', '#AEC3B0'];

const formatINR = (val) =>
    val >= 100000 ? `₹${(val / 100000).toFixed(1)}L` : `₹${(val / 1000).toFixed(0)}K`;

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div className="bg-dark text-white text-xs px-3 py-2.5 rounded-xl shadow-xl border border-white/10">
                <p className="font-bold mb-1 text-white/60">{label}</p>
                {payload.map((p) => (
                    <p key={p.name} className="font-semibold">
                        {p.name}: {formatINR(p.value)}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function GSTChart() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Area Chart */}
            <div className="lg:col-span-2 bg-white/70 border border-card/50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h3 className="font-bold text-dark text-sm" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                            Revenue vs GST (6 months)
                        </h3>
                        <p className="text-secondary text-xs mt-0.5">Monthly billing overview</p>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary font-semibold px-3 py-1 rounded-full">
                        FY 2025–26
                    </span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                        <defs>
                            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#375534" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#375534" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gstGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6B9071" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#6B9071" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#AEC3B0" strokeOpacity={0.3} />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B9071' }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={formatINR} tick={{ fontSize: 10, fill: '#6B9071' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#375534" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: '#375534', r: 3 }} />
                        <Area type="monotone" dataKey="gst" name="GST" stroke="#6B9071" strokeWidth={2} fill="url(#gstGrad)" dot={{ fill: '#6B9071', r: 3 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-white/70 border border-card/50 rounded-2xl p-5">
                <h3 className="font-bold text-dark text-sm mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                    GST Breakdown
                </h3>
                <p className="text-secondary text-xs mb-4">April 2026</p>
                <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                        <Pie data={gstBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                            {gstBreakdown.map((_, i) => (
                                <Cell key={i} fill={COLORS[i]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(val) => formatINR(val)} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 mt-2">
                    {gstBreakdown.map(({ name, value }, i) => (
                        <div key={name} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                                <span className="text-secondary">{name}</span>
                            </div>
                            <span className="font-bold text-dark">{formatINR(value)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
