
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import PageLoader from './components/ui/PageLoader';
import ProtectedRoute from './components/auth/ProtectedRoute';

// --- Core Pages (Eagerly Loaded for LCP) ---
import PortalPage from './pages/PortalPage';
import AboutPage from './pages/AboutPage';
import SupportPage from './pages/SupportPage';
import JoinUsPage from './pages/JoinUsPage';
import AccountPage from './pages/AccountPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentStatusPage from './pages/PaymentStatusPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfUsePage from './pages/TermsOfUsePage';

// Import StudentLayout directly to prevent chunk loading errors
import StudentLayout from './components/student/StudentLayout';

// --- Feature Pages (Lazy Loaded) ---

// Enha Lak (Story Store)
const EnhaLakPage = lazy(() => import('./pages/EnhaLakPage'));
const PersonalizedStoriesPage = lazy(() => import('./pages/PersonalizedStoriesPage'));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'));
const OrderPage = lazy(() => import('./pages/OrderPage'));

// Creative Writing (Start of the Journey)
const CreativeWritingPage = lazy(() => import('./pages/CreativeWritingPage'));
const CreativeWritingAboutPage = lazy(() => import('./pages/CreativeWritingAboutPage'));
const CreativeWritingCurriculumPage = lazy(() => import('./pages/CreativeWritingCurriculumPage'));
const CreativeWritingInstructorsPage = lazy(() => import('./pages/CreativeWritingInstructorsPage'));
const InstructorProfilePage = lazy(() => import('./pages/InstructorProfilePage'));
const CreativeWritingBookingPage = lazy(() => import('./pages/CreativeWritingBookingPage'));
const CreativeWritingPackagesPage = lazy(() => import('./pages/CreativeWritingPackagesPage'));
const CreativeWritingServicesPage = lazy(() => import('./pages/CreativeWritingServicesPage'));
const ServiceProvidersPage = lazy(() => import('./pages/creative-writing/ServiceProvidersPage'));
const ServiceOrderPage = lazy(() => import('./pages/creative-writing/ServiceOrderPage'));
const TrainingJourneyPage = lazy(() => import('./pages/TrainingJourneyPage'));
const SessionPage = lazy(() => import('./pages/SessionPage'));

// Blog
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));

// Protected Layouts & Areas
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));

// Lazy load student pages content
const StudentDashboardPage = lazy(() => import('./pages/student/StudentDashboardPage'));
const StudentPortfolioPage = lazy(() => import('./pages/student/StudentPortfolioPage'));


const AppRoutes: React.FC = () => {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* ================= Public Routes ================= */}
                <Route path="/" element={<PortalPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/join-us" element={<JoinUsPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsOfUsePage />} />
                
                {/* Blog */}
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />

                {/* Authentication */}
                <Route path="/account" element={<AccountPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* E-commerce & Checkout */}
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                <Route path="/payment-status" element={<PaymentStatusPage />} />
                
                {/* ================= Feature Routes ================= */}

                {/* Enha Lak (Stories) */}
                <Route path="/enha-lak" element={<EnhaLakPage />} />
                <Route path="/enha-lak/store" element={<PersonalizedStoriesPage />} />
                <Route path="/enha-lak/subscription" element={<SubscriptionPage />} />
                <Route path="/enha-lak/order/:productKey" element={<OrderPage />} />

                {/* Creative Writing (Academy) */}
                <Route path="/creative-writing" element={<CreativeWritingPage />} />
                <Route path="/creative-writing/about" element={<CreativeWritingAboutPage />} />
                <Route path="/creative-writing/curriculum" element={<CreativeWritingCurriculumPage />} />
                <Route path="/creative-writing/instructors" element={<CreativeWritingInstructorsPage />} />
                <Route path="/creative-writing/packages" element={<CreativeWritingPackagesPage />} />
                
                {/* Creative Writing Services & Booking */}
                <Route path="/creative-writing/services" element={<CreativeWritingServicesPage />} />
                <Route path="/creative-writing/services/:serviceId/providers" element={<ServiceProvidersPage />} />
                <Route path="/creative-writing/services/:serviceId/order" element={<ServiceOrderPage />} />
                
                <Route path="/instructor/:slug" element={<InstructorProfilePage />} />
                <Route path="/creative-writing/booking" element={<ProtectedRoute><CreativeWritingBookingPage /></ProtectedRoute>} />

                {/* ================= Protected Routes ================= */}
                
                {/* Student Portal - Eager Layout, Lazy Pages */}
                <Route path="/student" element={<ProtectedRoute studentOnly><StudentLayout /></ProtectedRoute>}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<StudentDashboardPage />} />
                    <Route path="portfolio" element={<StudentPortfolioPage />} />
                </Route>

                {/* Active Sessions & Journeys */}
                <Route path="/journey/:journeyId" element={<ProtectedRoute><TrainingJourneyPage /></ProtectedRoute>} />
                <Route path="/session/:sessionId" element={<ProtectedRoute><SessionPage /></ProtectedRoute>} />

                {/* Admin Dashboard */}
                <Route path="/admin/*" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;
