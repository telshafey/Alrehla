import React, { useState, useMemo } from 'react';
import { Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAdminScheduledSessions } from '../../hooks/queries/admin/useAdminSchedulingQuery';
import PageLoader from '../../components/ui/PageLoader';
import AdminSection from '../../components/admin/AdminSection';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { formatDate } from '../../utils/helpers';
import type { SessionStatus } from '../../lib/database.types';

type SessionTypeFilter = 'all' | 'اشتراك' | 'حجز باقة';

const getStatusInfo = (status: SessionStatus) => {
    switch (status) {
        case 'upcoming': return { text: 'قادمة', icon: <Clock size={16} className="text-blue-500" /> };
        case 'completed': return { text: 'مكتملة', icon: <CheckCircle size={16} className="text-green-500" /> };
        case 'missed': return { text: 'لم يحضر', icon: <XCircle size={16} className="text-red-500" /> };
        default: return { text: status, icon: <Clock size={16} className="text-gray-500" /> };
    }
};

const AdminScheduledSessionsPage: React.FC = () => {
    const { data: sessions = [], isLoading, error } = useAdminScheduledSessions();
    const [statusFilter, setStatusFilter] = useState<SessionStatus | 'all'>('all');
    const [typeFilter, setTypeFilter] = useState<SessionTypeFilter>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSessions = useMemo(() => {
        return (sessions as any[]).filter(s => {
            const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
            const matchesType = typeFilter === 'all' || s.type === typeFilter;
            const matchesSearch = searchTerm === '' ||
                s.instructor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.child_name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesType && matchesSearch;
        });
    }, [sessions, statusFilter, typeFilter, searchTerm]);

    if (isLoading) {
        return <PageLoader text="جاري تحميل الجلسات..." />;
    }
    if (error) {
        return <p className="text-red-500">{error.message}</p>;
    }

    const statusOptions: (SessionStatus | 'all')[] = ['all', 'upcoming', 'completed', 'missed'];
    const typeOptions: SessionTypeFilter[] = ['all', 'اشتراك', 'حجز باقة'];

    return (
        <div className="animate-fadeIn space-y-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">الجلسات المجدولة</h1>

            <AdminSection title="قائمة الجلسات" icon={<Calendar />}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Input
                        type="search"
                        placeholder="ابحث بالمدرب أو الطالب..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
                        {statusOptions.map(s => <option key={s} value={s}>{s === 'all' ? 'كل الحالات' : getStatusInfo(s as SessionStatus).text}</option>)}
                    </Select>
                     <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)}>
                        {typeOptions.map(t => <option key={t} value={t}>{t === 'all' ? 'كل الأنواع' : t}</option>)}
                    </Select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="border-b-2">
                            <tr>
                                <th className="p-3">الطالب</th>
                                <th className="p-3">المدرب</th>
                                <th className="p-3">التاريخ والوقت</th>
                                <th className="p-3">النوع</th>
                                <th className="p-3">الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSessions.map(session => {
                                const statusInfo = getStatusInfo(session.status);
                                return (
                                    <tr key={session.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-semibold">{session.child_name}</td>
                                        <td className="p-3">{session.instructor_name}</td>
                                        <td className="p-3 text-sm">{formatDate(session.session_date)} - {new Date(session.session_date).toLocaleTimeString('ar-EG')}</td>
                                        <td className="p-3 text-sm">{session.type}</td>
                                        <td className="p-3">
                                            <span className="flex items-center gap-2 text-sm font-semibold">
                                                {statusInfo.icon} {statusInfo.text}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                     {filteredSessions.length === 0 && <p className="text-center py-8 text-gray-500">لا توجد جلسات تطابق بحثك.</p>}
                </div>
            </AdminSection>
        </div>
    );
};

export default AdminScheduledSessionsPage;
