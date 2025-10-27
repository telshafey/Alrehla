import React, { useMemo } from 'react';
import { useAdminUsers, useAdminOrders, useAdminCwBookings } from '../../../hooks/adminQueries';
import StatCard from '../StatCard';
import BarChart from '../BarChart';
import { DollarSign, Users, ShoppingBag } from 'lucide-react';
import PageLoader from '../../ui/PageLoader';

const GlobalDashboard: React.FC = () => {
    const { data: users = [], isLoading: usersLoading, error: usersError } = useAdminUsers();
    const { data: orders = [], isLoading: ordersLoading, error: ordersError } = useAdminOrders();
    const { data: cw_bookings = [], isLoading: bookingsLoading, error: bookingsError } = useAdminCwBookings();

    const isLoading = usersLoading || ordersLoading || bookingsLoading;
    const error = usersError || ordersError || bookingsError;

    const stats = useMemo(() => {
        const totalRevenue = 
            orders.reduce((sum, order) => sum + (order.total || 0), 0) + 
            cw_bookings.reduce((sum, booking) => sum + (booking.total || 0), 0);
        
        const totalUsers = users.length;
        const totalOrdersAndBookings = orders.length + cw_bookings.length;
        
        return { totalRevenue, totalUsers, totalOrdersAndBookings };
    }, [users, orders, cw_bookings]);

    const monthlyRevenueData = useMemo(() => {
         const revenueByMonth: { [key: string]: number } = {};
         const allTransactions = [
             ...orders.map(o => ({ date: o.order_date, total: o.total })),
             ...cw_bookings.map(b => ({ date: b.created_at, total: b.total }))
         ];

         allTransactions.forEach(item => {
             if (item.date && item.total) {
                 const month = new Date(item.date).toLocaleString('default', { month: 'short' });
                 revenueByMonth[month] = (revenueByMonth[month] || 0) + item.total;
             }
         });

         return Object.entries(revenueByMonth).map(([label, value]) => ({
             label,
             value,
             color: '#3b82f6',
         }));
    }, [orders, cw_bookings]);
    
    if (isLoading) return <PageLoader />;
    if (error) return <div className="text-red-500 bg-red-50 p-4 rounded-lg">خطأ في تحميل الإحصائيات العامة: {error.message}</div>;

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">نظرة عامة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="إجمالي الإيرادات" value={`${stats.totalRevenue} ج.م`} icon={<DollarSign size={28} className="text-green-500" />} color="bg-green-100" />
                <StatCard title="إجمالي المستخدمين" value={stats.totalUsers} icon={<Users size={28} className="text-blue-500" />} color="bg-blue-100" />
                <StatCard title="إجمالي الطلبات والحجوزات" value={stats.totalOrdersAndBookings} icon={<ShoppingBag size={28} className="text-purple-500" />} color="bg-purple-100" />
            </div>
            <BarChart title="الإيرادات الشهرية" data={monthlyRevenueData} />
        </div>
    );
};

export default GlobalDashboard;