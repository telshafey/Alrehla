import React from 'react';
import { Loader2, Send } from 'lucide-react';
import type { CreativeWritingPackage, Instructor, ChildProfile } from '../../../lib/database.types';
import { Button } from '../../ui/Button';

interface BookingSummaryProps {
    pkg: CreativeWritingPackage | null;
    instructor: Instructor | null;
    dateTime: { date: Date; time: string } | null;
    child: ChildProfile | null;
    onConfirm: () => void;
    isSubmitting: boolean;
    step: string;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({ pkg, instructor, dateTime, child, onConfirm, isSubmitting, step }) => {
    
    const isConfirmStep = step === 'confirm';

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border">
            <h3 className="text-xl font-bold text-gray-800 mb-4 pb-3 border-b">ملخص الحجز</h3>
            <div className="space-y-4 text-sm">
                <div>
                    <p className="font-semibold text-gray-500">الباقة:</p>
                    <p className="font-bold text-gray-800">{pkg?.name || 'لم تحدد بعد'}</p>
                </div>
                <div>
                    <p className="font-semibold text-gray-500">المدرب:</p>
                    <p className="font-bold text-gray-800">{instructor?.name || 'لم يحدد بعد'}</p>
                </div>
                 <div>
                    <p className="font-semibold text-gray-500">الموعد:</p>
                    <p className="font-bold text-gray-800">
                        {dateTime ? `${dateTime.date.toLocaleDateString('ar-EG')} - ${dateTime.time}` : 'لم يحدد بعد'}
                    </p>
                </div>
                <div>
                    <p className="font-semibold text-gray-500">الطفل:</p>
                    <p className="font-bold text-gray-800">{child?.name || 'لم يحدد بعد'}</p>
                </div>
            </div>
            <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center text-xl font-bold">
                    <span>الإجمالي:</span>
                    <span>{pkg?.price ?? 0} ج.م</span>
                </div>
            </div>
             <Button 
                onClick={onConfirm}
                disabled={!isConfirmStep || isSubmitting}
                className="mt-6 w-full"
                loading={isSubmitting}
                icon={<Send />}
                variant="success"
            >
                {isSubmitting ? 'جاري التأكيد...' : 'التأكيد والانتقال للدفع'}
            </Button>
        </div>
    );
};

export default BookingSummary;