import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import PageLoader from './components/ui/PageLoader';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Lazy-loaded components. All paths now point to the correct structure.
const AdminLayout = React.lazy(() => import('./components/admin/AdminLayout'));
const StudentLayout = React.lazy(() => import('./components/student/StudentLayout'));

// Public Pages
const PortalPage = React.lazy(() => import('./pages/PortalPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const BlogPage = React.lazy(() => import('./pages/BlogPage'));
const BlogPostPage = React.lazy(() => import('./pages/BlogPostPage'));
const JoinUsPage = React.lazy(() => import('./pages/JoinUsPage'));
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage'));
const SupportPage = React.lazy(() => import('./pages/SupportPage'));
const TermsOfUsePage = React.lazy(() => import('./pages/TermsOfUsePage'));

// Enha Lak Feature Pages
const EnhaLakPage = React.lazy(() => import('./pages/EnhaLakPage'));
const PersonalizedStoriesPage = React.lazy(() => import('./pages/PersonalizedStoriesPage'));
const SubscriptionPage = React.lazy(() => import('./pages/SubscriptionPage'));
const OrderPage = React.lazy(() => import('./pages/OrderPage'));

// Creative Writing Feature Pages
const CreativeWritingPage = React.lazy(() => import('./pages/CreativeWritingPage'));
const CreativeWritingAboutPage = React.lazy(() => import('./pages/CreativeWritingAboutPage'));
const CreativeWritingCurriculumPage = React.lazy(() => import('./pages/CreativeWritingCurriculumPage'));
const CreativeWritingInstructorsPage = React.lazy(() => import('./pages/CreativeWritingInstructorsPage'));
const InstructorProfilePage = React.lazy(() => import('./pages/InstructorProfilePage'));
const CreativeWritingBookingPage = React.lazy(() => import('./pages/CreativeWritingBookingPage'));

// User-centric Features
const AccountPage = React.lazy(() => import('./pages/AccountPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const CartPage = React.lazy(() => import('./pages/CartPage'));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage'));
const PaymentStatusPage = React.lazy(() => import('./pages/PaymentStatusPage'));
const SessionPage = React.lazy(() => import('./pages/SessionPage'));
const TrainingJourneyPage = React.lazy(() => import('./pages/TrainingJourneyPage'));
const StudentLoginPage = React.lazy(() => import('./pages/StudentLoginPage'));
const StudentDashboardPage = React.lazy(() => import('./pages/student/StudentDashboardPage'));

// New Admin Product Detail Page
const AdminProductDetailPage = React.lazy(() => import('./pages/admin/AdminProductDetailPage'));


const AppRoutes: React.FC = () => {
    return (
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
                }>
                    {/* Nested route for product detail page */}
                    <Route path="personalized-products/new" element={<AdminProductDetailPage />} />
                    <Route path="personalized-products/:id" element={<AdminProductDetailPage />} />
                </Route>
            </Routes>
        </Suspense>
    );
}

export default AppRoutes;