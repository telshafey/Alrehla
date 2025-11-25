
import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Plus, UserCog, Search } from 'lucide-react';
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
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';


// Main Page Component
const AdminInstructorsPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: instructors = [], isLoading, error, refetch } = useAdminInstructors();
    
    // State for Sort, Filter, Search
    const [sortConfig, setSortConfig] = useState<{ key: keyof Instructor; direction: 'asc' | 'desc' } | null>({ key: 'name', direction: 'asc' });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const filteredAndSortedInstructors = useMemo(() => {
        let data = [...instructors];

        // 1. Filter by Status
        if (statusFilter !== 'all') {
            data = data.filter(instructor => instructor.schedule_status === statusFilter);
        }

        // 2. Search by Name or Specialty
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            data = data.filter(instructor => 
                instructor.name.toLowerCase().includes(lowerTerm) || 
                instructor.specialty.toLowerCase().includes(lowerTerm)
            );
        }

        // 3. Sort
        if (sortConfig !== null) {
            data.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                
                if (aVal === null) return 1;
                if (bVal === null) return -1;

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return data;
    }, [instructors, sortConfig, searchTerm, statusFilter]);

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
                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <Input 
                            placeholder="بحث باسم المدرب أو التخصص..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-10"
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">كل حالات الجدول</option>
                            <option value="approved">معتمد</option>
                            <option value="pending">قيد المراجعة</option>
                            <option value="rejected">مرفوض</option>
                        </Select>
                    </div>
                </div>

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
                            {filteredAndSortedInstructors.length > 0 ? (
                                filteredAndSortedInstructors.map(instructor => (
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
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        لا توجد نتائج تطابق بحثك.
                                    </TableCell>
                                </TableRow>
                            )}
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
