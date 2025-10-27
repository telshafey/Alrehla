import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserAccountData } from '../hooks/userQueries';
import { AuthForm } from '../components/auth/AuthForm';
import DemoLogins from '../components/auth/DemoLogins';
import PageLoader from '../components/ui/PageLoader';
import DashboardPanel from '../components/account/DashboardPanel';
import MyLibraryPanel from '../components/account/MyLibraryPanel';
import AccountSettingsPanel from '../components/account/AccountSettingsPanel';
import NotificationPanel from '../components/account/NotificationPanel';
import PaymentModal from '../components/PaymentModal';
import { LayoutDashboard, BookOpen, Settings, Bell } from 'lucide-react';

type AccountTab = 'dashboard' | 'myLibrary' | 'settings' | 'notifications';

const AccountPage: React.FC = () => {
    const { currentUser, isLoggedIn, loading: authLoading, signOut } = useAuth();
    const { data: accountData, isLoading: dataLoading } = useUserAccountData();
    const location = useLocation();
    
    const defaultTab = (location.state as { defaultTab?: AccountTab })?.defaultTab || 'dashboard';
    const [activeTab, setActiveTab] = useState<AccountTab>(defaultTab);

    useEffect(() => {
        const newDefaultTab = (location.state as { defaultTab?: AccountTab })?.defaultTab;
        if (newDefaultTab) {
            setActiveTab(newDefaultTab);
        }
    }, [location.state]);

    const [paymentItem, setPaymentItem] = useState<{ id: string; type: 'order' | 'booking' | 'subscription' } | null>(null);

    const isLoading = authLoading || (isLoggedIn && dataLoading);

    const unifiedItems = useMemo(() => {
        if (!accountData) return [];
        const orders = (accountData.userOrders || []).map(o => ({
            id: o.id,
            type: 'order' as const,
            date: o.order_date,
            summary: o.item_summary,
            total: o.total,
            status: o.status,
        }));
        return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [accountData]);
    
    const upcomingSessions = useMemo(() => {
        if (!accountData?.userBookings) return [];
        return accountData.userBookings.filter(b => b.status === 'مؤكد' && new Date(b.booking_date) >= new Date(new Date().setDate(new Date().getDate() -1)));
    }, [accountData]);

    const activeSubscriptions = useMemo(() => {
        if (!accountData?.userSubscriptions) return [];
        return accountData.userSubscriptions.filter(s => s.status === 'active');
    }, [accountData]);


    if (isLoading) {
        return <PageLoader text="جاري تحميل بيانات حسابك..." />;
    }

    if (!isLoggedIn || !currentUser) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto items-start">
                    <AuthForm mode="login" />
                    <DemoLogins />
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard /> },
        { id: 'myLibrary', label: 'مكتبتي', icon: <BookOpen /> },
        { id: 'settings', label: 'إعدادات الحساب', icon: <Settings /> },
        { id: 'notifications', label: 'الإشعارات', icon: <Bell /> },
    ];

    const handlePaymentSuccess = () => {
        setPaymentItem(null);
    };
    
    return (
        <>
            <PaymentModal 
                isOpen={!!paymentItem}
                onClose={() => setPaymentItem(null)}
                onSuccess={handlePaymentSuccess}
                item={paymentItem}
            />
            <div className="bg-gray-50 py-12">
                <div className="container mx-auto px-4">
                     <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar Navigation */}
                        <aside className="lg:col-span-1">
                            <div className="bg-white p-4 rounded-2xl shadow-lg space-y-2 sticky top-24">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as AccountTab)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-right font-semibold transition-colors ${
                                            activeTab === tab.id
                                                ? 'bg-blue-600 text-white shadow'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        {tab.icon}
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </div>
                        </aside>

                        {/* Main Content */}
                        <main className="lg:col-span-3">
                            {activeTab === 'dashboard' && <DashboardPanel currentUser={currentUser} unifiedItems={unifiedItems} upcomingSessions={upcomingSessions} activeSubscriptions={activeSubscriptions} onNavigateTab={setActiveTab} />}
                            {activeTab === 'myLibrary' && <MyLibraryPanel orders={unifiedItems} subscriptions={accountData?.userSubscriptions || []} bookings={accountData?.userBookings || []} onPay={setPaymentItem} />}
                            {activeTab === 'settings' && <AccountSettingsPanel currentUser={currentUser} onSignOut={signOut} />}
                            {activeTab === 'notifications' && <NotificationPanel />}
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AccountPage;