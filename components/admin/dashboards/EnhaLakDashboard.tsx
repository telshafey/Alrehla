import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardWidget from './DashboardWidget';
import StatCard from '../StatCard';
import { ShoppingBag, Star } from 'lucide-react';

const EnhaLakDashboard: React.FC<{ data: any }> = ({ data }) => {
    const navigate = useNavigate();
    const { orders = [], subscriptions = [] } = data || {};

    const stats = useMemo(() => {
        const newOrders = orders.filter((o: any) => o.status === 'بانتظار المراجعة').length;
        const activeSubscriptions = subscriptions.filter((s: any) => s.status === 'active').length;
        return { newOrders, activeSubscriptions, totalOrders: orders.length };
    }, [orders, subscriptions]);

    return (
        <DashboardWidget title="قسم إنها لك" icon={<ShoppingBag className="text-pink-500" />}>
            <div className="space-y-4">
                <StatCard title="إجمالي الطلبات" value={stats.totalOrders} icon={<ShoppingBag size={24} className="text-pink-500" />} color="bg-pink-100" onClick={() => navigate('/admin/orders')} />
                <StatCard title="الاشتراكات النشطة" value={stats.activeSubscriptions} icon={<Star size={24} className="text-yellow-500" />} color="bg-yellow-100" onClick={() => navigate('/admin/subscriptions')} />
                 {stats.newOrders > 0 && <p className="text-sm text-yellow-700">{stats.newOrders} طلبات جديدة بحاجة للمراجعة.</p>}
            </div>
        </DashboardWidget>
    );
};

export default EnhaLakDashboard;
