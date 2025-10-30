import React, { useState } from 'react';
import { Users, Plus, Edit, Calendar, Check, XCircle, UserCog, AlertCircle } from 'lucide-react';
import { useAdminInstructors } from '../../hooks/queries/admin/useAdminInstructorsQuery';
import { useInstructorMutations } from '../../hooks/mutations/useInstructorMutations';
import PageLoader from '../../components/ui/PageLoader';
import AvailabilityManager from '../../components/admin/AvailabilityManager';
import type { WeeklySchedule, Instructor } from '../../lib/database.types';
import InstructorModal from '../../components/admin/InstructorModal';
import { Button } from '../../components/ui/Button';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import Accordion from '../../components/ui/Accordion';


const fieldLabels: { [key: string]: string } = {
    name: 'الاسم',
    specialty: 'التخصص',
    bio: 'النبذة التعريفية',
    rate_per_session: 'سعر الجلسة المقترح',
};

const PendingUpdateDetails: React.FC<{ updates: any }> = ({ updates }) => {
    if (!updates || Object.keys(updates).length === 0) {
        return <p className="text-xs text-muted-foreground">لا توجد تغييرات مقترحة.</p>;
    }
    return (
        <ul className="text-xs list-disc pr-4 space-y-1">
            {Object.entries(updates).map(([key, value]) => (
                <li key={key}>
                    <span className="font-semibold">{fieldLabels[key] || key}:</span>{' '}
                    <span className="text-muted-foreground whitespace-pre-wrap">{String(value)}</span>
                </li>
            ))}
        </ul>
    );
};


// Main Page Component
const AdminInstructorsPage: React.FC = () => {
    const { data: instructors = [], isLoading, error, refetch } = useAdminInstructors();
    const { 
        createInstructor, 
        updateInstructor, 
        approveInstructorSchedule, 
        rejectInstructorSchedule,
        approveInstructorProfileUpdate,
        rejectInstructorProfileUpdate
    } = useInstructorMutations();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleOpenModal = (instructor: Instructor | null) => {
        setSelectedInstructor(instructor);
        setIsModalOpen(true);
    };

    const handleSaveInstructor = async (details: any) => {
        setIsSaving(true);
        try {
            if (details.id) {
                await updateInstructor.mutateAsync(details);
            } else {
                await createInstructor.mutateAsync(details);
            }
            setIsModalOpen(false);
        } catch(e) {
            // Error toast is handled in context
        } finally {
            setIsSaving(false);
        }
    };
    
    const pendingSchedules = instructors.filter(i => i.schedule_status === 'pending');
    const pendingProfileUpdates = instructors.filter(i => i.profile_update_status === 'pending');


    if (isLoading) return <PageLoader text="جاري تحميل بيانات المدربين..." />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

    const dayNames = {
        sunday: 'الأحد',
        monday: 'الاثنين',
        tuesday: 'الثلاثاء',
        wednesday: 'الأربعاء',
        thursday: 'الخميس',
        friday: 'الجمعة',
        saturday: 'السبت',
    };
    
    return (
        <>
            <InstructorModal 
              isOpen={isModalOpen} 
              onClose={() => setIsModalOpen(false)} 
              onSave={handleSaveInstructor} 
              instructor={selectedInstructor} 
              isSaving={isSaving}
            />
            <div className="animate-fadeIn space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-extrabold text-foreground">إدارة المدربين</h1>
                    <Button onClick={() => handleOpenModal(null)} icon={<Plus size={18} />}>
                        إضافة مدرب
                    </Button>
                </div>
                
                {(pendingSchedules.length > 0 || pendingProfileUpdates.length > 0) && (
                    <Card border="border-yellow-400">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-yellow-600"><AlertCircle /> طلبات بانتظار المراجعة</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {pendingSchedules.length > 0 && (
                                <div>
                                    <h3 className="font-bold mb-2">طلبات تعديل الجداول ({pendingSchedules.length})</h3>
                                    <div className="space-y-4">
                                        {pendingSchedules.map(instructor => (
                                            <div key={instructor.id} className="p-4 bg-muted/50 rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <h3 className="font-bold text-foreground">طلب جديد من: {instructor.name}</h3>
                                                        <div className="text-sm text-muted-foreground mt-2">
                                                            {Object.entries((instructor.weekly_schedule as WeeklySchedule) || {}).map(([day, times]) => (
                                                                (Array.isArray(times) && times.length > 0) && <p key={day}><span className="font-semibold">{dayNames[day as keyof typeof dayNames]}:</span> {times.join(', ')}</p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="subtle" size="icon" onClick={() => approveInstructorSchedule.mutate({instructorId: instructor.id})} className="bg-green-100 text-green-700 hover:bg-green-200"><Check size={20}/></Button>
                                                        <Button variant="subtle" size="icon" onClick={() => rejectInstructorSchedule.mutate({instructorId: instructor.id})} className="bg-red-100 text-red-700 hover:bg-red-200"><XCircle size={20}/></Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {pendingProfileUpdates.length > 0 && (
                                <div className={pendingSchedules.length > 0 ? 'border-t pt-6' : ''}>
                                    <h3 className="font-bold mb-2">طلبات تعديل الملفات الشخصية ({pendingProfileUpdates.length})</h3>
                                    <div className="space-y-4">
                                        {pendingProfileUpdates.map((instructor: Instructor) => {
                                            const pendingData = instructor.pending_profile_data as any;
                                            return (
                                                <div key={instructor.id} className="p-4 bg-muted/50 rounded-lg">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-bold text-foreground">طلب تحديث من: {instructor.name}</h3>
                                                            <div className="mt-2 text-sm text-foreground bg-white p-3 rounded-md border">
                                                                <p className="font-semibold">البيانات الجديدة المقترحة:</p>
                                                                <div className="bg-muted/50 p-2 rounded mt-1">
                                                                    <PendingUpdateDetails updates={pendingData?.updates} />
                                                                </div>
                                                                <p className="font-semibold mt-2 border-t pt-2">المبررات:</p>
                                                                <p className="whitespace-pre-wrap text-xs text-muted-foreground">{pendingData?.justification || 'لا يوجد'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 flex-shrink-0">
                                                            <Button variant="subtle" size="icon" onClick={() => approveInstructorProfileUpdate.mutate({ instructorId: instructor.id })} className="bg-green-100 text-green-700 hover:bg-green-200"><Check size={20} /></Button>
                                                            <Button variant="subtle" size="icon" onClick={() => rejectInstructorProfileUpdate.mutate({ instructorId: instructor.id })} className="bg-red-100 text-red-700 hover:bg-red-200"><XCircle size={20} /></Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users /> قائمة المدربين</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>المدرب</TableHead>
                                    <TableHead>التخصص</TableHead>
                                    <TableHead>حالة الجدول</TableHead>
                                    <TableHead>إجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {instructors.map(instructor => (
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
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(instructor)}>
                                                <Edit size={20} />
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
        </>
    );
};

export default AdminInstructorsPage;