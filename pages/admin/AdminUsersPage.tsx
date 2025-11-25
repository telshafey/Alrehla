
import React, { useState, useMemo } from 'react';
import { useAdminUsers, useAdminAllChildProfiles, transformUsersWithRelations } from '../../hooks/queries/admin/useAdminUsersQuery';
import { useUserMutations } from '../../hooks/mutations/useUserMutations';
import PageLoader from '../../components/ui/PageLoader';
import { Users, Plus, Edit, Trash2, Link as LinkIcon, Search, Filter } from 'lucide-react';
import { roleNames } from '../../lib/roles';
import type { UserProfileWithRelations } from '../../lib/database.types';
import { Button } from '../../components/ui/Button';
import EditUserModal from '../../components/admin/EditUserModal';
import LinkStudentModal from '../../components/admin/LinkStudentModal';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import SortableTableHead from '../../components/admin/ui/SortableTableHead';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

const AdminUsersPage: React.FC = () => {
    const { data: users = [], isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useAdminUsers();
    const { data: children = [], isLoading: childrenLoading, error: childrenError, refetch: refetchChildren } = useAdminAllChildProfiles();
    const { updateUser, updateUserPassword, bulkDeleteUsers } = useUserMutations();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<UserProfileWithRelations | null>(null);
    const [userToLink, setUserToLink] = useState<UserProfileWithRelations | null>(null);
    
    // Search & Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [sortConfig, setSortConfig] = useState<{ key: keyof UserProfileWithRelations | 'childrenCount'; direction: 'asc' | 'desc' } | null>({ key: 'created_at', direction: 'desc' });

    const isLoading = usersLoading || childrenLoading;
    const error = usersError || childrenError;
    const refetch = () => {
        if (usersError) refetchUsers();
        if (childrenError) refetchChildren();
    };

    const enrichedUsers = useMemo(() => {
        if (isLoading || error) return [];
        return transformUsersWithRelations(users, children);
    }, [users, children, isLoading, error]);

    const filteredAndSortedUsers = useMemo(() => {
        let data = [...enrichedUsers];

        // 1. Filter
        if (roleFilter !== 'all') {
            data = data.filter(user => user.role === roleFilter);
        }

        // 2. Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            data = data.filter(user => 
                user.name.toLowerCase().includes(lowerTerm) || 
                user.email.toLowerCase().includes(lowerTerm)
            );
        }

        // 3. Sort
        if (sortConfig) {
            data.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return data;
    }, [enrichedUsers, roleFilter, searchTerm, sortConfig]);


    const handleOpenEditModal = (user: UserProfileWithRelations | null) => {
        setUserToEdit(user);
        setIsEditModalOpen(true);
    };

    const handleOpenLinkModal = (user: UserProfileWithRelations) => {
        setUserToLink(user);
        setIsLinkModalOpen(true);
    };

    const handleDeleteUser = (userId: string) => {
        if (window.confirm(`هل أنت متأكد من حذف هذا المستخدم؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
            bulkDeleteUsers.mutate({ userIds: [userId] });
        }
    };

    const handleSaveUser = async (payload: any) => {
        // Separate password update if it exists in payload (for existing users)
        if (payload.id && payload.password) {
            await updateUserPassword.mutateAsync({ userId: payload.id, newPassword: payload.password });
            // Remove password from payload so we don't send it to generic update if not needed there
            delete payload.password; 
        }
        
        // Update other profile details
        await updateUser.mutateAsync(payload);
        setIsEditModalOpen(false);
    };

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key: key as keyof UserProfileWithRelations, direction });
    };

    if (isLoading) return <PageLoader text="جاري تحميل المستخدمين..." />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

    return (
        <>
            <EditUserModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveUser} user={userToEdit} isSaving={updateUser.isPending || updateUserPassword.isPending} />
            <LinkStudentModal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} user={userToLink} />
            
            <div className="animate-fadeIn space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-extrabold text-foreground">إدارة المستخدمين</h1>
                    <Button onClick={() => handleOpenEditModal(null)} icon={<Plus size={18} />}>
                        إضافة مستخدم
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users /> قائمة المستخدمين</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Search and Filters */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="flex-1 relative">
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <Input 
                                    placeholder="بحث بالاسم أو البريد الإلكتروني..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pr-10"
                                />
                            </div>
                            <div className="w-full md:w-64">
                                <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                                    <option value="all">كل الأدوار</option>
                                    {Object.entries(roleNames).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <SortableTableHead<UserProfileWithRelations> sortKey="name" label="الاسم" sortConfig={sortConfig} onSort={handleSort} />
                                        <SortableTableHead<UserProfileWithRelations> sortKey="email" label="البريد الإلكتروني" sortConfig={sortConfig} onSort={handleSort} />
                                        <SortableTableHead<UserProfileWithRelations> sortKey="role" label="الدور" sortConfig={sortConfig} onSort={handleSort} />
                                        <SortableTableHead<UserProfileWithRelations> sortKey="childrenCount" label="عدد الأطفال" sortConfig={sortConfig} onSort={handleSort} />
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
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {roleNames[user.role] || user.role}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">{user.childrenCount}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(user)} title="تعديل">
                                                            <Edit size={18} />
                                                        </Button>
                                                        {user.role === 'student' && (
                                                            <Button variant="ghost" size="icon" onClick={() => handleOpenLinkModal(user)} title="ربط حساب الطالب">
                                                                <LinkIcon size={18} />
                                                            </Button>
                                                        )}
                                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteUser(user.id)} title="حذف">
                                                            <Trash2 size={18} />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                لا توجد نتائج تطابق بحثك.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="mt-4 text-sm text-muted-foreground">
                            إجمالي النتائج: {filteredAndSortedUsers.length} مستخدم
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default AdminUsersPage;
