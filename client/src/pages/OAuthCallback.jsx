import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const completeGoogleLogin = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setError('Google sign-in failed. Missing token.');
        return;
      }

      try {
        const res = await api.get('/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = res.data?.data?.user;
        if (!user) {
          throw new Error('Missing user profile in response');
        }

        login(user, token);
        navigate(`/${user.role}/dashboard`, { replace: true });
      } catch (err) {
        setError(err.response?.data?.message || 'Google sign-in could not be completed.');
      }
    };

    completeGoogleLogin();
  }, [login, navigate, searchParams]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="bg-white border border-card/50 rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
        {!error ? (
          <>
            <h1 className="text-2xl font-bold text-dark" style={{ fontFamily: 'Plus Jakarta Sans' }}>Signing you in...</h1>
            <p className="text-sm text-secondary mt-3">Completing your Google login and preparing your dashboard.</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-dark" style={{ fontFamily: 'Plus Jakarta Sans' }}>Sign-in failed</h1>
            <p className="text-sm text-red-600 mt-3">{error}</p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="mt-6 inline-flex items-center justify-center bg-dark text-[#0A2518] rounded-lg px-5 py-2.5 font-semibold hover:bg-primary transition-colors"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}