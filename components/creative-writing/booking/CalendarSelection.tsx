import React, { useMemo } from 'react';
import type { Instructor } from '../../../lib/database.types';
import BookingCalendar from '../../../components/BookingCalendar';
import { Calendar } from 'lucide-react';

interface CalendarSelectionProps {
    instructor: Instructor;
    onSelect: (date: Date, time: string) => void;
    holidays: string[];
}

const CalendarSelection: React.FC<CalendarSelectionProps> = ({ instructor, onSelect, holidays }) => {
    
    const hasAvailability = useMemo(() => {
        if (!instructor?.weekly_schedule) return false;
        return Object.values(instructor.weekly_schedule).some(daySlots => Array.isArray(daySlots) && daySlots.length > 0);
    }, [instructor]);

    return (
        <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">اختر تاريخ ووقت الجلسة الأولى</h2>
            
            {hasAvailability ? (
                <>
                    <p className="text-gray-600 mb-4 -mt-4">
                        اختر الموعد المناسب لك من المواعيد المتاحة للمدرب <span className="font-bold">{instructor.name}</span>.
                    </p>
                    <BookingCalendar instructor={instructor} onDateTimeSelect={onSelect} holidays={holidays} />
                </>
            ) : (
                 <div className="text-center py-10 px-6 bg-yellow-50 border-2 border-dashed border-yellow-300 rounded-2xl">
                    <Calendar className="mx-auto h-12 w-12 text-yellow-500" />
                    <h3 className="mt-2 text-lg font-bold text-yellow-800">لا توجد مواعيد متاحة حالياً</h3>
                    <p className="mt-1 text-sm text-yellow-700">
                        عذراً، لا توجد أوقات متاحة لهذا المدرب في الوقت الحالي. يرجى المحاولة مرة أخرى لاحقاً أو اختيار مدرب آخر.
                    </p>
                    <p className="mt-4 text-xs text-yellow-600">
                        نحن نعمل على إضافة المزيد من المواعيد قريباً.
                    </p>
                </div>
            )}
        </div>
    );
};

export default CalendarSelection;