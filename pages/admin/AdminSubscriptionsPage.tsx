import React, { useState } from 'react';
import { Star, Calendar } from 'lucide-react';
import { useAdminSubscriptions } from '../../hooks/adminQueries';
import type { Subscription } from '../../lib/database.types';
import { formatDate } from '../../utils/helpers';
import AdminSection from '../../components/admin/AdminSection';
import PageLoader from '../../components/ui/PageLoader';
import SessionSchedulerModal from '../../components/admin/SessionSchedulerModal';
import { Button } from '../../components/ui/Button';

const AdminSubscriptionsPage: React.FC = () => {
    const { data: subscriptions = [], isLoading: loading, error } = useAdminSubscriptions();
    const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
    const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);

    const handleOpenScheduler = (sub: Subscription) => {
        setSelectedSub(sub);
        setIsSchedulerOpen(true);
    };

    const getStatusColor = (status: Subscription['status']) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'paused': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    const getStatusText = (status: Subscription['status']) => {
        switch (status) {
            case 'active': return 'نشط';
            case 'paused': return 'متوقف مؤقتاً';
            case 'cancelled': return 'ملغي';
            default: return status;
        }
    }

    if (loading) {
        return <PageLoader text="جاري تحميل الاشتراكات..." />;
    }

    if (error) {
        return <div className="text-center text-red-500 p-4">{error.message}</div>;
    }

    return (
        <>
            <SessionSchedulerModal
                isOpen={isSchedulerOpen}
                onClose={() => setIsSchedulerOpen(false)}
                subscription={selectedSub}
            />
            <div className="animate-fadeIn space-y-12">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة الاشتراكات</h1>
                <AdminSection title="جميع الاشتراكات" icon={<Star />}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="border-b-2 border-gray-200">
                                <tr>
                                    <th className="py-3 px-4 font-semibold text-gray-600">المشترك</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">الطفل</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">تاريخ البدء</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">التجديد القادم</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">الحالة</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscriptions.map(sub => (
                                    <tr key={sub.id} className="border-b hover:bg-gray-50">
                                        <td className="py-4 px-4">{sub.user_name}</td>
                                        <td className="py-4 px-4">{sub.child_name}</td>
                                        <td className="py-4 px-4">{formatDate(sub.start_date)}</td>
                                        <td className="py-4 px-4">{formatDate(sub.next_renewal_date)}</td>
                                        <td className="py-4 px-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(sub.status)}`}>
                                                {getStatusText(sub.status)}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <Button
                                                onClick={() => handleOpenScheduler(sub)}
                                                variant="outline"
                                                size="sm"
                                                icon={<Calendar size={16} />}
                                            >
                                                جدولة الجلسات
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {subscriptions.length === 0 && <p className="text-center py-8 text-gray-500">لا توجد اشتراكات حاليًا.</p>}
                    </div>
                </AdminSection>
            </div>
        </>
    );
};

export default AdminSubscriptionsPage;