
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ShoppingBag, Star, Users, ArrowLeft, Video, CheckCircle } from 'lucide-react';
import type { UserProfile } from '../../contexts/AuthContext.tsx';
import type { ChildProfile, Subscription, CreativeWritingBooking } from '../../lib/database.types.ts';
import { formatDate } from '../../utils/helpers.ts';

// Re-defining UnifiedItem here to avoid complex imports.
interface UnifiedItem {
    id: string;
    type: 'order' | 'booking' | 'subscription';
    date: string;
    summary: string | null;
}

// Sub-component for stat cards
const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-gray-50 p-6 rounded-2xl border flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-3xl font-extrabold text-gray-800">{value}</p>
            <p className="text-sm font-medium text-gray-500">{title}</p>
        </div>
    </div>
);


interface DashboardPanelProps {
    currentUser: UserProfile;
    unifiedItems: UnifiedItem[];
    upcomingSessions: CreativeWritingBooking[];
    activeSubscriptions: Subscription[];
    onNavigateTab: (tab: string) => void;
}

const DashboardPanel: React.FC<DashboardPanelProps> = ({ 
    currentUser, 
    unifiedItems,
    upcomingSessions,
    activeSubscriptions,
    onNavigateTab
}) => {
    
    const recentItems = unifiedItems.slice(0, 3);

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="الطلبات والحجوزات" value={unifiedItems.length} icon={<ShoppingBag />} />
                <StatCard title="الاشتراكات النشطة" value={activeSubscriptions.length} icon={<Star />} />
                <StatCard title="الجلسات القادمة" value={upcomingSessions.length} icon={<Calendar />} />
            </div>

            {/* Upcoming Sessions */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">الجلسات القادمة</h3>
                {upcomingSessions.length > 0 ? (
                    <div className="space-y-4">
                        {upcomingSessions.slice(0, 3).map(session => (
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
                                     {item.type === 'order' ? <ShoppingBag size={20} className="text-blue-500"/> : <CheckCircle size={20} className="text-purple-500"/>}
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
                    <button onClick={() => onNavigateTab('orders')} className="text-sm font-semibold text-blue-600 hover:underline flex items-center justify-center gap-1">
                        <span>عرض كل الطلبات</span>
                        <ArrowLeft size={16}/>
                    </button>
                 </div>
            </div>
        </div>
    );
};

export default DashboardPanel;
