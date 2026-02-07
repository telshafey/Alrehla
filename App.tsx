
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
import { supabase } from './lib/supabaseClient';

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine if the current route should hide the standard layout (Header/Footer)
  const isAdminRoute = location.pathname.startsWith('/admin');
  // const isStudentArea = location.pathname.startsWith('/student'); // Removed to show header in student area
  const isSessionRoute = location.pathname.startsWith('/session');
  
  // Show layout for everyone except Admin pages and active Session pages
  const showLayout = !isAdminRoute && !isSessionRoute;

  // Listen for Password Recovery Event
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // عند الضغط على الرابط، سيتم تسجيل دخول المستخدم تلقائياً
        // نقوم هنا بتوجيهه لصفحة تعيين كلمة المرور الجديدة
        navigate('/reset-password');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
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
  );
}

export default App;
