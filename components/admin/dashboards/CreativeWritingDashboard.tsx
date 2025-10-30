import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardWidget from './DashboardWidget';
import StatCard from '../StatCard';
import { BookOpen, UserCheck } from 'lucide-react';

const CreativeWritingDashboard: React.FC<{ data: any }> = ({ data }) => {
    const navigate = useNavigate();
    const { bookings = [], instructors = [] } = data || {};

    const stats = useMemo(() => {
        const pendingBookings = bookings.filter((b: any) => b.status === 'بانتظار الدفع').length;
        const totalInstructors = instructors.length;
        return { pendingBookings, totalInstructors, totalBookings: bookings.length };
    }, [bookings, instructors]);

    return (
        <DashboardWidget title="قسم بداية الرحلة" icon={<BookOpen className="text-purple-500" />}>
            <div className="space-y-4">
                <StatCard title="إجمالي الحجوزات" value={stats.totalBookings} icon={<BookOpen size={24} className="text-purple-500" />} color="bg-purple-100" onClick={() => navigate('/admin/creative-writing')} />
                <StatCard title="إجمالي المدربين" value={stats.totalInstructors} icon={<UserCheck size={24} className="text-blue-500" />} color="bg-blue-100" onClick={() => navigate('/admin/instructors')} />
                {stats.pendingBookings > 0 && <p className="text-sm text-yellow-700">{stats.pendingBookings} حجوزات جديدة بحاجة لتأكيد الدفع.</p>}
            </div>
        </DashboardWidget>
    );
};

export default CreativeWritingDashboard;
