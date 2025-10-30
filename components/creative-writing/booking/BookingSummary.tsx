import React from 'react';
import { User, Package, UserCheck, Calendar, CreditCard } from 'lucide-react';
import { Button } from '../../ui/Button';
import { formatDate } from '../../../utils/helpers';
import type { CreativeWritingPackage, Instructor } from '../../../lib/database.types';

interface BookingSummaryProps {
    childName: string | null;
    pkg: CreativeWritingPackage | null;
    instructor: Instructor | null;
    dateTime: { date: Date, time: string } | null;
    onSubmit: () => void;
    isSubmitting: boolean;
    isConfirmStep: boolean;
}

const SummaryRow: React.FC<{ icon: React.ReactNode, label: string, value: string | null }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 text-sm">
        <div className="flex-shrink-0 text-gray-400 mt-1">{icon}</div>
        <div>
            <p className="font-semibold text-gray-500">{label}</p>
            <p className="font-bold text-gray-800">{value || '...'}</p>
        </div>
    </div>
);


const BookingSummary: React.FC<BookingSummaryProps> = ({
    childName,
    pkg,
    instructor,
    dateTime,
    onSubmit,
    isSubmitting,
    isConfirmStep
}) => {
    
    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border">
            <h2 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b">ملخص الحجز</h2>
            
            <div className="space-y-4">
                <SummaryRow icon={<User size={16}/>} label="الطالب" value={childName || null} />
                <SummaryRow icon={<Package size={16}/>} label="الباقة" value={pkg?.name || null} />
                <SummaryRow icon={<UserCheck size={16}/>} label="المدرب" value={instructor?.name || null} />
                <SummaryRow 
                    icon={<Calendar size={16}/>} 
                    label="الموعد" 
                    value={dateTime ? `${formatDate(dateTime.date.toISOString())}, ${dateTime.time}` : null} 
                />
            </div>
            
            {pkg && (
                <div className="mt-6 pt-4 border-t">
                    <div className="flex justify-between items-center text-xl font-bold">
                        <span>الإجمالي</span>
                        <span>{pkg.price === 0 ? 'مجاني' : `${pkg.price} ج.م`}</span>
                    </div>
                </div>
            )}
            
            <Button
                onClick={onSubmit}
                loading={isSubmitting}
                disabled={!isConfirmStep || isSubmitting}
                className="w-full mt-6"
                icon={<CreditCard />}
            >
                {isSubmitting ? 'جاري الإضافة...' : (pkg?.price === 0 ? 'تأكيد الحجز المجاني' : 'أضف للسلة وأكمل')}
            </Button>
        </div>
    );
};

export default BookingSummary;