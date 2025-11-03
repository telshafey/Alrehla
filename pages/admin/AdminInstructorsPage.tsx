import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Plus, UserCog } from 'lucide-react';
import { useAdminInstructors } from '../../hooks/queries/admin/useAdminInstructorsQuery';
import PageLoader from '../../components/ui/PageLoader';
import AvailabilityManager from '../../components/admin/AvailabilityManager';
import { Button } from '../../components/ui/Button';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import Accordion from '../../components/ui/Accordion';
import type { Instructor } from '../../lib/database.types';
import SortableTableHead from '../../components/admin/ui/SortableTableHead';


// Main Page Component
const AdminInstructorsPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: instructors = [], isLoading, error, refetch } = useAdminInstructors();
    const [sortConfig, setSortConfig] = useState<{ key: keyof Instructor; direction: 'asc' | 'desc' } | null>({ key: 'name', direction: 'asc' });

    const sortedInstructors = useMemo(() => {
        let sortableItems = [...instructors];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [instructors, sortConfig]);

    const handleSort = (key: keyof Instructor) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    if (isLoading) return <PageLoader text="جاري تحميل بيانات المدربين..." />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

    return (
        <div className="animate-fadeIn space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-foreground">إدارة المدربين</h1>
                <Button onClick={() => navigate('/admin/instructors/new')} icon={<Plus size={18} />}>
                    إضافة مدرب
                </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users /> قائمة المدربين</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <SortableTableHead<Instructor> sortKey="name" label="المدرب" sortConfig={sortConfig} onSort={handleSort} />
                                <SortableTableHead<Instructor> sortKey="specialty" label="التخصص" sortConfig={sortConfig} onSort={handleSort} />
                                <SortableTableHead<Instructor> sortKey="schedule_status" label="حالة الجدول" sortConfig={sortConfig} onSort={handleSort} />
                                <TableHead>إجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedInstructors.map(instructor => (
                                <TableRow key={instructor.id}>
                                    <TableCell className="flex items-center gap-3">
                                        <img src={instructor.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} alt={instructor.name} className="w-10 h-10 rounded-full object-cover" loading="lazy" />
                                        <span className="font-medium text-foreground">{instructor.name}</span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{instructor.specialty}</TableCell>
                                     <TableCell>
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                            instructor.schedule_status === 'approved' ? 'bg-green-100 text-green-800' :
                                            instructor.schedule_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            instructor.schedule_status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-muted text-muted-foreground'
                                        }`}>
                                            {instructor.schedule_status === 'approved' ? 'معتمد' :
                                             instructor.schedule_status === 'pending' ? 'قيد المراجعة' :
                                             instructor.schedule_status === 'rejected' ? 'مرفوض' : 'غير محدد'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Button as={Link} to={`/admin/instructors/${instructor.id}`} variant="ghost" size="icon" title="إدارة ملف المدرب">
                                            <UserCog size={20} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
              </CardContent>
            </Card>
            
             <Card>
                <Accordion title="إدارة المواعيد المتاحة (تجاوز يدوي)">
                    <CardContent>
                        <p className="text-muted-foreground mb-6">
                            اختر مدربًا ثم اختر يومًا من التقويم لإضافة أو حذف المواعيد المتاحة فيه بشكل مباشر. هذا الإجراء يتجاوز نظام موافقة الجداول.
                        </p>
                        <AvailabilityManager />
                    </CardContent>
                </Accordion>
             </Card>
        </div>
    );
};

export default AdminInstructorsPage;
