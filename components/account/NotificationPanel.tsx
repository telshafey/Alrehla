

import React from 'react';
import { Bell, ShoppingBag, Calendar, Info } from 'lucide-react';
// FIX: Corrected import path from non-existent queries.ts to userQueries.ts
import { useUserNotifications } from '../../hooks/userQueries';
import PageLoader from '../ui/PageLoader';
import { formatDate } from '../../utils/helpers';

const NotificationIcon: React.FC<{ type: string }> = ({ type }) => {
    switch (type) {
        case 'order': return <ShoppingBag className="w-5 h-5 text-blue-500" />;
        case 'booking': return <Calendar className="w-5 h-5 text-purple-500" />;
        default: return <Info className="w-5 h-5 text-gray-500" />;
    }
};

const NotificationPanel: React.FC = () => {
    const { data: notifications, isLoading, error } = useUserNotifications();

    if (isLoading) {
        return (
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
                <PageLoader text="جاري تحميل الإشعارات..." />
            </div>
        );
    }
    
    if (error) {
        return <div className="text-red-500">{error.message}</div>
    }

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><Bell /> الإشعارات</h2>
            {notifications && notifications.length > 0 ? (
                <div className="space-y-4">
                    {notifications.map((notif: any) => (
                        <div key={notif.id} className={`p-4 flex items-start gap-4 border-r-4 ${notif.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-400'}`}>
                            <div className="flex-shrink-0 mt-1">
                                <NotificationIcon type={notif.type} />
                            </div>
                            <div className="flex-grow">
                                <p className={`text-gray-800 ${!notif.read && 'font-semibold'}`}>{notif.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{formatDate(notif.created_at)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-12">
                    <Bell className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">لا توجد إشعارات جديدة</h3>
                    <p className="mt-1 text-sm text-gray-500">سيتم عرض تحديثات طلباتك وإشعاراتك المهمة هنا.</p>
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;