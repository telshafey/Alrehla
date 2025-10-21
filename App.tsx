import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.tsx';

// Layout Components
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import ScrollToTop from './components/ScrollToTop.tsx';
import AdminLayout from './components/admin/AdminLayout.tsx';
import StudentLayout from './components/student/StudentLayout.tsx';
import ProtectedRoute from './components/auth/ProtectedRoute.tsx';

// Page Components
import PortalPage from './pages/PortalPage.tsx';
import AboutPage from './pages/AboutPage.tsx';
import EnhaLakPage from './pages/EnhaLakPage.tsx';
import PersonalizedStoriesPage from './pages/PersonalizedStoriesPage.tsx';
import OrderPage from './pages/OrderPage.tsx';
import SubscriptionPage from './pages/SubscriptionPage.tsx';
import CreativeWritingPage from './pages/CreativeWritingPage.tsx';
import CreativeWritingAboutPage from './pages/CreativeWritingAboutPage.tsx';
import CreativeWritingCurriculumPage from './pages/CreativeWritingCurriculumPage.tsx';
import CreativeWritingInstructorsPage from './pages/CreativeWritingInstructorsPage.tsx';
import CreativeWritingBookingPage from './pages/CreativeWritingBookingPage.tsx';
import InstructorProfilePage from './pages/InstructorProfilePage.tsx';
import SessionPage from './pages/SessionPage.tsx';
import AccountPage from './pages/AccountPage.tsx';
import StudentLoginPage from './pages/StudentLoginPage.tsx';
import StudentDashboardPage from './pages/student/StudentDashboardPage.tsx';
import CheckoutPage from './pages/CheckoutPage.tsx';
import PaymentStatusPage from './pages/PaymentStatusPage.tsx';
import SupportPage from './pages/SupportPage.tsx';
import JoinUsPage from './pages/JoinUsPage.tsx';
import BlogPage from './pages/BlogPage.tsx';
import BlogPostPage from './pages/BlogPostPage.tsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.tsx';
import TermsOfUsePage from './pages/TermsOfUsePage.tsx';

// AI Chat Components
import FloatingAiButton from './components/FloatingAiButton.tsx';
import { ChatWidget } from './components/ChatWidget.tsx';

const App: React.FC = () => {
    const location = useLocation();
    const { hasAdminAccess } = useAuth();
    const [isChatOpen, setIsChatOpen] = useState(false);

    const isAdminRoute = location.pathname.startsWith('/admin');
    const isStudentRoute = location.pathname.startsWith('/student/dashboard');
    const isFullPage = location.pathname.startsWith('/session') || location.pathname.startsWith('/student/login');
    const showChatbot = !isAdminRoute && !isStudentRoute && !isFullPage;

    if (isFullPage) {
        return (
            <Routes>
                <Route path="/session/:sessionId" element={<ProtectedRoute><SessionPage /></ProtectedRoute>} />
                <Route path="/student/login" element={<StudentLoginPage />} />
            </Routes>
        );
    }
    
    if (isAdminRoute) {
        return (
            <ProtectedRoute adminOnly>
                <AdminLayout />
            </ProtectedRoute>
        );
    }
    
    if (isStudentRoute) {
        return (
             <ProtectedRoute studentOnly>
                <StudentLayout>
                    <Routes>
                        <Route path="/student/dashboard" element={<StudentDashboardPage />} />
                    </Routes>
                </StudentLayout>
            </ProtectedRoute>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
            <ScrollToTop />
            <Header />
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<PortalPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/enha-lak" element={<EnhaLakPage />} />
                    <Route path="/enha-lak/store" element={<PersonalizedStoriesPage />} />
                    <Route path="/enha-lak/order/:productKey" element={<ProtectedRoute><OrderPage /></ProtectedRoute>} />
                    <Route path="/enha-lak/subscription" element={<SubscriptionPage />} />
                    <Route path="/creative-writing" element={<CreativeWritingPage />} />
                    <Route path="/creative-writing/about" element={<CreativeWritingAboutPage />} />
                    <Route path="/creative-writing/curriculum" element={<CreativeWritingCurriculumPage />} />
                    <Route path="/creative-writing/instructors" element={<CreativeWritingInstructorsPage />} />
                    <Route path="/creative-writing/booking" element={<CreativeWritingBookingPage />} />
                    <Route path="/instructor/:slug" element={<InstructorProfilePage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                    <Route path="/payment-status" element={<PaymentStatusPage />} />
                    <Route path="/support" element={<SupportPage />} />
                    <Route path="/join-us" element={<JoinUsPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/blog/:slug" element={<BlogPostPage />} />
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                    <Route path="/terms" element={<TermsOfUsePage />} />
                </Routes>
            </main>
            <Footer />
            {showChatbot && (
                <>
                    <FloatingAiButton onClick={() => setIsChatOpen(true)} isChatOpen={isChatOpen} />
                    <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
                </>
            )}
        </div>
    );
};

export default App;
