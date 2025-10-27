import React, { useState, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import PageLoader from './components/ui/PageLoader';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ChatWidget } from './components/ChatWidget';
import FloatingAiButton from './components/FloatingAiButton';
import WhatsAppButton from './components/WhatsAppButton';
import ScrollToTopButton from './components/ScrollToTopButton';

// Lazy-loaded components
const AdminLayout = React.lazy(() => import('./components/admin/AdminLayout'));
const StudentLayout = React.lazy(() => import('./components/student/StudentLayout'));
const PortalPage = React.lazy(() => import('./pages/PortalPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const AccountPage = React.lazy(() => import('./pages/AccountPage'));
const BlogPage = React.lazy(() => import('./pages/BlogPage'));
const BlogPostPage = React.lazy(() => import('./pages/BlogPostPage'));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage'));
const CreativeWritingAboutPage = React.lazy(() => import('./pages/CreativeWritingAboutPage'));
const CreativeWritingBookingPage = React.lazy(() => import('./pages/CreativeWritingBookingPage'));
const CreativeWritingCurriculumPage = React.lazy(() => import('./pages/CreativeWritingCurriculumPage'));
const CreativeWritingInstructorsPage = React.lazy(() => import('./pages/CreativeWritingInstructorsPage'));
const CreativeWritingPage = React.lazy(() => import('./pages/CreativeWritingPage'));
const EnhaLakPage = React.lazy(() => import('./pages/EnhaLakPage'));
const InstructorProfilePage = React.lazy(() => import('./pages/InstructorProfilePage'));
const JoinUsPage = React.lazy(() => import('./pages/JoinUsPage'));
const OrderPage = React.lazy(() => import('./pages/OrderPage'));
const PaymentStatusPage = React.lazy(() => import('./pages/PaymentStatusPage'));
const PersonalizedStoriesPage = React.lazy(() => import('./pages/PersonalizedStoriesPage'));
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage'));
const SessionPage = React.lazy(() => import('./pages/SessionPage'));
const TrainingJourneyPage = React.lazy(() => import('./pages/TrainingJourneyPage'));
const StudentDashboardPage = React.lazy(() => import('./pages/student/StudentDashboardPage'));
const StudentLoginPage = React.lazy(() => import('./pages/StudentLoginPage'));
const SubscriptionPage = React.lazy(() => import('./pages/SubscriptionPage'));
const SupportPage = React.lazy(() => import('./pages/SupportPage'));
const TermsOfUsePage = React.lazy(() => import('./pages/TermsOfUsePage'));
const GeminiPage = React.lazy(() => import('./pages/GeminiPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const CartPage = React.lazy(() => import('./pages/CartPage'));


function App() {
  const location = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isStudentArea = location.pathname.startsWith('/student');
  const isSessionRoute = location.pathname.startsWith('/session');
  
  const showLayout = !isAdminRoute && !isStudentArea && !isSessionRoute;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">
      {showLayout && <Header />}
      <ScrollToTop />
      <main className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PortalPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/join-us" element={<JoinUsPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfUsePage />} />
            <Route path="/gemini-test" element={<GeminiPage />} />
            
            {/* Enha Lak Project Routes */}
            <Route path="/enha-lak" element={<EnhaLakPage />} />
            <Route path="/enha-lak/store" element={<PersonalizedStoriesPage />} />
            <Route path="/enha-lak/order/:productKey" element={<OrderPage />} />
            <Route path="/enha-lak/subscription" element={<SubscriptionPage />} />

            {/* Creative Writing Project Routes */}
            <Route path="/creative-writing" element={<CreativeWritingPage />} />
            <Route path="/creative-writing/about" element={<CreativeWritingAboutPage />} />
            <Route path="/creative-writing/curriculum" element={<CreativeWritingCurriculumPage />} />
            <Route path="/creative-writing/instructors" element={<CreativeWritingInstructorsPage />} />
            <Route path="/instructor/:slug" element={<InstructorProfilePage />} />
            <Route path="/creative-writing/booking" element={<CreativeWritingBookingPage />} />
            
            {/* User Account & Auth Routes */}
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/payment-status" element={<PaymentStatusPage />} />
            <Route path="/session/:sessionId" element={<ProtectedRoute><SessionPage /></ProtectedRoute>} />
            <Route path="/journey/:journeyId" element={<ProtectedRoute><TrainingJourneyPage /></ProtectedRoute>} />

            {/* Student Routes */}
            <Route path="/student/login" element={<StudentLoginPage />} />
            <Route path="/student/dashboard" element={
              <ProtectedRoute studentOnly>
                <StudentLayout>
                  <StudentDashboardPage />
                </StudentLayout>
              </ProtectedRoute>
            }/>

            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            }/>
          </Routes>
        </Suspense>
      </main>
      {showLayout && <Footer />}
      {showLayout && (
          <>
            <FloatingAiButton onClick={() => setIsChatOpen(true)} isChatOpen={isChatOpen} />
            <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
            <WhatsAppButton />
            <ScrollToTopButton />
          </>
      )}
    </div>
  );
}

export default App;