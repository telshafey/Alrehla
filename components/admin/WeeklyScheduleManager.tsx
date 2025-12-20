
import React, { useState, useEffect } from 'react';
import { Loader2, Send, Clock } from 'lucide-react';
import { useInstructorMutations } from '../../hooks/mutations/useInstructorMutations';
import type { Instructor, WeeklySchedule } from '../../lib/database.types';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../ui/Button';

const daysOfWeek = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const dayNames: { [key: string]: string } = {
    saturday: 'السبت', sunday: 'الأحد', monday: 'الاثنين', tuesday: 'الثلاثاء', wednesday: 'الأربعاء',
    thursday: 'الخميس', friday: 'الجمعة'
};

// تم التعديل ليكون الفارق 60 دقيقة بدلاً من 30
const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
});


export const WeeklyScheduleManager: React.FC<{ instructor: Instructor }> = ({ instructor }) => {
    const { requestScheduleChange } = useInstructorMutations();
    const { addToast } = useToast();
    const [schedule, setSchedule] = useState<WeeklySchedule>({});

    useEffect(() => {
        if (instructor.weekly_schedule) {
            setSchedule(instructor.weekly_schedule as WeeklySchedule);
        } else {
            setSchedule({});
        }
    }, [instructor]);

    const handleTimeToggle = (day: string, time: string) => {
        setSchedule(prev => {
            const daySlots = prev[day as keyof WeeklySchedule] || [];
            const newDaySlots = daySlots.includes(time)
                ? daySlots.filter(t => t !== time)
                : [...daySlots, time].sort((a,b) => a.localeCompare(b));
            
            const newSchedule = { ...prev, [day]: newDaySlots };
            if (newDaySlots.length === 0) {
                delete newSchedule[day as keyof WeeklySchedule];
            }

            return newSchedule;
        });
    };
    
    const handleSubmit = () => {
        if (Object.values(schedule).every(v => Array.isArray(v) && v.length === 0) && !window.confirm("جدولك فارغ. هل أنت متأكد من أنك تريد إرساله هكذا؟")) {
            return;
        }
        requestScheduleChange.mutate({ instructorId: instructor.id, schedule });
    };

    return (
        <div className="space-y-8">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
                <Clock className="text-blue-600 mt-1" />
                <div>
                    <p className="text-sm font-bold text-blue-800">نظام المواعيد: 60 دقيقة</p>
                    <p className="text-xs text-blue-700">يرجى اختيار ساعات التوفر الثابتة. الموعد المختار (مثلاً 09:00) يعني توفرك للجلسة من 09:00 إلى 10:00.</p>
                </div>
            </div>

            {daysOfWeek.map(day => (
                <div key={day} className="bg-white p-4 rounded-xl border shadow-sm">
                    <h4 className="font-bold mb-4 text-gray-700 border-b pb-2 flex justify-between items-center">
                        {dayNames[day]}
                        <span className="text-xs font-normal text-muted-foreground">{(schedule[day] || []).length} مواعيد</span>
                    </h4>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                        {timeSlots.map(time => {
                            const isSelected = (schedule[day as keyof WeeklySchedule] || []).includes(time);
                            return (
                                <button
                                    key={time}
                                    type="button"
                                    onClick={() => handleTimeToggle(day, time)}
                                    className={`p-2 border rounded-lg text-xs font-mono font-bold transition-all ${
                                        isSelected 
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' 
                                        : 'bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600'
                                    }`}
                                >
                                    {time}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
             <div className="flex justify-end mt-6 sticky bottom-4 z-10">
                <Button onClick={handleSubmit} loading={requestScheduleChange.isPending} icon={<Send />} size="lg" className="shadow-xl">
                    إرسال طلب التعديل للمراجعة
                </Button>
            </div>
        </div>
    );
};
