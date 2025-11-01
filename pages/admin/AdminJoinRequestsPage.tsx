import React, { useState, useMemo } from 'react';
import { UserPlus, Eye, ArrowUp, ArrowDown } from 'lucide-react';
import { useAdminJoinRequests } from '../../hooks/queries/admin/useAdminCommunicationQuery';
import { useCommunicationMutations } from '../../hooks/mutations/useCommunicationMutations';
import PageLoader from '../../components/ui/PageLoader';
import ViewJoinRequestModal from '../../components/admin/ViewJoinRequestModal';
import { formatDate } from '../../utils/helpers';
import type { JoinRequest, RequestStatus } from '../../lib/database.types';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import StatFilterCard from '../../components/admin/StatFilterCard';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import ErrorState from '../../components/ui/ErrorState';

const requestStatuses: RequestStatus[] = ["جديد", "تمت المراجعة", "مقبول", "مرفوض"];
const statusColors: { [key in RequestStatus]: string } = {
    "جديد": "bg-blue-500",
    "تمت المراجعة": "bg-yellow-500",
    "مقبول": "bg-green-500",
    "مرفوض": "bg-red-500",
};

const AdminJoinRequestsPage: React.FC = () => {
    const { data: requests = [], isLoading, error, refetch } = useAdminJoinRequests();
    const { updateJoinRequestStatus } = useCommunicationMutations();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);
    const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof JoinRequest; direction: 'asc' | 'desc' } | null>({ key: 'created_at', direction: 'desc' });

    const statusCounts = useMemo(() => {
        const counts: { [key in RequestStatus]?: number } = {};
        for (const request of requests) {
            counts[request.status] = (counts[request.status] || 0) + 1;
        }
        return counts;
    }, [requests]);

    const sortedAndFilteredRequests = useMemo(() => {
        let filtered = [...requests].filter(request => {
            const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
            const matchesSearch = searchTerm === '' ||
                request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                request.role.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        });

        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [requests, statusFilter, searchTerm, sortConfig]);

    const handleViewRequest = (request: JoinRequest) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const handleStatusChange = (requestId: string, newStatus: RequestStatus) => {
        updateJoinRequestStatus.mutate({ requestId, newStatus });
    };

    const handleSort = (key: keyof JoinRequest) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const SortableTh: React.FC<{ sortKey: keyof JoinRequest; label: string }> = ({ sortKey, label }) => (
        <TableHead>
            <Button variant="ghost" onClick={() => handleSort(sortKey)} className="px-0 h-auto py-0">
                <div className="flex items-center">
                   <span>{label}</span>
                    {sortConfig?.key === sortKey && (
                        sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4 mr-2" /> : <ArrowDown className="h-4 w-4 mr-2" />
                    )}
                </div>
            </Button>
        </TableHead>
    );

    if (isLoading) return <PageLoader text="جاري تحميل طلبات الانضمام..." />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

    return (
        <>
            <ViewJoinRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} request={selectedRequest} />
            <div className="animate-fadeIn space-y-8">
                <h1 className="text-3xl font-extrabold text-foreground">طلبات الانضمام للفريق</h1>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <StatFilterCard label="الكل" value={requests.length} color="bg-primary" isActive={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
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

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><UserPlus /> قائمة الطلبات</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 max-w-lg">
                            <Input 
                                type="search"
                                placeholder="ابحث بالاسم أو الدور المطلوب..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                               <TableHeader>
                                   <TableRow>
                                        <SortableTh sortKey="name" label="الاسم" />
                                        <SortableTh sortKey="role" label="الدور المطلوب" />
                                        <SortableTh sortKey="created_at" label="التاريخ" />
                                        <SortableTh sortKey="status" label="الحالة" />
                                        <TableHead>إجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedAndFilteredRequests.map(request => (
                                        <TableRow key={request.id}>
                                            <TableCell className="font-semibold">{request.name}</TableCell>
                                            <TableCell>{request.role}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{formatDate(request.created_at)}</TableCell>
                                            <TableCell className="min-w-[150px]">
                                                <Select value={request.status} onChange={e => handleStatusChange(request.id, e.target.value as RequestStatus)}>
                                                    {requestStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => handleViewRequest(request)}><Eye size={20} /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                             {sortedAndFilteredRequests.length === 0 && <p className="text-center py-8 text-muted-foreground">لا توجد طلبات تطابق بحثك.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default AdminJoinRequestsPage;