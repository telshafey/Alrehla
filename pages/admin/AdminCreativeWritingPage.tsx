

import React, { useState, useMemo } from 'react';
import { CheckSquare, Eye, Search, User } from 'lucide-react';
import { useAdminCwBookings } from '../../hooks/queries.ts';
import { useAppMutations } from '../../hooks/mutations.ts';
import PageLoader from '../../components/ui/PageLoader.tsx';
import AdminSection from '../../components/admin/AdminSection.tsx';
import { formatDate, getStatusColor } from '../../utils/helpers.ts';
import BookingDetailsModal from '../../components/admin/BookingDetailsModal.tsx';
import StudentProgressModal from '../../components/admin/StudentProgressModal.tsx';
import type { CreativeWritingBooking } from '../../lib/database.types.ts';

interface Student {
    id: string;
    name: string;
    bookings: CreativeWritingBooking[];
    lastProgressNote: string | null;
}

const AdminCreativeWritingPage: React.FC = () => {
    const { data: bookings = [], isLoading, error } = useAdminCwBookings();
    const { updateBookingStatus } = useAppMutations();

    const [selectedBooking, setSelectedBooking] = useState<CreativeWritingBooking | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const handleViewDetails = (booking: CreativeWritingBooking) => {
        setSelectedBooking(booking);
        setIsDetailsModalOpen(true);
    };
    
    const handleViewProgress = (student: Student) => {
        setSelectedStudent(student);
        setIsProgressModalOpen(true);
    };

    const students = useMemo<Student[]>(() => {
        const studentMap = new Map<string, Student>();
        bookings.forEach(booking => {
            if (!booking.child_profiles) return;
            const studentId = booking.child_id.toString();
            const studentName = booking.child_profiles.name;
            if (!studentMap.has(studentId)) {
                studentMap.set(studentId, { id: studentId, name: studentName, bookings: [], lastProgressNote: null });
            }
            const student = studentMap.get(studentId)!;
            student.bookings.push(booking);
            if (booking.progress_notes) {
                student.lastProgressNote = booking.progress_notes;
            }
        });
        return Array.from(studentMap.values());
    }, [bookings]);

    const filteredBookings = useMemo(() => {
        return bookings
            .filter(b => {
                if (statusFilter !== 'all' && b.status !== statusFilter) return false;
                if (searchTerm && !b.user_name.includes(searchTerm) && !(b as any).child_profiles?.name.includes(searchTerm)) return false;
                return true;
            })
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }, [bookings, searchTerm, statusFilter]);

    const bookingStatuses: CreativeWritingBooking['status'][] = ["بانتظار الدفع", "بانتظار المراجعة", "مؤكد", "مكتمل", "ملغي"];

    if (isLoading) return <PageLoader text="جاري تحميل الحجوزات..." />;
    if (error) return <div className="text-center text-red-500">{error.message}</div>;

    return (
        <>
            <BookingDetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} booking={selectedBooking} />
            <StudentProgressModal isOpen={isProgressModalOpen} onClose={() => setIsProgressModalOpen(false)} student={selectedStudent} />
            <div className="animate-fadeIn space-y-12">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة حجوزات "بداية الرحلة"</h1>
                
                <AdminSection title="الطلاب" icon={<User />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {students.map(student => (
                            <div key={student.id} className="p-4 bg-gray-50 rounded-lg border flex justify-between items-center">
                                <div>
                                    <p className="font-bold">{student.name}</p>
                                    <p className="text-xs text-gray-500">{student.bookings.length} حجوزات</p>
                                </div>
                                <button onClick={() => handleViewProgress(student)} className="text-sm font-semibold text-blue-600 hover:underline">متابعة التقدم</button>
                            </div>
                        ))}
                    </div>
                </AdminSection>

                <AdminSection title="جميع الحجوزات" icon={<CheckSquare />}>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <input
                            type="text"
                            placeholder="ابحث بالاسم..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 border rounded-full bg-gray-50"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full sm:w-48 p-2 border rounded-full bg-gray-50"
                        >
                            <option value="all">كل الحالات</option>
                            {bookingStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="border-b-2">
                                <tr>
                                    <th className="p-3">الطفل</th>
                                    <th className="p-3">الباقة</th>
                                    <th className="p-3">تاريخ الجلسة</th>
                                    <th className="p-3">الحالة</th>
                                    <th className="p-3">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.map(b => (
                                    <tr key={b.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-semibold">{(b as any).child_profiles?.name || 'غير محدد'}</td>
                                        <td className="p-3">{b.package_name}</td>
                                        <td className="p-3">{formatDate(b.booking_date)} - {b.booking_time}</td>
                                        <td className="p-3">
                                            <select 
                                                value={b.status} 
                                                // Correctly call the mutation function using `.mutate`.
                                                onChange={(e) => updateBookingStatus.mutate({ bookingId: b.id, newStatus: e.target.value as CreativeWritingBooking['status'] })}
                                                className={`p-1 text-xs font-bold rounded-full border-2 bg-transparent ${getStatusColor(b.status)}`}
                                                style={{ WebkitAppearance: 'none', appearance: 'none', paddingRight: '1.5rem' }}
                                             >
                                                {bookingStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </td>
                                        <td className="p-3">
                                            <button onClick={() => handleViewDetails(b)}><Eye size={20} /></button>
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
