import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useUserAccountData } from '../hooks/queries.ts';
import { User, ShoppingBag, Heart, Users, Bell } from 'lucide-react';
import PageLoader from '../components/ui/PageLoader.tsx';
import DashboardPanel from '../components/account/DashboardPanel.tsx';
import OrdersPanel from '../components/account/OrdersPanel.tsx';
import FamilyPanel from '../components/account/FamilyPanel.tsx';
import ProfilePanel from '../components/account/ProfilePanel.tsx';
import AuthForm from '../components/auth/AuthForm.tsx';
import DemoLogins from '../components/auth/DemoLogins.tsx';
import PaymentModal from '../components/PaymentModal.tsx';

type Tab = 'dashboard' | 'orders' | 'family' | 'profile' | 'notifications';

const AccountPage: React.FC = () => {
    const { currentUser, isLoggedIn, signOut, loading: authLoading } = useAuth();
    const { data, isLoading: dataLoading, refetch } = useUserAccountData();
    const location = useLocation();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [paymentItem, setPaymentItem] = useState<{ id: string; type: 'order' | 'booking' | 'subscription' } | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    useEffect(() => {
        if (location.state?.defaultTab) {
            setActiveTab(location.state.defaultTab);
        }
    }, [location.state]);

    if (authLoading) {
        return <PageLoader text="جاري التحقق..." />;
    }

    if (!isLoggedIn) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    <AuthForm />
                    <DemoLogins />
                </div>
            </div>
        );
    }

    if (dataLoading) {
        return <PageLoader text="جاري تحميل بيانات حسابك..." />;
    }
    
    if (!currentUser) return null; // Should not happen if logged in

    const { userOrders = [], userBookings = [], userSubscriptions = [] } = data || {};

    const unifiedItems = [
        ...userOrders.map(o => ({ id: o.id, type: 'order' as const, date: o.order_date, summary: o.item_summary, total: o.total, status: o.status, details: o.details, child_id: o.child_id })),
        ...userBookings.map(b => ({ id: b.id, type: 'booking' as const, date: b.created_at, summary: b.package_name, total: b.total, status: b.status, details: null, child_id: b.child_id }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const upcomingSessions = userBookings.filter(b => b.status === 'مؤكد' && new Date(b.booking_date) >= new Date(new Date().setDate(new Date().getDate() - 1)));
    const activeSubscriptions = userSubscriptions.filter(s => s.status === 'active');

    const handlePay = (item: { id: string; type: 'order' | 'booking' | 'subscription' }) => {
        setPaymentItem(item);
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSuccess = () => {
        setIsPaymentModalOpen(false);
        refetch(); // Refetch data after successful payment
        navigate('/payment-status?status=success_review');
    };

    const tabs = [
        { id: 'dashboard', label: 'لوحة التحكم', icon: <User size={18} /> },
        { id: 'orders', label: 'الطلبات والحجوزات', icon: <ShoppingBag size={18} /> },
        ...(currentUser.role === 'guardian' ? [{ id: 'family', label: 'المركز العائلي', icon: <Users size={18} /> }] : []),
        { id: 'profile', label: 'الملف الشخصي', icon: <Heart size={18} /> },
    ];

    return (
       <>
         <PaymentModal 
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            onSuccess={handlePaymentSuccess}
            item={paymentItem}
         />
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                <aside className="lg:col-span-1 lg:sticky top-24">
                    <div className="bg-white p-4 rounded-2xl shadow-lg">
                        <nav className="flex flex-row lg:flex-col gap-2">
                           {tabs.map(tab => (
                               <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={`flex items-center gap-3 w-full text-right p-3 rounded-lg font-semibold transition-colors ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
                                   {tab.icon}
                                   <span>{tab.label}</span>
                               </button>
                           ))}
                        </nav>
                    </div>
                </aside>

                <div className="lg:col-span-3">
                    {activeTab === 'dashboard' && <DashboardPanel currentUser={currentUser} unifiedItems={unifiedItems} upcomingSessions={upcomingSessions} activeSubscriptions={activeSubscriptions} onNavigateTab={(tab) => setActiveTab(tab as Tab)} />}
                    {activeTab === 'orders' && <OrdersPanel unifiedItems={unifiedItems} onPay={handlePay} />}
                    {activeTab === 'family' && currentUser.role === 'guardian' && <FamilyPanel />}
                    {activeTab === 'profile' && <ProfilePanel currentUser={currentUser} onSignOut={signOut} />}
                </div>
            </div>
        </div>
       </>
    );
};

export default AccountPage;
