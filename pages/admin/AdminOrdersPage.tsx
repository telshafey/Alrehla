import React, { useState, useMemo } from 'react';
import { Eye, ShoppingBag } from 'lucide-react';
import { useAdminOrders } from '../../hooks/adminQueries';
import PageLoader from '../../components/ui/PageLoader';
import AdminSection from '../../components/admin/AdminSection';
import ViewOrderModal from '../../components/admin/ViewOrderModal';
import { formatDate, getStatusColor } from '../../utils/helpers';
import type { OrderWithRelations, OrderStatus } from '../../lib/database.types';
import { Button } from '../../components/ui/Button';
import StatFilterCard from '../../components/admin/StatFilterCard';
import { Input } from '../../components/ui/Input';

const orderStatuses: OrderStatus[] = ["بانتظار الدفع", "بانتظار المراجعة", "قيد التجهيز", "يحتاج مراجعة", "تم الشحن", "تم التسليم", "ملغي"];
const statusColors: { [key in OrderStatus]: string } = {
    "بانتظار الدفع": "bg-gray-500",
    "بانتظار المراجعة": "bg-indigo-500",
    "قيد التجهيز": "bg-yellow-500",
    "يحتاج مراجعة": "bg-orange-500",
    "تم الشحن": "bg-blue-500",
    "تم التسليم": "bg-green-500",
    "ملغي": "bg-red-500",
};


const AdminOrdersPage: React.FC = () => {
    const { data: orders = [], isLoading, error } = useAdminOrders();
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

    const handleViewOrder = (order: OrderWithRelations) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };
    
    if (isLoading) return <PageLoader text="جاري تحميل الطلبات..." />;
    if (error) return <div className="text-center text-red-500">{(error as Error).message}</div>;

    return (
        <>
            <ViewOrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} order={selectedOrder} />
            <div className="animate-fadeIn space-y-8">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة طلبات "إنها لك"</h1>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    <StatFilterCard label="الكل" value={orders.length} color="bg-gray-800" isActive={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
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
                
                <AdminSection title="قائمة كل الطلبات" icon={<ShoppingBag />}>
                    <div className="mb-6 max-w-lg">
                        <Input 
                            type="search"
                            placeholder="ابحث برقم الطلب، اسم العميل، أو اسم الطفل..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                           <thead className="border-b-2"><tr>
                                <th className="p-3">العميل</th><th className="p-3">الطفل</th><th className="p-3">التاريخ</th><th className="p-3">الملخص</th><th className="p-3">الإجمالي</th><th className="p-3">الحالة</th><th className="p-3">إجراءات</th>
                            </tr></thead>
                            <tbody>
                                {filteredOrders.map(order => (
                                    <tr key={order.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-semibold">{order.users?.name || 'N/A'}</td>
                                        <td className="p-3">{order.child_profiles?.name || 'N/A'}</td>
                                        <td className="p-3 text-sm">{formatDate(order.order_date)}</td>
                                        <td className="p-3 text-sm">{order.item_summary}</td>
                                        <td className="p-3 font-bold">{order.total} ج.م</td>
                                        <td className="p-3"><span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(order.status)}`}>{order.status}</span></td>
                                        <td className="p-3">
                                            <Button variant="ghost" size="icon" onClick={() => handleViewOrder(order)}><Eye size={20} /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                         {filteredOrders.length === 0 && <p className="text-center py-8 text-gray-500">لا توجد طلبات تطابق بحثك.</p>}
                    </div>
                </AdminSection>
            </div>
        </>
    );
};

export default AdminOrdersPage;
