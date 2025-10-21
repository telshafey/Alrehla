import React, { useState, useEffect, useRef } from 'react';
import { X, User, Package, Calendar, Clock, Edit, Save, Loader2, Link as LinkIcon, FileText } from 'lucide-react';
import { CreativeWritingBooking } from '../../lib/database.types.ts';
import { formatDate, getStatusColor } from '../../utils/helpers.ts';
import { useAppMutations } from '../../hooks/mutations.ts';
import { useToast } from '../../contexts/ToastContext.tsx';
import { useModalAccessibility } from '../../hooks/useModalAccessibility.ts';

interface BookingDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: CreativeWritingBooking | null;
}

const DetailItem: React.FC<{ label: string, value?: string | number | null }> = ({ label, value }) => (
    value ? <div><span className="font-semibold text-gray-500">{label}:</span> {value}</div> : null
);

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ isOpen, onClose, booking }) => {
    const { updateBookingProgressNotes } = useAppMutations();
    const { addToast } = useToast();
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useModalAccessibility({ modalRef, isOpen, onClose, initialFocusRef: closeButtonRef });

    useEffect(() => {
        if (booking && isOpen) {
            setNotes(booking.progress_notes || '');
        }
    }, [booking, isOpen]);

    if (!isOpen || !booking) return null;
    
    const handleSaveNotes = async () => {
        setIsSaving(true);
        try {
            // Correctly call the mutation function using `.mutateAsync`.
            await updateBookingProgressNotes.mutateAsync({ bookingId: booking.id, notes });
            onClose();
        } catch(e) {
            // error handled in hook
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-12" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="booking-modal-title">
            <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 m-4 animate-fadeIn max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 id="booking-modal-title" className="text-2xl font-bold text-gray-800">تفاصيل الحجز <span className="font-mono text-lg">{booking.id}</span></h2>
                    <button ref={closeButtonRef} onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border">
                        <div>
                            <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-2"><User /> الطالب</h3>
                            <p>{(booking as any).child_profiles?.name}</p>
                            <p className="text-sm text-gray-500">ولي الأمر: {booking.user_name}</p>
                        </div>
                         <div>
                            <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-2"><Package /> الباقة</h3>
                            <p>{booking.package_name}</p>
                            <p className="text-sm text-gray-500">المدرب: {(booking as any).instructors?.name}</p>
                             <span className={`mt-2 inline-block px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(booking.status)}`}>
                                {booking.status}
                            </span>
                        </div>
                    </div>
                    
                    <div>
                         <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-2"><Calendar /> تفاصيل الموعد</h3>
                         <div className="p-4 border rounded-lg space-y-2 text-sm">
                            <DetailItem label="التاريخ" value={formatDate(booking.booking_date)} />
                            <DetailItem label="الوقت" value={booking.booking_time} />
                            {booking.session_id && (
                                 <p className="flex items-center gap-2">
                                   <span className="font-semibold text-gray-500">رابط الجلسة:</span> 
                                   <a href={`/session/${booking.session_id}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                     <LinkIcon size={14}/> <span>انضم الآن</span>
                                   </a>
                                </p>
                            )}
                         </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-2"><FileText /> ملاحظات التقدم</h3>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="اكتب ملاحظاتك حول تقدم الطالب في هذه الجلسة..."
                        />
                        <button onClick={handleSaveNotes} disabled={isSaving} className="mt-2 flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full hover:bg-blue-200 disabled:bg-gray-200">
                           {isSaving ? <Loader2 className="animate-spin" /> : <Save size={16}/>}
                           {isSaving ? 'جاري الحفظ...' : 'حفظ الملاحظات'}
                        </button>
                    </div>
                </div>

                <div className="flex justify-end pt-6 mt-8 border-t">
                    <button onClick={onClose} className="px-8 py-2 rounded-full text-white bg-blue-600 hover:bg-blue-700">إغلاق</button>
                </div>
            </div>
        </div>
    );
};

export default BookingDetailsModal;
