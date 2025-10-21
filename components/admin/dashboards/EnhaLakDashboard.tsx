import React, { useMemo } from 'react';
import { useAdminOrders, useAdminSubscriptions } from '../../../hooks/queries.ts';
import StatCard from '../StatCard.tsx';
import BarChart from '../BarChart.tsx';
import { ShoppingBag, Star, DollarSign } from 'lucide-react';
import PageLoader from '../../ui/PageLoader.tsx';

const EnhaLakDashboard: React.FC = () => {
    const { data: orders = [], isLoading: ordersLoading, error: ordersError } = useAdminOrders();
    const { data: subscriptions = [], isLoading: subsLoading, error: subsError } = useAdminSubscriptions();

    const isLoading = ordersLoading || subsLoading;
    const error = ordersError || subsError;

    const totalRevenue = useMemo(() => {
        return orders.reduce((sum, order) => sum + (order.total || 0), 0);
    }, [orders]);

    const orderStatusData = useMemo(() => {
        const statusCounts: { [key: string]: number } = {};
        orders.forEach(order => {
            statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
        });
        return Object.entries(statusCounts).map(([label, value]) => ({
            label,
            value,
            color: '#8b5cf6',
        }));
    }, [orders]);

    if (isLoading) return <PageLoader />;
    if (error) return <div className="text-red-500 bg-red-50 p-4 rounded-lg">خطأ في تحميل إحصائيات "إنها لك": {error.message}</div>;

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">ملخص "إنها لك"</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="إجمالي الطلبات" value={orders.length} icon={<ShoppingBag size={28} className="text-blue-500" />} color="bg-blue-100" />
                <StatCard title="إجمالي الاشتراكات" value={subscriptions.length} icon={<Star size={28} className="text-yellow-500" />} color="bg-yellow-100" />
                <StatCard title="إيرادات الطلبات" value={`${totalRevenue} ج.م`} icon={<DollarSign size={28} className="text-green-500" />} color="bg-green-100" />
            </div>
            <BarChart title="حالات الطلبات" data={orderStatusData} />
        </div>
    );
};

export default EnhaLakDashboard;