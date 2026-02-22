
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Scanner from './pages/Scanner';
import ProductDetails from './pages/ProductDetails';
import HowItWorks from './pages/HowItWorks';
import About from './pages/About';
import Insights from './pages/Insights';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ApiDocumentation from './pages/ApiDocumentation';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import OTPVerification from './pages/OTPVerification';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Compare from './pages/Compare';
import Admin from './pages/Admin';
import LabelScanner from './pages/LabelScanner';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './context/AuthContext';
import OfflineStatus from './components/OfflineStatus';
import ChatAssistant from './components/ChatAssistant';
import './App.css';

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
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <OfflineStatus />
      <Router>
        <ScrollToTop />
        <Navbar />
        <main style={{ flex: 1, paddingTop: '80px', display: 'flex', flexDirection: 'column' }}>
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
