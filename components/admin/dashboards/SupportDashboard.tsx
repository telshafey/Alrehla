

import React from 'react';
import { useAdminSupportTickets, useAdminJoinRequests } from '../../../hooks/queries.ts';
import StatCard from '../StatCard.tsx';
import PageLoader from '../../ui/PageLoader.tsx';
import { MessageSquare, UserPlus } from 'lucide-react';

const SupportDashboard: React.FC = () => {
    const { data: supportTickets = [], isLoading: ticketsLoading, error: ticketsError } = useAdminSupportTickets();
    const { data: joinRequests = [], isLoading: requestsLoading, error: requestsError } = useAdminJoinRequests();

    const isLoading = ticketsLoading || requestsLoading;
    const error = ticketsError || requestsError;
    
    if (isLoading) return <PageLoader />;
    if (error) return <div className="text-red-500 bg-red-50 p-4 rounded-lg">خطأ في تحميل إحصائيات الدعم: {error.message}</div>;

    const newTickets = supportTickets.filter(t => t.status === 'جديدة').length;
    const newJoinRequests = joinRequests.filter(r => r.status === 'جديد').length;

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">ملخص الدعم والتواصل</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard title="رسائل دعم جديدة" value={newTickets} icon={<MessageSquare size={28} className="text-orange-500" />} color="bg-orange-100" />
                <StatCard title="طلبات انضمام جديدة" value={newJoinRequests} icon={<UserPlus size={28} className="text-cyan-500" />} color="bg-cyan-100" />
            </div>
        </div>
    );
};

export default SupportDashboard;