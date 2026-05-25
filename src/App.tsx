import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeProvider';
import { useAuthStore } from './store/index';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles/globals.css';

const OnboardingPage = React.lazy(() => import('./pages/Onboarding'));
const LoginPage = React.lazy(() => import('./pages/Login'));
const SignupPage = React.lazy(() => import('./pages/Signup'));
const VerifyEmailPage = React.lazy(() => import('./pages/VerifyEmail'));
const ForgotPage = React.lazy(() => import('./pages/Forgot'));
const HomePage = React.lazy(() => import('./pages/Home'));
const AllProductsPage = React.lazy(() => import('./pages/AllProducts'));
const ProductDetailsPage = React.lazy(() => import('./pages/ProductDetails'));
const CartPage = React.lazy(() => import('./pages/Cart'));
const CheckoutPage = React.lazy(() => import('./pages/Checkout'));
const OrderConfirmationPage = React.lazy(() => import('./pages/OrderConfirmation'));
const OrdersPage = React.lazy(() => import('./pages/Orders'));
const ProfilePage = React.lazy(() => import('./pages/Profile'));
const EditProfilePage = React.lazy(() => import('./pages/EditProfile'));
const AddressesPage = React.lazy(() => import('./pages/Addresses'));
const ChangePasswordPage = React.lazy(() => import('./pages/ChangePassword'));
const CustomRequestPage = React.lazy(() => import('./pages/CustomRequest'));
const MyRequestsPage = React.lazy(() => import('./pages/MyRequests'));
const SupportChatPage = React.lazy(() => import('./pages/SupportChat'));
const NotificationsPage = React.lazy(() => import('./pages/Notifications'));

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function SessionExpiredToast({ onDone }: { onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 4000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: '#1F2937', color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>
      Your session expired. Please log in again.
    </div>
  );
}

function AppInner() {
  const { loadUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => { loadUser(); }, []);

  useEffect(() => {
    const handler = () => {
      logout();
      setSessionExpired(true);
      navigate('/login', { replace: true });
    };
    window.addEventListener('auth:expired', handler);
    return () => window.removeEventListener('auth:expired', handler);
  }, [navigate, logout]);

  return (
    <>
      {sessionExpired && <SessionExpiredToast onDone={() => setSessionExpired(false)} />}
      <React.Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh' }}><div className="spinner" /></div>}>
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot" element={<ForgotPage />} />
          <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />
          <Route path="/products" element={<RequireAuth><AllProductsPage /></RequireAuth>} />
          <Route path="/products/:id" element={<RequireAuth><ProductDetailsPage /></RequireAuth>} />
          <Route path="/cart" element={<RequireAuth><CartPage /></RequireAuth>} />
          <Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
          <Route path="/order-confirmation" element={<RequireAuth><OrderConfirmationPage /></RequireAuth>} />
          <Route path="/orders" element={<RequireAuth><OrdersPage /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/profile/edit" element={<RequireAuth><EditProfilePage /></RequireAuth>} />
          <Route path="/profile/addresses" element={<RequireAuth><AddressesPage /></RequireAuth>} />
          <Route path="/profile/change-password" element={<RequireAuth><ChangePasswordPage /></RequireAuth>} />
          <Route path="/custom-request" element={<RequireAuth><CustomRequestPage /></RequireAuth>} />
          <Route path="/my-requests" element={<RequireAuth><MyRequestsPage /></RequireAuth>} />
          <Route path="/support" element={<RequireAuth><SupportChatPage /></RequireAuth>} />
          <Route path="/notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <div className="app-shell">
          <BrowserRouter>
            <AppInner />
          </BrowserRouter>
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
