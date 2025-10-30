import React from 'react';
import { Link as LinkIcon } from 'lucide-react';
import { useBookingMutations } from '../../hooks/mutations/useBookingMutations';
import type { CreativeWritingBooking, BookingStatus } from '../../lib/database.types';
import { formatDate, getStatusColor } from '../../utils/helpers';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';

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

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ isOpen, onClose, booking }) => {
    const { updateBookingStatus } = useBookingMutations();

    if (!booking) return null;

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        await updateBookingStatus.mutateAsync({ bookingId: booking.id, newStatus: e.target.value as BookingStatus });
    };
    
    const statuses: BookingStatus[] = ["بانتظار الدفع", "مؤكد", "مكتمل", "ملغي"];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="تفاصيل الحجز"
            size="xl"
            footer={
                <Button onClick={onClose}>
                    إغلاق
                </Button>
            }
        >
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
        </Modal>
    );
};