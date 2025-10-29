import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardWidget from './DashboardWidget';
import StatCard from '../StatCard';
import { BookOpen, UserCog, CalendarCheck, ShieldQuestion, Calendar } from 'lucide-react';
import type { BookingStatus } from '../../../lib/database.types';

interface CreativeWritingDashboardProps {
    data: any;
}

const CreativeWritingDashboard: React.FC<CreativeWritingDashboardProps> = ({ data }) => {
    const navigate = useNavigate();
    const { bookings = [], instructors = [], supportSessionRequests = [], scheduledSessions = [] } = data || {};
    
    const stats = useMemo(() => {
        const newBookings = bookings.filter((b: any) => b.status === 'بانتظار الدفع').length;
        const confirmedBookings = bookings.filter((b: any) => b.status === 'مؤكد').length;
        const pendingScheduleUpdates = (instructors || []).filter((i: any) => i.schedule_status === 'pending').length;
        const pendingProfileUpdates = (instructors || []).filter((i: any) => i.profile_update_status === 'pending').length;
        const pendingSupportRequests = (supportSessionRequests || []).filter((r: any) => r.status === 'pending').length;
        const upcomingSessions = (scheduledSessions || []).filter((s: any) => s.status === 'upcoming').length;


        return { newBookings, confirmedBookings, pendingScheduleUpdates, pendingProfileUpdates, pendingSupportRequests, upcomingSessions };
    }, [bookings, instructors, supportSessionRequests, scheduledSessions]);

    return (
        <DashboardWidget title="ملخص 'بداية الرحلة'" icon={<BookOpen className="text-purple-500" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                 <StatCard
                    title="جلسات مجدولة وقادمة"
                    value={stats.upcomingSessions}
                    icon={<Calendar size={24} className="text-teal-500" />}
                    color="bg-teal-100"
                    onClick={() => navigate('/admin/scheduled-sessions')}
                />
                 <StatCard 
                    title="طلبات تعديل جداول" 
                    value={stats.pendingScheduleUpdates} 
                    icon={<CalendarCheck size={24} className="text-yellow-500" />} 
                    color="bg-yellow-100"
                    onClick={() => navigate('/admin/instructors')}
                />
                <StatCard 
                    title="طلبات تحديث ملفات شخصية" 
                    value={stats.pendingProfileUpdates} 
                    icon={<UserCog size={24} className="text-orange-500" />} 
                    color="bg-orange-100"
                    onClick={() => navigate('/admin/instructors')}
                />
                 <StatCard 
                    title="طلبات دعم من المدربين" 
                    value={stats.pendingSupportRequests} 
                    icon={<ShieldQuestion size={24} className="text-red-500" />} 
                    color="bg-red-100"
                    onClick={() => navigate('/admin/support-requests')}
                />
            </div>
        </DashboardWidget>
    );
};

export default CreativeWritingDashboard;