import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardWidget from './DashboardWidget';
import StatCard from '../StatCard';
import BarChart from '../BarChart';
import { BookOpen } from 'lucide-react';
import type { BookingStatus } from '../../../lib/database.types';

interface CreativeWritingDashboardProps {
    data: any;
}

const statusColors: { [key in BookingStatus]: string } = {
    "بانتظار الدفع": "#d1d5db", // gray-300
    "مؤكد": "#93c5fd", // blue-300
    "مكتمل": "#6ee7b7", // green-300
    "ملغي": "#fca5a5", // red-300
};

const CreativeWritingDashboard: React.FC<CreativeWritingDashboardProps> = ({ data }) => {
    const navigate = useNavigate();
    const { bookings = [] } = data || {};
    
    const stats = useMemo(() => {
        const newBookings = bookings.filter((b: any) => b.status === 'بانتظار الدفع').length;
        const confirmedBookings = bookings.filter((b: any) => b.status === 'مؤكد').length;

        return { newBookings, confirmedBookings };
    }, [bookings]);

    const bookingChartData = useMemo(() => {
        const counts = bookings.reduce((acc: { [key: string]: number }, booking: any) => {
            acc[booking.status] = (acc[booking.status] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(counts).map(([label, value]) => ({
            label,
            // FIX: Cast value to number to satisfy ChartData type.
            value: value as number,
            color: statusColors[label as BookingStatus] || '#9ca3af',
        }));
    }, [bookings]);


    return (
        <DashboardWidget title="ملخص 'بداية الرحلة'" icon={<BookOpen className="text-purple-500" />}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                    <StatCard 
                        title="حجوزات جديدة تنتظر الدفع" 
                        value={stats.newBookings} 
                        icon={<BookOpen size={24} className="text-purple-500" />} 
                        color="bg-purple-100"
                        onClick={() => navigate('/admin/creative-writing', { state: { statusFilter: 'بانتظار الدفع' } })}
                    />
                     <StatCard 
                        title="جلسات مؤكدة قادمة" 
                        value={stats.confirmedBookings} 
                        icon={<BookOpen size={24} className="text-blue-500" />} 
                        color="bg-blue-100"
                        onClick={() => navigate('/admin/creative-writing', { state: { statusFilter: 'مؤكد' } })}
                    />
                </div>
                 <BarChart title="حالات الحجوزات" data={bookingChartData} />
            </div>
        </DashboardWidget>
    );
};

export default CreativeWritingDashboard;