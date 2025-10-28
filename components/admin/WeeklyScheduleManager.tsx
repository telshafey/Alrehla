import React, { useState, useEffect } from 'react';
import { Loader2, Send } from 'lucide-react';
// FIX: Corrected import path
import { useInstructorMutations } from '../../hooks/mutations';
import type { Instructor, WeeklySchedule } from '../../lib/database.types';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../ui/Button';

const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const dayNames: { [key: string]: string } = {
    sunday: 'الأحد', monday: 'الاثنين', tuesday: 'الثلاثاء', wednesday: 'الأربعاء',
    thursday: 'الخميس', friday: 'الجمعة', saturday: 'السبت'
};
const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00'
];

const WeeklyScheduleManager: React.FC<{ instructor: Instructor }> = ({ instructor }) => {
    const { requestScheduleChange } = useInstructorMutations();
    const { addToast } = useToast();
    const [schedule, setSchedule] = useState<WeeklySchedule>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setSchedule((instructor.weekly_schedule as WeeklySchedule) || {});
    }, [instructor]);
    
    const handleTimeToggle = (day: string, time: string) => {
        setSchedule(prev => {
            const daySchedule = prev[day as keyof WeeklySchedule] || [];
            const newDaySchedule = daySchedule.includes(time) 
                ? daySchedule.filter(t => t !== time)
                : [...daySchedule, time].sort();
            return { ...prev, [day]: newDaySchedule };
        });
    };
    
    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            await requestScheduleChange.mutateAsync({ instructorId: instructor.id, schedule });
        } catch(e) {
             // error handled in hook
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-gray-50 p-6 rounded-2xl border">
            {daysOfWeek.map(day => (
                <div key={day} className="mb-6">
                    <h4 className="font-bold mb-3">{dayNames[day]}</h4>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {timeSlots.map(time => {
                            const isSelected = (schedule[day as keyof WeeklySchedule] || []).includes(time);
                            return (
                                <button
                                    key={time}
                                    onClick={() => handleTimeToggle(day, time)}
                                    className={`p-2 border rounded-lg text-sm transition-colors ${
                                        isSelected ? 'bg-blue-600 text-white' : 'bg-white hover:bg-blue-100'
                                    }`}
                                >
                                    {time}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
            <div className="flex justify-end mt-6">
                 <Button onClick={handleSubmit} loading={isSaving} icon={<Send size={16}/>}>
                    {isSaving ? 'جاري الإرسال...' : 'إرسال طلب التعديل'}
                </Button>
            </div>
        </div>
    );
};

export default WeeklyScheduleManager;