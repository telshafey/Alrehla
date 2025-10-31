import React, { useState, useMemo } from 'react';
import { DollarSign, Save, AlertCircle } from 'lucide-react';
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
    const [proposedRate, setProposedRate] = useState(instructor.rate_per_session?.toString() || '');
    const [justification, setJustification] = useState('');
    
    const currentMonthEarnings = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const completedSessionsThisMonth = bookings.reduce((acc, booking) => {
            const monthSessions = booking.sessions?.filter((s: any) => {
                const sessionDate = new Date(s.session_date);
                return s.status === 'completed' && sessionDate >= startOfMonth;
            }).length || 0;
            return acc + monthSessions;
        }, 0);

        const sessionEarnings = completedSessionsThisMonth * (instructor.rate_per_session || 0);

        const serviceEarnings = serviceOrders.filter(o => o.status === 'مكتمل' && new Date(o.created_at) >= startOfMonth)
            .reduce((acc, order) => acc + (order.total * 0.7), 0); // Assuming 70% commission

        return {
            sessionEarnings,
            serviceEarnings,
            total: sessionEarnings + serviceEarnings,
            completedSessionsCount: completedSessionsThisMonth,
            completedServicesCount: serviceOrders.filter(o => o.status === 'مكتمل' && new Date(o.created_at) >= startOfMonth).length
        };
    }, [bookings, serviceOrders, instructor.rate_per_session]);


    const isRateUpdatePending = instructor.profile_update_status === 'pending' && instructor.pending_profile_data?.updates?.rate_per_session;
    
    const handleRateChangeRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        await requestProfileUpdate.mutateAsync({
            instructorId: instructor.id,
            updates: { rate_per_session: parseFloat(proposedRate) },
            justification
        });
        setJustification('');
    };

    return (
        <div className="space-y-8">
            <AdminSection title="الملخص المالي" icon={<DollarSign />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">الرصيد الحالي المستحق (هذا الشهر)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-green-600">{currentMonthEarnings.total} ج.م</p>
                            <div className="text-xs text-gray-500 mt-2 space-y-1">
                                <p>من {currentMonthEarnings.completedSessionsCount} جلسة مكتملة: {currentMonthEarnings.sessionEarnings} ج.م</p>
                                <p>من {currentMonthEarnings.completedServicesCount} خدمة مكتملة: {currentMonthEarnings.serviceEarnings} ج.م</p>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                         <CardHeader>
                            <CardTitle className="text-lg">سجل التعاملات المالية</CardTitle>
                        </CardHeader>
                         <CardContent className="max-h-60 overflow-y-auto">
                           <Table>
                               <TableHeader>
                                   <TableRow>
                                        <TableHead>التاريخ</TableHead>
                                        <TableHead>المبلغ</TableHead>
                                        <TableHead>التفاصيل</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payouts.map(payout => (
                                        <TableRow key={payout.id}>
                                            <TableCell className="text-xs">{formatDate(payout.payout_date)}</TableCell>
                                            <TableCell className="font-bold text-sm">{payout.amount} ج.م</TableCell>
                                            <TableCell className="text-xs">{payout.details}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                         </CardContent>
                    </Card>
                </div>
                <p className="text-xs text-gray-500 text-center pt-4">يتم تحويل المستحقات شهرياً بناءً على عدد الجلسات والخدمات المكتملة.</p>
            </AdminSection>
            
            <AdminSection title="إدارة سعر الجلسة" icon={<DollarSign />}>
                {isRateUpdatePending ? (
                    <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
                         <div className="flex"><div className="flex-shrink-0"><AlertCircle className="h-5 w-5" /></div><div className="ml-3"><p className="text-sm font-bold">لديك طلب تعديل سعر قيد المراجعة حاليًا.</p></div></div>
                    </div>
                ) : (
                    <form onSubmit={handleRateChangeRequest} className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="font-semibold text-gray-600">السعر الحالي المعتمد للجلسة</p>
                            <p className="text-2xl font-bold">{instructor.rate_per_session || 0} ج.م</p>
                        </div>
                        <FormField label="السعر الجديد المقترح" htmlFor="proposedRate">
                            <Input id="proposedRate" type="number" value={proposedRate} onChange={(e) => setProposedRate(e.target.value)} required />
                        </FormField>
                         <FormField label="مبررات طلب التعديل (سيتم إرسالها للإدارة)" htmlFor="justification">
                             <Textarea id="justification" value={justification} onChange={(e) => setJustification(e.target.value)} rows={3} placeholder="مثال: أقترح تعديل السعر ليتناسب مع خبرتي المتزايدة وأسعار السوق الحالية." required />
                        </FormField>
                        <div className="flex justify-end">
                            <Button type="submit" loading={requestProfileUpdate.isPending} icon={<Save />}>
                                إرسال طلب التعديل
                            </Button>
                        </div>
                    </form>
                )}
            </AdminSection>
        </div>
    );
};

export default InstructorFinancialsPanel;