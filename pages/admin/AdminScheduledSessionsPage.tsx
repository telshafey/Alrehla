import React, { useState, useMemo } from 'react';
import { Calendar, CheckCircle, Clock, XCircle, Star, Package, Gift } from 'lucide-react';
import { useAdminScheduledSessions } from '../../hooks/queries/admin/useAdminSchedulingQuery';
import PageLoader from '../../components/ui/PageLoader';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { formatDate } from '../../utils/helpers';
import type { SessionStatus } from '../../lib/database.types';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';


const getStatusInfo = (status: SessionStatus) => {
    switch (status) {
        case 'upcoming': return { text: 'قادمة', icon: <Clock size={16} className="text-blue-500" /> };
        case 'completed': return { text: 'مكتملة', icon: <CheckCircle size={16} className="text-green-500" /> };
        case 'missed': return { text: 'لم يحضر', icon: <XCircle size={16} className="text-red-500" /> };
        default: return { text: status, icon: <Clock size={16} className="text-gray-500" /> };
    }
};

const AdminScheduledSessionsPage: React.FC = () => {
    const { data: sessions = [], isLoading, error, refetch } = useAdminScheduledSessions();
    const [statusFilter, setStatusFilter] = useState<SessionStatus | 'all'>('all');
    const [activeTab, setActiveTab] = useState<'all' | 'intro' | 'package' | 'subscription'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSessions = useMemo(() => {
        return (sessions as any[]).filter(s => {
            const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
            
            let matchesType = false;
            switch (activeTab) {
                case 'intro':
                    matchesType = s.package_name === 'الجلسة التعريفية';
                    break;
                case 'package':
                    matchesType = s.type === 'حجز باقة' && s.package_name !== 'الجلسة التعريفية';
                    break;
                case 'subscription':
                    matchesType = s.type === 'اشتراك';
                    break;
                default: // 'all'
                    matchesType = true;
            }
            
            const matchesSearch = searchTerm === '' ||
                (s.instructor_name && s.instructor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (s.child_name && s.child_name.toLowerCase().includes(searchTerm.toLowerCase()));

            return matchesStatus && matchesType && matchesSearch;
        });
    }, [sessions, statusFilter, activeTab, searchTerm]);
    
    const statusCounts = useMemo(() => {
        const counts = { all: 0, upcoming: 0, completed: 0, missed: 0 };
        filteredSessions.forEach(s => {
            counts.all++;
            if (s.status in counts) {
                counts[s.status as SessionStatus]++;
            }
        });
        return counts;
    }, [filteredSessions]);

    if (isLoading) return <PageLoader text="جاري تحميل الجلسات..." />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

    const statusOptions: (SessionStatus | 'all')[] = ['all', 'upcoming', 'completed', 'missed'];

    return (
        <div className="animate-fadeIn space-y-8">
            <h1 className="text-3xl font-extrabold text-foreground">الجلسات المجدولة</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar /> قائمة الجلسات
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                        <TabsList className="mb-6">
                            <TabsTrigger value="all">الكل</TabsTrigger>
                            <TabsTrigger value="intro"><Star className="ml-2 text-yellow-500" /> الجلسات التعريفية</TabsTrigger>
                            <TabsTrigger value="package"><Package className="ml-2" /> جلسات الباقات</TabsTrigger>
                            <TabsTrigger value="subscription"><Gift className="ml-2" /> جلسات الاشتراك</TabsTrigger>
                        </TabsList>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <Input
                                type="search"
                                placeholder="ابحث بالمدرب أو الطالب..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
                                {statusOptions.map(s => <option key={s} value={s}>{s === 'all' ? `كل الحالات (${statusCounts.all})` : `${getStatusInfo(s as SessionStatus).text} (${statusCounts[s as SessionStatus]})`}</option>)}
                            </Select>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>الطالب</TableHead>
                                        <TableHead>المدرب</TableHead>
                                        <TableHead>التاريخ والوقت</TableHead>
                                        <TableHead>النوع</TableHead>
                                        <TableHead>الحالة</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSessions.map(session => {
                                        const statusInfo = getStatusInfo(session.status);
                                        return (
                                            <TableRow key={session.id}>
                                                <TableCell className="font-semibold">{session.child_name}</TableCell>
                                                <TableCell>{session.instructor_name}</TableCell>
                                                <TableCell className="text-sm">{formatDate(session.session_date)} - {new Date(session.session_date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                                                <TableCell className="text-sm">{session.type}</TableCell>
                                                <TableCell>
                                                    <span className="flex items-center gap-2 text-sm font-semibold">
                                                        {statusInfo.icon} {statusInfo.text}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                            {filteredSessions.length === 0 && <p className="text-center py-8 text-muted-foreground">لا توجد جلسات تطابق بحثك.</p>}
                        </div>

                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminScheduledSessionsPage;