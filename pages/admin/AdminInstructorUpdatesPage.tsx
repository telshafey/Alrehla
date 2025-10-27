import React from 'react';
import { UserCog, Check, X } from 'lucide-react';
import { useAdminInstructorUpdates } from '../../hooks/adminQueries';
import { useInstructorMutations } from '../../hooks/mutations';
import PageLoader from '../../components/ui/PageLoader';
import AdminSection from '../../components/admin/AdminSection';
import { Button } from '../../components/ui/Button';
import type { Instructor } from '../../lib/database.types';

const DataChange: React.FC<{ label: string, oldData: any, newData: any }> = ({ label, oldData, newData }) => (
    <div className="p-3 bg-gray-100 rounded-md">
        <p className="text-sm font-bold text-gray-500">{label}</p>
        <p className="text-sm text-red-600 line-through">القديم: {oldData || 'غير محدد'}</p>
        <p className="text-sm text-green-600">الجديد: {newData || 'غير محدد'}</p>
    </div>
);


const AdminInstructorUpdatesPage: React.FC = () => {
    const { data: requests = [], isLoading, error } = useAdminInstructorUpdates();
    const { approveInstructorUpdate, rejectInstructorUpdate } = useInstructorMutations();

    if (isLoading) {
        return <PageLoader text="جاري تحميل طلبات التحديث..." />;
    }

    if (error) {
        return <div className="text-center text-red-500 p-4">{error.message}</div>;
    }

    return (
        <div className="animate-fadeIn space-y-12">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">مراجعة تحديثات المدربين</h1>
            <AdminSection title="الطلبات المعلقة" icon={<UserCog />}>
                {requests.length > 0 ? (
                    <div className="space-y-6">
                        {requests.map((instructor: Instructor) => {
                            const pendingData = instructor.pending_profile_data as any;
                            if (!pendingData) return null;

                            return (
                                <div key={instructor.id} className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                                        <h3 className="font-bold text-lg text-gray-800">طلب تحديث من: {instructor.name}</h3>
                                        <div className="flex gap-2 mt-3 sm:mt-0">
                                            <Button variant="success" size="sm" icon={<Check />} onClick={() => approveInstructorUpdate.mutate({ instructorId: instructor.id })}>
                                                موافقة
                                            </Button>
                                            <Button variant="danger" size="sm" icon={<X />} onClick={() => rejectInstructorUpdate.mutate({ instructorId: instructor.id })}>
                                                رفض
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {pendingData.bio && (
                                            <DataChange label="النبذة التعريفية" oldData={instructor.bio} newData={pendingData.bio} />
                                        )}
                                        {pendingData.rate_per_session !== undefined && (
                                            <DataChange label="سعر الجلسة" oldData={`${instructor.rate_per_session} ج.م`} newData={`${pendingData.rate_per_session} ج.م`} />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-center py-8 text-gray-500">لا توجد طلبات تحديث معلقة حاليًا.</p>
                )}
            </AdminSection>
        </div>
    );
};

export default AdminInstructorUpdatesPage;