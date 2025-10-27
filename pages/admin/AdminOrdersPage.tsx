

import React, { useState, useMemo, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
// FIX: Corrected import path from non-existent queries.ts to adminQueries.ts
import { useAdminOrders } from '../../hooks/adminQueries';
import { useOrderMutations } from '../../hooks/mutations';
import { useToast } from '../../contexts/ToastContext';
import PageLoader from '../../components/ui/PageLoader';
import AdminSection from '../../components/admin/AdminSection';
import { ShoppingBag, Eye } from 'lucide-react';
import { formatDate, getStatusColor } from '../../utils/helpers';
import ViewOrderModal from '../../components/admin/ViewOrderModal';
import type { OrderWithRelations, OrderStatus } from '../../lib/database.types';


const AdminOrdersPage: React.FC = () => {
    const { data: orders = [], isLoading, error } = useAdminOrders();
    const { updateOrderStatus } = useOrderMutations();
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState<OrderWithRelations | null>(null);

    const filteredOrders = useMemo(() => {
        return orders
            .filter(order => statusFilter === 'all' || order.status === statusFilter)
            .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());
    }, [orders, statusFilter]);
    
    const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
        updateOrderStatus.mutate({ orderId, newStatus });
    };

    if (isLoading) return <PageLoader text="جاري تحميل الطلبات..." />;
    if (error) return <div className="text-center text-red-500">{error.message}</div>;

    const statuses = Array.from(new Set(orders.map(o => o.status)));

    return (
        <>
            <ViewOrderModal
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                order={selectedOrder}
            />
            <div className="animate-fadeIn space-y-12">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة طلبات "إنها لك"</h1>

                <AdminSection title="قائمة الطلبات" icon={<ShoppingBag />}>
                    <div className="mb-4">
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="p-2 border rounded-lg bg-white"
                        >
                            <option value="all">كل الحالات</option>
                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="border-b-2">
                                <tr>
                                    <th className="p-3">رقم الطلب</th>
                                    <th className="p-3">العميل</th>
                                    <th className="p-3">المنتج</th>
                                    <th className="p-3">التاريخ</th>
                                    <th className="p-3">الإجمالي</th>
                                    <th className="p-3">الحالة</th>
                                    <th className="p-3">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map(order => (
                                    <tr key={order.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-mono text-sm">{order.id}</td>
                                        <td className="p-3">{order.users?.name || 'غير مسجل'}</td>
                                        <td className="p-3 font-semibold">{order.item_summary}</td>
                                        <td className="p-3 text-sm">{formatDate(order.order_date)}</td>
                                        <td className="p-3">{order.total} ج.م</td>
                                        <td className="p-3">
                                            <select 
                                              value={order.status} 
                                              onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                              className={`p-1 border rounded-md text-sm font-bold ${getStatusColor(order.status)}`}
                                            >
                                                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </td>
                                        <td className="p-3">
                                            <button onClick={() => setSelectedOrder(order)} className="text-gray-500 hover:text-blue-600">
                                                <Eye size={20} />
                                            </button>
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

export default AdminOrdersPage;