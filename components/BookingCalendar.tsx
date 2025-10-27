

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Instructor, AvailableSlots } from '../lib/database.types';
import { daysInMonth, firstDayOfMonth } from '../utils/helpers';

interface BookingCalendarProps {
    instructor: Instructor;
    onDateTimeSelect: (date: Date, time: string) => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ instructor, onDateTimeSelect }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const availableSlots = (instructor.availability as AvailableSlots) || {};

    const monthName = currentDate.toLocaleString('ar-EG', { month: 'long' });
    const year = currentDate.getFullYear();

    const handleDayClick = (day: number) => {
        setSelectedDay(day);
        setSelectedTime(null);
    };

    const handleTimeClick = (time: string) => {
        if (!selectedDay) return;
        setSelectedTime(time);
        const finalDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay);
        onDateTimeSelect(finalDate, time);
    };

    const renderCalendar = () => {
        const totalDays = daysInMonth(currentDate);
        const startingDay = firstDayOfMonth(currentDate);
        const blanks = Array(startingDay).fill(null);
        const days = Array.from({ length: totalDays }, (_, i) => i + 1);

        return [...blanks, ...days].map((day, index) => {
            if (day === null) {
                return <div key={`blank-${index}`} className="p-2 border border-transparent"></div>;
            }
            const isSelected = selectedDay === day;
            const daySlots = availableSlots[day.toString()] || [];
            const hasSlots = daySlots.length > 0;
            const isPast = new Date(currentDate.getFullYear(), currentDate.getMonth(), day) < new Date(new Date().setDate(new Date().getDate() -1));

            return (
                <button
                    key={day}
                    onClick={() => handleDayClick(day)}
                    disabled={isPast || !hasSlots}
                    className={`
                        p-2 border rounded-lg transition-colors text-center aspect-square flex flex-col justify-center items-center
                        ${isPast || !hasSlots ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-blue-50'}
                        ${isSelected ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-500' : 'bg-white border-gray-200'}
                    `}
                >
                    <span className="font-semibold text-lg">{day}</span>
                </button>
            );
        });
    };

    return (
        <div className="p-4 bg-gray-50 rounded-2xl shadow-inner border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Calendar */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 rounded-full hover:bg-gray-200"><ChevronRight size={20} /></button>
                        <h3 className="text-lg font-bold text-gray-800">{monthName} {year}</h3>
                        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 rounded-full hover:bg-gray-200"><ChevronLeft size={20} /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-500 mb-2 font-semibold">
                        {['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'].map(d => <div key={d}>{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {renderCalendar()}
                    </div>
                </div>

                {/* Time Slots */}
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                        {selectedDay ? `الأوقات المتاحة ليوم ${selectedDay}` : 'اختر يوماً من التقويم'}
                    </h3>
                    {selectedDay && (
                        <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
                            {(availableSlots[selectedDay.toString()] || []).length > 0 ? (
                                (availableSlots[selectedDay.toString()] || []).map(time => (
                                    <button 
                                        key={time} 
                                        onClick={() => handleTimeClick(time)}
                                        className={`p-3 border rounded-lg text-center font-semibold transition-colors ${selectedTime === time ? 'bg-blue-600 text-white' : 'bg-white hover:bg-blue-100'}`}
                                    >
                                        {time}
                                    </button>
                                ))
                            ) : (
                                <p className="col-span-2 text-center text-gray-500 py-4">لا توجد مواعيد متاحة لهذا اليوم.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingCalendar;