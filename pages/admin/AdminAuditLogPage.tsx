
import React, { useState } from 'react';
import { History, User, ShoppingBag, Edit, Search, Calendar, Filter, List } from 'lucide-react';
import { useAdminAuditLogQuery } from '../../hooks/queries/admin/useAdminAuditLogQuery';
import PageLoader from '../../components/ui/PageLoader';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import DatePicker from '../../components/admin/ui/DatePicker';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { useAdminUsers } from '../../hooks/queries/admin/useAdminUsersQuery';

const ActionIcon: React.FC<{ action: string }> = ({ action }) => {
    if (action.includes('USER')) return <User size={16} className="text-blue-500" />;
    if (action.includes('ORDER')) return <ShoppingBag size={16} className="text-pink-500" />;
    if (action.includes('POST')) return <Edit size={16} className="text-green-500" />;
    return <History size={16} className="text-gray-500" />;
};

const AdminAuditLogPage: React.FC = () => {
    const [filters, setFilters] = useState({ startDate: '', endDate: '', actionType: 'all', userId: 'all' });
    const [isSearchTriggered, setIsSearchTriggered] = useState(false);

    // Fetch users list separately for the filter dropdown to be populated before searching logs
    const { data: usersList = [] } = useAdminUsers(); 
    
    const { data: logData, isLoading, error, refetch } = useAdminAuditLogQuery(filters, isSearchTriggered);

    const { logs = [], actionTypes = [] } = logData || {};

    const handleFilterChange = (field: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        // We don't auto-fetch on change anymore to prevent heavy loading
    };

    const handleSearch = () => {
        setIsSearchTriggered(true);
        refetch();
    };

    // Mock action types for the dropdown if not yet loaded from query
    const availableActionTypes = actionTypes.length > 0 ? actionTypes : [
        'UPDATE_ORDER_STATUS', 'UPDATE_USER_ROLE', 'CREATE_BLOG_POST', 'APPROVE_INSTRUCTOR_SCHEDULE', 'UPDATE_PRODUCT'
    ];

    // Filter admins/staff only for the user dropdown
    const staffUsers = usersList.filter(u => u.role !== 'user' && u.role !== 'student');

    return (
        <div className="animate-fadeIn space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-foreground">سجل النشاطات</h1>
                <p className="text-muted-foreground mt-1">مراقبة وتتبع جميع الإجراءات الحساسة التي تتم داخل لوحة التحكم.</p>
            </div>

            <Card className="border-t-4 border-t-primary">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><Filter size={20}/> تصفية السجلات</CardTitle>
                    <CardDescription>حدد المعايير أدناه ثم اضغط على "عرض السجلات" لتحميل البيانات.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                        <div className="lg:col-span-2">
                             <DatePicker 
                                startDate={filters.startDate}
                                endDate={filters.endDate}
                                onStartDateChange={(date) => handleFilterChange('startDate', date)}
                                onEndDateChange={(date) => handleFilterChange('endDate', date)}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2"><List size={14} /> نوع الإجراء</label>
                            <Select value={filters.actionType} onChange={(e) => handleFilterChange('actionType', e.target.value)}>
                                <option value="all">كل الإجراءات</option>
                                {availableActionTypes.map((action: string) => <option key={action} value={action}>{action}</option>)}
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2"><User size={14} /> المستخدم المسؤول</label>
                            <Select value={filters.userId} onChange={(e) => handleFilterChange('userId', e.target.value)}>
                                <option value="all">كل المستخدمين</option>
                                {staffUsers.map((user: any) => <option key={user.id} value={user.id}>{user.name}</option>)}
                            </Select>
                        </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end border-t pt-4">
                        <Button onClick={handleSearch} icon={<Search size={18} />} loading={isLoading && isSearchTriggered} size="lg" className="w-full md:w-auto">
                            عرض السجلات
                        </Button>
                    </div>
                </CardContent>
            </Card>
            
            {error && <ErrorState message={(error as Error).message} onRetry={refetch} />}

            {isSearchTriggered && !error && !isLoading && (
                <Card className="animate-fadeIn">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">نتائج البحث</CardTitle>
                            <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                عدد السجلات: {logs.length}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[200px]">الإجراء</TableHead>
                                        <TableHead>المستخدم</TableHead>
                                        <TableHead>الهدف</TableHead>
                                        <TableHead>التفاصيل</TableHead>
                                        <TableHead className="text-left">التوقيت</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.length > 0 ? logs.map((log: any) => (
                                        <TableRow key={log.id}>
                                            <TableCell><span className="flex items-center gap-2 font-mono text-xs font-semibold bg-gray-50 p-1 rounded border w-fit"><ActionIcon action={log.action} /> {log.action}</span></TableCell>
                                            <TableCell className="font-medium">{log.user_name}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{log.target_description}</TableCell>
                                            <TableCell className="text-sm">{log.details}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground text-left" dir="ltr">{new Date(log.timestamp).toLocaleString('ar-EG')}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Search className="h-8 w-8 text-gray-300" />
                                                    <p>لا توجد سجلات تطابق الفلاتر المحددة.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {!isSearchTriggered && (
                <div className="text-center py-16 bg-muted/30 rounded-xl border-2 border-dashed border-gray-200">
                    <History className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700">لم يتم عرض أي بيانات بعد</h3>
                    <p className="text-muted-foreground mt-2">الرجاء استخدام الفلاتر أعلاه والضغط على "عرض السجلات" لبدء التصفح.</p>
                </div>
            )}
        </div>
    );
};

export default AdminAuditLogPage;
