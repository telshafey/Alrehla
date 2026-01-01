
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Eye, Loader2, Search, RefreshCw, Archive, CheckCircle2 } from 'lucide-react';
import { useAdminRawCwBookings, transformCwBookings } from '../../hooks/queries/admin/useAdminBookingsQuery';
import { useAdminAllChildProfiles } from '../../hooks/queries/admin/useAdminUsersQuery';
import { useAdminInstructors } from '../../hooks/queries/admin/useAdminInstructorsQuery';
import { useBookingMutations } from '../../hooks/mutations/useBookingMutations';
import PageLoader from '../../components/ui/PageLoader';
import { getStatusColor, formatDate } from '../../utils/helpers';
import type { BookingWithRelations, BookingStatus } from '../../lib/database.types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import ErrorState from '../../components/ui/ErrorState';
import SortableTableHead from '../../components/admin/ui/SortableTableHead';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';

const AdminCreativeWritingPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: rawBookings = [], isLoading, error, refetch, isRefetching } = useAdminRawCwBookings();
    const { data: allChildren = [] } = useAdminAllChildProfiles();
    const { data: instructors = [] } = useAdminInstructors();
    const { updateBookingStatus } = useBookingMutations();

    const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'created_at', direction: 'desc' });

    const bookings = useMemo(
        () => transformCwBookings(rawBookings, allChildren, instructors),
        [rawBookings, allChildren, instructors]
    );

    const filteredBookings = useMemo(() => {
        return bookings.filter(b => {
            const isArchived = b.status === 'ملغي';
            const tabMatch = activeTab === 'archived' ? isArchived : !isArchived;
            const searchMatch = !searchTerm || 
                b.child_profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.id.toLowerCase().includes(searchTerm.toLowerCase());
            
            return tabMatch && searchMatch;
        }).sort((a, b) => {
            if (!sortConfig) return 0;
            const aVal = (a as any)[sortConfig.key];
            const bVal = (b as any)[sortConfig.key];
            return sortConfig.direction === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
        });
    }, [bookings, activeTab, searchTerm, sortConfig]);

    if (isLoading) return <PageLoader text="جاري تحميل الحجوزات..." />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

    return (
        <div className="animate-fadeIn space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-foreground">إدارة الحجوزات</h1>
                <Button onClick={() => refetch()} variant="outline" size="sm" icon={<RefreshCw className={isRefetching ? 'animate-spin' : ''} size={16}/>}>تحديث</Button>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                    <TabsList>
                        <TabsTrigger value="active" className="gap-2"><CheckCircle2 size={16}/> الحجوزات النشطة</TabsTrigger>
                        <TabsTrigger value="archived" className="gap-2"><Archive size={16}/> الأرشيف (الملغاة)</TabsTrigger>
                    </TabsList>
                    <div className="relative w-full md:w-80">
                        <Input 
                            placeholder="ابحث باسم الطالب أو رقم الحجز..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                        />
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <SortableTableHead sortKey="child_profiles.name" label="الطالب" sortConfig={sortConfig} onSort={(k) => setSortConfig({key: k, direction: 'desc'})} />
                                        <TableHead>المدرب</TableHead>
                                        <TableHead>الباقة</TableHead>
                                        <TableHead>الحالة</TableHead>
                                        <TableHead>تاريخ البداية</TableHead>
                                        <TableHead>إجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredBookings.map(booking => (
                                        <TableRow key={booking.id}>
                                            <TableCell className="font-bold">{booking.child_profiles?.name}</TableCell>
                                            <TableCell>{booking.instructors?.name}</TableCell>
                                            <TableCell className="text-xs">{booking.package_name}</TableCell>
                                            <TableCell>
                                                <Select
                                                    value={booking.status}
                                                    onChange={e => updateBookingStatus.mutate({ bookingId: booking.id, newStatus: e.target.value as BookingStatus })}
                                                    className={`p-1 text-xs font-bold ${getStatusColor(booking.status)}`}
                                                >
                                                    {["بانتظار الدفع", "مؤكد", "مكتمل", "ملغي"].map(s => <option key={s} value={s}>{s}</option>)}
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-xs">{formatDate(booking.booking_date)}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/creative-writing/bookings/${booking.id}`)}><Eye size={18}/></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {filteredBookings.length === 0 && <p className="text-center py-10 text-muted-foreground">لا توجد سجلات في هذا التبويب.</p>}
                        </div>
                    </CardContent>
                </Card>
            </Tabs>
        </div>
    );
};

export default AdminCreativeWritingPage;
