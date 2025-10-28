import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
// REFACTOR: Use the specialized booking mutations hook.
// FIX: Corrected import path
import { useBookingMutations } from '../../hooks/mutations';
import type { CreativeWritingBooking } from '../../lib/database.types';
import { useToast } from '../../contexts/ToastContext';
import { formatDate } from '../../utils/helpers';

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

// FIX: Changed to a named export to resolve module resolution issues.
export const StudentProgressModal: React.FC<StudentProgressModalProps> = ({ isOpen, onClose, student }) => {
    const { updateBookingProgressNotes } = useBookingMutations();
    const { addToast } = useToast();
    const [notes, setNotes] = useState<{ [bookingId: string]: string }>({});
    const [isSaving, setIsSaving] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (student) {
            const initialNotes: { [bookingId: string]: string } = {};
            student.bookings.forEach(b => {
                initialNotes[b.id] = b.progress_notes || '';
            });
            setNotes(initialNotes);
        }
    }, [student, isOpen]);
    
      useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);


    if (!isOpen || !student) return null;

    const handleNoteChange = (bookingId: string, text: string) => {
        setNotes(prev => ({ ...prev, [bookingId]: text }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatePromises = student.bookings
                .filter(b => notes[b.id] !== (b.progress_notes || ''))
                .map(b => updateBookingProgressNotes.mutateAsync({ bookingId: b.id, notes: notes[b.id] }));
            
            await Promise.all(updatePromises);
            addToast('تم حفظ ملاحظات التقدم بنجاح.', 'success');
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const completedSessions = student.bookings
        .filter(b => b.status === 'مكتمل')
        .sort((a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime());

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-12" onClick={onClose}>
            <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 m-4 animate-fadeIn max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">ملاحظات التقدم للطالب: {student.name}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>

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

                <div className="flex justify-end gap-4 pt-6 mt-8 border-t">
                    <button type="button" onClick={onClose} className="px-6 py-2 rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200">إلغاء</button>
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
                    >
                        {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                        <span>{isSaving ? 'جاري الحفظ...' : 'حفظ الملاحظات'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
