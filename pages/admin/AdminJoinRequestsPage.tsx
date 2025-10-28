import React, { useState, useMemo } from 'react';
import { UserPlus, Eye } from 'lucide-react';
import { useAdminJoinRequests } from '../../hooks/adminQueries';
// FIX: Corrected import path
import { useCommunicationMutations } from '../../hooks/mutations';
import PageLoader from '../../components/ui/PageLoader';
import AdminSection from '../../components/admin/AdminSection';
import ViewJoinRequestModal from '../../components/admin/ViewJoinRequestModal';
import { formatDate } from '../../utils/helpers';
import type { JoinRequest, RequestStatus } from '../../lib/database.types';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import StatFilterCard from '../../components/admin/StatFilterCard';
import { Input } from '../../components/ui/Input';

const requestStatuses: RequestStatus[] = ["جديد", "تمت المراجعة", "مقبول", "مرفوض"];
const statusColors: { [key in RequestStatus]: string } = {
    "جديد": "bg-blue-500",
    "تمت المراجعة": "bg-yellow-500",
    "مقبول": "bg-green-500",
    "مرفوض": "bg-red-500",
};

const AdminJoinRequestsPage: React.FC = () => {
    const { data: requests = [], isLoading, error } = useAdminJoinRequests();
    const { updateJoinRequestStatus } = useCommunicationMutations();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);
    const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const statusCounts = useMemo(() => {
        const counts: { [key in RequestStatus]?: number } = {};
        for (const request of requests) {
            counts[request.status] = (counts[request.status] || 0) + 1;
        }
        return counts;
    }, [requests]);

    const filteredRequests = useMemo(() => {
        return requests.filter(request => {
            const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
            const matchesSearch = searchTerm === '' ||
                request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                request.role.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [requests, statusFilter, searchTerm]);

    const handleViewRequest = (request: JoinRequest) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const handleStatusChange = (requestId: string, newStatus: RequestStatus) => {
        updateJoinRequestStatus.mutate({ requestId, newStatus });
    };

    if (isLoading) return <PageLoader text="جاري تحميل طلبات الانضمام..." />;
    if (error) return <div className="text-center text-red-500">{(error as Error).message}</div>;

    return (
        <>
            <ViewJoinRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} request={selectedRequest} />
            <div className="animate-fadeIn space-y-8">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">طلبات الانضمام للفريق</h1>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <StatFilterCard label="الكل" value={requests.length} color="bg-gray-800" isActive={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
                    {requestStatuses.map(status => (
                        <StatFilterCard 
                            key={status}
                            label={status}
                            value={statusCounts[status] || 0}
                            color={statusColors[status] || 'bg-gray-500'}
                            isActive={statusFilter === status}
                            onClick={() => setStatusFilter(status)}
                        />
                    ))}
                </div>

                <AdminSection title="قائمة الطلبات" icon={<UserPlus />}>
                    <div className="mb-6 max-w-lg">
                        <Input 
                            type="search"
                            placeholder="ابحث بالاسم أو الدور المطلوب..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                           <thead className="border-b-2"><tr>
                                <th className="p-3">الاسم</th><th className="p-3">الدور المطلوب</th><th className="p-3">التاريخ</th><th className="p-3">الحالة</th><th className="p-3">إجراءات</th>
                            </tr></thead>
                            <tbody>
                                {filteredRequests.map(request => (
                                    <tr key={request.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-semibold">{request.name}</td>
                                        <td className="p-3">{request.role}</td>
                                        <td className="p-3 text-sm">{formatDate(request.created_at)}</td>
                                        <td className="p-3 min-w-[150px]">
                                            <Select value={request.status} onChange={e => handleStatusChange(request.id, e.target.value as RequestStatus)} className="p-1 text-sm">
                                                {requestStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                            </Select>
                                        </td>
                                        <td className="p-3">
                                            <Button variant="ghost" size="icon" onClick={() => handleViewRequest(request)}><Eye size={20} /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                         {filteredRequests.length === 0 && <p className="text-center py-8 text-gray-500">لا توجد طلبات انضمام تطابق بحثك.</p>}
                    </div>
                </AdminSection>
            </div>
        </>
    );
};

export default AdminJoinRequestsPage;