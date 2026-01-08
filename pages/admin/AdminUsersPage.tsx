
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminUsers, useAdminAllChildProfiles, transformUsersWithRelations, type UserWithParent } from '../../hooks/queries/admin/useAdminUsersQuery';
import { useUserMutations } from '../../hooks/mutations/useUserMutations';
import { Users, Plus, Edit, Trash2, Search, Briefcase, GraduationCap, Shield, User, ArrowRight, RefreshCw, Link as LinkIcon, Heart, UserCog, UserCheck } from 'lucide-react';
import { roleNames, STAFF_ROLES, CUSTOMER_ROLES } from '../../lib/roles';
import { Button } from '../../components/ui/Button';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import SortableTableHead from '../../components/admin/ui/SortableTableHead';
import { Input } from '../../components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import LinkStudentModal from '../../components/admin/LinkStudentModal';
import Dropdown from '../../components/ui/Dropdown';

const AdminUsersPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: users = [], isLoading: usersLoading, error: usersError, refetch: refetchUsers, isRefetching } = useAdminUsers();
    const { data: children = [], isLoading: childrenLoading, error: childrenError, refetch: refetchChildren } = useAdminAllChildProfiles();
    const { bulkDeleteUsers } = useUserMutations();

    const [activeTab, setActiveTab] = useState<'staff' | 'customers'>('customers');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'created_at', direction: 'desc' });
    
    const [linkModalOpen, setLinkModalOpen] = useState(false);
    const [selectedUserForLink, setSelectedUserForLink] = useState<UserWithParent | null>(null);

    const isLoading = usersLoading || childrenLoading;
    const error = usersError || childrenError;

    const enrichedUsers = useMemo(() => {
        if (isLoading || error) return [];
        return transformUsersWithRelations(users, children);
    }, [users, children, isLoading, error]);

    const { staffUsers, customerUsers } = useMemo(() => {
        // فلترة دقيقة بناءً على قوائم الأدوار الجديدة في lib/roles.ts
        const staff = enrichedUsers.filter(u => STAFF_ROLES.includes(u.role));
        const customers = enrichedUsers.filter(u => CUSTOMER_ROLES.includes(u.role));
        return { staffUsers: staff, customerUsers: customers };
    }, [enrichedUsers]);

    const filteredAndSortedUsers = useMemo(() => {
        let data = activeTab === 'staff' ? [...staffUsers] : [...customerUsers];

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            data = data.filter(user => 
                user.name.toLowerCase().includes(lowerTerm) || 
                user.email.toLowerCase().includes(lowerTerm)
            );
        }

        if (sortConfig) {
            data.sort((a, b) => {
                const aVal = (a as any)[sortConfig.key] ?? '';
                const bVal = (b as any)[sortConfig.key] ?? '';
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return data;
    }, [staffUsers, customerUsers, activeTab, searchTerm, sortConfig]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleDelete = (userId: string, name: string) => {
        if (window.confirm(`هل أنت متأكد من حذف المستخدم "${name}"؟ سيتم حذف كافة بياناته المرتبطة.`)) {
            bulkDeleteUsers.mutate({ userIds: [userId] });
        }
    };

    const addOptions = [
        { label: 'إضافة عميل/طالب جديد', action: () => navigate('/admin/users/new?type=customer'), icon: <User size={16} /> },
        { label: 'إضافة موظف/مدرب جديد', action: () => navigate('/admin/users/new?type=staff'), icon: <Shield size={16} /> },
    ];

    if (error) return <ErrorState message={(error as Error).message} onRetry={() => { refetchUsers(); refetchChildren(); }} />;

    return (
        <div className="animate-fadeIn space-y-8">
            <LinkStudentModal 
                isOpen={linkModalOpen} 
                onClose={() => { setLinkModalOpen(false); setSelectedUserForLink(null); refetchChildren(); refetchUsers(); }} 
                user={selectedUserForLink} 
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-extrabold text-foreground">إدارة المستخدمين</h1>
                <div className="flex flex-wrap gap-2">
                    <Button onClick={() => { refetchUsers(); refetchChildren(); }} variant="ghost" icon={<RefreshCw className={isRefetching ? 'animate-spin' : ''} size={16}/>}>تحديث</Button>
                    <Dropdown 
                        trigger={<span className="flex items-center gap-2"><Plus size={18} /> إضافة مستخدم</span>}
                        items={addOptions}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users /> قائمة الحسابات</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-6">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <Input 
                                placeholder="بحث بالاسم أو البريد الإلكتروني..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pr-10"
                            />
                        </div>

                        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'staff' | 'customers')}>
                            <TabsList className="w-full justify-start bg-muted/50 p-1">
                                <TabsTrigger value="customers" className="gap-2"><Briefcase size={16}/> العملاء والطلاب ({customerUsers.length})</TabsTrigger>
                                <TabsTrigger value="staff" className="gap-2"><Shield size={16}/> الموظفون والمدربون ({staffUsers.length})</TabsTrigger>
                            </TabsList>

                            <TabsContent value={activeTab}>
                                <div className="overflow-x-auto border rounded-lg">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/20">
                                                <SortableTableHead sortKey="name" label="الاسم" sortConfig={sortConfig} onSort={handleSort} />
                                                <SortableTableHead sortKey="email" label="البريد" sortConfig={sortConfig} onSort={handleSort} />
                                                <SortableTableHead sortKey="role" label="الدور / الرتبة" sortConfig={sortConfig} onSort={handleSort} />
                                                {activeTab === 'customers' && (
                                                    <TableHead className="text-center">الأطفال (طلاب/كل)</TableHead>
                                                )}
                                                <TableHead>إجراءات</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredAndSortedUsers.length > 0 ? (
                                                filteredAndSortedUsers.map((user) => (
                                                    <TableRow key={user.id}>
                                                        <TableCell className="font-medium">
                                                            <div>{user.name}</div>
                                                            {user.parentName && (
                                                                <div className="flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit mt-1 border border-blue-100">
                                                                    <ArrowRight size={10} />
                                                                    <span>تابع لـ: {user.parentName}</span>
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-xs font-mono">{user.email}</TableCell>
                                                        <TableCell>
                                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                                user.role === 'student' ? 'bg-blue-100 text-blue-800' : 
                                                                user.role === 'parent' ? 'bg-green-100 text-green-800' :
                                                                user.role === 'instructor' ? 'bg-orange-100 text-orange-800' :
                                                                user.role === 'user' ? 'bg-gray-100 text-gray-800' : 'bg-purple-100 text-purple-800'
                                                            }`}>
                                                                {user.role === 'student' ? <GraduationCap size={10}/> : 
                                                                 user.role === 'parent' ? <Heart size={10}/> :
                                                                 user.role === 'instructor' ? <UserCheck size={10}/> :
                                                                 user.role === 'user' ? <User size={10}/> : <Shield size={10}/>}
                                                                {roleNames[user.role]}
                                                            </span>
                                                        </TableCell>
                                                        {activeTab === 'customers' && (
                                                            <TableCell className="text-center">
                                                                <div className="flex flex-col items-center">
                                                                    <span className={`font-bold ${user.activeStudentsCount > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                                                                        {user.activeStudentsCount} طالب
                                                                    </span>
                                                                    <span className="text-[10px] text-muted-foreground">
                                                                        من أصل {user.totalChildrenCount} ملف
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                        )}
                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                <Button variant="ghost" size="icon" onClick={() => { setSelectedUserForLink(user); setLinkModalOpen(true); }} className={user.role !== 'student' && user.role !== 'user' ? 'hidden' : 'text-blue-500'} title="ربط بحساب طفل"><LinkIcon size={18} /></Button>
                                                                <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/users/${user.id}${activeTab === 'staff' ? '?type=staff' : '?type=customer'}`)} title="تعديل"><Edit size={18} /></Button>
                                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(user.id, user.name)} title="حذف"><Trash2 size={18} /></Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground italic">لا توجد بيانات لهذه الفئة حالياً.</TableCell></TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminUsersPage;
