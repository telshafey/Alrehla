import React from 'react';
import { useStudentDashboardData } from '../../hooks/queries/user/useJourneyDataQuery';
import PageLoader from '../../components/ui/PageLoader';
import StudentJourneyCard from '../../components/student/StudentJourneyCard';
import { BookOpen, ShoppingBag, Star } from 'lucide-react';
import { getStatusColor, getSubStatusColor, getSubStatusText, formatDate } from '../../utils/helpers';
import type { Order, Subscription } from '../../lib/database.types';

// New component for Order Card
const OrderCard: React.FC<{ order: Order }> = ({ order }) => (
    <div className="p-4 border rounded-lg bg-white flex justify-between items-center">
        <div>
            <p className="font-bold text-gray-800">{order.item_summary}</p>
            <p className="text-sm text-gray-500">{formatDate(order.order_date)}</p>
        </div>
        <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(order.status)}`}>
            {order.status}
        </span>
    </div>
);

// New component for Subscription Card
const SubscriptionCard: React.FC<{ subscription: Subscription }> = ({ subscription }) => (
    <div className="p-4 border rounded-lg bg-white flex justify-between items-center">
        <div>
            <p className="font-bold text-gray-800">صندوق الرحلة الشهري</p>
            <p className="text-sm text-gray-500">التجديد القادم: {formatDate(subscription.next_renewal_date)}</p>
        </div>
        <span className={`px-3 py-1 text-xs font-bold rounded-full ${getSubStatusColor(subscription.status)}`}>
            {getSubStatusText(subscription.status)}
        </span>
    </div>
);


const StudentDashboardPage: React.FC = () => {
    const { data, isLoading, error } = useStudentDashboardData();

    if (isLoading) {
        return <PageLoader text="جاري تحميل بياناتك..." />;
    }

    if (error || !data) {
        return <div className="text-center text-red-500 py-20">{error?.message || 'حدث خطأ في تحميل بياناتك.'}</div>;
    }

    const { journeys = [], orders = [], subscriptions = [] } = data;
    const displayJourneys = journeys.filter((j: any) => ['مؤكد', 'مكتمل'].includes(j.status));

    return (
        <div className="space-y-12 animate-fadeIn">
            {/* Journeys Section */}
            <section>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-6">
                    <BookOpen /> رحلاتي التدريبية
                </h2>
                {displayJourneys.length > 0 ? (
                    <div className="space-y-6">
                        {displayJourneys.map((journey: any) => (
                            <StudentJourneyCard key={journey.id} journey={journey} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 px-6 bg-white rounded-2xl shadow-sm border-2 border-dashed">
                        <h3 className="text-lg font-bold text-gray-800">لا توجد رحلات نشطة</h3>
                        <p className="mt-1 text-sm text-gray-500">عندما يتم حجز باقة لك، ستظهر رحلتك هنا.</p>
                    </div>
                )}
            </section>
            
            {/* Subscriptions Section */}
            <section>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-6">
                    <Star /> اشتراكات صندوق الرحلة
                </h2>
                {subscriptions.length > 0 ? (
                     <div className="space-y-4">
                        {subscriptions.map((sub: Subscription) => (
                            <SubscriptionCard key={sub.id} subscription={sub} />
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-10 px-6 bg-white rounded-2xl shadow-sm border-2 border-dashed">
                        <h3 className="text-lg font-bold text-gray-800">لا توجد اشتراكات</h3>
                        <p className="mt-1 text-sm text-gray-500">عندما يتم الاشتراك لك في صندوق الرحلة، سيظهر هنا.</p>
                    </div>
                )}
            </section>

            {/* Orders Section */}
            <section>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-6">
                    <ShoppingBag /> قصصي المخصصة
                </h2>
                {orders.length > 0 ? (
                    <div className="space-y-4">
                        {orders.map((order: Order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 px-6 bg-white rounded-2xl shadow-sm border-2 border-dashed">
                        <h3 className="text-lg font-bold text-gray-800">لا توجد قصص مخصصة</h3>
                        <p className="mt-1 text-sm text-gray-500">عندما يتم طلب قصة مخصصة لك، ستظهر هنا.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default StudentDashboardPage;