

import React, { useState } from 'react';
import { Users, Plus, Edit, Calendar, Check, XCircle } from 'lucide-react';
import { useAdminInstructors } from '../../hooks/queries.ts';
import { useAppMutations } from '../../hooks/mutations.ts';
import AdminSection from '../../components/admin/AdminSection.tsx';
import PageLoader from '../../components/ui/PageLoader.tsx';
import AvailabilityManager from '../../components/admin/AvailabilityManager.tsx';
import type { WeeklySchedule, Instructor } from '../../lib/database.types.ts';
import InstructorModal from '../../components/admin/InstructorModal.tsx';

// Main Page Component
const AdminInstructorsPage: React.FC = () => {
    const { data: instructors = [], isLoading, error } = useAdminInstructors();
    const { createInstructor, updateInstructor, approveInstructorSchedule, rejectInstructorSchedule } = useAppMutations();
    
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
                // Correctly call the mutation function using `.mutateAsync`.
                await updateInstructor.mutateAsync(details);
            } else {
                // Correctly call the mutation function using `.mutateAsync`.
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

    if (isLoading) return <PageLoader text="جاري تحميل بيانات المدربين..." />;
    if (error) return <div className="text-center text-red-500 text-lg bg-red-50 p-6 rounded-lg">{error.message}</div>;

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
            <div className="animate-fadeIn space-y-12">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة المدربين</h1>
                    <button onClick={() => handleOpenModal(null)} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-700">
                        <Plus size={18} /><span>إضافة مدرب</span>
                    </button>
                </div>
                
                 {pendingSchedules.length > 0 && (
                    <AdminSection title="طلبات تعديل الجداول" icon={<Calendar />}>
                        <div className="space-y-4">
                            {pendingSchedules.map(instructor => (
                                <div key={instructor.id} className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-gray-800">طلب جديد من: {instructor.name}</h3>
                                            <div className="text-sm text-gray-600 mt-2">
                                                {Object.entries((instructor.weekly_schedule as WeeklySchedule) || {}).map(([day, times]) => (
                                                   (Array.isArray(times) && times.length > 0) && <p key={day}><span className="font-semibold">{dayNames[day as keyof typeof dayNames]}:</span> {times.join(', ')}</p>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {/* Correctly call the mutation function using `.mutate`. */}
                                            <button onClick={() => approveInstructorSchedule.mutate({instructorId: instructor.id})} className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200"><Check size={20}/></button>
                                            {/* Correctly call the mutation function using `.mutate`. */}
                                            <button onClick={() => rejectInstructorSchedule.mutate({instructorId: instructor.id})} className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200"><XCircle size={20}/></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AdminSection>
                )}


                <AdminSection title="قائمة المدربين" icon={<Users />}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="border-b-2 border-gray-200">
                                <tr>
                                    <th className="py-3 px-4 font-semibold text-gray-600">المدرب</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">التخصص</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">حالة الجدول</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {instructors.map(instructor => (
                                    <tr key={instructor.id} className="border-b hover:bg-gray-50">
                                        <td className="py-4 px-4 flex items-center gap-3">
                                            <img src={instructor.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} alt={instructor.name} className="w-10 h-10 rounded-full object-cover" loading="lazy" />
                                            <span className="font-medium text-gray-800">{instructor.name}</span>
                                        </td>
                                        <td className="py-4 px-4 text-gray-600">{instructor.specialty}</td>
                                         <td className="py-4 px-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                                instructor.schedule_status === 'approved' ? 'bg-green-100 text-green-800' :
                                                instructor.schedule_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                instructor.schedule_status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {instructor.schedule_status === 'approved' ? 'معتمد' :
                                                 instructor.schedule_status === 'pending' ? 'قيد المراجعة' :
                                                 instructor.schedule_status === 'rejected' ? 'مرفوض' : 'غير محدد'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <button onClick={() => handleOpenModal(instructor)} className="text-gray-500 hover:text-blue-600"><Edit size={20} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </AdminSection>

                 <AdminSection title="إدارة المواعيد المتاحة (تجاوز يدوي)" icon={<Calendar />}>
                    <p className="text-gray-600 mb-6 -mt-4">
                        اختر مدربًا ثم اختر يومًا من التقويم لإضافة أو حذف المواعيد المتاحة فيه بشكل مباشر. هذا الإجراء يتجاوز نظام موافقة الجداول.
                    </p>
                    <AvailabilityManager />
                 </AdminSection>
            </div>
        </>
    );
};

export default AdminInstructorsPage;
