import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardWidget from './DashboardWidget';
import StatCard from '../StatCard';
import { MessageSquare, UserPlus } from 'lucide-react';

interface SupportDashboardProps {
    data: any;
}

const SupportDashboard: React.FC<SupportDashboardProps> = ({ data }) => {
    const navigate = useNavigate();
    const { supportTickets = [], joinRequests = [] } = data || {};
    
    const stats = useMemo(() => {
        const newTickets = supportTickets.filter((t: any) => t.status === 'جديدة').length;
        const newJoinRequests = joinRequests.filter((r: any) => r.status === 'جديد').length;

        return { newTickets, newJoinRequests };
    }, [supportTickets, joinRequests]);

    return (
        <DashboardWidget title="ملخص التواصل" icon={<MessageSquare className="text-cyan-500" />}>
            <div className="space-y-4">
                <StatCard 
                    title="رسائل دعم جديدة" 
                    value={stats.newTickets} 
                    icon={<MessageSquare size={24} className="text-cyan-500" />} 
                    color="bg-cyan-100"
                    onClick={() => navigate('/admin/support')}
                />
                 <StatCard 
                    title="طلبات انضمام جديدة" 
                    value={stats.newJoinRequests} 
                    icon={<UserPlus size={24} className="text-indigo-500" />} 
                    color="bg-indigo-100"
                    onClick={() => navigate('/admin/join-requests')}
                />
            </div>
        </DashboardWidget>
    );
};

export default SupportDashboard;
