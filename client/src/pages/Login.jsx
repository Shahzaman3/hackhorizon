import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/shared/Button';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [role, setRole] = useState('seller');
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(form.email, form.password);
            navigate(user.role === 'buyer' ? '/buyer-dashboard' : '/seller-dashboard');
        } catch (err) {
            setError(err?.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Demo login shortcut
    const demoLogin = (demoRole) => {
        setRole(demoRole);
        setForm({ email: `demo.${demoRole}@invoicesync.io`, password: 'demo1234' });
    };

    return (
        <div className="min-h-screen bg-dark flex">
            {/* Left panel — branding */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#0a1f15] p-12 border-r border-white/5 relative overflow-hidden">
                {/* Blobs */}
                <div className="absolute top-0 -left-20 w-80 h-80 bg-primary/15 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-60 h-60 bg-secondary/10 rounded-full blur-[80px]" />

                {/* Logo */}
                <Link to="/" className="relative flex items-center gap-2.5 z-10">
                    <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span className="text-white font-bold text-xl" style={{ fontFamily: 'Plus Jakarta Sans' }}>InvoiceSync</span>
                </Link>

                {/* Central content */}
                <div className="relative z-10">
                    <div className="mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-6">
                            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#6B9071" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                            Manage invoices
                            <br />like a pro
                        </h2>
                        <p className="text-white/45 text-sm leading-relaxed max-w-xs">
                            Real-time collaboration, GST compliance, and beautiful analytics — all in one workspace.
                        </p>
                    </div>

                    {/* Mini stats */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { val: '10K+', label: 'Invoices synced' },
                            { val: '500+', label: 'Businesses' },
                            { val: '₹50Cr+', label: 'Processed' },
                            { val: '99.9%', label: 'Uptime' },
                        ].map(({ val, label }) => (
                            <div key={label} className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <div className="text-white font-bold text-lg" style={{ fontFamily: 'Plus Jakarta Sans' }}>{val}</div>
                                <div className="text-white/35 text-xs mt-0.5">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="relative z-10 text-white/20 text-xs">© 2026 InvoiceSync · GST Compliant Platform</p>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="white" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <span className="text-white font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>InvoiceSync</span>
                    </Link>

                    <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                        Welcome back
                    </h1>
                    <p className="text-white/45 text-sm mb-8">Sign in to your InvoiceSync workspace</p>

                    {/* Role selector */}
                    <div className="flex mb-6 bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
                        {['seller', 'buyer'].map((r) => (
                            <button
                                key={r}
                                onClick={() => setRole(r)}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all capitalize ${role === r ? 'bg-primary text-white shadow-md' : 'text-white/40 hover:text-white/70'
                                    }`}
                                style={{ fontFamily: 'Plus Jakarta Sans' }}
                            >
                                {r === 'seller' ? '📤 Seller' : '📥 Buyer'}
                            </button>
                        ))}
                    </div>

                    {/* Demo buttons */}
                    <div className="flex gap-2 mb-6">
                        {['seller', 'buyer'].map((r) => (
                            <button
                                key={r}
                                onClick={() => demoLogin(r)}
                                className="flex-1 py-2 rounded-lg text-xs border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 transition-all"
                            >
                                Try demo {r}
                            </button>
                        ))}
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
                                Email address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                placeholder="you@company.com"
                                className="w-full bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                                    Password
                                </label>
                                <a href="#" className="text-secondary hover:text-card text-xs transition-colors">
                                    Forgot password?
                                </a>
                            </div>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                            />
                        </div>

                        <Button type="submit" size="lg" variant="primary" loading={loading} className="mt-2 w-full">
                            Sign in as {role === 'seller' ? 'Seller' : 'Buyer'}
                        </Button>
                    </form>

                    <p className="text-center text-white/30 text-xs mt-6">
                        Don't have an account?{' '}
                        <a href="#" className="text-secondary hover:text-card transition-colors font-medium">
                            Request access
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
