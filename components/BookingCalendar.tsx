import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Instructor, WeeklySchedule } from '../lib/database.types';

interface BookingCalendarProps {
    instructor: Instructor | null;
    onDateTimeSelect: (date: Date, time: string) => void;
    holidays?: string[];
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ instructor, onDateTimeSelect, holidays = [] }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const weeklySchedule: WeeklySchedule = useMemo(() => {
        if (!instructor || !instructor.weekly_schedule) return {};
        return instructor.weekly_schedule as WeeklySchedule;
    }, [instructor]);

    const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const monthName = currentDate.toLocaleString('ar-EG', { month: 'long' });
    const year = currentDate.getFullYear();
    const totalDays = daysInMonth(currentDate);
    const startingDay = firstDayOfMonth(currentDate);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setSelectedDate(null);
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedDate(null);
    };
    
    const handleDateClick = (day: number) => {
        const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        if (newSelectedDate < new Date(new Date().toDateString())) return; // Disable past dates
        setSelectedDate(newSelectedDate);
    };
    
    const dayNames = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
    const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
    
    const availableTimes = useMemo(() => {
        if (!selectedDate || !weeklySchedule) return [];
        const dayOfWeek = selectedDate.toLocaleString('en-US', { weekday: 'long' }).toLowerCase() as keyof WeeklySchedule;
        return weeklySchedule[dayOfWeek] || [];
    }, [selectedDate, weeklySchedule]);

    return (
        <div className="bg-gray-50 p-6 rounded-2xl border">
            <div className="flex items-center justify-between mb-4">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-200"><ChevronRight size={20} /></button>
                <h3 className="font-bold text-lg">{monthName} {year}</h3>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-200"><ChevronLeft size={20} /></button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center text-sm font-semibold text-gray-500 mb-2">
                {dayNames.map(day => <div key={day}>{day}</div>)}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startingDay }).map((_, i) => <div key={`empty-${i}`}></div>)}
                {daysArray.map(day => {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                    const isPast = date < new Date(new Date().toDateString());
                    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' }).toLowerCase() as keyof WeeklySchedule;
                    const isAvailableDay = (weeklySchedule[dayOfWeek] || []).length > 0;
                    const isHoliday = holidays.includes(date.toISOString().split('T')[0]);
                    const isDisabled = isPast || !isAvailableDay || isHoliday;

                    return (
                        <button 
                            key={day}
                            onClick={() => handleDateClick(day)}
                            disabled={isDisabled}
                            className={`w-10 h-10 rounded-full transition-colors ${
                                isDisabled ? 'text-gray-300' :
                                isSelected ? 'bg-blue-600 text-white' :
                                isToday ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
                            }`}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>

            {selectedDate && (
                <div className="mt-6 pt-4 border-t">
                    <h4 className="font-bold mb-3">الأوقات المتاحة ليوم {selectedDate.toLocaleDateString('ar-EG')}</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {availableTimes.length > 0 ? (
                            availableTimes.map(time => (
                                <button
                                    key={time}
                                    onClick={() => onDateTimeSelect(selectedDate, time)}
                                    className="p-2 border rounded-lg text-sm bg-white hover:bg-blue-100 hover:border-blue-500 transition-colors"
                                >
                                    {time}
                                </button>
                            ))
                        ) : (
                            <p className="col-span-full text-center text-gray-500 py-4">لا توجد مواعيد متاحة في هذا اليوم.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingCalendar;