import React, { useState, useMemo } from 'react';
import { Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAdminScheduledSessions } from '../../hooks/adminQueries';
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
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<SessionStatus | 'all'>('all');
    const [typeFilter, setTypeFilter] = useState<SessionTypeFilter>('all');

    const filteredSessions = useMemo(() => {
        return sessions.filter(session => {
            const matchesSearch = searchTerm === '' ||
                session.child_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                session.instructor_name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
            const matchesType = typeFilter === 'all' || session.type === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        }).sort((a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime());
    }, [sessions, searchTerm, statusFilter, typeFilter]);
    
    if (isLoading) return <PageLoader text="جاري تحميل الجلسات..." />;
    if (error) return <div className="text-center text-red-500">{error.message}</div>;

    return (
        <div className="animate-fadeIn space-y-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة الجلسات المجدولة</h1>
            <AdminSection title="قائمة الجلسات" icon={<Calendar />}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Input
                        type="search"
                        placeholder="ابحث باسم الطالب أو المدرب..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
                        <option value="all">كل الحالات</option>
                        <option value="upcoming">قادمة</option>
                        <option value="completed">مكتملة</option>
                        <option value="missed">لم يحضر</option>
                    </Select>
                    <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)}>
                        <option value="all">كل الأنواع</option>
                        <option value="اشتراك">اشتراك</option>
                        <option value="حجز باقة">حجز باقة</option>
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
                                        <td className="p-3">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${session.type === 'اشتراك' ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'}`}>
                                                {session.type}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                {statusInfo.icon}
                                                <span className="text-sm">{statusInfo.text}</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
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