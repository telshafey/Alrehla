import React, { useRef } from 'react';
import { X, Link as LinkIcon } from 'lucide-react';
// REFACTOR: Use the specialized booking mutations hook.
// FIX: Corrected import path
import { useBookingMutations } from '../../hooks/mutations';
import type { CreativeWritingBooking, BookingStatus } from '../../lib/database.types';
import { formatDate, getStatusColor } from '../../utils/helpers';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

type BookingWithRelations = CreativeWritingBooking & { child_profiles: { name: string } | null; instructors: { name: string } | null };

interface BookingDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: BookingWithRelations | null;
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="py-2">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-semibold text-gray-800">{value}</p>
    </div>
);

// FIX: Changed to a named export to resolve module resolution issues.
export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ isOpen, onClose, booking }) => {
    const { updateBookingStatus } = useBookingMutations();
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    useModalAccessibility({ modalRef, isOpen, onClose, initialFocusRef: closeButtonRef });


    if (!isOpen || !booking) return null;

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        await updateBookingStatus.mutateAsync({ bookingId: booking.id, newStatus: e.target.value as BookingStatus });
    };
    
    const statuses: BookingStatus[] = ["بانتظار الدفع", "مؤكد", "مكتمل", "ملغي"];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="booking-modal-title">
            <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-8 m-4 animate-fadeIn max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 id="booking-modal-title" className="text-2xl font-bold text-gray-800">تفاصيل الحجز</h2>
                    <button ref={closeButtonRef} onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                
                <div className="space-y-4">
                    <DetailRow label="رقم الحجز" value={<span className="font-mono text-sm">{booking.id}</span>} />
                    <DetailRow label="الطالب" value={booking.child_profiles?.name || 'N/A'} />
                    <DetailRow label="ولي الأمر" value={booking.user_name} />
                    <DetailRow label="المدرب" value={booking.instructors?.name || 'N/A'} />
                    <DetailRow label="الباقة" value={booking.package_name} />
                    <DetailRow label="موعد الجلسة" value={`${formatDate(booking.booking_date)} الساعة ${booking.booking_time}`} />
                    <DetailRow label="الإجمالي" value={`${booking.total} ج.م`} />
                    <DetailRow label="الحالة" value={
                        <select value={booking.status} onChange={handleStatusChange} className={`p-1 border rounded-md text-sm ${getStatusColor(booking.status)}`}>
                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    } />
                     {booking.receipt_url && <DetailRow label="الإيصال" value={<a href={booking.receipt_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1"><LinkIcon size={14}/><span>عرض</span></a>} />}

                    {booking.progress_notes && (
                        <DetailRow label="ملاحظات التقدم" value={<p className="whitespace-pre-wrap p-2 bg-gray-50 rounded border">{booking.progress_notes}</p>} />
                    )}
                </div>
                <div className="flex justify-end pt-6 mt-6 border-t">
                    <button onClick={onClose} className="px-6 py-2 rounded-full text-white bg-blue-600 hover:bg-blue-700">
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};
