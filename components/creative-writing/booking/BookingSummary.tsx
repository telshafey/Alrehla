import React from 'react';
import { User, Package, UserCheck, Calendar, CreditCard } from 'lucide-react';
import { Button } from '../../ui/Button';
import { formatDate } from '../../../utils/helpers';
import type { CreativeWritingPackage, Instructor } from '../../../lib/database.types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../ui/card';

interface BookingSummaryProps {
    childName: string | null;
    pkg: CreativeWritingPackage | null;
    instructor: Instructor | null;
    dateTime: { date: Date, time: string } | null;
    onSubmit: () => void;
    isSubmitting: boolean;
    isConfirmStep: boolean;
    finalPrice: number | null;
    priceRange: { min: number, max: number } | null;
}

const SummaryRow: React.FC<{ icon: React.ReactNode, label: string, value: string | null }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 text-sm">
        <div className="flex-shrink-0 text-muted-foreground mt-1">{icon}</div>
        <div>
            <p className="font-semibold text-muted-foreground">{label}</p>
            <p className="font-bold text-foreground">{value || '...'}</p>
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
    isConfirmStep,
    finalPrice,
    priceRange
}) => {
    
    const renderPrice = () => {
        if (finalPrice !== null) {
            return finalPrice === 0 ? 'مجاني' : `${finalPrice} ج.م`;
        }
        if (priceRange) {
            return priceRange.min === priceRange.max 
                ? `${priceRange.min} ج.م` 
                : `${priceRange.min} - ${priceRange.max} ج.م`;
        }
        return '...';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>ملخص الحجز</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <SummaryRow icon={<User size={16}/>} label="الطالب" value={childName || null} />
                <SummaryRow icon={<Package size={16}/>} label="الباقة" value={pkg?.name || null} />
                <SummaryRow icon={<UserCheck size={16}/>} label="المدرب" value={instructor?.name || null} />
                <SummaryRow 
                    icon={<Calendar size={16}/>} 
                    label="الموعد" 
                    value={dateTime ? `${formatDate(dateTime.date.toISOString())}, ${dateTime.time}` : null} 
                />
            </CardContent>
            
            {pkg && (
                <CardFooter className="flex-col items-stretch space-y-2 border-t pt-6">
                    <div className="flex justify-between items-center text-xl font-bold">
                        <span>الإجمالي</span>
                        <span>{renderPrice()}</span>
                    </div>
                     <Button
                        onClick={onSubmit}
                        loading={isSubmitting}
                        disabled={!isConfirmStep || isSubmitting}
                        className="w-full mt-6"
                        icon={<CreditCard />}
                    >
                        {isSubmitting ? 'جاري الإضافة...' : (finalPrice === 0 ? 'تأكيد الحجز المجاني' : 'أضف للسلة وأكمل')}
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
};

export default React.memo(BookingSummary);
