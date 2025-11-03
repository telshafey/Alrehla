import React, { useMemo } from 'react';
import { useRevenueStreams } from '../../../hooks/queries/admin/useFinancialsQueries';
import PageLoader from '../../../components/ui/PageLoader';
import ErrorState from '../../../components/ui/ErrorState';
import { ShoppingBag, BookOpen, Star, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import BarChart from '../../../components/admin/BarChart';

const RevenueStreamsPage: React.FC = () => {
    const { data, isLoading, error, refetch } = useRevenueStreams();

    const revenueStreams = useMemo(() => {
        if (!data) return null;
        
        const { orders, bookings, serviceOrders, subscriptions } = data;

        const enhaLakOrders = orders.filter((o: any) => o.status === 'تم التسليم' || o.status === 'مكتمل');
        const cwBookings = bookings.filter((b: any) => b.status === 'مكتمل');
        const cwServices = serviceOrders.filter((so: any) => so.status === 'مكتمل');
        const activeSubscriptions = subscriptions.filter((s: any) => s.status === 'active');

        const enhaLakRevenue = enhaLakOrders.reduce((sum: number, o: any) => sum + o.total, 0);
        const bookingRevenue = cwBookings.reduce((sum: number, b: any) => sum + b.total, 0);
        const serviceRevenue = cwServices.reduce((sum: number, so: any) => sum + so.total, 0);
        const subscriptionRevenue = activeSubscriptions.reduce((sum: number, s: any) => s.total, 0);

        return {
            enhaLak: { revenue: enhaLakRevenue, count: enhaLakOrders.length },
            bookings: { revenue: bookingRevenue, count: cwBookings.length },
            services: { revenue: serviceRevenue, count: cwServices.length },
            subscriptions: { revenue: subscriptionRevenue, count: activeSubscriptions.length },
        };
    }, [data]);

    if (isLoading) return <PageLoader />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;
    if (!revenueStreams) return null;
    
    const chartData = [
        { label: 'إنها لك', value: revenueStreams.enhaLak.revenue, color: '#ec4899' },
        { label: 'الباقات', value: revenueStreams.bookings.revenue, color: '#8b5cf6' },
        { label: 'الخدمات', value: revenueStreams.services.revenue, color: '#3b82f6' },
        { label: 'الاشتراكات', value: revenueStreams.subscriptions.revenue, color: '#f59e0b' },
    ];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><ShoppingBag className="text-pink-500" />إيرادات "إنها لك"</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">{revenueStreams.enhaLak.revenue.toLocaleString()} ج.م</p><p className="text-xs text-muted-foreground">من {revenueStreams.enhaLak.count} طلب</p></CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><BookOpen className="text-purple-500"/>إيرادات الباقات</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">{revenueStreams.bookings.revenue.toLocaleString()} ج.م</p><p className="text-xs text-muted-foreground">من {revenueStreams.bookings.count} حجز</p></CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Sparkles className="text-blue-500"/>إيرادات الخدمات</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">{revenueStreams.services.revenue.toLocaleString()} ج.م</p><p className="text-xs text-muted-foreground">من {revenueStreams.services.count} طلب خدمة</p></CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Star className="text-yellow-500"/>إيرادات الاشتراكات</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">{revenueStreams.subscriptions.revenue.toLocaleString()} ج.م</p><p className="text-xs text-muted-foreground">من {revenueStreams.subscriptions.count} اشتراك</p></CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader><CardTitle>توزيع الإيرادات حسب المصدر</CardTitle></CardHeader>
                <CardContent>
                    <BarChart title="إجمالي الإيرادات" data={chartData} />
                </CardContent>
            </Card>
        </div>
    );
};

export default RevenueStreamsPage;
