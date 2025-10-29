import React, { useState, useMemo } from 'react';
import { Star, Calendar, Pause, Play, XCircle } from 'lucide-react';
import { useAdminSubscriptions } from '../../hooks/queries/admin/useAdminEnhaLakQuery';
import { useSubscriptionMutations } from '../../hooks/mutations/useSubscriptionMutations';
import PageLoader from '../../components/ui/PageLoader';
import AdminSection from '../../components/admin/AdminSection';
import { SessionSchedulerModal } from '../../components/admin/SessionSchedulerModal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { formatDate } from '../../utils/helpers';
import type { Subscription } from '../../lib/database.types';

const getStatusInfo = (status: Subscription['status']) => {
    switch (status) {
        case 'active': return { text: 'نشط', color: 'bg-green-100 text-green-800' };
        case 'paused': return { text: 'متوقف مؤقتاً', color: 'bg-yellow-100 text-yellow-800' };
        case 'cancelled': return { text: 'ملغي', color: 'bg-red-100 text-red-800' };
        case 'pending_payment': return { text: 'بانتظار الدفع', color: 'bg-gray-200 text-gray-800' };
        default: return { text: status, color: 'bg-gray-100 text-gray-800' };
    }
};

const AdminSubscriptionsPage: React.FC = () => {
    const { data: subscriptions = [], isLoading, error } = useAdminSubscriptions();
    const { pauseSubscription, cancelSubscription, reactivateSubscription } = useSubscriptionMutations();

    const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSubscriptions = useMemo(() => {
        return subscriptions.filter(sub => 
            sub.user_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            sub.child_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [subscriptions, searchTerm]);

    const handleOpenScheduler = (subscription: Subscription) => {
        setSelectedSubscription(subscription);
        setIsSchedulerOpen(true);
    };

    if (isLoading) return <PageLoader text="جاري تحميل الاشتراكات..." />;
    if (error) return <div className="text-center text-red-500">{(error as Error).message}</div>;

    return (
        <>
            <SessionSchedulerModal 
                isOpen={isSchedulerOpen}
                onClose={() => setIsSchedulerOpen(false)}
                subscription={selectedSubscription}
            />
            <div className="animate-fadeIn space-y-8">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة الاشتراكات</h1>
                <AdminSection title="قائمة الاشتراكات" icon={<Star />}>
                    <div className="mb-6 max-w-lg">
                        <Input 
                            type="search"
                            placeholder="ابحث باسم ولي الأمر أو الطفل..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                           <thead className="border-b-2"><tr>
                                <th className="p-3">ولي الأمر</th>
                                <th className="p-3">الطفل</th>
                                <th className="p-3">الباقة</th>
                                <th className="p-3">التجديد القادم</th>
                                <th className="p-3">الحالة</th>
                                <th className="p-3">إجراءات</th>
                            </tr></thead>
                            <tbody>
                                {filteredSubscriptions.map(sub => {
                                    const statusInfo = getStatusInfo(sub.status);
                                    return (
                                        <tr key={sub.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 font-semibold">{sub.user_name}</td>
                                            <td className="p-3 font-semibold">{sub.child_name}</td>
                                            <td className="p-3 font-semibold text-blue-600">{sub.plan_name}</td>
                                            <td className="p-3 text-sm">{formatDate(sub.next_renewal_date)}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusInfo.color}`}>{statusInfo.text}</span>
                                            </td>
                                            <td className="p-3 flex items-center gap-1 flex-wrap">
                                                <Button variant="outline" size="sm" icon={<Calendar size={14}/>} onClick={() => handleOpenScheduler(sub)}>
                                                    جدولة
                                                </Button>
                                                {sub.status === 'active' && 
                                                    <Button variant="subtle" size="sm" icon={<Pause size={14}/>} onClick={() => pauseSubscription.mutate({ subscriptionId: sub.id })}>
                                                        إيقاف
                                                    </Button>
                                                }
                                                {sub.status === 'paused' && 
                                                    <Button variant="subtle" size="sm" icon={<Play size={14}/>} onClick={() => reactivateSubscription.mutate({ subscriptionId: sub.id })}>
                                                        إعادة تفعيل
                                                    </Button>
                                                }
                                                {sub.status !== 'cancelled' &&
                                                    <Button variant="subtle" size="sm" icon={<XCircle size={14}/>} className="text-red-600 hover:bg-red-100" onClick={() => cancelSubscription.mutate({ subscriptionId: sub.id })}>
                                                        إلغاء
                                                    </Button>
                                                }
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filteredSubscriptions.length === 0 && <p className="text-center py-8 text-gray-500">لا توجد اشتراكات.</p>}
                    </div>
                </AdminSection>
            </div>
        </>
    );
};

export default AdminSubscriptionsPage;