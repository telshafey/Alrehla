import React, { useState, useMemo } from 'react';
import { Users, Plus, Edit, Trash2, Link as LinkIcon, Eye } from 'lucide-react';
import { useAdminUsers, useAdminAllChildProfiles, transformUsersWithRelations } from '../../hooks/queries/admin/useAdminUsersQuery';
import { useUserMutations } from '../../hooks/mutations/useUserMutations';
import PageLoader from '../../components/ui/PageLoader';
import AdminSection from '../../components/admin/AdminSection';
import ViewUserModal from '../../components/admin/ViewUserModal';
import EditUserModal from '../../components/admin/EditUserModal';
import LinkStudentModal from '../../components/admin/LinkStudentModal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { roleNames } from '../../lib/roles';
import type { UserRole } from '../../lib/database.types';
import type { UserProfile as User, UserProfileWithRelations } from '../../lib/database.types';
import ErrorState from '../../components/ui/ErrorState';

const AdminUsersPage: React.FC = () => {
    const { data: users = [], isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useAdminUsers();
    const { data: children = [], isLoading: childrenLoading, error: childrenError, refetch: refetchChildren } = useAdminAllChildProfiles();
    const { createUser, updateUser, deleteUser } = useUserMutations();

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    
    const [selectedUser, setSelectedUser] = useState<UserProfileWithRelations | null>(null);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [userToLink, setUserToLink] = useState<User | null>(null);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

    const isLoading = usersLoading || childrenLoading;
    const isSaving = createUser.isPending || updateUser.isPending;

    const usersWithRelations = useMemo(
        () => transformUsersWithRelations(users, children),
        [users, children]
    );

    const filteredUsers = useMemo(() => {
        return usersWithRelations.filter(user => {
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
            const matchesSearch = searchTerm === '' ||
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesRole && matchesSearch;
        });
    }, [usersWithRelations, roleFilter, searchTerm]);

    const handleViewUser = (user: UserProfileWithRelations) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
    };
    
    const handleEditUser = (user: User | null) => {
        setUserToEdit(user);
        setIsEditModalOpen(true);
    };
    
    const handleLinkStudent = (user: User) => {
        setUserToLink(user);
        setIsLinkModalOpen(true);
    };

    const handleSaveUser = async (payload: any) => {
        try {
            if (payload.id) {
                await updateUser.mutateAsync(payload);
            } else {
                await createUser.mutateAsync(payload);
            }
            setIsEditModalOpen(false);
        } catch (e) { /* Error handled in hook */ }
    };
    
    const handleDeleteUser = async (userId: string) => {
        if(window.confirm('هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.')) {
            await deleteUser.mutateAsync({ userId });
        }
    };

    const error = usersError || childrenError;
    const refetch = () => {
        if (usersError) refetchUsers();
        if (childrenError) refetchChildren();
    };

    if (isLoading) return <PageLoader text="جاري تحميل المستخدمين..." />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

    return (
        <>
            <ViewUserModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} user={selectedUser} />
            <EditUserModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveUser} user={userToEdit} isSaving={isSaving} />
            <LinkStudentModal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} user={userToLink} />

            <div className="animate-fadeIn space-y-12">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة المستخدمين</h1>
                    <Button onClick={() => handleEditUser(null)} icon={<Plus size={18} />}>
                        إضافة مستخدم
                    </Button>
                </div>

                <AdminSection title="قائمة المستخدمين" icon={<Users />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <Input 
                            type="search"
                            placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                         <Select value={roleFilter} onChange={e => setRoleFilter(e.target.value as any)}>
                            <option value="all">كل الأدوار</option>
                            {Object.entries(roleNames).map(([key, name]) => (
                                <option key={key} value={key}>{name}</option>
                            ))}
                        </Select>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="border-b-2"><tr>
                                <th className="p-3">الاسم</th><th className="p-3">البريد الإلكتروني</th><th className="p-3">الدور</th><th className="p-3">إجراءات</th>
                            </tr></thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-semibold">{user.name}</td>
                                        <td className="p-3 text-sm text-gray-600">{user.email}</td>
                                        <td className="p-3"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">{roleNames[user.role]}</span></td>
                                        <td className="p-3 flex items-center gap-1 flex-wrap">
                                            <Button variant="ghost" size="icon" onClick={() => handleViewUser(user)} title="عرض التفاصيل"><Eye size={20} /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)} title="تعديل"><Edit size={20} /></Button>
                                            {user.role === 'student' && <Button variant="ghost" size="icon" onClick={() => handleLinkStudent(user)} title="ربط بطفل"><LinkIcon size={20} /></Button>}
                                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteUser(user.id)} title="حذف"><Trash2 size={20} /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </AdminSection>
            </div>
        </>
    );
};

export default AdminUsersPage;