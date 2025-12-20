import React, { useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { useInstructorMutations } from '../../../hooks/mutations/useInstructorMutations';
import type { Instructor, AvailableSlots } from '../../../lib/database.types';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

const IntroductoryAvailabilityManager: React.FC<{ instructor: Instructor }> = ({ instructor }) => {
    const { requestIntroAvailabilityChange } = useInstructorMutations();
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedTime, setSelectedTime] = useState('17:00');
    
    // We use the existing intro_availability from instructor or local state for the proposed change
    const [availability, setAvailability] = useState<AvailableSlots>(instructor.intro_availability || {});

    const handleAddTime = () => {
        if (!selectedDate || !selectedTime) return;
        setAvailability(prev => {
            const daySlots = prev[selectedDate] || [];
            if (daySlots.includes(selectedTime)) return prev;
            return { ...prev, [selectedDate]: [...daySlots, selectedTime].sort() };
        });
    };

    const handleRemoveTime = (date: string, time: string) => {
        setAvailability(prev => {
            const daySlots = prev[date].filter(t => t !== time);
            const newState = { ...prev };
            if (daySlots.length === 0) {
                delete newState[date];
            } else {
                newState[date] = daySlots;
            }
            return newState;
        });
    };

    const handleSave = () => {
        requestIntroAvailabilityChange.mutate({ instructorId: instructor.id, availability });
    };

    return (
        <div className="space-y-6">
            <div className="bg-muted/30 p-4 rounded-xl border border-dashed flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="text-xs font-bold mb-1 block">التاريخ</label>
                    <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                </div>
                <div className="flex-1 w-full">
                    <label className="text-xs font-bold mb-1 block">الوقت</label>
                    <Input type="time" value={selectedTime} onChange={e => setSelectedTime(e.target.value)} />
                </div>
                <Button type="button" onClick={handleAddTime} icon={<Plus size={16}/>}>إضافة موعد</Button>
            </div>

            <div className="space-y-3">
                {Object.entries(availability).sort().map(([date, times]) => (
                    <div key={date} className="p-3 bg-white border rounded-lg">
                        <p className="font-bold text-sm mb-2 border-b pb-1">{date}</p>
                        <div className="flex flex-wrap gap-2">
                            {/* Fix: Explicitly cast 'times' to string[] to resolve Property 'map' does not exist on type 'unknown' error */}
                            {(times as string[]).map(time => (
                                <span key={time} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                                    {time}
                                    <button onClick={() => handleRemoveTime(date, time)} className="text-red-400 hover:text-red-600">
                                        <Trash2 size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSave} loading={requestIntroAvailabilityChange.isPending} icon={<Save />}>
                    إرسال طلب تحديث مواعيد الجلسات التعريفية
                </Button>
            </div>
        </div>
    );
};

export default IntroductoryAvailabilityManager;