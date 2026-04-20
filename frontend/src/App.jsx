
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect, Suspense, lazy } from 'react';

import Navbar from './features/core/components/Navbar';
import Footer from './features/core/components/Footer';
import ErrorBoundary from './features/core/components/ErrorBoundary';
import { AuthProvider } from './features/auth/context/AuthContext';
import OfflineStatus from './features/core/components/OfflineStatus';
import ChatAssistant from './features/core/components/ChatAssistant';
import FloatingBackground from './features/core/components/FloatingBackground';
import './App.css';

// ─── Code Splitting: Ultra-Fast On-Demand Loading ────────────────────────────
const Home = lazy(() => import('./features/info/pages/Home'));
const Scanner = lazy(() => import('./features/scanner/pages/Scanner'));
const ProductDetails = lazy(() => import('./features/product/pages/ProductDetails'));
const HowItWorks = lazy(() => import('./features/info/pages/HowItWorks'));
const About = lazy(() => import('./features/info/pages/About'));
const Insights = lazy(() => import('./features/info/pages/Insights'));
const PrivacyPolicy = lazy(() => import('./features/info/pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./features/info/pages/TermsOfService'));
const ApiDocumentation = lazy(() => import('./features/info/pages/ApiDocumentation'));
const Login = lazy(() => import('./features/auth/pages/Login'));
const Signup = lazy(() => import('./features/auth/pages/Signup'));
const Profile = lazy(() => import('./features/user/pages/Profile'));
const OTPVerification = lazy(() => import('./features/auth/pages/OTPVerification'));
const ForgotPassword = lazy(() => import('./features/auth/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./features/auth/pages/ResetPassword'));
const Compare = lazy(() => import('./features/product/pages/Compare'));
const Admin = lazy(() => import('./features/info/pages/Admin'));
const LabelScanner = lazy(() => import('./features/scanner/pages/LabelScanner'));
const Dashboard = lazy(() => import('./features/user/pages/Dashboard'));

// ─── QuantumPulse Loader Skeleton ───────────────────────────────────────────
const PageLoader = () => (
  <div className="container section-padding" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
    <div className="skeleton" style={{ height: '60px', width: '60%', borderRadius: '12px' }} />
    <div className="skeleton" style={{ height: '300px', width: '100%', borderRadius: '24px' }} />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
      <div className="skeleton" style={{ height: '150px' }} />
      <div className="skeleton" style={{ height: '150px' }} />
      <div className="skeleton" style={{ height: '150px' }} />
    </div>
  </div>
);

// Component to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Extracted Routes component to access useLocation hook
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/scan" element={<Scanner />} />
          <Route path="/product/:barcode" element={<ProductDetails />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/about" element={<About />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/label-scan" element={<LabelScanner />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/api-documentation" element={<ApiDocumentation />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/verify-otp" element={<OTPVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <OfflineStatus />
      <Router>
        <ScrollToTop />
        <FloatingBackground />
        <Navbar />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <ErrorBoundary>
            <AnimatedRoutes />
          </ErrorBoundary>
        </main>
        <Footer />
        <ChatAssistant />
      </Router>
    </AuthProvider>
  );
}

export default App;
