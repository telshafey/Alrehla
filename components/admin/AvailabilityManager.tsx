

import React, { useState, useMemo } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useAdminInstructors } from '../../hooks/queries.ts';
import { useAppMutations } from '../../hooks/mutations.ts';
import { Instructor, AvailableSlots } from '../../lib/database.types.ts';
import BookingCalendar from '../BookingCalendar.tsx'; // Re-using for display

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00'
];

const AvailabilityManager: React.FC<{ instructor?: Instructor }> = ({ instructor: passedInstructor }) => {
    const { data: instructors = [], isLoading, error } = useAdminInstructors();
    const { updateInstructorAvailability } = useAppMutations();
    const [selectedInstructorId, setSelectedInstructorId] = useState<number | null>(passedInstructor?.id || null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isSaving, setIsSaving] = useState(false);
    
    const selectedInstructor = useMemo(() => 
        instructors.find(i => i.id === selectedInstructorId), 
    [instructors, selectedInstructorId]);

    const currentSlots: AvailableSlots = (selectedInstructor?.availability as AvailableSlots) || {};
    const selectedDay = selectedDate.getDate().toString();
    const daySlots = currentSlots[selectedDay] || [];

    const handleSlotChange = async (time: string) => {
        if (!selectedInstructor) return;
        
        setIsSaving(true);
        const newDaySlots = daySlots.includes(time) 
            ? daySlots.filter(t => t !== time)
            : [...daySlots, time].sort();

        const newAvailability = {
            ...currentSlots,
            [selectedDay]: newDaySlots
        };

        try {
            // Correctly call the mutation function using `.mutateAsync`.
            await updateInstructorAvailability.mutateAsync({ instructorId: selectedInstructor.id, availability: newAvailability });
        } catch(e) {
            // error handled by hook
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isLoading) return <Loader2 className="animate-spin" />;
    if (error) return <div className="text-red-500">{error.message}</div>;

    return (
        <div className="space-y-4">
             {!passedInstructor && (
                <select 
                    value={selectedInstructorId || ''} 
                    onChange={e => setSelectedInstructorId(Number(e.target.value))}
                    className="w-full max-w-xs p-2 border rounded-lg bg-white"
                >
                    <option value="">-- اختر مدربًا --</option>
                    {instructors.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
                </select>
             )}

            {selectedInstructor && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <BookingCalendar instructor={selectedInstructor} onDateTimeSelect={(date) => setSelectedDate(date)} />
                    <div>
                        <h3 className="text-lg font-bold">إدارة مواعيد يوم: {selectedDate.toLocaleDateString('ar-EG')}</h3>
                        {isSaving && <p className="text-sm text-blue-500">جاري الحفظ...</p>}
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-4 max-h-72 overflow-y-auto">
                            {timeSlots.map(time => {
                                const isAvailable = daySlots.includes(time);
                                return (
                                <button
                                    key={time}
                                    onClick={() => handleSlotChange(time)}
                                    className={`p-2 border rounded-lg text-sm font-semibold flex items-center justify-center gap-1 transition-colors ${
                                        isAvailable ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
                                    }`}
                                >
                                    {isAvailable ? <Trash2 size={14} /> : <Plus size={14} />}
                                    <span>{time}</span>
                                </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AvailabilityManager;
