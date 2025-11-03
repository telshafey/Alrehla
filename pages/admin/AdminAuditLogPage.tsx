import React, { useState, useMemo } from 'react';
import { History, User, ShoppingBag, Edit } from 'lucide-react';
import { useAdminAuditLogQuery } from '../../hooks/queries/admin/useAdminAuditLogQuery';
import PageLoader from '../../components/ui/PageLoader';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import DatePicker from '../../components/admin/ui/DatePicker';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { formatDate } from '../../utils/helpers';

const ActionIcon: React.FC<{ action: string }> = ({ action }) => {
    if (action.includes('USER')) return <User size={16} className="text-blue-500" />;
    if (action.includes('ORDER')) return <ShoppingBag size={16} className="text-pink-500" />;
    if (action.includes('POST')) return <Edit size={16} className="text-green-500" />;
    return <History size={16} className="text-gray-500" />;
};

const AdminAuditLogPage: React.FC = () => {
    const [filters, setFilters] = useState({ startDate: '', endDate: '', actionType: 'all', userId: 'all' });
    const { data: logData, isLoading, error, refetch } = useAdminAuditLogQuery();

    const { logs = [], users = [], actionTypes = [] } = logData || {};

    const handleFilterChange = (field: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const filteredLogs = useMemo(() => {
        if (!logs) return [];
        return logs.filter((log: any) => {
            const logDate = new Date(log.timestamp);
            const matchesDate = 
                (!filters.startDate || logDate >= new Date(filters.startDate)) &&
                (!filters.endDate || logDate <= new Date(filters.endDate));
            const matchesAction = filters.actionType === 'all' || log.action === filters.actionType;
            const matchesUser = filters.userId === 'all' || log.user_id === filters.userId;
            return matchesDate && matchesAction && matchesUser;
        });
    }, [logs, filters]);

    if (isLoading) return <PageLoader text="جاري تحميل سجل النشاطات..." />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

    return (
        <div className="animate-fadeIn space-y-8">
            <h1 className="text-3xl font-extrabold text-foreground">سجل النشاطات</h1>

            <Card>
                <CardHeader><CardTitle>فلترة السجل</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <DatePicker 
                            startDate={filters.startDate}
                            endDate={filters.endDate}
                            onStartDateChange={(date) => handleFilterChange('startDate', date)}
                            onEndDateChange={(date) => handleFilterChange('endDate', date)}
                        />
                        <Select value={filters.actionType} onChange={(e) => handleFilterChange('actionType', e.target.value)}>
                            <option value="all">كل الإجراءات</option>
                            {actionTypes.map((action: string) => <option key={action} value={action}>{action}</option>)}
                        </Select>
                        <Select value={filters.userId} onChange={(e) => handleFilterChange('userId', e.target.value)}>
                            <option value="all">كل المستخدمين</option>
                            {users.map((user: any) => <option key={user.id} value={user.id}>{user.name}</option>)}
                        </Select>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader><CardTitle>النتائج</CardTitle></CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>الإجراء</TableHead>
                                    <TableHead>المستخدم</TableHead>
                                    <TableHead>الهدف</TableHead>
                                    <TableHead>التفاصيل</TableHead>
                                    <TableHead>التوقيت</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.length > 0 ? filteredLogs.map((log: any) => (
                                    <TableRow key={log.id}>
                                        <TableCell><span className="flex items-center gap-2 font-mono text-xs font-semibold"><ActionIcon action={log.action} /> {log.action}</span></TableCell>
                                        <TableCell>{log.user_name}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{log.target_description}</TableCell>
                                        <TableCell className="text-xs">{log.details}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString('ar-EG')}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                            لا توجد سجلات تطابق الفلاتر المحددة.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminAuditLogPage;