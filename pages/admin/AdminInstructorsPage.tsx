
import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Plus, UserCog, Calendar, FileEdit } from 'lucide-react';
import { useAdminInstructors } from '../../hooks/queries/admin/useAdminInstructorsQuery';
import { useInstructorMutations } from '../../hooks/mutations/useInstructorMutations';
import PageLoader from '../../components/ui/PageLoader';
import AvailabilityManager from '../../components/admin/AvailabilityManager';
import { Button } from '../../components/ui/Button';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import Accordion from '../../components/ui/Accordion';
import type { Instructor } from '../../lib/database.types';
import SortableTableHead from '../../components/admin/ui/SortableTableHead';
import { Trash2, UserPlus, Info } from 'lucide-react';

const AdminInstructorsPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: instructors = [], isLoading, error, refetch } = useAdminInstructors();
    const { deleteInstructor } = useInstructorMutations();
    const [sortConfig, setSortConfig] = useState<{ key: keyof Instructor; direction: 'asc' | 'desc' } | null>({ key: 'name', direction: 'asc' });

    const sortedInstructors = useMemo(() => {
        let sortableItems = [...instructors];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                // Handle potentially null/undefined values safely
                const aVal = a[sortConfig.key] || '';
                const bVal = b[sortConfig.key] || '';
                
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [instructors, sortConfig]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key: key as keyof Instructor, direction });
    };

    const handleDeleteInstructor = async (id: number, name: string) => {
        if (window.confirm(`هل أنت متأكد من حذف المدرب "${name}"؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
            deleteInstructor.mutate({ instructorId: id });
        }
    };

    if (isLoading) return <PageLoader text="جاري تحميل بيانات المدربين..." />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

    return (
        <div className="animate-fadeIn space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-3">
                    <UserCog className="text-primary" /> إدارة المدربين
                </h1>
                <Button onClick={() => navigate('/admin/users?tab=staff')} variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/5">
                    <UserPlus size={18} /> إضافة مدرب جديد (عبر إدارة الموظفين)
                </Button>
            </div>
            
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6 flex gap-3 text-sm text-blue-800">
                    <Info className="flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold">تنبيه إداري:</p>
                        <p>هذه الصفحة مخصصة لإدارة "بيانات" المدربين (السيرة الذاتية، الجداول، الأسعار). لإنشاء حساب مدرب جديد أو تغيير صلاحيات دخوله، يرجى الذهاب إلى تبويب <Link to="/admin/users?tab=staff" className="font-black underline">الموظفين</Link>.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users /> المدربون المعتمدون</CardTitle>
                <CardDescription>قائمة بالمدربين الذين يمتلكون ملفات تعريفية منشورة على المنصة.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <SortableTableHead<Instructor> sortKey="name" label="المدرب" sortConfig={sortConfig} onSort={handleSort} />
                                <SortableTableHead<Instructor> sortKey="specialty" label="التخصص" sortConfig={sortConfig} onSort={handleSort} />
                                <TableHead>حالة التحديثات</TableHead>
                                <TableHead>إجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedInstructors.length > 0 ? (
                                sortedInstructors.map(instructor => (
                                    <TableRow key={instructor.id} className="hover:bg-muted/10">
                                        <TableCell className="flex items-center gap-3">
                                            <img src={instructor.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} alt={instructor.name} className="w-10 h-10 rounded-full object-cover border" loading="lazy" />
                                            <span className="font-bold text-foreground">{instructor.name}</span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{instructor.specialty}</TableCell>
                                         <TableCell>
                                            <div className="flex flex-wrap gap-2">
                                                {instructor.schedule_status === 'pending' && (
                                                    <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800">
                                                        <Calendar size={12} /> تحديث جدول
                                                    </span>
                                                )}
                                                {instructor.profile_update_status === 'pending' && (
                                                    <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-full bg-orange-100 text-orange-800">
                                                        <FileEdit size={12} /> تحديث بيانات
                                                    </span>
                                                )}
                                                {instructor.schedule_status !== 'pending' && instructor.profile_update_status !== 'pending' && (
                                                    <span className="text-[10px] text-gray-400">محدث</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button as={Link} to={`/admin/instructors/${instructor.id}`} variant="ghost" size="icon" title="إدارة ملف المدرب">
                                                    <div className="relative">
                                                        <UserCog size={20} />
                                                        {(instructor.profile_update_status === 'pending' || instructor.schedule_status === 'pending') && (
                                                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white"></span>
                                                        )}
                                                    </div>
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    title="حذف المدرب" 
                                                    className="text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDeleteInstructor(instructor.id, instructor.name)}
                                                >
                                                    <Trash2 size={20} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">لا يوجد مدربون مسجلون حالياً.</TableCell>
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
                        <p className="text-muted-foreground mb-6 text-sm">
                            هذه الأداة تسمح لك بتعديل مواعيد أي مدرب بشكل مباشر في حالات الطوارئ أو الطلبات اليدوية من العملاء.
                        </p>
                        <AvailabilityManager />
                    </CardContent>
                </Accordion>
             </Card>
        </div>
    );
};

export default AdminInstructorsPage;
