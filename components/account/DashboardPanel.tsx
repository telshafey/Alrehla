import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ShoppingBag, Star, ArrowLeft, Video, BookOpen } from 'lucide-react';
// FIX: Corrected import path
import { useUserAccountData } from '../../hooks/userQueries';
import { formatDate } from '../../utils/helpers';
import type { Order, Subscription, CreativeWritingBooking } from '../../lib/database.types';

type AccountTab = 'dashboard' | 'myLibrary' | 'settings' | 'notifications';

interface DashboardPanelProps {
    onNavigateTab: (tab: AccountTab) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; onClick?: () => void; }> = ({ title, value, icon, onClick }) => (
    <button onClick={onClick} className="bg-gray-50 p-6 rounded-2xl border flex items-center gap-4 w-full text-right hover:border-blue-300 hover:bg-white transition-colors">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-3xl font-extrabold text-gray-800">{value}</p>
            <p className="text-sm font-medium text-gray-500">{title}</p>
        </div>
    </button>
);


const DashboardPanel: React.FC<DashboardPanelProps> = ({ onNavigateTab }) => {
    const { data } = useUserAccountData();
    const { userOrders: orders = [], userSubscriptions: subscriptions = [], userBookings: bookings = [] } = data || {};

    const unifiedItems = useMemo(() => {
        const allItems = [
            ...orders.map((o: Order) => ({ id: o.id, type: 'order' as const, date: o.order_date, summary: o.item_summary, total: o.total, status: o.status })),
            ...subscriptions.map((s: Subscription) => ({ id: s.id, type: 'subscription' as const, date: s.start_date, summary: `اشتراك: ${s.child_name}` })),
            ...bookings.map((b: CreativeWritingBooking) => ({ id: b.id, type: 'booking' as const, date: b.booking_date, summary: b.package_name }))
        ];
        return allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [orders, subscriptions, bookings]);
    
    const upcomingSessions = useMemo(() => 
        bookings
            .filter((b: any) => b.status === 'مؤكد' && new Date(b.booking_date) >= new Date())
            .sort((a: any, b: any) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime()),
    [bookings]);

    const activeSubscriptions = useMemo(() => 
        subscriptions.filter((s: Subscription) => s.status === 'active'),
    [subscriptions]);
    
    const recentItems = unifiedItems.slice(0, 3);

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="الطلبات والحجوزات" value={unifiedItems.length} icon={<ShoppingBag />} onClick={() => onNavigateTab('myLibrary')} />
                <StatCard title="الاشتراكات النشطة" value={activeSubscriptions.length} icon={<Star />} onClick={() => onNavigateTab('myLibrary')} />
                <StatCard title="الجلسات القادمة" value={upcomingSessions.length} icon={<Calendar />} onClick={() => onNavigateTab('myLibrary')} />
            </div>

            {/* Upcoming Sessions */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">الجلسات القادمة</h3>
                {upcomingSessions.length > 0 ? (
                    <div className="space-y-4">
                        {upcomingSessions.slice(0, 3).map((session: any) => (
                            <div key={session.id} className="p-4 bg-blue-50 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                <div>
                                    <p className="font-bold text-blue-800">{session.package_name}</p>
                                    <p className="text-sm text-gray-600">{formatDate(session.booking_date)} - {session.booking_time}</p>
                                </div>
                                <Link to={`/session/${session.session_id}`} className="flex items-center justify-center gap-2 bg-green-500 text-white text-sm font-bold py-2 px-4 rounded-full hover:bg-green-600 transition-colors">
                                    <Video size={16}/>
                                    <span>انضم الآن</span>
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-4">لا توجد جلسات قادمة محجوزة.</p>
                )}
            </div>

             {/* Recent Activities */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">أحدث الأنشطة</h3>
                {recentItems.length > 0 ? (
                     <div className="space-y-3">
                        {recentItems.map(item => (
                            <div key={`${item.type}-${item.id}`} className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                                <div className="flex-shrink-0">
                                     {item.type === 'order' ? <ShoppingBag size={20} className="text-blue-500"/> : item.type === 'subscription' ? <Star size={20} className="text-orange-500"/> : <BookOpen size={20} className="text-purple-500" />}
                                </div>
                                <div className="flex-grow">
                                    <p className="font-semibold text-gray-700">{item.summary}</p>
                                    <p className="text-xs text-gray-500">{formatDate(item.date)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-4">لا توجد أنشطة مسجلة بعد.</p>
                )}
                 <div className="mt-4 text-center">
                    <button onClick={() => onNavigateTab('myLibrary')} className="text-sm font-semibold text-blue-600 hover:underline flex items-center justify-center gap-1 mx-auto">
                        <span>عرض كل الأنشطة</span>
                        <ArrowLeft size={16}/>
                    </button>
                 </div>
            </div>
        </div>
    );
};

export default DashboardPanel;