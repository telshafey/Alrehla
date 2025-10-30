import React, { useState, useMemo } from 'react';
import { Eye, Sparkles } from 'lucide-react';
import { useAdminServiceOrders } from '../../hooks/queries/admin/useAdminCommunicationQuery';
import PageLoader from '../../components/ui/PageLoader';
import AdminSection from '../../components/admin/AdminSection';
import ViewServiceOrderModal from '../../components/admin/ViewServiceOrderModal';
import { formatDate, getStatusColor } from '../../utils/helpers';
import type { ServiceOrderWithRelations, OrderStatus } from '../../lib/database.types';
import { Button } from '../../components/ui/Button';
import StatFilterCard from '../../components/admin/StatFilterCard';
import { Input } from '../../components/ui/Input';
import ErrorState from '../../components/ui/ErrorState';

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
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة طلبات الخدمات</h1>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                
                <AdminSection title="قائمة كل الطلبات" icon={<Sparkles />}>
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
                                <th className="p-3">العميل</th><th className="p-3">الطفل</th><th className="p-3">الخدمة</th><th className="p-3">المدرب المسؤول</th><th className="p-3">الإجمالي</th><th className="p-3">الحالة</th><th className="p-3">إجراءات</th>
                            </tr></thead>
                            <tbody>
                                {filteredOrders.map(order => (
                                    <tr key={order.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-semibold">{order.users?.name || 'N/A'}</td>
                                        <td className="p-3">{order.child_profiles?.name || 'N/A'}</td>
                                        <td className="p-3 text-sm">{order.standalone_services?.name || 'N/A'}</td>
                                        <td className="p-3 text-sm">{order.instructors?.name || 'غير معين'}</td>
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

export default AdminServiceOrdersPage;