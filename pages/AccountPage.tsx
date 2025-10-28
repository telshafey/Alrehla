import React, { useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PageLoader from '../components/ui/PageLoader';
import { AuthForm } from '../components/auth/AuthForm';
import DemoLogins from '../components/auth/DemoLogins';
import DashboardPanel from '../components/account/DashboardPanel';
import MyLibraryPanel from '../components/account/MyLibraryPanel';
import AccountSettingsPanel from '../components/account/AccountSettingsPanel';
import NotificationPanel from '../components/account/NotificationPanel';
import FamilyCenterPanel from '../components/account/FamilyCenterPanel'; // Import the new panel
import PaymentModal from '../components/PaymentModal';
import { LayoutDashboard, BookOpen, Settings, Bell, Users } from 'lucide-react';

type AccountTab = 'dashboard' | 'myLibrary' | 'familyCenter' | 'settings' | 'notifications';

const AccountPage: React.FC = () => {
    const { isLoggedIn, loading: authLoading, hasAdminAccess } = useAuth();
    const location = useLocation();
    
    const defaultTab = (location.state as any)?.defaultTab || 'dashboard';
    const [activeTab, setActiveTab] = useState<AccountTab>(defaultTab);

    const [paymentItem, setPaymentItem] = useState<{ id: string; type: 'order' | 'subscription' | 'booking' } | null>(null);

    const handlePaymentSuccess = () => {
        setPaymentItem(null);
        // Data will be refetched by the panels themselves.
    }

    if (authLoading) {
        return <PageLoader text="جاري تحميل صفحة الحساب..." />;
    }

    if (isLoggedIn && hasAdminAccess) {
        return <Navigate to="/admin" replace />;
    }

    if (!isLoggedIn) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
                    <AuthForm mode="login" />
                    <DemoLogins />
                </div>
            </div>
        );
    }
    
    const tabs = [
        { key: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard /> },
        { key: 'myLibrary', label: 'مكتبتي', icon: <BookOpen /> },
        { key: 'familyCenter', label: 'المركز العائلي', icon: <Users /> },
        { key: 'settings', label: 'الإعدادات', icon: <Settings /> },
        { key: 'notifications', label: 'الإشعارات', icon: <Bell /> },
    ];

    return (
        <>
        <PaymentModal isOpen={!!paymentItem} onClose={() => setPaymentItem(null)} onSuccess={handlePaymentSuccess} item={paymentItem} />
        <div className="bg-gray-50 py-12 sm:py-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1 sticky top-24">
                        <div className="bg-white p-4 rounded-2xl shadow-lg">
                            <ul className="space-y-2">
                                {tabs.map(tab => (
                                    <li key={tab.key}>
                                        <button 
                                            onClick={() => setActiveTab(tab.key as AccountTab)}
                                            className={`w-full flex items-center gap-3 p-4 rounded-lg text-right font-semibold transition-colors ${activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            {tab.icon}
                                            {tab.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {activeTab === 'dashboard' && <DashboardPanel onNavigateTab={setActiveTab} />}
                        {activeTab === 'myLibrary' && <MyLibraryPanel onPay={setPaymentItem} />}
                        {activeTab === 'familyCenter' && <FamilyCenterPanel />}
                        {activeTab === 'settings' && <AccountSettingsPanel />}
                        {activeTab === 'notifications' && <NotificationPanel />}
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default AccountPage;
