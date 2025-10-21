

import React, { useState, useMemo } from 'react';
import { ShoppingBag, Eye, Search } from 'lucide-react';
import { useAdminOrders } from '../../hooks/queries.ts';
import { useAppMutations } from '../../hooks/mutations.ts';
import PageLoader from '../../components/ui/PageLoader.tsx';
import AdminSection from '../../components/admin/AdminSection.tsx';
import { formatDate, getStatusColor } from '../../utils/helpers.ts';
import ViewOrderModal, { IOrderDetails } from '../../components/admin/ViewOrderModal.tsx';
import { Order } from '../../lib/database.types.ts';

const AdminOrdersPage: React.FC = () => {
    const { data: orders = [], isLoading, error } = useAdminOrders();
    const { updateOrderStatus } = useAppMutations();
    const [selectedOrder, setSelectedOrder] = useState<IOrderDetails | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const handleViewOrder = (order: IOrderDetails) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };
    
    const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
        // Correctly call the mutation function using `.mutateAsync`.
        await updateOrderStatus.mutateAsync({ orderId, newStatus });
    };

    const filteredOrders = useMemo(() => {
        return orders
            .filter(order => {
                if (statusFilter !== 'all' && order.status !== statusFilter) {
                    return false;
                }
                if (searchTerm && !order.customer_name.includes(searchTerm) && !order.id.includes(searchTerm)) {
                    return false;
                }
                return true;
            })
            .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());
    }, [orders, searchTerm, statusFilter]);

    const orderStatuses: Order['status'][] = ["بانتظار الدفع", "بانتظار المراجعة", "قيد التجهيز", "يحتاج مراجعة", "تم الشحن", "تم التسليم", "ملغي"];

    if (isLoading) return <PageLoader text="جاري تحميل الطلبات..." />;
    if (error) return <div className="text-center text-red-500">{error.message}</div>;

    return (
        <>
            <ViewOrderModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                order={selectedOrder}
            />
            <div className="animate-fadeIn space-y-12">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة طلبات "إنها لك"</h1>

                <AdminSection title="جميع الطلبات" icon={<ShoppingBag />}>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-grow">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="ابحث بالاسم أو رقم الطلب..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-10 pl-4 py-2 border rounded-full bg-gray-50"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full sm:w-48 p-2 border rounded-full bg-gray-50"
                        >
                            <option value="all">كل الحالات</option>
                            {orderStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="border-b-2 border-gray-200">
                                <tr>
                                    <th className="py-3 px-4 font-semibold">رقم الطلب</th>
                                    <th className="py-3 px-4 font-semibold">العميل</th>
                                    <th className="py-3 px-4 font-semibold">التاريخ</th>
                                    <th className="py-3 px-4 font-semibold">الإجمالي</th>
                                    <th className="py-3 px-4 font-semibold">الحالة</th>
                                    <th className="py-3 px-4 font-semibold">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map(order => (
                                    <tr key={order.id} className="border-b hover:bg-gray-50">
                                        <td className="py-4 px-4 font-mono text-sm">{order.id}</td>
                                        <td className="py-4 px-4">{order.customer_name}</td>
                                        <td className="py-4 px-4">{formatDate(order.order_date)}</td>
                                        <td className="py-4 px-4">{order.total} ج.م</td>
                                        <td className="py-4 px-4">
                                             <select 
                                                value={order.status} 
                                                onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])} 
                                                className={`p-1 text-xs font-bold rounded-full border-2 bg-transparent ${getStatusColor(order.status)}`}
                                                style={{ WebkitAppearance: 'none', appearance: 'none', paddingRight: '1.5rem' }}
                                             >
                                                {orderStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </td>
                                        <td className="py-4 px-4">
                                            <button onClick={() => handleViewOrder(order)} className="text-gray-500 hover:text-blue-600">
                                                <Eye size={20} />
                                            </button>
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
