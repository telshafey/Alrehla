
import React, { useMemo } from 'react';
import { useFinancialsOverview } from '../../../hooks/queries/admin/useFinancialsQueries';
import PageLoader from '../../../components/ui/PageLoader';
import ErrorState from '../../../components/ui/ErrorState';
import StatCard from '../../../components/admin/StatCard';
import { DollarSign, TrendingUp, TrendingDown, Clock, AlertCircle } from 'lucide-react';
import BarChart from '../../../components/admin/BarChart';
import LineChart from '../../../components/admin/LineChart';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';

const FinancialOverviewPage: React.FC = () => {
    const { data, isLoading, error, refetch } = useFinancialsOverview();

    const stats = useMemo(() => {
        if (!data) return null;

        const { orders, bookings, serviceOrders, subscriptions, payouts, subscriptionPlans } = data;
        
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // 1. Recognized Revenue (Completed/Delivered)
        const revenueEnhaLak = orders
            .filter((o: any) => o.status === 'تم التسليم' || o.status === 'مكتمل')
            .reduce((sum: number, o: any) => sum + o.total, 0);
            
        const revenueCreativeWriting = bookings
            .filter((b: any) => b.status === 'مكتمل')
            .reduce((sum: number, b: any) => sum + b.total, 0) + 
            serviceOrders
            .filter((o: any) => o.status === 'مكتمل')
            .reduce((sum: number, o: any) => sum + o.total, 0);
            
        const totalRevenue = revenueEnhaLak + revenueCreativeWriting;

        // 2. Pending Revenue (New/Processing/Pending Payment)
        const pendingRevenueEnhaLak = orders
            .filter((o: any) => ['بانتظار الدفع', 'بانتظار المراجعة', 'قيد التجهيز', 'قيد التنفيذ', 'يحتاج مراجعة', 'تم الشحن'].includes(o.status))
            .reduce((sum: number, o: any) => sum + o.total, 0);

        const pendingRevenueCreativeWriting = bookings
            .filter((b: any) => ['بانتظار الدفع', 'مؤكد'].includes(b.status))
            .reduce((sum: number, b: any) => sum + b.total, 0) +
            serviceOrders
            .filter((o: any) => ['بانتظار المراجعة', 'قيد التنفيذ'].includes(o.status))
            .reduce((sum: number, o: any) => sum + o.total, 0);

        const totalPendingRevenue = pendingRevenueEnhaLak + pendingRevenueCreativeWriting;

        // 3. MRR
        const mrr = subscriptions.filter((s: any) => s.status === 'active').reduce((sum: number, s: any) => {
             const plan = subscriptionPlans.find((p: any) => p.name === s.plan_name);
             return sum + (plan?.price_per_month || 0);
        }, 0);
        
        // 4. Payouts
        const payoutsThisMonth = payouts.filter((p: any) => new Date(p.payout_date) >= startOfMonth).reduce((sum: number, p: any) => sum + p.amount, 0);

        const revenueOverTimeData = [
            { label: 'Jan', value: 5000 },
            { label: 'Feb', value: 7000 },
            { label: 'Mar', value: 6500 },
            { label: 'Apr', value: 8200 },
            { label: 'May', value: 9500 },
            { label: 'Jun', value: 11000 },
        ]; // Mock data for chart

        return {
            totalRevenue,
            totalPendingRevenue,
            mrr,
            payoutsThisMonth,
            revenueEnhaLak,
            revenueCreativeWriting,
            revenueOverTimeData,
        };
    }, [data]);

    if (isLoading) return <PageLoader text="جاري تحميل البيانات المالية..." />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;
    if (!stats) return null;

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="الأرباح المحققة (مكتملة)" 
                    value={`${stats.totalRevenue.toLocaleString()} ج.م`} 
                    icon={<DollarSign className="text-green-600" />} 
                />
                <StatCard 
                    title="أرباح متوقعة (قيد التنفيذ)" 
                    value={`${stats.totalPendingRevenue.toLocaleString()} ج.م`} 
                    icon={<Clock className="text-orange-500" />} 
                />
                <StatCard 
                    title="الإيرادات الشهرية المتكررة (MRR)" 
                    value={`${stats.mrr.toLocaleString()} ج.م`} 
                    icon={<TrendingUp className="text-blue-500" />} 
                />
                <StatCard 
                    title="مدفوعات للمدربين (هذا الشهر)" 
                    value={`${stats.payoutsThisMonth.toLocaleString()} ج.م`} 
                    icon={<TrendingDown className="text-red-500" />} 
                />
            </div>
            
            {stats.totalPendingRevenue > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="text-orange-600 w-5 h-5 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-orange-800 text-sm">تنبيه مالي</h4>
                        <p className="text-sm text-orange-700 mt-1">
                            لديك طلبات بقيمة <span className="font-bold">{stats.totalPendingRevenue.toLocaleString()} ج.م</span> قيد الانتظار أو التنفيذ. قم بمراجعة صفحة الطلبات وتغيير الحالة إلى "مكتمل" أو "تم التسليم" ليتم احتسابها ضمن الأرباح المحققة.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle>نمو الإيرادات</CardTitle></CardHeader>
                    <CardContent>
                        <LineChart data={stats.revenueOverTimeData} title="الإيرادات الشهرية (محاكاة)" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>مصادر الدخل (المحققة)</CardTitle></CardHeader>
                    <CardContent>
                        <BarChart title="توزيع الإيرادات" data={[
                            { label: 'إنها لك', value: stats.revenueEnhaLak, color: 'hsl(var(--primary))' },
                            { label: 'بداية الرحلة', value: stats.revenueCreativeWriting, color: 'hsl(var(--secondary))' },
                        ]}/>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default FinancialOverviewPage;
