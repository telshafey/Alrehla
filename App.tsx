import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import WhatsAppButton from './components/WhatsAppButton';
import ScrollToTopButton from './components/ScrollToTopButton';
// FIX: Added .tsx extension to fix module resolution error
import AppRoutes from './AppRoutes.tsx';

function App() {
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isStudentArea = location.pathname.startsWith('/student');
  const isSessionRoute = location.pathname.startsWith('/session');
  
  const showLayout = !isAdminRoute && !isStudentArea && !isSessionRoute;

  return (
    <div className="flex flex-col min-h-screen bg-muted/50" dir="rtl">
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