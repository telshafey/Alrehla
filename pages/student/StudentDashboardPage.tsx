import React from 'react';
import { useStudentDashboardData } from '../../hooks/queries/user/useJourneyDataQuery';
import PageLoader from '../../components/ui/PageLoader';
import StudentJourneyCard from '../../components/student/StudentJourneyCard';
import { BookOpen, ShoppingBag, Star } from 'lucide-react';
import { getStatusColor, getSubStatusColor, getSubStatusText, formatDate } from '../../utils/helpers';
import type { Order, Subscription } from '../../lib/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

const OrderCard: React.FC<{ order: Order }> = React.memo(({ order }) => (
    <Card className="transition-transform transform hover:-translate-y-1">
        <CardContent className="pt-6 flex justify-between items-center">
            <div>
                <p className="font-bold text-foreground">{order.item_summary}</p>
                <p className="text-sm text-muted-foreground">{formatDate(order.order_date)}</p>
            </div>
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(order.status)}`}>
                {order.status}
            </span>
        </CardContent>
    </Card>
));

const SubscriptionCard: React.FC<{ subscription: Subscription }> = React.memo(({ subscription }) => (
    <Card className="transition-transform transform hover:-translate-y-1">
         <CardContent className="pt-6 flex justify-between items-center">
            <div>
                <p className="font-bold text-foreground">صندوق الرحلة الشهري</p>
                <p className="text-sm text-muted-foreground">التجديد القادم: {formatDate(subscription.next_renewal_date)}</p>
            </div>
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${getSubStatusColor(subscription.status)}`}>
                {getSubStatusText(subscription.status)}
            </span>
        </CardContent>
    </Card>
));

const EmptyStateCard: React.FC<{ title: string; message: string }> = ({ title, message }) => (
    <Card>
        <CardContent className="text-center py-10">
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </CardContent>
    </Card>
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
            <section>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3 mb-6">
                    <BookOpen /> رحلاتي التدريبية
                </h2>
                {displayJourneys.length > 0 ? (
                    <div className="space-y-6">
                        {displayJourneys.map((journey: any) => (
                            <StudentJourneyCard key={journey.id} journey={journey} />
                        ))}
                    </div>
                ) : (
                    <EmptyStateCard 
                        title="لا توجد رحلات نشطة"
                        message="عندما يتم حجز باقة لك، ستظهر رحلتك هنا."
                    />
                )}
            </section>
            
            <section>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3 mb-6">
                    <Star /> اشتراكات صندوق الرحلة
                </h2>
                {subscriptions.length > 0 ? (
                     <div className="space-y-4">
                        {subscriptions.map((sub: Subscription) => (
                            <SubscriptionCard key={sub.id} subscription={sub} />
                        ))}
                    </div>
                ) : (
                     <EmptyStateCard 
                        title="لا توجد اشتراكات"
                        message="عندما يتم الاشتراك لك في صندوق الرحلة، سيظهر هنا."
                    />
                )}
            </section>

            <section>
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3 mb-6">
                    <ShoppingBag /> قصصي المخصصة
                </h2>
                {orders.length > 0 ? (
                    <div className="space-y-4">
                        {orders.map((order: Order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                ) : (
                    <EmptyStateCard 
                        title="لا توجد قصص مخصصة"
                        message="عندما يتم طلب قصة مخصصة لك، ستظهر هنا."
                    />
                )}
            </section>
        </div>
    );
};

export default StudentDashboardPage;