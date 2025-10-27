

import React, { useState, useMemo, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
// FIX: Corrected import path from non-existent queries.ts to adminQueries.ts
import { useAdminCwBookings } from '../../hooks/adminQueries';
// REFACTOR: Use the specialized booking mutations hook instead of the general app mutations hook.
import { useBookingMutations } from '../../hooks/mutations';
import { useToast } from '../../contexts/ToastContext';
import PageLoader from '../../components/ui/PageLoader';
import AdminSection from '../../components/admin/AdminSection';
import BookingDetailsModal from '../../components/admin/BookingDetailsModal';
// FIX: Changed to a named import to resolve the "no default export" error.
import { StudentProgressModal } from '../../components/admin/StudentProgressModal';
import { CheckSquare, Edit, Eye } from 'lucide-react';
import { formatDate, getStatusColor } from '../../utils/helpers';
import type { BookingWithRelations, BookingStatus } from '../../lib/database.types';

// Re-defining for this context
interface Student {
    id: number;
    name: string;
    bookings: BookingWithRelations[];
    lastProgressNote: string | null;
}

const AdminCreativeWritingPage: React.FC = () => {
    const { data: bookings = [], isLoading, error } = useAdminCwBookings();
    const { updateBookingStatus } = useBookingMutations();
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedBooking, setSelectedBooking] = useState<BookingWithRelations | null>(null);
    const [studentForProgress, setStudentForProgress] = useState<Student | null>(null);

    const filteredBookings = useMemo(() => {
        return bookings.filter(b => statusFilter === 'all' || b.status === statusFilter);
    }, [bookings, statusFilter]);
    
    const students = useMemo(() => {
        const studentMap = new Map<number, Student>();
        bookings.forEach(booking => {
            const child = booking.child_profiles;
            if (child) {
                if (!studentMap.has(child.id)) {
                    studentMap.set(child.id, { id: child.id, name: child.name, bookings: [], lastProgressNote: null });
                }
                const student = studentMap.get(child.id)!;
                student.bookings.push(booking);
                if (booking.progress_notes) {
                    student.lastProgressNote = booking.progress_notes;
                }
            }
        });
        return Array.from(studentMap.values());
    }, [bookings]);
    
    const handleStatusChange = (bookingId: string, newStatus: BookingStatus) => {
        updateBookingStatus.mutate({ bookingId, newStatus });
    };

    if (isLoading) return <PageLoader text="جاري تحميل الحجوزات..." />;
    if (error) return <div className="text-center text-red-500">{error.message}</div>;

    const statuses = Array.from(new Set(bookings.map(b => b.status)));

    return (
        <>
            <BookingDetailsModal
                isOpen={!!selectedBooking}
                onClose={() => setSelectedBooking(null)}
                booking={selectedBooking}
            />
            <StudentProgressModal 
                isOpen={!!studentForProgress}
                onClose={() => setStudentForProgress(null)}
                student={studentForProgress}
            />
            <div className="animate-fadeIn space-y-12">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة حجوزات "بداية الرحلة"</h1>

                <AdminSection title="قائمة الحجوزات" icon={<CheckSquare />}>
                    <div className="mb-4">
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="p-2 border rounded-lg bg-white"
                        >
                            <option value="all">كل الحالات</option>
                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="border-b-2">
                                <tr>
                                    <th className="p-3">الطالب</th>
                                    <th className="p-3">الباقة</th>
                                    <th className="p-3">المدرب</th>
                                    <th className="p-3">تاريخ الجلسة</th>
                                    <th className="p-3">الحالة</th>
                                    <th className="p-3">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.map(booking => (
                                    <tr key={booking.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-semibold">{booking.child_profiles?.name || 'غير محدد'}</td>
                                        <td className="p-3">{booking.package_name}</td>
                                        <td className="p-3">{booking.instructors?.name || 'غير محدد'}</td>
                                        <td className="p-3">{formatDate(booking.booking_date)}</td>
                                        <td className="p-3">
                                             <select 
                                              value={booking.status} 
                                              onChange={(e) => handleStatusChange(booking.id, e.target.value as BookingStatus)}
                                              className={`p-1 border rounded-md text-sm font-bold ${getStatusColor(booking.status)}`}
                                            >
                                                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </td>
                                        <td className="p-3">
                                            <button onClick={() => setSelectedBooking(booking)} className="text-gray-500 hover:text-blue-600"><Eye size={20} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </AdminSection>

                 <AdminSection title="متابعة تقدم الطلاب" icon={<Edit />}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="border-b-2">
                                <tr>
                                    <th className="p-3">الطالب</th>
                                    <th className="p-3">آخر ملاحظة</th>
                                    <th className="p-3">إجراء</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-semibold">{student.name}</td>
                                        <td className="p-3 text-sm text-gray-600 truncate max-w-xs">{student.lastProgressNote || 'لا يوجد'}</td>
                                        <td className="p-3">
                                            <button onClick={() => setStudentForProgress(student)} className="text-sm text-blue-600 font-semibold hover:underline">
                                                عرض / تعديل
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </AdminSection>
            </div>
        </>
    );
};

export default AdminCreativeWritingPage;