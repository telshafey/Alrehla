import React, { useMemo } from 'react';
import { useAdminCwBookings, useAdminInstructors } from '../../../hooks/adminQueries';
import StatCard from '../StatCard';
import BarChart from '../BarChart';
import { CheckSquare, Users, UserCheck } from 'lucide-react';
import PageLoader from '../../ui/PageLoader';

const CreativeWritingDashboard: React.FC = () => {
    const { data: cw_bookings = [], isLoading: bookingsLoading, error: bookingsError } = useAdminCwBookings();
    const { data: instructors = [], isLoading: instructorsLoading, error: instructorsError } = useAdminInstructors();
    
    const isLoading = bookingsLoading || instructorsLoading;
    const error = bookingsError || instructorsError;
    
    const totalStudents = useMemo(() => new Set(cw_bookings.map(b => b.child_id)).size, [cw_bookings]);

    const bookingStatusData = useMemo(() => {
        const statusCounts: { [key: string]: number } = {};
        cw_bookings.forEach(booking => {
            statusCounts[booking.status] = (statusCounts[booking.status] || 0) + 1;
        });
        return Object.entries(statusCounts).map(([label, value]) => ({
            label,
            value,
            color: '#ec4899',
        }));
    }, [cw_bookings]);
    
    if (isLoading) return <PageLoader />;
    if (error) return <div className="text-red-500 bg-red-50 p-4 rounded-lg">خطأ في تحميل إحصائيات "بداية الرحلة": {error.message}</div>;

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">ملخص "بداية الرحلة"</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="إجمالي الحجوزات" value={cw_bookings.length} icon={<CheckSquare size={28} className="text-green-500" />} color="bg-green-100" />
                <StatCard title="الطلاب الحاليون" value={totalStudents} icon={<Users size={28} className="text-indigo-500" />} color="bg-indigo-100" />
                <StatCard title="المدربون" value={instructors.length} icon={<UserCheck size={28} className="text-pink-500" />} color="bg-pink-100" />
            </div>
            <BarChart title="حالات الحجوزات" data={bookingStatusData} />
        </div>
    );
};

export default CreativeWritingDashboard;