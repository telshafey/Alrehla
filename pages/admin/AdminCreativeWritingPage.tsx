import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BookOpen, Eye, Edit, Loader2 } from 'lucide-react';
import { useAdminRawCwBookings, transformCwBookings } from '../../hooks/queries/admin/useAdminBookingsQuery';
import { useAdminAllChildProfiles } from '../../hooks/queries/admin/useAdminUsersQuery';
import { useAdminInstructors } from '../../hooks/queries/admin/useAdminInstructorsQuery';
import { useBookingMutations } from '../../hooks/mutations/useBookingMutations';
import PageLoader from '../../components/ui/PageLoader';
import { BookingDetailsModal } from '../../components/admin/BookingDetailsModal';
import { StudentProgressModal } from '../../components/admin/StudentProgressModal';
import { getStatusColor, formatDate } from '../../utils/helpers';
import type { BookingWithRelations, CreativeWritingBooking, BookingStatus } from '../../lib/database.types';
import { Button } from '../../components/ui/Button';
import StatFilterCard from '../../components/admin/StatFilterCard';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import ErrorState from '../../components/ui/ErrorState';
import SortableTableHead from '../../components/admin/ui/SortableTableHead';


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
    const { data: rawBookings = [], isLoading: bookingsLoading, error: bookingsError, refetch: refetchBookings } = useAdminRawCwBookings();
    const { data: allChildren = [], isLoading: childrenLoading, error: childrenError, refetch: refetchChildren } = useAdminAllChildProfiles();
    const { data: instructors = [], isLoading: instructorsLoading, error: instructorsError, refetch: refetchInstructors } = useAdminInstructors();
    const { updateBookingStatus } = useBookingMutations();
    const location = useLocation();

    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<BookingWithRelations | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    
    const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>((location.state as any)?.statusFilter || 'all');
    const [searchTerm, setSearchTerm] = useState('');
    const [bookingsSortConfig, setBookingsSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'created_at', direction: 'desc' });
    const [studentsSortConfig, setStudentsSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'name', direction: 'asc' });

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

     const sortedStudents = useMemo(() => {
        let sortableItems = [...students];
        if (studentsSortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aVal = studentsSortConfig.key === 'bookings' ? a.bookings.length : a[studentsSortConfig.key as keyof Student];
                const bVal = studentsSortConfig.key === 'bookings' ? b.bookings.length : b[studentsSortConfig.key as keyof Student];
                if (aVal < bVal) return studentsSortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return studentsSortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [students, studentsSortConfig]);
    
    const statusCounts = useMemo(() => {
        const counts: { [key in BookingStatus]?: number } = {};
        for (const booking of bookings) {
            counts[booking.status] = (counts[booking.status] || 0) + 1;
        }
        return counts;
    }, [bookings]);

    const sortedAndFilteredBookings = useMemo(() => {
        let filtered = [...bookings];
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

        if (bookingsSortConfig !== null) {
            filtered.sort((a, b) => {
                const getNestedValue = (obj: any, path: string) => path.split('.').reduce((o, i) => (o ? o[i] : null), obj);
                const aVal = getNestedValue(a, bookingsSortConfig.key);
                const bVal = getNestedValue(b, bookingsSortConfig.key);
                if (aVal < bVal) return bookingsSortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return bookingsSortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [bookings, statusFilter, searchTerm, bookingsSortConfig]);

    const handleViewDetails = (booking: BookingWithRelations) => {
        setSelectedBooking(booking);
        setIsDetailsModalOpen(true);
    };

    const handleEditProgress = (student: Student) => {
        setSelectedStudent(student);
        setIsProgressModalOpen(true);
    };

    const handleSort = (table: 'students' | 'bookings', key: string) => {
        if (table === 'students') {
            let direction: 'asc' | 'desc' = 'asc';
            if (studentsSortConfig && studentsSortConfig.key === key && studentsSortConfig.direction === 'asc') direction = 'desc';
            setStudentsSortConfig({ key, direction });
        } else {
            let direction: 'asc' | 'desc' = 'asc';
            if (bookingsSortConfig && bookingsSortConfig.key === key && bookingsSortConfig.direction === 'asc') direction = 'desc';
            setBookingsSortConfig({ key, direction });
        }
    };
    
    const error = bookingsError || childrenError || instructorsError;
    const refetch = () => {
        if (bookingsError) refetchBookings();
        if (childrenError) refetchChildren();
        if (instructorsError) refetchInstructors();
    }


    if (isLoading) return <PageLoader text="جاري تحميل الحجوزات..." />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

    return (
        <>
            <BookingDetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} booking={selectedBooking} />
            <StudentProgressModal isOpen={isProgressModalOpen} onClose={() => setIsProgressModalOpen(false)} student={selectedStudent} />
            <div className="animate-fadeIn space-y-8">
                <h1 className="text-3xl font-extrabold text-foreground">إدارة حجوزات "بداية الرحلة"</h1>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BookOpen /> ملخص الطلاب</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <SortableTableHead<Student> sortKey="name" label="الطالب" sortConfig={studentsSortConfig} onSort={(key) => handleSort('students', key)} />
                                        <SortableTableHead<Student> sortKey="bookings" label="عدد الجلسات المحجوزة" sortConfig={studentsSortConfig} onSort={(key) => handleSort('students', key)} />
                                        <SortableTableHead<Student> sortKey="lastProgressNote" label="آخر ملاحظات" sortConfig={studentsSortConfig} onSort={(key) => handleSort('students', key)} />
                                        <TableHead>إجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedStudents.map(student => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-semibold">{student.name}</TableCell>
                                            <TableCell>{student.bookings.length}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground truncate max-w-xs">{student.lastProgressNote || 'لا يوجد'}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm" onClick={() => handleEditProgress(student)} icon={<Edit size={16}/>}>
                                                    ملاحظات التقدم
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <div>
                     <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                        <StatFilterCard label="الكل" value={bookings.length} color="bg-primary" isActive={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
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

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><BookOpen /> قائمة كل الحجوزات</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-6 max-w-lg">
                                <Input 
                                    type="search"
                                    placeholder="ابحث برقم الحجز أو اسم الطالب..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                   <TableHeader>
                                       <TableRow>
                                            <SortableTableHead<BookingWithRelations> sortKey="child_profiles.name" label="الطالب" sortConfig={bookingsSortConfig} onSort={(key) => handleSort('bookings', key)} />
                                            <SortableTableHead<BookingWithRelations> sortKey="package_name" label="الباقة" sortConfig={bookingsSortConfig} onSort={(key) => handleSort('bookings', key)} />
                                            <SortableTableHead<BookingWithRelations> sortKey="instructors.name" label="المدرب" sortConfig={bookingsSortConfig} onSort={(key) => handleSort('bookings', key)} />
                                            <SortableTableHead<BookingWithRelations> sortKey="status" label="الحالة" sortConfig={bookingsSortConfig} onSort={(key) => handleSort('bookings', key)} />
                                            <SortableTableHead<BookingWithRelations> sortKey="booking_date" label="تاريخ الجلسة" sortConfig={bookingsSortConfig} onSort={(key) => handleSort('bookings', key)} />
                                            <TableHead>إجراءات</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sortedAndFilteredBookings.map(booking => (
                                            <TableRow key={booking.id}>
                                                <TableCell className="font-semibold">{booking.child_profiles?.name}</TableCell>
                                                <TableCell>{booking.package_name}</TableCell>
                                                <TableCell>{booking.instructors?.name}</TableCell>
                                                <TableCell className="min-w-[150px]">
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
                                                </TableCell>
                                                <TableCell className="text-sm">{formatDate(booking.booking_date)}</TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" onClick={() => handleViewDetails(booking)}><Eye size={20} /></Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {sortedAndFilteredBookings.length === 0 && <p className="text-center py-8 text-muted-foreground">لا توجد حجوزات تطابق بحثك أو الفلتر المحدد.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default AdminCreativeWritingPage;