import React, { useState, useMemo } from 'react';
import { MessageSquare, Eye } from 'lucide-react';
import { useAdminSupportTickets } from '../../hooks/adminQueries';
// FIX: Corrected import path
import { useCommunicationMutations } from '../../hooks/mutations';
import PageLoader from '../../components/ui/PageLoader';
import AdminSection from '../../components/admin/AdminSection';
import ViewTicketModal from '../../components/admin/ViewTicketModal';
import { formatDate } from '../../utils/helpers';
import type { SupportTicket, TicketStatus } from '../../lib/database.types';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import StatFilterCard from '../../components/admin/StatFilterCard';
import { Input } from '../../components/ui/Input';

const ticketStatuses: TicketStatus[] = ["جديدة", "تمت المراجعة", "مغلقة"];
const statusColors: { [key in TicketStatus]: string } = {
    "جديدة": "bg-blue-500",
    "تمت المراجعة": "bg-yellow-500",
    "مغلقة": "bg-green-500",
};

const AdminSupportPage: React.FC = () => {
    const { data: tickets = [], isLoading, error } = useAdminSupportTickets();
    const { updateSupportTicketStatus } = useCommunicationMutations();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const statusCounts = useMemo(() => {
        const counts: { [key in TicketStatus]?: number } = {};
        for (const ticket of tickets) {
            counts[ticket.status] = (counts[ticket.status] || 0) + 1;
        }
        return counts;
    }, [tickets]);

    const filteredTickets = useMemo(() => {
        return tickets.filter(ticket => {
            const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
            const matchesSearch = searchTerm === '' ||
                ticket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ticket.subject.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [tickets, statusFilter, searchTerm]);

    const handleViewTicket = (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        setIsModalOpen(true);
    };

    const handleStatusChange = (ticketId: string, newStatus: TicketStatus) => {
        updateSupportTicketStatus.mutate({ ticketId, newStatus });
    };

    if (isLoading) return <PageLoader text="جاري تحميل رسائل الدعم..." />;
    if (error) return <div className="text-center text-red-500">{(error as Error).message}</div>;

    return (
        <>
            <ViewTicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} ticket={selectedTicket} />
            <div className="animate-fadeIn space-y-8">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">رسائل الدعم</h1>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatFilterCard label="الكل" value={tickets.length} color="bg-gray-800" isActive={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
                    {ticketStatuses.map(status => (
                        <StatFilterCard 
                            key={status}
                            label={status}
                            value={statusCounts[status] || 0}
                            color={statusColors[status] || 'bg-gray-500'}
                            isActive={statusFilter === status}
                            onClick={() => setStatusFilter(status)}
                        />
                    ))}
                </div>

                <AdminSection title="قائمة الرسائل" icon={<MessageSquare />}>
                    <div className="mb-6 max-w-lg">
                        <Input 
                            type="search"
                            placeholder="ابحث بالاسم أو الموضوع..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                           <thead className="border-b-2"><tr>
                                <th className="p-3">الاسم</th><th className="p-3">الموضوع</th><th className="p-3">التاريخ</th><th className="p-3">الحالة</th><th className="p-3">إجراءات</th>
                            </tr></thead>
                            <tbody>
                                {filteredTickets.map(ticket => (
                                    <tr key={ticket.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-semibold">{ticket.name}</td>
                                        <td className="p-3">{ticket.subject}</td>
                                        <td className="p-3 text-sm">{formatDate(ticket.created_at)}</td>
                                        <td className="p-3 min-w-[150px]">
                                            <Select value={ticket.status} onChange={e => handleStatusChange(ticket.id, e.target.value as TicketStatus)} className="p-1 text-sm">
                                                {ticketStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                            </Select>
                                        </td>
                                        <td className="p-3">
                                            <Button variant="ghost" size="icon" onClick={() => handleViewTicket(ticket)}><Eye size={20} /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                         {filteredTickets.length === 0 && <p className="text-center py-8 text-gray-500">لا توجد رسائل دعم تطابق بحثك.</p>}
                    </div>
                </AdminSection>
            </div>
        </>
    );
};

export default AdminSupportPage;