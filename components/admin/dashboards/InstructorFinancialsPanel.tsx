import React, { useState, useMemo } from 'react';
import { DollarSign, Save, AlertCircle } from 'lucide-react';
import AdminSection from '../AdminSection';
import { Button } from '../../ui/Button';
import FormField from '../../ui/FormField';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { useInstructorMutations } from '../../../hooks/mutations/useInstructorMutations';
import type { Instructor } from '../../../lib/database.types';

interface InstructorFinancialsPanelProps {
    bookings: any[];
    instructor: Instructor;
}

const InstructorFinancialsPanel: React.FC<InstructorFinancialsPanelProps> = ({ bookings, instructor }) => {
    const { requestProfileUpdate } = useInstructorMutations();
    const [proposedRate, setProposedRate] = useState(instructor.rate_per_session?.toString() || '');
    const [justification, setJustification] = useState('');
    
    const completedSessionsThisMonth = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        return bookings.reduce((acc, booking) => {
            const monthSessions = booking.sessions?.filter((s: any) => {
                const sessionDate = new Date(s.session_date);
                return s.status === 'completed' && sessionDate >= startOfMonth;
            }).length || 0;
            return acc + monthSessions;
        }, 0);
    }, [bookings]);
    
    const currentMonthBalance = completedSessionsThisMonth * (instructor.rate_per_session || 0);

    const isRateUpdatePending = instructor.profile_update_status === 'pending' && instructor.pending_profile_data?.updates?.rate_per_session;

    const financials = {
        lastPayout: 1800,
        lastPayoutDate: '2023-08-01',
    };
    
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
                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                            <p className="font-semibold text-gray-600">الرصيد الحالي المستحق (هذا الشهر)</p>
                            <p className="text-2xl font-bold text-green-600">{currentMonthBalance} ج.م</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-left">بناءً على {completedSessionsThisMonth} جلسة مكتملة</p>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <p className="font-semibold text-gray-600">آخر دفعة</p>
                        <div>
                            <p className="font-bold text-right">{financials.lastPayout} ج.م</p>
                            <p className="text-xs text-gray-500 text-right">في تاريخ {new Date(financials.lastPayoutDate).toLocaleDateString('ar-EG')}</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 text-center pt-2">يتم تحويل المستحقات شهرياً بناءً على عدد الجلسات المكتملة.</p>
                </div>
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