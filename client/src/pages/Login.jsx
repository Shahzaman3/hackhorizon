import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';

export default function Login() {
  const [activeRole, setActiveRole] = useState('seller');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate(`/${user.role}/dashboard`, { replace: true });
    }
  }, [user, navigate]);

  const handleGoogleLogin = () => {
    setError('');
    setIsGoogleLoading(true);
    const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const apiBaseUrl = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`;
    window.location.href = `${apiBaseUrl}/auth/google`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email: email.trim().toLowerCase(), password });
      const { user } = res.data.data;
      login(user);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FDFBF7] relative overflow-hidden">
      {/* bg blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-[#047857]/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#047857]/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#047857 1px, transparent 1px), linear-gradient(90deg, #047857 1px, transparent 1px)', backgroundSize: '48px 48px' }}
        />
      </div>

      <div className="w-full max-w-[420px] relative z-10 flex flex-col items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-9 h-9 bg-[#047857] rounded-xl flex items-center justify-center font-bold text-[14px] text-[#FDFBF7] shadow-lg shadow-[#047857]/30">IS</div>
          <span className="text-[#0A2518] font-bold text-xl tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>InvoiceSync</span>
        </div>

        <div className="w-full bg-[#FFFFFF]/80 backdrop-blur-xl border border-[#E5E2D9] rounded-[2rem] p-8 shadow-2xl flex flex-col text-center">

          {/* Role Toggle */}
          <div className="flex w-full bg-[#FFFFFF] rounded-2xl p-1 mb-8 border border-[#E5E2D9]">
            {['seller', 'buyer'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setActiveRole(r)}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 capitalize ${
                  activeRole === r
                    ? 'bg-[#047857] text-[#FDFBF7] shadow-lg shadow-[#047857]/25'
                    : 'text-[#4D6357] hover:text-[#0A2518]'
                }`}
                style={{ fontFamily: 'Plus Jakarta Sans' }}
              >
                {r === 'seller' ? 'Seller' : 'Buyer'}
              </button>
            ))}
          </div>

          {/* Heading */}
          <h2 className="font-extrabold text-2xl text-[#0A2518] mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Sign in as {activeRole === 'seller' ? 'Seller' : 'Buyer'}
          </h2>
          <p className="text-sm text-[#4D6357] mb-8 leading-relaxed">
            {activeRole === 'seller'
              ? 'Access your invoice dashboard and track payments'
              : 'Review and validate invoices from your suppliers'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-[#4D6357] uppercase tracking-[0.12em] mb-2">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-[#FFFFFF] border border-[#E5E2D9] rounded-xl px-4 py-3.5 text-sm text-[#0A2518] placeholder-[#728279] outline-none focus:border-[#047857]/50 focus:ring-2 focus:ring-[#047857]/10 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[11px] font-bold text-[#4D6357] uppercase tracking-[0.12em]">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-[#047857] hover:text-[#0A2518] transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#FFFFFF] border border-[#E5E2D9] rounded-xl px-4 pr-12 py-3.5 text-sm text-[#0A2518] placeholder-[#728279] outline-none focus:border-[#047857]/50 focus:ring-2 focus:ring-[#047857]/10 transition-all tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#728279] hover:text-[#4D6357] transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#047857] hover:bg-[#065F46] text-[#FDFBF7] rounded-xl py-4 font-bold text-sm mt-1 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-xl shadow-[#047857]/20 hover:shadow-[#047857]/35"
              style={{ fontFamily: 'Plus Jakarta Sans' }}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#FDFBF7]/80 border-t-transparent rounded-full spin" />
                  Authenticating...
                </>
              ) : (
                `Sign in as ${activeRole === 'seller' ? 'Seller' : 'Buyer'}`
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-7 flex items-center gap-4">
            <div className="flex-1 h-px bg-[#E5E2D9]" />
            <span className="text-xs text-[#728279] font-bold uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-[#E5E2D9]" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
            className="w-full bg-[#FFFFFF] border border-[#E5E2D9] hover:border-[#D1CFC2] hover:bg-[#F4F1EA] text-[#0A2518] rounded-xl py-3.5 font-semibold text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-60"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.72 1.22 9.23 3.6l6.85-6.85C35.9 2.38 30.37 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.36 13.98 17.73 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.65-.15-3.23-.42-4.75H24v9h12.67c-.55 2.96-2.2 5.48-4.67 7.17l7.2 5.59C43.95 37.05 46.5 31.3 46.5 24.5z"/>
              <path fill="#FBBC05" d="M10.54 28.59a14.5 14.5 0 010-9.18l-7.98-6.19A23.96 23.96 0 000 24c0 3.87.92 7.53 2.56 10.78l7.98-6.19z"/>
              <path fill="#34A853" d="M24 48c6.37 0 11.72-2.1 15.63-5.7l-7.2-5.59c-2 1.34-4.57 2.14-8.43 2.14-6.27 0-11.64-4.48-13.46-10.41l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            {isGoogleLoading ? 'Redirecting to Google...' : 'Continue with Google'}
          </button>

          <p className="text-center text-sm text-[#4D6357] mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#047857] font-bold hover:text-[#0A2518] transition-colors">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
