import React from 'react';
import type { Instructor } from '../../../lib/database.types';
import BookingCalendar from '../../../components/BookingCalendar';

interface CalendarSelectionProps {
    instructor: Instructor;
    onSelect: (date: Date, time: string) => void;
    holidays: string[];
}

const CalendarSelection: React.FC<CalendarSelectionProps> = ({ instructor, onSelect, holidays }) => {
    return (
        <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">اختر تاريخ ووقت الجلسة الأولى</h2>
            <p className="text-gray-600 mb-4 -mt-4">
                اختر الموعد المناسب لك من المواعيد المتاحة للمدرب <span className="font-bold">{instructor.name}</span>.
            </p>
            <BookingCalendar instructor={instructor} onDateTimeSelect={onSelect} holidays={holidays} />
        </div>
    );
};

export default CalendarSelection;