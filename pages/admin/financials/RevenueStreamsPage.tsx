
import React, { useMemo } from 'react';
import { useRevenueStreams } from '../../../hooks/queries/admin/useFinancialsQueries';
import { useAdminPricingSettings } from '../../../hooks/queries/admin/useAdminSettingsQuery';
import PageLoader from '../../../components/ui/PageLoader';
import ErrorState from '../../../components/ui/ErrorState';
import { ShoppingBag, BookOpen, Star, Wallet, TrendingUp, Landmark } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import BarChart from '../../../components/admin/BarChart';

const RevenueStreamsPage: React.FC = () => {
    const { data, isLoading, error, refetch } = useRevenueStreams();
    const { data: pricingConfig } = useAdminPricingSettings();

    const stats = useMemo(() => {
        if (!data || !pricingConfig) return null;
        
        const { orders, bookings, serviceOrders, subscriptions } = data;

        // حساب إجمالي الدخل المحقق (Gross Revenue)
        const grossTotal = [...orders, ...bookings, ...serviceOrders]
            .filter(o => o.status === 'مكتمل' || o.status === 'تم التسليم')
            .reduce((sum, o) => sum + (o.total || 0), 0);

        // حساب مستحقات المدربين (Instructor Share)
        // المعادلة العكسية: (سعر العميل - الرسوم الثابتة) / نسبة المنصة = صافي المدرب
        const instructorShare = [...bookings, ...serviceOrders]
            .filter(o => o.status === 'مكتمل')
            .reduce((sum, o) => {
                const net = (o.total - pricingConfig.fixed_fee) / pricingConfig.company_percentage;
                return sum + net;
            }, 0);

        // صافي ربح المنصة (Platform Profit)
        const platformProfit = grossTotal - instructorShare;

        return {
            grossTotal,
            instructorShare,
            platformProfit,
            enhaLakTotal: orders.reduce((sum, o) => sum + (o.total || 0), 0),
            cwTotal: (bookings.reduce((sum, b) => sum + (b.total || 0), 0) + serviceOrders.reduce((sum, s) => sum + (s.total || 0), 0))
        };
    }, [data, pricingConfig]);

    if (isLoading) return <PageLoader />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;
    if (!stats) return null;

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* 1. ملخص الأرباح الحقيقي */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Card className="bg-primary text-primary-foreground">
                    <CardHeader className="pb-2 text-xs font-bold uppercase opacity-80">إجمالي التدفق النقدي (Gross)</CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{stats.grossTotal.toLocaleString()} ج.م</div>
                        <p className="text-xs mt-2 opacity-70">إجمالي ما دفعه العملاء للمنصة</p>
                    </CardContent>
                </Card>
                <Card className="border-orange-200 bg-orange-50">
                    <CardHeader className="pb-2 text-xs font-bold uppercase text-orange-800">مستحقات المدربين (صافي)</CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-orange-600">{Math.floor(stats.instructorShare).toLocaleString()} ج.م</div>
                        <p className="text-xs mt-2 text-orange-700">المبالغ الواجب تحويلها للمدربين</p>
                    </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-2 text-xs font-bold uppercase text-green-800">صافي ربح المنصة (Margin)</CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-green-600">{Math.floor(stats.platformProfit).toLocaleString()} ج.m</div>
                        <p className="text-xs mt-2 text-green-700">الربح الصافي بعد خصم حصة المدربين</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp /> تحليل القطاعات</CardTitle></CardHeader>
                    <CardContent>
                        <BarChart title="مقارنة حجم المبيعات" data={[
                            { label: 'إنها لك (قصص)', value: stats.enhaLakTotal, color: '#ec4899' },
                            { label: 'بداية الرحلة (تدريب)', value: stats.cwTotal, color: '#3b82f6' },
                        ]} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Wallet /> كفاءة التسعير</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-4 rounded-xl bg-muted/50 border border-dashed">
                            <p className="text-sm font-bold text-muted-foreground mb-4 text-center">توزيع الجنيه الواحد</p>
                            <div className="flex h-8 w-full rounded-full overflow-hidden shadow-inner border">
                                <div 
                                    className="bg-orange-500 h-full flex items-center justify-center text-[10px] text-white font-bold" 
                                    style={{ width: `${(stats.instructorShare / stats.grossTotal) * 100}%` }}
                                >
                                    للمدرب
                                </div>
                                <div 
                                    className="bg-green-500 h-full flex items-center justify-center text-[10px] text-white font-bold" 
                                    style={{ width: `${(stats.platformProfit / stats.grossTotal) * 100}%` }}
                                >
                                    للمنصة
                                </div>
                            </div>
                            <div className="flex justify-between mt-4 text-xs font-bold">
                                <span className="text-orange-600">حصة المدربين: {((stats.instructorShare / stats.grossTotal) * 100).toFixed(1)}%</span>
                                <span className="text-green-600">هامش ربحك: {((stats.platformProfit / stats.grossTotal) * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg text-blue-800 text-xs leading-relaxed">
                            <Landmark className="shrink-0" size={16} />
                            <p>يتم احتساب هذه النسب بناءً على الرسوم الإدارية ({pricingConfig.fixed_fee} ج.م) ومعامل الضرب ({pricingConfig.company_percentage}) المحدد في الإعدادات.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default RevenueStreamsPage;
