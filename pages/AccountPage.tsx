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
import { Card } from '../components/ui/card';

type AccountTab = 'dashboard' | 'myLibrary' | 'familyCenter' | 'settings' | 'notifications';

const AccountPage: React.FC = () => {
    const { isLoggedIn, loading: authLoading, hasAdminAccess, currentUser } = useAuth();
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

    if (isLoggedIn && currentUser?.role === 'student') {
        return <Navigate to="/student/dashboard" replace />;
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
        { key: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard className="h-5 w-5" /> },
        { key: 'myLibrary', label: 'مكتبتي', icon: <BookOpen className="h-5 w-5" /> },
        { key: 'familyCenter', label: 'المركز العائلي', icon: <Users className="h-5 w-5" /> },
        { key: 'settings', label: 'الإعدادات', icon: <Settings className="h-5 w-5" /> },
        { key: 'notifications', label: 'الإشعارات', icon: <Bell className="h-5 w-5" /> },
    ];

    return (
        <>
        <PaymentModal isOpen={!!paymentItem} onClose={() => setPaymentItem(null)} onSuccess={handlePaymentSuccess} item={paymentItem} />
        <div className="bg-muted/50 py-12 sm:py-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1 sticky top-24">
                        <Card>
                            <ul className="space-y-1 p-2">
                                {tabs.map(tab => (
                                    <li key={tab.key}>
                                        <button 
                                            onClick={() => setActiveTab(tab.key as AccountTab)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-md text-right font-semibold transition-colors text-sm ${activeTab === tab.key ? 'bg-muted text-primary' : 'text-foreground hover:bg-muted/50'}`}
                                        >
                                            {tab.icon}
                                            {tab.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </Card>
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