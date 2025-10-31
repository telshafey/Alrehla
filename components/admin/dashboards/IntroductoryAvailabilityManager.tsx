import React, { useState, useEffect } from 'react';
import { Loader2, Save } from 'lucide-react';
import { useInstructorMutations } from '../../../hooks/mutations/useInstructorMutations';
import type { Instructor, AvailableSlots } from '../../../lib/database.types';
import { Button } from '../../ui/Button';

const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00',
    '17:00', '18:00', '19:00', '20:00'
];

const IntroductoryAvailabilityManager: React.FC<{ instructor: Instructor }> = ({ instructor }) => {
    const { requestIntroAvailabilityChange } = useInstructorMutations();

    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [availability, setAvailability] = useState<AvailableSlots>({});
    
    const handleTimeToggle = (time: string) => {
        setAvailability(prev => {
            const daySlots = prev[selectedDate] || [];
            const newDaySlots = daySlots.includes(time)
                ? daySlots.filter(t => t !== time)
                : [...daySlots, time].sort();
            return { ...prev, [selectedDate]: newDaySlots };
        });
    };
    
    const handleSave = () => {
        if (!instructor) return;
        requestIntroAvailabilityChange.mutate({ instructorId: instructor.id, availability });
    };

    const currentDaySlots = availability[selectedDate] || [];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full p-2 border rounded-lg bg-white" />
            </div>

            <div>
                <h4 className="font-bold mb-3">حدد الأوقات المقترحة في يوم {selectedDate}</h4>
                 <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                     {timeSlots.map(time => {
                         const isSelected = currentDaySlots.includes(time);
                         return (
                            <button
                                key={time}
                                onClick={() => handleTimeToggle(time)}
                                className={`p-2 border rounded-lg text-sm transition-colors ${
                                    isSelected ? 'bg-blue-600 text-white' : 'bg-white hover:bg-blue-100'
                                }`}
                            >
                                {time}
                            </button>
                         );
                     })}
                </div>
                <div className="flex justify-end mt-6">
                    <Button onClick={handleSave} loading={requestIntroAvailabilityChange.isPending} icon={<Save />}>
                        إرسال طلب التحديث
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default IntroductoryAvailabilityManager;
