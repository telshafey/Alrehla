
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PageLoader from '../components/ui/PageLoader';
import { AuthForm } from '../components/auth/AuthForm';
import DashboardPanel from '../components/account/DashboardPanel';
import AccountSettingsPanel from '../components/account/AccountSettingsPanel';
import NotificationPanel from '../components/account/NotificationPanel';
import FamilyCenterPanel from '../components/account/FamilyCenterPanel';
import PortfolioPanel from '../components/account/PortfolioPanel';
import MyLibraryPanel from '../components/account/MyLibraryPanel';
import PaymentModal from '../components/PaymentModal';
import { LayoutDashboard, Settings, Bell, Users, GalleryVertical, BookOpen } from 'lucide-react';
import { Card } from '../components/ui/card';

type AccountTab = 'dashboard' | 'myLibrary' | 'portfolio' | 'familyCenter' | 'settings' | 'notifications';

const AccountPage: React.FC = () => {
    const { isLoggedIn, loading: authLoading, hasAdminAccess, currentUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    
    const defaultTab = (location.state as any)?.defaultTab || 'dashboard';
    const [activeTab, setActiveTab] = useState<AccountTab>(defaultTab);
    const [paymentItem, setPaymentItem] = useState<{ id: string; type: 'order' | 'subscription' | 'booking' } | null>(null);

    // توجيه ذكي وفوري بناءً على الرتبة (نتخطى وضع التحميل إذا كنا متأكدين من الرتبة)
    useEffect(() => {
        if (isLoggedIn && currentUser) {
            const role = currentUser.role;
            if (role === 'student') {
                navigate('/student/dashboard', { replace: true });
            } else if (['super_admin', 'general_supervisor', 'instructor', 'enha_lak_supervisor', 'creative_writing_supervisor', 'content_editor', 'support_agent'].includes(role)) {
                navigate('/admin', { replace: true });
            }
        }
    }, [isLoggedIn, currentUser, navigate]);

    if (authLoading) {
        return <PageLoader text="جاري التحقق من صلاحيات الدخول..." />;
    }

    if (!isLoggedIn) {
        return (
            <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
                <div className="w-full max-w-md">
                    <AuthForm mode="login" />
                </div>
            </div>
        );
    }

    const availableTabs = [
        { key: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard className="h-5 w-5" /> },
        { key: 'myLibrary', label: 'مكتبتي (الطلبات)', icon: <BookOpen className="h-5 w-5" /> },
        { key: 'familyCenter', label: 'المركز العائلي', icon: <Users className="h-5 w-5" /> },
        { key: 'portfolio', label: 'معرض أعمالي', icon: <GalleryVertical className="h-5 w-5" /> },
        { key: 'settings', label: 'الإعدادات', icon: <Settings className="h-5 w-5" /> },
        { key: 'notifications', label: 'الإشعارات', icon: <Bell className="h-5 w-5" /> },
    ];

    return (
        <>
            <PaymentModal isOpen={!!paymentItem} onClose={() => setPaymentItem(null)} onSuccess={() => setPaymentItem(null)} item={paymentItem} />
            <div className="bg-muted/50 py-12 sm:py-16 animate-fadeIn">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                        <div className="lg:col-span-1 sticky top-24">
                            <Card>
                                <ul className="space-y-1 p-2">
                                    {availableTabs.map(tab => (
                                        <li key={tab.key}>
                                            <button 
                                                onClick={() => setActiveTab(tab.key as AccountTab)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-md text-right font-semibold transition-colors text-sm ${activeTab === tab.key ? 'bg-muted text-primary border-r-4 border-primary' : 'text-foreground hover:bg-muted/50'}`}
                                            >
                                                {tab.icon}
                                                {tab.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        </div>
                        <div className="lg:col-span-3">
                            {activeTab === 'dashboard' && <DashboardPanel onNavigateTab={setActiveTab} />}
                            {activeTab === 'myLibrary' && <MyLibraryPanel onPay={(item) => setPaymentItem(item)} />}
                            {activeTab === 'portfolio' && <PortfolioPanel />}
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
