
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import PageLoader from './components/ui/PageLoader';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ProfileCompletionGuard from './components/auth/ProfileCompletionGuard';
import NotFoundPage from './components/shared/NotFoundPage';

// --- Core Pages ---
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
import PublisherPublicProfilePage from './pages/PublisherPublicProfilePage';

// --- Auth Pages ---
import AdminLoginPage from './pages/admin/AdminLoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import StudentLayout from './components/student/StudentLayout';
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import StudentPortfolioPage from './pages/student/StudentPortfolioPage';

// --- Feature Pages ---
const EnhaLakPage = lazy(() => import('./pages/EnhaLakPage'));
const PersonalizedStoriesPage = lazy(() => import('./pages/PersonalizedStoriesPage'));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'));
const OrderPage = lazy(() => import('./pages/OrderPage'));

const CreativeWritingPage = lazy(() => import('./pages/CreativeWritingPage'));
const CreativeWritingAboutPage = lazy(() => import('./pages/CreativeWritingAboutPage'));
const CreativeWritingInstructorsPage = lazy(() => import('./pages/CreativeWritingInstructorsPage'));
const InstructorProfilePage = lazy(() => import('./pages/InstructorProfilePage'));
const CreativeWritingBookingPage = lazy(() => import('./pages/CreativeWritingBookingPage'));
const CreativeWritingPackagesPage = lazy(() => import('./pages/CreativeWritingPackagesPage'));
const CreativeWritingServicesPage = lazy(() => import('./pages/CreativeWritingServicesPage'));
const ServiceProvidersPage = lazy(() => import('./pages/creative-writing/ServiceProvidersPage'));
const ServiceOrderPage = lazy(() => import('./pages/creative-writing/ServiceOrderPage'));
const TrainingJourneyPage = lazy(() => import('./pages/TrainingJourneyPage'));
const SessionPage = lazy(() => import('./pages/SessionPage'));

// New Instructor Pages
const SessionReportPage = lazy(() => import('./pages/admin/instructor/SessionReportPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));

const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));

const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));

const AppRoutes: React.FC = () => {
    return (
        <Suspense fallback={<PageLoader />}>
            <ProfileCompletionGuard>
                <Routes>
                    <Route path="/" element={<PortalPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/support" element={<SupportPage />} />
                    <Route path="/join-us" element={<JoinUsPage />} />
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                    <Route path="/terms" element={<TermsOfUsePage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/blog/:slug" element={<BlogPostPage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/publisher/:slug" element={<PublisherPublicProfilePage />} />
                    
                    {/* Password Reset */}
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    
                    {/* Dedicated Admin Login */}
                    <Route path="/admin/login" element={<AdminLoginPage />} />

                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                    <Route path="/payment-status" element={<PaymentStatusPage />} />
                    <Route path="/enha-lak" element={<EnhaLakPage />} />
                    <Route path="/enha-lak/store" element={<PersonalizedStoriesPage />} />
                    <Route path="/enha-lak/subscription" element={<SubscriptionPage />} />
                    <Route path="/enha-lak/order/:productKey" element={<OrderPage />} />
                    <Route path="/creative-writing" element={<CreativeWritingPage />} />
                    <Route path="/creative-writing/about" element={<CreativeWritingAboutPage />} />
                    <Route path="/creative-writing/instructors" element={<CreativeWritingInstructorsPage />} />
                    <Route path="/creative-writing/packages" element={<CreativeWritingPackagesPage />} />
                    <Route path="/creative-writing/services" element={<CreativeWritingServicesPage />} />
                    <Route path="/creative-writing/services/:serviceId/providers" element={<ServiceProvidersPage />} />
                    <Route path="/creative-writing/services/:serviceId/order" element={<ServiceOrderPage />} />
                    <Route path="/instructor/:slug" element={<InstructorProfilePage />} />
                    <Route path="/creative-writing/booking" element={<ProtectedRoute><CreativeWritingBookingPage /></ProtectedRoute>} />
                    
                    {/* صفحة الإشعارات الجديدة */}
                    <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

                    <Route path="/student" element={<ProtectedRoute studentOnly><StudentLayout /></ProtectedRoute>}>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<StudentDashboardPage />} />
                        <Route path="portfolio" element={<StudentPortfolioPage />} />
                    </Route>

                    <Route path="/journey/:journeyId" element={<ProtectedRoute><TrainingJourneyPage /></ProtectedRoute>} />
                    <Route path="/session/:sessionId" element={<ProtectedRoute><SessionPage /></ProtectedRoute>} />
                    
                    <Route path="/admin/session-report/:sessionId" element={<ProtectedRoute adminOnly><SessionReportPage /></ProtectedRoute>} />

                    <Route path="/admin/*" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>} />
                    
                    {/* Fallback to 404 Page */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </ProfileCompletionGuard>
        </Suspense>
    );
};

export default AppRoutes;
