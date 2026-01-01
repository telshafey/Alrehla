
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Eye, Loader2, Search, RefreshCw } from 'lucide-react';
import { useAdminRawCwBookings, transformCwBookings } from '../../hooks/queries/admin/useAdminBookingsQuery';
import { useAdminAllChildProfiles } from '../../hooks/queries/admin/useAdminUsersQuery';
import { useAdminInstructors } from '../../hooks/queries/admin/useAdminInstructorsQuery';
import { useBookingMutations } from '../../hooks/mutations/useBookingMutations';
import PageLoader from '../../components/ui/PageLoader';
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

const bookingStatuses: BookingStatus[] = ["بانتظار الدفع", "مؤكد", "مكتمل", "ملغي"];
const statusColors: { [key in BookingStatus]: string } = {
    "بانتظار الدفع": "bg-gray-500",
    "مؤكد": "bg-blue-500",
    "مكتمل": "bg-green-500",
    "ملغي": "bg-red-500",
};

const AdminCreativeWritingPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { data: rawBookings = [], isLoading: bookingsLoading, error: bookingsError, refetch: refetchBookings, isRefetching } = useAdminRawCwBookings();
    const { data: allChildren = [], isLoading: childrenLoading, error: childrenError, refetch: refetchChildren } = useAdminAllChildProfiles();
    const { data: instructors = [], isLoading: instructorsLoading, error: instructorsError, refetch: refetchInstructors } = useAdminInstructors();
    const { updateBookingStatus } = useBookingMutations();

    const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>((location.state as any)?.statusFilter || 'all');
    const [packageFilter, setPackageFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [bookingsSortConfig, setBookingsSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'created_at', direction: 'desc' });

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
    
    const uniquePackages = useMemo(() => {
        return Array.from(new Set(bookings.map(b => b.package_name))).filter(Boolean);
    }, [bookings]);

    const statusCounts = useMemo(() => {
        const counts: { [key in BookingStatus]?: number } = {};
        for (const booking of bookings) {
            counts[booking.status] = (counts[booking.status] || 0) + 1;
        }
        return counts;
    }, [bookings]);

    const sortedAndFilteredBookings = useMemo(() => {
        let filtered = [...bookings];
        
        // 1. Filter by Status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(b => b.status === statusFilter);
        }
        
        // 2. Filter by Package
        if (packageFilter !== 'all') {
            filtered = filtered.filter(b => b.package_name === packageFilter);
        }

        // 3. Search
        if (searchTerm.trim() !== '') {
            const lowercasedTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(b =>
                b.child_profiles?.name?.toLowerCase().includes(lowercasedTerm) ||
                b.id.toLowerCase().includes(lowercasedTerm) ||
                b.instructors?.name?.toLowerCase().includes(lowercasedTerm)
            );
        }

        // 4. Sort
        if (bookingsSortConfig !== null) {
            filtered.sort((a, b) => {
                const getNestedValue = (obj: any, path: string) => path.split('.').reduce((o, i) => (o ? o[i] : null), obj);
                const aVal = getNestedValue(a, bookingsSortConfig.key);
                const bVal = getNestedValue(b, bookingsSortConfig.key);
                
                if (aVal === null) return 1;
                if (bVal === null) return -1;

                if (aVal < bVal) return bookingsSortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return bookingsSortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [bookings, statusFilter, packageFilter, searchTerm, bookingsSortConfig]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (bookingsSortConfig && bookingsSortConfig.key === key && bookingsSortConfig.direction === 'asc') direction = 'desc';
        setBookingsSortConfig({ key, direction });
    };
    
    const error = bookingsError || childrenError || instructorsError;
    const refetchAll = () => {
        refetchBookings();
        refetchChildren();
        refetchInstructors();
    };

    if (isLoading) return <PageLoader text="جاري تحميل الحجوزات..." />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetchAll} />;

    return (
        <div className="animate-fadeIn space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-extrabold text-foreground">إدارة حجوزات "بداية الرحلة"</h1>
                <Button onClick={refetchAll} variant="outline" size="sm" icon={<RefreshCw className={isRefetching ? 'animate-spin' : ''} size={16}/>}>تحديث البيانات</Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <Input 
                                type="search"
                                placeholder="ابحث برقم الحجز، اسم الطالب، أو المدرب..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pr-10"
                            />
                        </div>
                        <div className="w-full md:w-64">
                            <Select value={packageFilter} onChange={(e) => setPackageFilter(e.target.value)}>
                                <option value="all">كل الباقات</option>
                                {uniquePackages.map(pkg => (
                                    <option key={pkg} value={pkg}>{pkg}</option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <SortableTableHead<BookingWithRelations> sortKey="child_profiles.name" label="الطالب" sortConfig={bookingsSortConfig} onSort={handleSort} />
                                    <SortableTableHead<BookingWithRelations> sortKey="package_name" label="الباقة" sortConfig={bookingsSortConfig} onSort={handleSort} />
                                    <SortableTableHead<BookingWithRelations> sortKey="instructors.name" label="المدرب" sortConfig={bookingsSortConfig} onSort={handleSort} />
                                    <SortableTableHead<BookingWithRelations> sortKey="status" label="الحالة" sortConfig={bookingsSortConfig} onSort={handleSort} />
                                    <SortableTableHead<BookingWithRelations> sortKey="booking_date" label="تاريخ الجلسة" sortConfig={bookingsSortConfig} onSort={handleSort} />
                                    <TableHead>إجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedAndFilteredBookings.length > 0 ? sortedAndFilteredBookings.map(booking => (
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
                                            <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/creative-writing/bookings/${booking.id}`)} title="عرض التفاصيل"><Eye size={20} /></Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            لا توجد حجوزات تطابق بحثك أو الفلتر المحدد.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminCreativeWritingPage;
