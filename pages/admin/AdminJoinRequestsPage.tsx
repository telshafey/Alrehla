

import React, { useState, useMemo, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { UserPlus, Eye } from 'lucide-react';
import { useAdminJoinRequests } from '../../hooks/adminQueries';
import { useCommunicationMutations } from '../../hooks/mutations';
import { useToast } from '../../contexts/ToastContext';
import PageLoader from '../../components/ui/PageLoader';
import AdminSection from '../../components/admin/AdminSection';
import { formatDate } from '../../utils/helpers';
import ViewJoinRequestModal from '../../components/admin/ViewJoinRequestModal';
import type { JoinRequest, RequestStatus } from '../../lib/database.types';

const AdminJoinRequestsPage: React.FC = () => {
    const { data: joinRequests = [], isLoading, error } = useAdminJoinRequests();
    const { updateJoinRequestStatus } = useCommunicationMutations();
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);
    
    const filteredRequests = useMemo(() => {
        return joinRequests.filter(req => statusFilter === 'all' || req.status === req.status);
    }, [joinRequests, statusFilter]);
    
     const handleStatusChange = async (requestId: string, newStatus: RequestStatus) => {
        await updateJoinRequestStatus.mutateAsync({ requestId, newStatus });
    };

    if (isLoading) return <PageLoader text="جاري تحميل طلبات الانضمام..." />;
    if (error) return <div className="text-center text-red-500">{error.message}</div>;
    
    const statuses: RequestStatus[] = ["جديد", "تمت المراجعة", "مقبول", "مرفوض"];

    return (
        <>
        <ViewJoinRequestModal isOpen={!!selectedRequest} onClose={() => setSelectedRequest(null)} request={selectedRequest} />
        <div className="animate-fadeIn space-y-12">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">طلبات الانضمام للفريق</h1>
            <AdminSection title="كل الطلبات" icon={<UserPlus />}>
                 <div className="mb-4">
                     <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2 border rounded-lg bg-white">
                        <option value="all">كل الحالات</option>
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead><tr className="border-b-2">
                            <th className="p-3">المقدم</th><th className="p-3">الدور المطلوب</th><th className="p-3">التاريخ</th><th className="p-3">الحالة</th><th className="p-3">عرض</th>
                        </tr></thead>
                        <tbody>
                            {filteredRequests.map(req => (
                                <tr key={req.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">{req.name}</td>
                                    <td className="p-3">{req.role}</td>
                                    <td className="p-3">{formatDate(req.created_at)}</td>
                                    <td className="p-3">
                                        <select value={req.status} onChange={e => handleStatusChange(req.id, e.target.value as RequestStatus)} className="p-1 border rounded-md bg-white">
                                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-3">
                                        <button onClick={() => setSelectedRequest(req)} className="text-gray-500 hover:text-blue-600"><Eye size={20} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </AdminSection>
        </div>
        </>
    );
};

export default AdminJoinRequestsPage;