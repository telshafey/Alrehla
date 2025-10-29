import React from 'react';
import { ShieldQuestion, Check, X } from 'lucide-react';
import { useAdminSupportSessionRequests } from '../../hooks/queries/admin/useAdminCommunicationQuery';
import { useInstructorMutations } from '../../hooks/mutations/useInstructorMutations';
import PageLoader from '../../components/ui/PageLoader';
import AdminSection from '../../components/admin/AdminSection';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../utils/helpers';
import type { SupportSessionRequest } from '../../lib/database.types';

const AdminSupportRequestsPage: React.FC = () => {
    const { data: requests = [], isLoading, error } = useAdminSupportSessionRequests();
    const { approveSupportSessionRequest, rejectSupportSessionRequest } = useInstructorMutations();

    if (isLoading) {
        return <PageLoader text="جاري تحميل طلبات الدعم..." />;
    }

    if (error) {
        return <div className="text-center text-red-500 p-4">{error.message}</div>;
    }

    const getStatusInfo = (status: SupportSessionRequest['status']) => {
        switch (status) {
            case 'approved': return { text: 'تمت الموافقة', color: 'bg-green-100 text-green-800' };
            case 'rejected': return { text: 'مرفوض', color: 'bg-red-100 text-red-800' };
            case 'pending': return { text: 'معلق', color: 'bg-yellow-100 text-yellow-800' };
            default: return { text: status, color: 'bg-gray-100 text-gray-800' };
        }
    };

    return (
        <div className="animate-fadeIn space-y-12">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">مراجعة طلبات جلسات الدعم</h1>
            <AdminSection title="كل الطلبات" icon={<ShieldQuestion />}>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="border-b-2 border-gray-200">
                            <tr>
                                <th className="py-3 px-4">المدرب</th>
                                <th className="py-3 px-4">الطالب</th>
                                <th className="py-3 px-4">السبب</th>
                                <th className="py-3 px-4">التاريخ</th>
                                <th className="py-3 px-4">الحالة</th>
                                <th className="py-3 px-4">إجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((req: any) => {
                                const statusInfo = getStatusInfo(req.status);
                                return (
                                    <tr key={req.id} className="border-b hover:bg-gray-50">
                                        <td className="py-4 px-4 font-semibold">{req.instructor_name}</td>
                                        <td className="py-4 px-4 font-semibold">{req.child_name}</td>
                                        <td className="py-4 px-4 text-sm text-gray-600 max-w-sm truncate">{req.reason}</td>
                                        <td className="py-4 px-4 text-sm">{formatDate(req.requested_at)}</td>
                                        <td className="py-4 px-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusInfo.color}`}>
                                                {statusInfo.text}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            {req.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <Button variant="success" size="icon" onClick={() => approveSupportSessionRequest.mutate({ requestId: req.id })} title="موافقة">
                                                        <Check size={18} />
                                                    </Button>
                                                    <Button variant="danger" size="icon" onClick={() => rejectSupportSessionRequest.mutate({ requestId: req.id })} title="رفض">
                                                        <X size={18} />
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {requests.length === 0 && <p className="text-center py-8 text-gray-500">لا توجد طلبات دعم حاليًا.</p>}
                </div>
            </AdminSection>
        </div>
    );
};

export default AdminSupportRequestsPage;