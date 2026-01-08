
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminUsers, useAdminAllChildProfiles, transformUsersWithRelations, type UserWithParent } from '../../hooks/queries/admin/useAdminUsersQuery';
import { useUserMutations } from '../../hooks/mutations/useUserMutations';
import { Users, Plus, Edit, Trash2, Search, Briefcase, Shield, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { roleNames, STAFF_ROLES, CUSTOMER_ROLES } from '../../lib/roles';
import { Button } from '../../components/ui/Button';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import LinkStudentModal from '../../components/admin/LinkStudentModal';
import DataTable from '../../components/admin/ui/DataTable';

const AdminUsersPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: users = [], isLoading: usersLoading, error: usersError, refetch: refetchUsers, isRefetching } = useAdminUsers();
    const { data: children = [], isLoading: childrenLoading, error: childrenError, refetch: refetchChildren } = useAdminAllChildProfiles();
    const { bulkDeleteUsers } = useUserMutations();

    const [activeTab, setActiveTab] = useState<'staff' | 'customers'>('customers');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [linkModalOpen, setLinkModalOpen] = useState(false);
    const [selectedUserForLink, setSelectedUserForLink] = useState<UserWithParent | null>(null);

    const error = usersError || childrenError;

    const enrichedUsers = useMemo(() => {
        if (usersLoading || childrenLoading || error) return [];
        return transformUsersWithRelations(users, children);
    }, [users, children, usersLoading, childrenLoading, error]);

    const filteredUsers = useMemo(() => {
        const roleFilter = activeTab === 'staff' ? STAFF_ROLES : CUSTOMER_ROLES;
        return enrichedUsers.filter(user => {
            const matchesRole = roleFilter.includes(user.role);
            const matchesSearch = searchTerm === '' || 
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesRole && matchesSearch;
        });
    }, [enrichedUsers, activeTab, searchTerm]);

    const handleDelete = (userId: string, name: string) => {
        if (window.confirm(`هل أنت متأكد من حذف المستخدم "${name}"؟ سيتم حذف كافة البيانات المرتبطة ولن يتمكن من الدخول ثانية.`)) {
            bulkDeleteUsers.mutate({ userIds: [userId] });
        }
    };

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
                    <Button onClick={() => { refetchUsers(); refetchChildren(); }} variant="ghost" icon={<RefreshCw className={isRefetching ? 'animate-spin' : ''} size={16}/>}>تحديث البيانات</Button>
                    <Button onClick={() => navigate('/admin/users/new?type=customer')} icon={<Plus size={18} />}>إضافة مستخدم</Button>
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
                                <TabsTrigger value="customers" className="gap-2"><Briefcase size={16}/> العملاء والطلاب</TabsTrigger>
                                <TabsTrigger value="staff" className="gap-2"><Shield size={16}/> الموظفون والمدربون</TabsTrigger>
                            </TabsList>

                            <TabsContent value={activeTab}>
                                <DataTable<UserWithParent>
                                    data={filteredUsers}
                                    columns={[
                                        {
                                            accessorKey: 'name',
                                            header: 'الاسم',
                                            cell: ({ row }) => (
                                                <div>
                                                    <div className="font-medium">{row.name}</div>
                                                    {row.parentName && (
                                                        <div className="flex items-center gap-1 text-[9px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit mt-1 border border-blue-100">
                                                            <LinkIcon size={10} />
                                                            <span>تابع لـ: {row.parentName}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        },
                                        {
                                            accessorKey: 'email',
                                            header: 'البريد الإلكتروني',
                                            cell: ({ value }) => <span className="text-xs font-mono">{value}</span>
                                        },
                                        {
                                            accessorKey: 'role',
                                            header: 'الرتبة',
                                            cell: ({ value }) => (
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                    value === 'student' ? 'bg-blue-100 text-blue-800' : 
                                                    value === 'parent' ? 'bg-green-100 text-green-800' :
                                                    value === 'instructor' ? 'bg-orange-100 text-orange-800' :
                                                    value === 'user' ? 'bg-gray-100 text-gray-800' : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                    {roleNames[value as keyof typeof roleNames]}
                                                </span>
                                            )
                                        },
                                        {
                                            accessorKey: 'totalChildrenCount',
                                            header: 'الملفات / الحالة',
                                            cell: ({ row }) => row.role === 'student' ? (
                                                <span className="text-[10px] text-muted-foreground italic">حساب طالب</span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-400">{row.totalChildrenCount} ملفات أطفال</span>
                                            )
                                        }
                                    ]}
                                    renderRowActions={(user) => (
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/users/${user.id}`)} title="تعديل"><Edit size={18} /></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(user.id, user.name)} title="حذف"><Trash2 size={18} /></Button>
                                        </div>
                                    )}
                                    bulkActions={[
                                        {
                                            label: 'حذف المحدد',
                                            action: (selected) => {
                                                if (window.confirm(`هل أنت متأكد من حذف ${selected.length} مستخدمين؟`)) {
                                                    bulkDeleteUsers.mutate({ userIds: selected.map(u => u.id) });
                                                }
                                            },
                                            isDestructive: true
                                        }
                                    ]}
                                    pageSize={10}
                                    initialSort={{ key: 'created_at', direction: 'desc' }}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminUsersPage;
