import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useBookingMutations } from '../../hooks/mutations/useBookingMutations';
import type { CreativeWritingBooking } from '../../lib/database.types';
import { useToast } from '../../contexts/ToastContext';
import { formatDate } from '../../utils/helpers';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';

interface Student {
    id: number;
    name: string;
    bookings: CreativeWritingBooking[];
    lastProgressNote: string | null;
}

interface StudentProgressModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student | null;
}

export const StudentProgressModal: React.FC<StudentProgressModalProps> = ({ isOpen, onClose, student }) => {
    const { updateBookingProgressNotes } = useBookingMutations();
    const { addToast } = useToast();
    const [notes, setNotes] = useState<{ [bookingId: string]: string }>({});
    
    const isSaving = updateBookingProgressNotes.isPending;

    useEffect(() => {
        if (student) {
            const initialNotes: { [bookingId: string]: string } = {};
            student.bookings.forEach(b => {
                initialNotes[b.id] = b.progress_notes || '';
            });
            setNotes(initialNotes);
        }
    }, [student, isOpen]);

    if (!student) return null;

    const handleNoteChange = (bookingId: string, text: string) => {
        setNotes(prev => ({ ...prev, [bookingId]: text }));
    };

    const handleSave = async () => {
        try {
            const updatePromises = student.bookings
                .filter(b => notes[b.id] !== (b.progress_notes || ''))
                .map(b => updateBookingProgressNotes.mutateAsync({ bookingId: b.id, notes: notes[b.id] }));
            
            await Promise.all(updatePromises);
            addToast('تم حفظ ملاحظات التقدم بنجاح.', 'success');
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    const completedSessions = student.bookings
        .filter(b => b.status === 'مكتمل')
        .sort((a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime());

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`ملاحظات التقدم للطالب: ${student.name}`}
            size="2xl"
            footer={
                <>
                    <Button type="button" onClick={onClose} variant="ghost">إلغاء</Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        loading={isSaving}
                        icon={isSaving ? undefined : <Save />}
                    >
                        {isSaving ? 'جاري الحفظ...' : 'حفظ الملاحظات'}
                    </Button>
                </>
            }
        >
            <div className="space-y-6">
                {completedSessions.length > 0 ? completedSessions.map(booking => (
                    <div key={booking.id} className="p-4 bg-gray-50 rounded-lg border">
                        <h3 className="font-bold text-gray-700">جلسة تاريخ: {formatDate(booking.booking_date)}</h3>
                        <textarea
                            value={notes[booking.id] || ''}
                            onChange={(e) => handleNoteChange(booking.id, e.target.value)}
                            rows={4}
                            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="اكتب ملاحظاتك حول تقدم الطالب في هذه الجلسة..."
                        />
                    </div>
                )) : (
                    <p className="text-center text-gray-500 py-8">لا توجد جلسات مكتملة لهذا الطالب بعد.</p>
                )}
            </div>
        </Modal>
    );
};