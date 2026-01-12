
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminUsers, useAdminAllChildProfiles, transformUsersWithRelations, type UserWithParent } from '../../hooks/queries/admin/useAdminUsersQuery';
import { useUserMutations } from '../../hooks/mutations/useUserMutations';
import { Users, Plus, Edit, Trash2, Search, Briefcase, Shield, Link as LinkIcon, RefreshCw, User, Baby, GraduationCap, AlertCircle, ShoppingBag, UserPlus, Link2Off } from 'lucide-react';
import { roleNames, STAFF_ROLES } from '../../lib/roles';
import { Button } from '../../components/ui/Button';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import LinkStudentModal from '../../components/admin/LinkStudentModal';
import DataTable from '../../components/admin/ui/DataTable';
import Dropdown from '../../components/ui/Dropdown';

const AdminUsersPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: users = [], isLoading: usersLoading, error: usersError, refetch: refetchUsers, isRefetching } = useAdminUsers();
    const { data: children = [], isLoading: childrenLoading, error: childrenError, refetch: refetchChildren } = useAdminAllChildProfiles();
    const { bulkDeleteUsers } = useUserMutations();

    const [activeTab, setActiveTab] = useState<'parents' | 'customers' | 'students' | 'staff'>('parents');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [linkModalOpen, setLinkModalOpen] = useState(false);
    const [selectedUserForLink, setSelectedUserForLink] = useState<UserWithParent | null>(null);

    const error = usersError || childrenError;

    const enrichedUsers = useMemo(() => {
        if (usersLoading || childrenLoading || error) return [];
        return transformUsersWithRelations(users, children);
    }, [users, children, usersLoading, childrenLoading, error]);

    const filteredUsers = useMemo(() => {
        return enrichedUsers.filter(user => {
            let matchesRole = false;

            // 1. الموظفين والمدربين
            if (activeTab === 'staff') {
                matchesRole = STAFF_ROLES.includes(user.role);
            } 
            // 2. أولياء الأمور (مفعلين فقط)
            // الشرط: يجب أن يكون لديه طالب واحد مفعل على الأقل
            else if (activeTab === 'parents') {
                matchesRole = user.activeStudentsCount > 0;
            } 
            // 3. العملاء (يشمل من لديهم ملفات أطفال لكن لم يفعلوا حسابات طلاب بعد)
            // الشرط: ليس موظفاً، ليس طالباً، وليس لديه طلاب مفعلين
            else if (activeTab === 'customers') {
                const isStaff = STAFF_ROLES.includes(user.role);
                const isStudent = user.role === 'student';
                matchesRole = !isStaff && !isStudent && user.activeStudentsCount === 0;
            } 
            // 4. حسابات الطلاب المستقلة
            else if (activeTab === 'students') {
                matchesRole = user.role === 'student';
            }

            // Search Filtering
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

    const handleOpenLinkModal = (user: UserWithParent) => {
        setSelectedUserForLink(user);
        setLinkModalOpen(true);
    };
    
    const addUserOptions = [
        { 
            label: 'إضافة عميل / ولي أمر', 
            action: () => navigate('/admin/users/new?type=customer'),
            icon: <User size={16} />
        },
        { 
            label: 'إضافة موظف / إداري', 
            action: () => navigate('/admin/users/new?type=staff'),
            icon: <Shield size={16} />
        }
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
                    <Button onClick={() => { refetchUsers(); refetchChildren(); }} variant="ghost" icon={<RefreshCw className={isRefetching ? 'animate-spin' : ''} size={16}/>}>تحديث البيانات</Button>
                    <Dropdown 
                        trigger={
                            <span className="flex items-center gap-2">
                                <Plus size={18} /> إضافة مستخدم
                            </span>
                        }
                        items={addUserOptions}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users /> قاعدة البيانات الحية</CardTitle>
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

                        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
                            <TabsList className="w-full justify-start bg-muted/50 p-1 flex-wrap h-auto">
                                <TabsTrigger value="parents" className="gap-2"><Baby size={16}/> أولياء الأمور (مفعلين)</TabsTrigger>
                                <TabsTrigger value="customers" className="gap-2"><ShoppingBag size={16}/> عملاء (قصص/زوار)</TabsTrigger>
                                <TabsTrigger value="students" className="gap-2"><GraduationCap size={16}/> حسابات الطلاب</TabsTrigger>
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
                                                    {row.parentName ? (
                                                        <div className="flex items-center gap-1 text-[9px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit mt-1 border border-blue-100">
                                                            <LinkIcon size={10} />
                                                            <span>تابع لـ: {row.parentName}</span>
                                                        </div>
                                                    ) : row.role === 'student' ? (
                                                        <div className="flex items-center gap-1 text-[9px] text-red-600 bg-red-50 px-2 py-0.5 rounded-full w-fit mt-1 border border-red-100 font-bold animate-pulse">
                                                            <Link2Off size={10} />
                                                            <span>غير مرتبط بولي أمر!</span>
                                                        </div>
                                                    ) : null}
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
                                            header: 'الرتبة المسجلة',
                                            cell: ({ value, row }) => (
                                                <div className="flex flex-col gap-1">
                                                    <span className={`inline-flex w-fit items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                        value === 'student' ? 'bg-indigo-100 text-indigo-800' : 
                                                        value === 'parent' ? 'bg-green-100 text-green-800' :
                                                        value === 'instructor' ? 'bg-orange-100 text-orange-800' :
                                                        value === 'user' ? 'bg-gray-100 text-gray-800' : 'bg-purple-100 text-purple-800'
                                                    }`}>
                                                        {roleNames[value as keyof typeof roleNames]}
                                                    </span>
                                                </div>
                                            )
                                        },
                                        {
                                            accessorKey: 'totalChildrenCount',
                                            header: 'بيانات العائلة',
                                            cell: ({ row }) => {
                                                if (row.role === 'student') return <span className="text-[10px] text-muted-foreground">-</span>;
                                                
                                                if (row.totalChildrenCount > 0) {
                                                    return (
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[10px] font-bold text-gray-700">{row.totalChildrenCount} ملف طفل</span>
                                                            {row.activeStudentsCount > 0 ? (
                                                                <span className="text-[9px] text-green-600 font-bold bg-green-50 px-1 rounded w-fit">
                                                                    {row.activeStudentsCount} طالب مفعل
                                                                </span>
                                                            ) : (
                                                                 <span className="text-[9px] text-orange-600 font-bold bg-orange-50 px-1 rounded w-fit">
                                                                    بانتظار التفعيل
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                }
                                                return <span className="text-[10px] text-muted-foreground italic">لا يوجد أطفال</span>;
                                            }
                                        }
                                    ]}
                                    renderRowActions={(user) => (
                                        <div className="flex items-center gap-1">
                                            {user.role === 'student' && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleOpenLinkModal(user)} 
                                                    title={user.parentName ? "تغيير الربط" : "ربط الطالب بولي أمر"}
                                                    className={!user.parentName ? "text-orange-500 hover:text-orange-700 bg-orange-50" : ""}
                                                >
                                                    <LinkIcon size={18} />
                                                </Button>
                                            )}
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
