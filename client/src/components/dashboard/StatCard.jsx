export default function StatCard({ label, value, change, changeType = 'up', icon, accent = false }) {
    const isUp = changeType === 'up';

    return (
        <div className={`rounded-2xl p-5 border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${accent
                ? 'bg-dark border-white/10 text-white'
                : 'bg-white/70 border-card/50 text-dark hover:border-primary/20'
            }`}>
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent ? 'bg-primary/30 text-card' : 'bg-primary/10 text-primary'
                    }`}>
                    {icon}
                </div>
                {change && (
                    <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isUp
                            ? 'bg-green-500/10 text-green-600'
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                        <span>{isUp ? '↑' : '↓'}</span>
                        <span>{change}</span>
                    </div>
                )}
            </div>

            <p className={`text-2xl font-extrabold mb-1 ${accent ? 'text-white' : 'text-dark'}`}
                style={{ fontFamily: 'Plus Jakarta Sans' }}>
                {value}
            </p>
            <p className={`text-xs font-medium ${accent ? 'text-white/45' : 'text-secondary'}`}>
                {label}
            </p>
        </div>
    );
}
