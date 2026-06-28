
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import WhatsAppButton from './components/WhatsAppButton';
import ScrollToTopButton from './components/ScrollToTopButton';
import AppRoutes from './AppRoutes';
import OfflineBanner from './components/shared/OfflineBanner';
import DevelopmentBanner from './components/shared/DevelopmentBanner';
import ErrorBoundary from './components/ErrorBoundary';
import { supabase } from './lib/supabaseClient';
import { initGA, pageview } from './lib/ga';

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isSessionRoute = location.pathname.startsWith('/session');
  const showLayout = !isAdminRoute && !isSessionRoute;

  useEffect(() => {
    const handleAuthStateChange = async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/reset-password');
      }
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
    return () => { subscription?.unsubscribe(); };
  }, [navigate]);

  useEffect(() => { initGA(); }, []);
  useEffect(() => { pageview(location.pathname + location.search); }, [location]);

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen" dir="rtl">
        <DevelopmentBanner />
        <OfflineBanner />
        {showLayout && <Header />}
        <ScrollToTop />
        <main className="flex-grow">
          <AppRoutes />
        </main>
        {showLayout && <Footer />}
        {showLayout && (
          <>
            <WhatsAppButton />
            <ScrollToTopButton />
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
