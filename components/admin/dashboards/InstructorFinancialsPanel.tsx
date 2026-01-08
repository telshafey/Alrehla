
import React, { useState, useMemo } from 'react';
import { DollarSign, Save, AlertCircle, PieChart, Landmark, TrendingUp } from 'lucide-react';
import AdminSection from '../AdminSection';
import { Button } from '../../ui/Button';
import FormField from '../../ui/FormField';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { useInstructorMutations } from '../../../hooks/mutations/useInstructorMutations';
import type { Instructor } from '../../../lib/database.types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import { formatDate } from '../../../utils/helpers';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';

interface InstructorFinancialsPanelProps {
    bookings: any[];
    serviceOrders: any[];
    payouts: any[];
    instructor: Instructor;
}

const InstructorFinancialsPanel: React.FC<InstructorFinancialsPanelProps> = ({ bookings, serviceOrders, payouts, instructor }) => {
    const { requestProfileUpdate } = useInstructorMutations();
    
    // حساب الأرباح بناءً على صافي ربح المدرب المخزن وقت الطلب
    const financialSummary = useMemo(() => {
        // 1. أرباح الباقات (الجلسات المكتملة)
        const bookingEarnings = bookings
            .filter(b => b.status === 'مكتمل')
            .map(b => {
                // نستخدم سعر المدرب المخصص للباقة، أو سعره للجلسة مضروباً في عدد الجلسات
                const netAmount = instructor.package_rates?.[b.package_id] || (instructor.rate_per_session * 1); // تبسيط
                return { ...b, netAmount };
            });

        // 2. أرباح الخدمات الإضافية
        const serviceEarnings = serviceOrders
            .filter(o => o.status === 'مكتمل')
            .map(o => {
                const netAmount = instructor.service_rates?.[o.service_id] || (o.total * 0.7);
                return { ...o, netAmount };
            });

        const totalEarned = [...bookingEarnings, ...serviceEarnings].reduce((sum, item) => sum + item.netAmount, 0);
        const totalPaid = payouts.reduce((sum, p) => sum + p.amount, 0);

        return {
            totalEarned,
            totalPaid,
            outstanding: totalEarned - totalPaid,
            recentItems: [...bookingEarnings, ...serviceEarnings]
                .sort((a, b) => new Date(b.created_at || b.booking_date).getTime() - new Date(a.created_at || a.booking_date).getTime())
                .slice(0, 5)
        };
    }, [bookings, serviceOrders, payouts, instructor]);

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-t-4 border-t-green-500">
                    <CardHeader className="pb-2 text-xs font-bold text-muted-foreground uppercase">إجمالي مستحقاتك المكتسبة</CardHeader>
                    <CardContent>
                        <p className="text-3xl font-black text-foreground">{financialSummary.totalEarned.toLocaleString()} ج.م</p>
                    </CardContent>
                </Card>
                <Card className="border-t-4 border-t-blue-500">
                    <CardHeader className="pb-2 text-xs font-bold text-muted-foreground uppercase">إجمالي ما تم تحويله لك</CardHeader>
                    <CardContent>
                        <p className="text-3xl font-black text-foreground">{financialSummary.totalPaid.toLocaleString()} ج.م</p>
                    </CardContent>
                </Card>
                <Card className="border-t-4 border-t-primary bg-primary/5">
                    <CardHeader className="pb-2 text-xs font-bold text-primary uppercase">الرصيد المتاح للتحويل (الآن)</CardHeader>
                    <CardContent>
                        <p className="text-3xl font-black text-primary">{financialSummary.outstanding.toLocaleString()} ج.م</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AdminSection title="آخر المعاملات المالية (صافي أرباحك)" icon={<TrendingUp />}>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>الخدمة / الطالب</TableHead>
                                    <TableHead>التاريخ</TableHead>
                                    <TableHead className="text-left">ربحك الصافي</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {financialSummary.recentItems.map((item, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>
                                            <p className="font-bold text-xs">{item.package_name || item.details?.serviceName}</p>
                                            <p className="text-[10px] text-muted-foreground">{item.child_profiles?.name}</p>
                                        </TableCell>
                                        <TableCell className="text-[10px]">{formatDate(item.booking_date || item.created_at)}</TableCell>
                                        <TableCell className="text-left font-bold text-green-600">{item.netAmount} ج.م</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </AdminSection>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Landmark /> تعليمات صرف المستحقات</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-xl text-blue-800 text-sm">
                            <ul className="list-disc list-inside space-y-2">
                                <li>تتم مراجعة الجلسات المكتملة في نهاية كل شهر ميلادي.</li>
                                <li>يتم تحويل المستحقات عبر <strong>Instapay</strong> أو <strong>فودافون كاش</strong> في أول 5 أيام من الشهر التالي.</li>
                                <li>تأكد من أن بياناتك المالية محدثة في قسم الإعدادات.</li>
                            </ul>
                        </div>
                        <Button variant="outline" className="w-full" icon={<PieChart />}>طلب كشف حساب تفصيلي (PDF)</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default InstructorFinancialsPanel;
