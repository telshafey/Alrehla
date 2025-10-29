import React, { useState, useEffect } from 'react';
import { Loader2, Save } from 'lucide-react';
import { useAdminInstructors } from '../../hooks/queries/admin/useAdminInstructorsQuery';
import { useInstructorMutations } from '../../hooks/mutations/useInstructorMutations';
import type { Instructor, AvailableSlots } from '../../lib/database.types';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00'
];

const AvailabilityManager: React.FC = () => {
    const { data: instructors = [], isLoading: instructorsLoading } = useAdminInstructors();
    const { updateInstructorAvailability } = useInstructorMutations();

    const [selectedInstructorId, setSelectedInstructorId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [availability, setAvailability] = useState<AvailableSlots>({});
    
    const instructor = instructors.find(i => i.id === parseInt(selectedInstructorId));

    useEffect(() => {
        if (instructor?.availability) {
            setAvailability(instructor.availability as AvailableSlots);
        } else {
            setAvailability({});
        }
    }, [instructor]);
    
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
        updateInstructorAvailability.mutate({ instructorId: instructor.id, availability });
    };

    if (instructorsLoading) {
        return <Loader2 className="animate-spin" />;
    }

    const currentDaySlots = availability[selectedDate] || [];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Select value={selectedInstructorId} onChange={e => setSelectedInstructorId(e.target.value)}>
                    <option value="">-- اختر مدرب --</option>
                    {instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </Select>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full p-2 border rounded-lg bg-white" />
            </div>

            {selectedInstructorId && (
                <div>
                    <h4 className="font-bold mb-3">المواعيد المتاحة لـ {instructor?.name} في يوم {selectedDate}</h4>
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
                        <Button onClick={handleSave} loading={updateInstructorAvailability.isPending} icon={<Save />}>
                            حفظ التغييرات
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AvailabilityManager;