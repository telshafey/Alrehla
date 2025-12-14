
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminUsers, useAdminAllChildProfiles, transformUsersWithRelations } from '../../hooks/queries/admin/useAdminUsersQuery';
import { useUserMutations } from '../../hooks/mutations/useUserMutations';
import { Users, Plus, Edit, Trash2, Search, Briefcase, GraduationCap, Shield, User, ArrowRight } from 'lucide-react';
import { roleNames } from '../../lib/roles';
import type { UserProfileWithRelations } from '../../lib/database.types';
import { Button } from '../../components/ui/Button';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import SortableTableHead from '../../components/admin/ui/SortableTableHead';
import { Input } from '../../components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';

const AdminUsersPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: users = [], isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useAdminUsers();
    const { data: children = [], isLoading: childrenLoading, error: childrenError, refetch: refetchChildren } = useAdminAllChildProfiles();
    const { bulkDeleteUsers } = useUserMutations();

    const [activeTab, setActiveTab] = useState<'staff' | 'customers'>('staff');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof UserProfileWithRelations | 'childrenCount'; direction: 'asc' | 'desc' } | null>({ key: 'created_at', direction: 'desc' });

    const isLoading = usersLoading || childrenLoading;
    const error = usersError || childrenError;
    const refetch = () => {
        if (usersError) refetchUsers();
        if (childrenError) refetchChildren();
    };

    const enrichedUsers = useMemo(() => {
        if (usersLoading || childrenLoading || error) return [];
        return transformUsersWithRelations(users, children);
    }, [users, children, usersLoading, childrenLoading, error]);

    // Create a map to find Parent for a Student
    const studentParentMap = useMemo(() => {
        const map = new Map<string, { id: string, name: string }>();
        children.forEach(child => {
            if (child.student_user_id) {
                const parent = users.find(u => u.id === child.user_id);
                if (parent) {
                    map.set(child.student_user_id, { id: parent.id, name: parent.name });
                }
            }
        });
        return map;
    }, [children, users]);

    const { staffUsers, customerUsers } = useMemo(() => {
        const staff = enrichedUsers.filter(u => u.role !== 'user' && u.role !== 'student');
        const customers = enrichedUsers.filter(u => u.role === 'user' || u.role === 'student');
        return { staffUsers: staff, customerUsers: customers };
    }, [enrichedUsers]);

    const filteredAndSortedUsers = useMemo(() => {
        let data = activeTab === 'staff' ? [...staffUsers] : [...customerUsers];

        // 1. Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            data = data.filter(user => 
                user.name.toLowerCase().includes(lowerTerm) || 
                user.email.toLowerCase().includes(lowerTerm)
            );
        }

        // 2. Sort
        if (sortConfig) {
            data.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];

                if (aVal === null || aVal === undefined) return 1;
                if (bVal === null || bVal === undefined) return -1;

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return data;
    }, [staffUsers, customerUsers, activeTab, searchTerm, sortConfig]);


    const handleDeleteUser = (userId: string) => {
        if (window.confirm(`هل أنت متأكد من حذف هذا المستخدم؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
            bulkDeleteUsers.mutate({ userIds: [userId] });
        }
    };

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key: key as keyof UserProfileWithRelations, direction });
    };

    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

    return (
        <div className="animate-fadeIn space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-foreground">إدارة المستخدمين</h1>
                <Button onClick={() => navigate('/admin/users/new')} icon={<Plus size={18} />}>
                    إضافة مستخدم
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users /> قائمة الحسابات</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row gap-4 justify-between">
                            {/* Search */}
                            <div className="relative w-full md:w-96">
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <Input 
                                    placeholder="بحث بالاسم أو البريد الإلكتروني..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pr-10"
                                />
                            </div>
                        </div>

                        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'staff' | 'customers')}>
                            <TabsList className="w-full justify-start">
                                <TabsTrigger value="staff" className="flex-1 md:flex-none">
                                    <Shield className="ml-2 w-4 h-4"/> الموظفون والإدارة ({staffUsers.length})
                                </TabsTrigger>
                                <TabsTrigger value="customers" className="flex-1 md:flex-none">
                                    <Briefcase className="ml-2 w-4 h-4"/> العملاء والطلاب ({customerUsers.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="staff">
                                <div className="overflow-x-auto border rounded-lg">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <SortableTableHead<UserProfileWithRelations> sortKey="name" label="الاسم" sortConfig={sortConfig} onSort={handleSort} />
                                                <SortableTableHead<UserProfileWithRelations> sortKey="email" label="البريد الإلكتروني" sortConfig={sortConfig} onSort={handleSort} />
                                                <SortableTableHead<UserProfileWithRelations> sortKey="role" label="الدور" sortConfig={sortConfig} onSort={handleSort} />
                                                <TableHead>إجراءات</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredAndSortedUsers.length > 0 ? (
                                                filteredAndSortedUsers.map((user) => (
                                                    <TableRow key={user.id}>
                                                        <TableCell className="font-medium">{user.name}</TableCell>
                                                        <TableCell>{user.email}</TableCell>
                                                        <TableCell>
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                                {roleNames[user.role] || user.role}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/users/${user.id}`)} title="تعديل">
                                                                    <Edit size={18} />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteUser(user.id)} title="حذف">
                                                                    <Trash2 size={18} />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">لا يوجد موظفين يطابقون البحث.</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </TabsContent>

                            <TabsContent value="customers">
                                <div className="overflow-x-auto border rounded-lg">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <SortableTableHead<UserProfileWithRelations> sortKey="name" label="الاسم" sortConfig={sortConfig} onSort={handleSort} />
                                                <SortableTableHead<UserProfileWithRelations> sortKey="email" label="البريد الإلكتروني" sortConfig={sortConfig} onSort={handleSort} />
                                                <SortableTableHead<UserProfileWithRelations> sortKey="role" label="النوع" sortConfig={sortConfig} onSort={handleSort} />
                                                <SortableTableHead<UserProfileWithRelations> sortKey="childrenCount" label="عدد الأطفال" sortConfig={sortConfig} onSort={handleSort} />
                                                <TableHead>إجراءات</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredAndSortedUsers.length > 0 ? (
                                                filteredAndSortedUsers.map((user) => {
                                                    const parentInfo = user.role === 'student' ? studentParentMap.get(user.id) : null;
                                                    
                                                    return (
                                                        <TableRow key={user.id}>
                                                            <TableCell className="font-medium">
                                                                <div>{user.name}</div>
                                                                {parentInfo && (
                                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                                        <ArrowRight size={10} className="transform rotate-180 rtl:rotate-0" />
                                                                        <span>تابع لـ: </span>
                                                                        <span 
                                                                            className="text-blue-600 hover:underline cursor-pointer"
                                                                            onClick={() => {
                                                                                 setSearchTerm(parentInfo.name);
                                                                                 // Ideally highlight or navigate, but search is good enough for now
                                                                            }}
                                                                        >
                                                                            {parentInfo.name}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>{user.email}</TableCell>
                                                            <TableCell>
                                                                {user.role === 'student' ? (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                        <GraduationCap size={12} /> طالب
                                                                    </span>
                                                                ) : (user.childrenCount && user.childrenCount > 0) ? (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                        <Briefcase size={12} /> ولي أمر
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                                        <User size={12} /> مستخدم
                                                                    </span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-center">{user.childrenCount || 0}</TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-1">
                                                                    <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/users/${user.id}`)} title="تعديل">
                                                                        <Edit size={18} />
                                                                    </Button>
                                                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteUser(user.id)} title="حذف">
                                                                        <Trash2 size={18} />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">لا يوجد عملاء يطابقون البحث.</TableCell>
                                                </TableRow>
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
