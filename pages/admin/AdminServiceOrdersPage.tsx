import React, { useState, useMemo } from 'react';
import { Eye, Sparkles } from 'lucide-react';
import { useAdminServiceOrders } from '../../hooks/queries/admin/useAdminCommunicationQuery';
import PageLoader from '../../components/ui/PageLoader';
import ViewServiceOrderModal from '../../components/admin/ViewServiceOrderModal';
import { formatDate, getStatusColor } from '../../utils/helpers';
import type { ServiceOrderWithRelations, OrderStatus } from '../../lib/database.types';
import { Button } from '../../components/ui/Button';
import StatFilterCard from '../../components/admin/StatFilterCard';
import { Input } from '../../components/ui/Input';
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<ServiceOrderWithRelations | null>(null);
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const statusCounts = useMemo(() => {
        const counts: { [key in OrderStatus]?: number } = {};
        for (const order of orders) {
            counts[order.status] = (counts[order.status] || 0) + 1;
        }
        return counts;
    }, [orders]);

    const filteredOrders = useMemo(() => {
        return orders.filter(o => {
            const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
            const matchesSearch = searchTerm.trim() === '' ||
                o.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.child_profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.id.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [orders, statusFilter, searchTerm]);

    const handleViewOrder = (order: ServiceOrderWithRelations) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };
    
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
                                        <TableHead>العميل</TableHead>
                                        <TableHead>الطفل</TableHead>
                                        <TableHead>الخدمة</TableHead>
                                        <TableHead>المدرب المسؤول</TableHead>
                                        <TableHead>الإجمالي</TableHead>
                                        <TableHead>الحالة</TableHead>
                                        <TableHead>إجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.map(order => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-semibold">{order.users?.name || 'N/A'}</TableCell>
                                            <TableCell>{order.child_profiles?.name || 'N/A'}</TableCell>
                                            <TableCell className="text-sm">{order.standalone_services?.name || 'N/A'}</TableCell>
                                            <TableCell className="text-sm">{order.instructors?.name || 'غير معين'}</TableCell>
                                            <TableCell className="font-bold">{order.total} ج.م</TableCell>
                                            <TableCell><span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(order.status)}`}>{order.status}</span></TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => handleViewOrder(order)}><Eye size={20} /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                             {filteredOrders.length === 0 && <p className="text-center py-8 text-muted-foreground">لا توجد طلبات تطابق بحثك.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default AdminServiceOrdersPage;