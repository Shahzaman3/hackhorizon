import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

// Performance Optimization: Lazy Loading Routes
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const SellerDashboard = lazy(() => import('./pages/SellerDashboard'));
const BuyerDashboard = lazy(() => import('./pages/BuyerDashboard'));

// Ultra-lightweight loader for Suspense
const GlobalLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#FDFBF7]">
    <div className="flex flex-col items-center gap-6">
       <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-[#047857]/10 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-[#047857] rounded-full animate-spin" />
       </div>
       <span className="text-[10px] font-black text-[#047857] uppercase tracking-[0.3em] animate-pulse">Synchronizing Interface...</span>
    </div>
  </div>
);

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <GlobalLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'buyer' ? '/buyer/overview' : '/seller/overview'} replace />;
  }

  return children;
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<GlobalLoader />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Optimized Seller Routing */}
              <Route path="/seller" element={<Navigate to="/seller/overview" replace />} />
              <Route
                path="/seller/:tab"
                element={
                  <ProtectedRoute role="seller">
                    <SellerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Optimized Buyer Routing */}
              <Route path="/buyer" element={<Navigate to="/buyer/overview" replace />} />
              <Route
                path="/buyer/:tab"
                element={
                  <ProtectedRoute role="buyer">
                    <BuyerDashboard />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
