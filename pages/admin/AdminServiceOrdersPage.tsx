import React, { useState, useMemo } from 'react';
import { Eye, Sparkles, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { useAdminServiceOrders } from '../../hooks/queries/admin/useAdminCommunicationQuery';
import { useOrderMutations } from '../../hooks/mutations/useOrderMutations';
import PageLoader from '../../components/ui/PageLoader';
import ViewServiceOrderModal from '../../components/admin/ViewServiceOrderModal';
import { formatDate, getStatusColor } from '../../utils/helpers';
import type { ServiceOrderWithRelations, OrderStatus } from '../../lib/database.types';
import { Button } from '../../components/ui/Button';
import StatFilterCard from '../../components/admin/StatFilterCard';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';

const orderStatuses: OrderStatus[] = ["بانتظار المراجعة", "قيد التنفيذ", "مكتمل", "ملغي"];
const statusColors: { [key in OrderStatus]?: string } = {
    "بانتظار المراجعة": "bg-indigo-500",
    "قيد التنفيذ": "bg-yellow-500",
    "مكتمل": "bg-green-500",
    "ملغي": "bg-red-500",
};

const AdminServiceOrdersPage: React.FC = () => {
    const { data: orders = [], isLoading, error, refetch } = useAdminServiceOrders();
    const { updateServiceOrderStatus } = useOrderMutations();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<ServiceOrderWithRelations | null>(null);
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'created_at', direction: 'desc' });

    const statusCounts = useMemo(() => {
        const counts: { [key in OrderStatus]?: number } = {};
        for (const order of orders) {
            counts[order.status] = (counts[order.status] || 0) + 1;
        }
        return counts;
    }, [orders]);

    const sortedAndFilteredOrders = useMemo(() => {
        let filtered = [...orders].filter(o => {
            const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
            const matchesSearch = searchTerm.trim() === '' ||
                o.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.child_profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.id.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        });
        
        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                const getNestedValue = (obj: any, path: string) => path.split('.').reduce((o, i) => (o ? o[i] : null), obj);
                const aVal = getNestedValue(a, sortConfig.key);
                const bVal = getNestedValue(b, sortConfig.key);
                if (aVal === null || aVal === undefined) return 1;
                if (bVal === null || bVal === undefined) return -1;
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [orders, statusFilter, searchTerm, sortConfig]);

    const handleViewOrder = (order: ServiceOrderWithRelations) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const SortableTh: React.FC<{ sortKey: string; label: string }> = ({ sortKey, label }) => (
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
    
    if (isLoading) return <PageLoader text="جاري تحميل طلبات الخدمات..." />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

    return (
        <>
            <ViewServiceOrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} order={selectedOrder} />
            <div className="animate-fadeIn space-y-8">
                <h1 className="text-3xl font-extrabold text-foreground">إدارة طلبات الخدمات الإبداعية</h1>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <StatFilterCard label="الكل" value={orders.length} color="bg-primary" isActive={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
                    {orderStatuses.map(status => (
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
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles /> قائمة كل الطلبات
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 max-w-lg">
                            <Input 
                                type="search"
                                placeholder="ابحث برقم الطلب، اسم العميل، أو اسم الطفل..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                               <TableHeader>
                                   <TableRow>
                                        <SortableTh sortKey="users.name" label="العميل" />
                                        <SortableTh sortKey="child_profiles.name" label="الطفل" />
                                        <SortableTh sortKey="standalone_services.name" label="الخدمة" />
                                        <SortableTh sortKey="instructors.name" label="المدرب المسؤول" />
                                        <SortableTh sortKey="total" label="الإجمالي" />
                                        <SortableTh sortKey="status" label="الحالة" />
                                        <TableHead>إجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedAndFilteredOrders.map(order => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-semibold">{order.users?.name || 'N/A'}</TableCell>
                                            <TableCell>{order.child_profiles?.name || 'N/A'}</TableCell>
                                            <TableCell className="text-sm">{order.standalone_services?.name || 'N/A'}</TableCell>
                                            <TableCell className="text-sm">{order.instructors?.name || 'غير معين'}</TableCell>
                                            <TableCell className="font-bold">{order.total} ج.م</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Select
                                                        value={order.status}
                                                        onChange={e => updateServiceOrderStatus.mutate({ orderId: order.id, newStatus: e.target.value as OrderStatus })}
                                                        className={`w-full p-1 text-xs font-bold ${getStatusColor(order.status)}`}
                                                        disabled={updateServiceOrderStatus.isPending && updateServiceOrderStatus.variables?.orderId === order.id}
                                                    >
                                                        {orderStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </Select>
                                                    {updateServiceOrderStatus.isPending && updateServiceOrderStatus.variables?.orderId === order.id && <Loader2 className="animate-spin" size={16} />}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => handleViewOrder(order)}><Eye size={20} /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                             {sortedAndFilteredOrders.length === 0 && <p className="text-center py-8 text-muted-foreground">لا توجد طلبات تطابق بحثك.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default AdminServiceOrdersPage;