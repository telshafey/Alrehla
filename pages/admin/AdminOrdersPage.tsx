import React, { useState, useMemo } from 'react';
import { Eye, ShoppingBag, DollarSign, AlertCircle } from 'lucide-react';
import { useAdminOrders } from '../../hooks/queries/admin/useAdminEnhaLakQuery';
import PageLoader from '../../components/ui/PageLoader';
import ViewOrderModal from '../../components/admin/ViewOrderModal';
import { formatDate, getStatusColor } from '../../utils/helpers';
import type { OrderWithRelations, OrderStatus } from '../../lib/database.types';
import { Button } from '../../components/ui/Button';
import StatFilterCard from '../../components/admin/StatFilterCard';
import { Input } from '../../components/ui/Input';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import StatCard from '../../components/admin/StatCard';

const orderStatuses: OrderStatus[] = ["بانتظار الدفع", "بانتظار المراجعة", "قيد التجهيز", "يحتاج مراجعة", "قيد التنفيذ", "تم الشحن", "تم التسليم", "مكتمل", "ملغي"];
const statusColors: { [key in OrderStatus]: string } = {
    "بانتظار الدفع": "bg-gray-500",
    "بانتظار المراجعة": "bg-indigo-500",
    "قيد التجهيز": "bg-yellow-500",
    "يحتاج مراجعة": "bg-orange-500",
    "تم الشحن": "bg-blue-500",
    "تم التسليم": "bg-green-500",
    "ملغي": "bg-red-500",
    "قيد التنفيذ": "bg-teal-500",
    "مكتمل": "bg-green-500",
};


const AdminOrdersPage: React.FC = () => {
    const { data: orders = [], isLoading, error, refetch } = useAdminOrders();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderWithRelations | null>(null);
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
        let filtered = orders;
        if (statusFilter !== 'all') {
            filtered = filtered.filter(o => o.status === statusFilter);
        }
        if (searchTerm.trim() !== '') {
            const lowercasedTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(o =>
                o.users?.name?.toLowerCase().includes(lowercasedTerm) ||
                o.child_profiles?.name?.toLowerCase().includes(lowercasedTerm) ||
                o.id.toLowerCase().includes(lowercasedTerm)
            );
        }
        return filtered;
    }, [orders, statusFilter, searchTerm]);
    
    const totalRevenue = useMemo(() => {
        return orders
            .filter(o => o.status === 'تم التسليم' || o.status === 'مكتمل')
            .reduce((sum, o) => sum + o.total, 0);
    }, [orders]);

    const pendingOrders = useMemo(() => {
        return orders.filter(o => o.status === 'بانتظار المراجعة' || o.status === 'قيد التجهيز').length;
    }, [orders]);


    const handleViewOrder = (order: OrderWithRelations) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };
    
    if (isLoading) return <PageLoader text="جاري تحميل الطلبات..." />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

    return (
        <>
            <ViewOrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} order={selectedOrder} />
            <div className="animate-fadeIn space-y-8">
                <h1 className="text-3xl font-extrabold text-foreground">إدارة طلبات "إنها لك"</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="إجمالي الإيرادات (المكتملة)" value={`${totalRevenue} ج.م`} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} />
                    <StatCard title="إجمالي الطلبات" value={orders.length} icon={<ShoppingBag className="h-4 w-4 text-muted-foreground" />} />
                    <StatCard title="طلبات تحتاج إجراء" value={pendingOrders} icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />} />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-4">
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
                           <ShoppingBag /> قائمة كل الطلبات
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
                                        <TableHead>التاريخ</TableHead>
                                        <TableHead>الملخص</TableHead>
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
                                            <TableCell className="text-sm">{formatDate(order.order_date)}</TableCell>
                                            <TableCell className="text-sm">{order.item_summary}</TableCell>
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

export default AdminOrdersPage;