
import React from 'react';
import { useStudentDashboardData } from '../../hooks/queries/user/useJourneyDataQuery';
import PageLoader from '../../components/ui/PageLoader';
import StudentJourneyCard from '../../components/student/StudentJourneyCard';
import BadgeDisplay from '../../components/shared/BadgeDisplay';
import { BookOpen, ShoppingBag, Star, Award, AlertCircle } from 'lucide-react';
import { getStatusColor, getSubStatusColor, getSubStatusText, formatDate } from '../../utils/helpers';
import type { Order, Subscription, Badge } from '../../lib/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';

const OrderCard = React.memo(React.forwardRef<HTMLElement, { order: Order }>(({ order }, ref) => (
    <Card ref={ref} className="transition-transform transform hover:-translate-y-1">
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
)));
OrderCard.displayName = "OrderCard";


const SubscriptionCard = React.memo(React.forwardRef<HTMLElement, { subscription: Subscription }>(({ subscription }, ref) => (
    <Card ref={ref} className="transition-transform transform hover:-translate-y-1">
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
)));
SubscriptionCard.displayName = "SubscriptionCard";

const EmptyStateCard = React.forwardRef<HTMLElement, { title: string; message: string }>(({ title, message }, ref) => (
    <Card ref={ref}>
        <CardContent className="text-center py-10">
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </CardContent>
    </Card>
));
EmptyStateCard.displayName = "EmptyStateCard";


const StudentDashboardPage: React.FC = () => {
    const { currentChildProfile } = useAuth();
    const { data, isLoading, error } = useStudentDashboardData();

    if (isLoading) {
        return <PageLoader text="جاري تحميل بياناتك..." />;
    }

    if (!currentChildProfile) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">الحساب غير مرتبط بملف طالب</h2>
                <p className="text-gray-600 max-w-md mt-2">
                    يبدو أن هذا الحساب لم يتم ربطه بملف طالب بشكل صحيح حتى الآن. يرجى الطلب من ولي أمرك مراجعة إعدادات الحساب في "المركز العائلي".
                </p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="text-center py-20 bg-red-50 rounded-xl border border-red-100 m-4">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-700 font-semibold">حدث خطأ في تحميل بياناتك.</p>
                <p className="text-sm text-red-500 mt-1">{error?.message}</p>
            </div>
        );
    }

    const { journeys = [], orders = [], subscriptions = [], badges = [] } = data;
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
                    <Award /> إنجازاتي
                </h2>
                {badges.length > 0 ? (
                    <Card>
                        <CardContent className="pt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {(badges as Badge[]).map(badge => (
                                <BadgeDisplay key={badge.id} badge={badge} />
                            ))}
                        </CardContent>
                    </Card>
                ) : (
                     <EmptyStateCard 
                        title="لم تحصل على شارات بعد"
                        message="مع كل إنجاز تحققه في رحلتك، ستظهر شاراتك هنا."
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
