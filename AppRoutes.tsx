import React, { Suspense, lazy } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PageLoader from './components/ui/PageLoader';

// Lazy load pages to improve initial load time
const PortalPage = lazy(() => import('./pages/PortalPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const JoinUsPage = lazy(() => import('./pages/JoinUsPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfUsePage = lazy(() => import('./pages/TermsOfUsePage'));

// "Enha Lak" Section
const EnhaLakPage = lazy(() => import('./pages/EnhaLakPage'));
const PersonalizedStoriesPage = lazy(() => import('./pages/PersonalizedStoriesPage'));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'));
const OrderPage = lazy(() => import('./pages/OrderPage'));

// "Creative Writing" Section
const CreativeWritingPage = lazy(() => import('./pages/CreativeWritingPage'));
const CreativeWritingAboutPage = lazy(() => import('./pages/CreativeWritingAboutPage'));
const CreativeWritingCurriculumPage = lazy(() => import('./pages/CreativeWritingCurriculumPage'));
const CreativeWritingInstructorsPage = lazy(() => import('./pages/CreativeWritingInstructorsPage'));
const CreativeWritingPackagesPage = lazy(() => import('./pages/CreativeWritingPackagesPage'));
const CreativeWritingServicesPage = lazy(() => import('./pages/CreativeWritingServicesPage'));
const InstructorProfilePage = lazy(() => import('./pages/InstructorProfilePage'));
const CreativeWritingBookingPage = lazy(() => import('./pages/CreativeWritingBookingPage'));

// Auth & Account
const AccountPage = lazy(() => import('./pages/AccountPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const StudentLoginPage = lazy(() => import('./pages/StudentLoginPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const PaymentStatusPage = lazy(() => import('./pages/PaymentStatusPage'));

// Protected Areas
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const StudentLayout = lazy(() => import('./components/student/StudentLayout'));
const SessionPage = lazy(() => import('./pages/SessionPage'));
const TrainingJourneyPage = lazy(() => import('./pages/TrainingJourneyPage'));
const StudentDashboardPage = lazy(() => import('./pages/student/StudentDashboardPage'));
const StudentPortfolioPage = lazy(() => import('./pages/student/StudentPortfolioPage'));


const AppRoutes: React.FC = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PortalPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/join-us" element={<JoinUsPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsOfUsePage />} />

      {/* "Enha Lak" Section */}
      <Route path="/enha-lak" element={<EnhaLakPage />} />
      <Route path="/enha-lak/store" element={<PersonalizedStoriesPage />} />
      <Route path="/enha-lak/subscription" element={<SubscriptionPage />} />
      <Route path="/enha-lak/order/:productKey" element={<OrderPage />} />

      {/* "Creative Writing" Section */}
      <Route path="/creative-writing" element={<CreativeWritingPage />} />
      <Route path="/creative-writing/about" element={<CreativeWritingAboutPage />} />
      <Route path="/creative-writing/curriculum" element={<CreativeWritingCurriculumPage />} />
      <Route path="/creative-writing/instructors" element={<CreativeWritingInstructorsPage />} />
      <Route path="/creative-writing/packages" element={<CreativeWritingPackagesPage />} />
      <Route path="/creative-writing/services" element={<CreativeWritingServicesPage />} />
      <Route path="/instructor/:slug" element={<InstructorProfilePage />} />
      
      {/* Auth & Account Routes */}
      <Route path="/account" element={<AccountPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/student-login" element={<StudentLoginPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/payment-status" element={<PaymentStatusPage />} />
      
      {/* Protected Routes */}
      <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
      <Route path="/creative-writing/booking" element={<ProtectedRoute><CreativeWritingBookingPage /></ProtectedRoute>} />
      <Route path="/session/:sessionId" element={<ProtectedRoute><SessionPage /></ProtectedRoute>} />
      <Route path="/journey/:journeyId" element={<ProtectedRoute><TrainingJourneyPage /></ProtectedRoute>} />

      {/* Student Area */}
      <Route
        path="/student"
        element={
          <ProtectedRoute studentOnly>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboardPage />} />
        <Route path="portfolio" element={<StudentPortfolioPage />} />
      </Route>

      {/* Admin Area */}
      <Route path="/admin/*" element={
        <ProtectedRoute adminOnly>
          <AdminLayout />
        </ProtectedRoute>
      } />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;