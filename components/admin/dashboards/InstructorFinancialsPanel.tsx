import React from 'react';
import { DollarSign } from 'lucide-react';
import AdminSection from '../AdminSection';
import { Button } from '../../ui/Button';

// FIX: Implemented the InstructorFinancialsPanel with mock data to display financial info.
const InstructorFinancialsPanel: React.FC<{ bookings: any[], instructorRate: number }> = ({ bookings, instructorRate }) => {
    const completedSessions = bookings.reduce((acc, booking) => {
        return acc + (booking.sessions?.filter((s: any) => s.status === 'completed').length || 0);
    }, 0);

    // Mock data for demonstration
    const financials = {
        currentBalance: completedSessions * instructorRate,
        lastPayout: 1800,
        lastPayoutDate: '2023-08-01',
    };

    return (
        <AdminSection title="الملخص المالي" icon={<DollarSign />}>
            <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-600">الرصيد الحالي المستحق</p>
                    <p className="text-2xl font-bold text-green-600">{financials.currentBalance} ج.م</p>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-600">آخر دفعة</p>
                    <div>
                        <p className="font-bold text-right">{financials.lastPayout} ج.م</p>
                        <p className="text-xs text-gray-500 text-right">في تاريخ {new Date(financials.lastPayoutDate).toLocaleDateString('ar-EG')}</p>
                    </div>
                </div>
                <div className="pt-4 border-t">
                     <Button variant="outline" className="w-full">
                        عرض سجل الدفعات
                    </Button>
                </div>
                 <p className="text-xs text-gray-500 text-center">يتم تحويل المستحقات في اليوم الخامس من كل شهر ميلادي.</p>
            </div>
        </AdminSection>
    );
};

export default InstructorFinancialsPanel;