
import React from 'react';
import { Instructor } from '../../../lib/database.types.ts';
import BookingCalendar from '../../BookingCalendar.tsx';

interface CalendarSelectionProps {
    instructor: Instructor;
    onSelect: (date: Date, time: string) => void;
}

const CalendarSelection: React.FC<CalendarSelectionProps> = ({ instructor, onSelect }) => {
    return (
        <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">اختر تاريخ ووقت الجلسة الأولى</h2>
            <p className="text-gray-600 mb-4 -mt-4">
                اختر الموعد المناسب لك من المواعيد المتاحة للمدرب <span className="font-bold">{instructor.name}</span>.
            </p>
            <BookingCalendar instructor={instructor} onDateTimeSelect={onSelect} />
        </div>
    );
};

export default CalendarSelection;
