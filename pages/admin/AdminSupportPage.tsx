

import React, { useState, useMemo } from 'react';
import { MessageSquare, Eye } from 'lucide-react';
import { useAdminSupportTickets } from '../../hooks/queries.ts';
import { useAppMutations } from '../../hooks/mutations.ts';
import PageLoader from '../../components/ui/PageLoader.tsx';
import AdminSection from '../../components/admin/AdminSection.tsx';
import { formatDate } from '../../utils/helpers.ts';
import ViewTicketModal from '../../components/admin/ViewTicketModal.tsx';
import type { SupportTicket } from '../../lib/database.types.ts';

const AdminSupportPage: React.FC = () => {
    const { data: supportTickets = [], isLoading, error } = useAdminSupportTickets();
    const { updateSupportTicketStatus } = useAppMutations();
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

    const filteredTickets = useMemo(() => {
        return supportTickets.filter(ticket => statusFilter === 'all' || ticket.status === statusFilter);
    }, [supportTickets, statusFilter]);
    
    const handleStatusChange = async (ticketId: string, newStatus: SupportTicket['status']) => {
        // Correctly call the mutation function using `.mutateAsync`.
        await updateSupportTicketStatus.mutateAsync({ ticketId, newStatus });
    };

    if (isLoading) return <PageLoader text="جاري تحميل رسائل الدعم..." />;
    if (error) return <div className="text-center text-red-500">{error.message}</div>;
    
    const statuses: SupportTicket['status'][] = ["جديدة", "تمت المراجعة", "مغلقة"];

    return (
       <>
         <ViewTicketModal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} ticket={selectedTicket} />
        <div className="animate-fadeIn space-y-12">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة رسائل الدعم</h1>
            <AdminSection title="صندوق الوارد" icon={<MessageSquare />}>
                <div className="mb-4">
                     <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2 border rounded-lg bg-white">
                        <option value="all">كل الحالات</option>
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead><tr className="border-b-2">
                            <th className="p-3">المرسل</th><th className="p-3">الموضوع</th><th className="p-3">التاريخ</th><th className="p-3">الحالة</th><th className="p-3">عرض</th>
                        </tr></thead>
                        <tbody>
                            {filteredTickets.map(ticket => (
                                <tr key={ticket.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">{ticket.name}<br/><span className="text-xs text-gray-500">{ticket.email}</span></td>
                                    <td className="p-3">{ticket.subject}</td>
                                    <td className="p-3">{formatDate(ticket.created_at)}</td>
                                    <td className="p-3">
                                        <select value={ticket.status} onChange={e => handleStatusChange(ticket.id, e.target.value as SupportTicket['status'])} className="p-2 border rounded-lg bg-white">
                                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-3">
                                        <button onClick={() => setSelectedTicket(ticket)} className="text-gray-500 hover:text-blue-600"><Eye size={20} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </AdminSection>
        </div>
       </>
    );
};

export default AdminSupportPage;
