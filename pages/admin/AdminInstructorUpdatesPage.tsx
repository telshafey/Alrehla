import React from 'react';
import { UserCog, Check, XCircle } from 'lucide-react';
import { useAdminInstructorUpdates } from '../../hooks/adminQueries';
import PageLoader from '../../components/ui/PageLoader';
import AdminSection from '../../components/admin/AdminSection';
import { Button } from '../../components/ui/Button';
import type { Instructor } from '../../lib/database.types';

const AdminInstructorUpdatesPage: React.FC = () => {
    const { data: pendingUpdates = [], isLoading, error } = useAdminInstructorUpdates();

    if (isLoading) {
        return <PageLoader text="جاري تحميل التحديثات المعلقة..." />;
    }

    if (error) {
        return <div className="text-center text-red-500 p-4">{error.message}</div>;
    }
    
    // Mock approve/reject functions
    const handleApprove = (id: number) => console.log('Approving update for instructor', id);
    const handleReject = (id: number) => console.log('Rejecting update for instructor', id);

    return (
        <div className="animate-fadeIn space-y-12">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">مراجعة تحديثات المدربين</h1>
            <AdminSection title="التحديثات المعلقة" icon={<UserCog />}>
                {pendingUpdates.length > 0 ? (
                    <div className="space-y-4">
                        {pendingUpdates.map((instructor: Instructor) => {
                            const pendingData = instructor.pending_profile_data as any;
                            return (
                                <div key={instructor.id} className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-800">طلب تحديث من: {instructor.name}</h3>
                                            <div className="mt-2 text-sm text-gray-700 bg-white p-3 rounded-md border">
                                                <p className="font-semibold">البيانات الجديدة المقترحة:</p>
                                                <pre className="whitespace-pre-wrap font-sans text-xs bg-gray-50 p-2 rounded mt-1">
                                                    {JSON.stringify(pendingData?.updates || {}, null, 2)}
                                                </pre>
                                                <p className="font-semibold mt-2 border-t pt-2">المبررات:</p>
                                                <p className="whitespace-pre-wrap">{pendingData?.justification || 'لا يوجد'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <Button variant="subtle" size="icon" onClick={() => handleApprove(instructor.id)} className="bg-green-100 text-green-700 hover:bg-green-200"><Check size={20} /></Button>
                                            <Button variant="subtle" size="icon" onClick={() => handleReject(instructor.id)} className="bg-red-100 text-red-700 hover:bg-red-200"><XCircle size={20} /></Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-center py-8 text-gray-500">لا توجد تحديثات معلقة للمراجعة.</p>
                )}
            </AdminSection>
        </div>
    );
};

export default AdminInstructorUpdatesPage;
