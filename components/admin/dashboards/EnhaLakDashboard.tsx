import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardWidget from './DashboardWidget';
import StatCard from '../StatCard';
import BarChart from '../BarChart';
import { ShoppingBag, Star } from 'lucide-react';
import type { OrderStatus } from '../../../lib/database.types';

interface EnhaLakDashboardProps {
    data: any;
}

const statusColors: { [key in OrderStatus]: string } = {
    "بانتظار الدفع": "#d1d5db", // gray-300
    "بانتظار المراجعة": "#a5b4fc", // indigo-300
    "قيد التجهيز": "#fcd34d", // yellow-300
    "يحتاج مراجعة": "#fdba74", // orange-300
    "تم الشحن": "#93c5fd", // blue-300
    "تم التسليم": "#6ee7b7", // green-300
    "ملغي": "#fca5a5", // red-300
};


const EnhaLakDashboard: React.FC<EnhaLakDashboardProps> = ({ data }) => {
    const navigate = useNavigate();
    const { orders = [], subscriptions = [] } = data || {};
    
    const stats = useMemo(() => {
        const newOrders = orders.filter((o: any) => o.status === 'بانتظار المراجعة' || o.status === 'بانتظار الدفع').length;
        const activeSubscriptions = subscriptions.filter((s: any) => s.status === 'active').length;

        return { newOrders, activeSubscriptions };
    }, [orders, subscriptions]);

    const orderChartData = useMemo(() => {
        const counts = orders.reduce((acc: { [key: string]: number }, order: any) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(counts).map(([label, value]) => ({
            label,
            // FIX: Cast value to number to satisfy ChartData type.
            value: value as number,
            color: statusColors[label as OrderStatus] || '#9ca3af',
        }));
    }, [orders]);


    return (
        <DashboardWidget title="ملخص 'إنها لك'" icon={<ShoppingBag className="text-pink-500" />}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                    <StatCard 
                        title="طلبات جديدة تنتظر المراجعة" 
                        value={stats.newOrders} 
                        icon={<ShoppingBag size={24} className="text-pink-500" />} 
                        color="bg-pink-100"
                        onClick={() => navigate('/admin/orders')}
                    />
                    <StatCard 
                        title="الاشتراكات النشطة حالياً" 
                        value={stats.activeSubscriptions} 
                        icon={<Star size={24} className="text-yellow-500" />} 
                        color="bg-yellow-100"
                        onClick={() => navigate('/admin/subscriptions')}
                    />
                </div>
                 <BarChart title="حالات الطلبات" data={orderChartData} />
            </div>
        </DashboardWidget>
    );
};

export default EnhaLakDashboard;