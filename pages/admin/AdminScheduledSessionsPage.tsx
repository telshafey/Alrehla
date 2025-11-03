import React, { useState, useMemo } from 'react';
import { Calendar, CheckCircle, Clock, XCircle, Star, Package, Gift, ShieldQuestion, Check, X } from 'lucide-react';
import { useAdminScheduledSessions } from '../../hooks/queries/admin/useAdminSchedulingQuery';
import { useAdminSupportSessionRequests } from '../../hooks/queries/admin/useAdminCommunicationQuery';
import { useInstructorMutations } from '../../hooks/mutations/useInstructorMutations';
import PageLoader from '../../components/ui/PageLoader';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { formatDate } from '../../utils/helpers';
import type { SessionStatus, ScheduledSession, SupportSessionRequest } from '../../lib/database.types';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import IntroductorySessionSchedulerModal from '../../components/admin/IntroductorySessionSchedulerModal';
import SortableTableHead from '../../components/admin/ui/SortableTableHead';


const getStatusInfo = (status: SessionStatus) => {
    switch (status) {
        case 'upcoming': return { text: 'قادمة', icon: <Clock size={16} className="text-blue-500" /> };
        case 'completed': return { text: 'مكتملة', icon: <CheckCircle size={16} className="text-green-500" /> };
        case 'missed': return { text: 'لم يحضر', icon: <XCircle size={16} className="text-red-500" /> };
        default: return { text: status, icon: <Clock size={16} className="text-gray-500" /> };
    }
};

type EnrichedSession = ScheduledSession & { instructor_name: string; child_name: string; type: string; package_name: string | null };

const AdminScheduledSessionsPage: React.FC = () => {
    const { data: sessions = [], isLoading: sessionsLoading, error: sessionsError, refetch: refetchSessions } = useAdminScheduledSessions();
    const { data: supportRequests = [], isLoading: supportLoading, error: supportError, refetch: refetchSupport } = useAdminSupportSessionRequests();
    const { approveSupportSessionRequest, rejectSupportSessionRequest } = useInstructorMutations();
    
    const [isSchedulerModalOpen, setIsSchedulerModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<SessionStatus | 'all'>('all');
    const [activeTab, setActiveTab] = useState<'all' | 'intro' | 'package' | 'subscription' | 'support'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'session_date', direction: 'desc' });

    const isLoading = sessionsLoading || supportLoading;
    const error = sessionsError || supportError;

    const sortedAndFilteredSessions = useMemo(() => {
        let filtered = (sessions as any[]).filter(s => {
            const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
            
            let matchesType = false;
            switch (activeTab) {
                case 'intro': matchesType = s.package_name === 'الجلسة التعريفية'; break;
                case 'package': matchesType = s.type === 'حجز باقة' && s.package_name !== 'الجلسة التعريفية'; break;
                case 'subscription': matchesType = s.type === 'اشتراك'; break;
                default: matchesType = true;
            }
            
            const matchesSearch = searchTerm === '' || (s.instructor_name && s.instructor_name.toLowerCase().includes(searchTerm.toLowerCase())) || (s.child_name && s.child_name.toLowerCase().includes(searchTerm.toLowerCase()));

            return matchesStatus && matchesType && matchesSearch;
        });
        
        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [sessions, statusFilter, activeTab, searchTerm, sortConfig]);
    
    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    if (isLoading) return <PageLoader text="جاري تحميل الجلسات..." />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={() => { refetchSessions(); refetchSupport(); }} />;

    return (
        <>
        <IntroductorySessionSchedulerModal isOpen={isSchedulerModalOpen} onClose={() => setIsSchedulerModalOpen(false)} />
        <div className="animate-fadeIn space-y-8">
            <h1 className="text-3xl font-extrabold text-foreground">إدارة الجلسات</h1>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Calendar /> قائمة الجلسات</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                        <TabsList className="mb-6 flex-wrap h-auto">
                            <TabsTrigger value="all">الكل</TabsTrigger>
                            <TabsTrigger value="intro"><Star className="ml-2 text-yellow-500" /> الجلسات التعريفية</TabsTrigger>
                            <TabsTrigger value="package"><Package className="ml-2" /> جلسات الباقات</TabsTrigger>
                            <TabsTrigger value="subscription"><Gift className="ml-2" /> جلسات الاشتراك</TabsTrigger>
                            <TabsTrigger value="support"><ShieldQuestion className="ml-2 text-orange-500" /> طلبات الدعم</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="support">
                             <Table>
                                <TableHeader><TableRow><TableHead>المدرب</TableHead><TableHead>الطالب</TableHead><TableHead>السبب</TableHead><TableHead>التاريخ</TableHead><TableHead>الإجراء</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {(supportRequests as any[]).filter(r => r.status === 'pending').map(req => (
                                        <TableRow key={req.id}>
                                            <TableCell className="font-semibold">{req.instructor_name}</TableCell>
                                            <TableCell className="font-semibold">{req.child_name}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground max-w-sm truncate">{req.reason}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{formatDate(req.requested_at)}</TableCell>
                                            <TableCell><div className="flex gap-2"><Button variant="success" size="icon" onClick={() => approveSupportSessionRequest.mutate({ requestId: req.id })} title="موافقة"><Check size={18} /></Button><Button variant="destructive" size="icon" onClick={() => rejectSupportSessionRequest.mutate({ requestId: req.id })} title="رفض"><X size={18} /></Button></div></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {(supportRequests as any[]).filter(r => r.status === 'pending').length === 0 && <p className="text-center py-8 text-muted-foreground">لا توجد طلبات دعم معلقة حاليًا.</p>}
                        </TabsContent>
                        
                        <TabsContent value={activeTab} className={activeTab === 'support' ? 'hidden' : ''}>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <Input type="search" placeholder="ابحث بالمدرب أو الطالب..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
                                    <option value="all">كل الحالات</option>
                                    {(['upcoming', 'completed', 'missed'] as SessionStatus[]).map(s => <option key={s} value={s}>{getStatusInfo(s).text}</option>)}
                                </Select>
                            </div>
                            {activeTab === 'intro' && (
                                <div className="mb-4"><Button onClick={() => setIsSchedulerModalOpen(true)} icon={<Calendar />}>جدولة جلسة تعريفية</Button></div>
                            )}
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader><TableRow>
                                        <SortableTableHead<EnrichedSession> sortKey="child_name" label="الطالب" sortConfig={sortConfig} onSort={handleSort} />
                                        <SortableTableHead<EnrichedSession> sortKey="instructor_name" label="المدرب" sortConfig={sortConfig} onSort={handleSort} />
                                        <SortableTableHead<EnrichedSession> sortKey="session_date" label="التاريخ والوقت" sortConfig={sortConfig} onSort={handleSort} />
                                        <SortableTableHead<EnrichedSession> sortKey="type" label="النوع" sortConfig={sortConfig} onSort={handleSort} />
                                        <SortableTableHead<EnrichedSession> sortKey="status" label="الحالة" sortConfig={sortConfig} onSort={handleSort} />
                                    </TableRow></TableHeader>
                                    <TableBody>
                                        {sortedAndFilteredSessions.map(session => {
                                            const statusInfo = getStatusInfo(session.status);
                                            return (<TableRow key={session.id}><TableCell className="font-semibold">{session.child_name}</TableCell><TableCell>{session.instructor_name}</TableCell><TableCell className="text-sm">{formatDate(session.session_date)} - {new Date(session.session_date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</TableCell><TableCell className="text-sm">{session.type}</TableCell><TableCell><span className="flex items-center gap-2 text-sm font-semibold">{statusInfo.icon} {statusInfo.text}</span></TableCell></TableRow>)
                                        })}
                                    </TableBody>
                                </Table>
                                {sortedAndFilteredSessions.length === 0 && <p className="text-center py-8 text-muted-foreground">لا توجد جلسات تطابق بحثك.</p>}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
        </>
    );
};

export default AdminScheduledSessionsPage;