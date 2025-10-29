import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BookOpen, Eye, Edit, Loader2 } from 'lucide-react';
import { useAdminRawCwBookings, transformCwBookings } from '../../hooks/queries/admin/useAdminBookingsQuery';
import { useAdminAllChildProfiles } from '../../hooks/queries/admin/useAdminUsersQuery';
import { useAdminInstructors } from '../../hooks/queries/admin/useAdminInstructorsQuery';
import { useBookingMutations } from '../../hooks/mutations/useBookingMutations';
import PageLoader from '../../components/ui/PageLoader';
import AdminSection from '../../components/admin/AdminSection';
import { BookingDetailsModal } from '../../components/admin/BookingDetailsModal';
import { StudentProgressModal } from '../../components/admin/StudentProgressModal';
import { getStatusColor, formatDate } from '../../utils/helpers';
import type { BookingWithRelations, CreativeWritingBooking, BookingStatus } from '../../lib/database.types';
import { Button } from '../../components/ui/Button';
import StatFilterCard from '../../components/admin/StatFilterCard';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

interface Student {
    id: number;
    name: string;
    bookings: CreativeWritingBooking[];
    lastProgressNote: string | null;
}

const bookingStatuses: BookingStatus[] = ["بانتظار الدفع", "مؤكد", "مكتمل", "ملغي"];
const statusColors: { [key in BookingStatus]: string } = {
    "بانتظار الدفع": "bg-gray-500",
    "مؤكد": "bg-blue-500",
    "مكتمل": "bg-green-500",
    "ملغي": "bg-red-500",
};


const AdminCreativeWritingPage: React.FC = () => {
    const { data: rawBookings = [], isLoading: bookingsLoading } = useAdminRawCwBookings();
    const { data: allChildren = [], isLoading: childrenLoading } = useAdminAllChildProfiles();
    const { data: instructors = [], isLoading: instructorsLoading } = useAdminInstructors();
    const { updateBookingStatus } = useBookingMutations();
    const location = useLocation();

    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<BookingWithRelations | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    
    const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>((location.state as any)?.statusFilter || 'all');
    const [searchTerm, setSearchTerm] = useState('');

    const isLoading = bookingsLoading || childrenLoading || instructorsLoading;

    useEffect(() => {
        if (location.state?.statusFilter) {
            setStatusFilter(location.state.statusFilter);
        }
    }, [location.state]);

    const bookings = useMemo(
        () => transformCwBookings(rawBookings, allChildren, instructors),
        [rawBookings, allChildren, instructors]
    );

    const students = useMemo(() => {
        const studentMap = new Map<number, Student>();
        bookings.forEach(booking => {
            if (!booking.child_profiles) return;
            const childId = booking.child_id;
            if (!studentMap.has(childId)) {
                studentMap.set(childId, {
                    id: childId,
                    name: booking.child_profiles.name,
                    bookings: [],
                    lastProgressNote: null,
                });
            }
            const student = studentMap.get(childId)!;
            student.bookings.push(booking);
            if (booking.progress_notes) {
                student.lastProgressNote = booking.progress_notes;
            }
        });
        return Array.from(studentMap.values());
    }, [bookings]);
    
    const statusCounts = useMemo(() => {
        const counts: { [key in BookingStatus]?: number } = {};
        for (const booking of bookings) {
            counts[booking.status] = (counts[booking.status] || 0) + 1;
        }
        return counts;
    }, [bookings]);

    const filteredBookings = useMemo(() => {
        let filtered = bookings;
        if (statusFilter !== 'all') {
            filtered = filtered.filter(b => b.status === statusFilter);
        }
        if (searchTerm.trim() !== '') {
            const lowercasedTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(b =>
                b.child_profiles?.name?.toLowerCase().includes(lowercasedTerm) ||
                b.id.toLowerCase().includes(lowercasedTerm)
            );
        }
        return filtered;
    }, [bookings, statusFilter, searchTerm]);

    const handleViewDetails = (booking: BookingWithRelations) => {
        setSelectedBooking(booking);
        setIsDetailsModalOpen(true);
    };

    const handleEditProgress = (student: Student) => {
        setSelectedStudent(student);
        setIsProgressModalOpen(true);
    };

    if (isLoading) return <PageLoader text="جاري تحميل الحجوزات..." />;

    return (
        <>
            <BookingDetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} booking={selectedBooking} />
            <StudentProgressModal isOpen={isProgressModalOpen} onClose={() => setIsProgressModalOpen(false)} student={selectedStudent} />
            <div className="animate-fadeIn space-y-12">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة حجوزات "بداية الرحلة"</h1>
                
                <AdminSection title="ملخص الطلاب" icon={<BookOpen />}>
                    <div className="overflow-x-auto">
                         <table className="w-full text-right">
                            <thead className="border-b-2"><tr>
                                <th className="p-3">الطالب</th>
                                <th className="p-3">عدد الجلسات المحجوزة</th>
                                <th className="p-3">آخر ملاحظات</th>
                                <th className="p-3">إجراءات</th>
                            </tr></thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-semibold">{student.name}</td>
                                        <td className="p-3">{student.bookings.length}</td>
                                        <td className="p-3 text-sm text-gray-500 truncate max-w-xs">{student.lastProgressNote || 'لا يوجد'}</td>
                                        <td className="p-3">
                                            <Button variant="ghost" size="sm" onClick={() => handleEditProgress(student)} icon={<Edit size={16}/>}>
                                                ملاحظات التقدم
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </AdminSection>

                <div>
                     <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                        <StatFilterCard label="الكل" value={bookings.length} color="bg-gray-800" isActive={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
                        {bookingStatuses.map(status => (
                            <StatFilterCard 
                                key={status}
                                label={status}
                                value={statusCounts[status] || 0}
                                color={statusColors[status] || 'bg-gray-500'}
                                isActive={statusFilter === status}
                                onClick={() => setStatusFilter(status)}
                            />
                        ))}
                    </div>

                    <AdminSection title="قائمة كل الحجوزات" icon={<BookOpen />}>
                        <div className="mb-6 max-w-lg">
                            <Input 
                                type="search"
                                placeholder="ابحث برقم الحجز أو اسم الطالب..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                               <thead className="border-b-2"><tr>
                                    <th className="p-3">الطالب</th><th className="p-3">الباقة</th><th className="p-3">المدرب</th><th className="p-3">الحالة</th><th className="p-3">تاريخ الجلسة</th><th className="p-3">إجراءات</th>
                                </tr></thead>
                                <tbody>
                                    {filteredBookings.map(booking => (
                                        <tr key={booking.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 font-semibold">{booking.child_profiles?.name}</td>
                                            <td className="p-3">{booking.package_name}</td>
                                            <td className="p-3">{booking.instructors?.name}</td>
                                            <td className="p-3 min-w-[150px]">
                                                <div className="flex items-center gap-2">
                                                    <Select
                                                        value={booking.status}
                                                        onChange={e => updateBookingStatus.mutate({ bookingId: booking.id, newStatus: e.target.value as BookingStatus })}
                                                        className={`w-full p-1 text-xs font-bold ${getStatusColor(booking.status)}`}
                                                        disabled={updateBookingStatus.isPending && updateBookingStatus.variables?.bookingId === booking.id}
                                                    >
                                                        {bookingStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </Select>
                                                     {updateBookingStatus.isPending && updateBookingStatus.variables?.bookingId === booking.id && <Loader2 className="animate-spin" size={16} />}
                                                </div>
                                            </td>
                                            <td className="p-3 text-sm">{formatDate(booking.booking_date)}</td>
                                            <td className="p-3">
                                                <Button variant="ghost" size="icon" onClick={() => handleViewDetails(booking)}><Eye size={20} /></Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredBookings.length === 0 && <p className="text-center py-8 text-gray-500">لا توجد حجوزات تطابق بحثك أو الفلتر المحدد.</p>}
                        </div>
                    </AdminSection>
                </div>
            </div>
        </>
    );
};

export default AdminCreativeWritingPage;