

import React, { useState } from 'react';
import { Users, Plus, Edit, UserCheck, Eye } from 'lucide-react';
// FIX: Corrected import path from non-existent queries.ts to adminQueries.ts
import { useAdminUsersWithRelations } from '../../hooks/adminQueries';
import { useUserMutations } from '../../hooks/mutations';
import PageLoader from '../../components/ui/PageLoader';
import AdminSection from '../../components/admin/AdminSection';
import EditUserModal from '../../components/admin/EditUserModal';
import LinkStudentModal from '../../components/admin/LinkStudentModal';
import ViewUserModal from '../../components/admin/ViewUserModal';
import type { UserProfileWithRelations } from '../../lib/database.types';
import { roleNames, UserRole, staffRoles } from '../../lib/roles';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';

const AdminUsersPage: React.FC = () => {
    const { data: users = [], isLoading, error } = useAdminUsersWithRelations();
    const { updateUserRole, createUser, updateUser } = useUserMutations();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfileWithRelations | null>(null);
    const [isSaving, setIsSaving] = useState(false);


    const handleOpenEditModal = (user: UserProfileWithRelations | null) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleOpenLinkModal = (user: UserProfileWithRelations) => {
        setSelectedUser(user);
        setIsLinkModalOpen(true);
    };
    
    const handleOpenViewModal = (user: UserProfileWithRelations) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
    };

    const handleSaveUser = async (payload: any) => {
        setIsSaving(true);
        try {
            if (payload.id) {
                await updateUser.mutateAsync(payload);
            } else {
                await createUser.mutateAsync({ ...payload, role: 'user' });
            }
            setIsEditModalOpen(false);
        } catch (e) {
            // Error is handled in hook
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <PageLoader text="جاري تحميل المستخدمين..." />;
    if (error) return <div className="text-center text-red-500">{error.message}</div>;

    return (
        <>
            <EditUserModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveUser}
                user={selectedUser}
                isSaving={isSaving}
            />
             <LinkStudentModal 
                isOpen={isLinkModalOpen}
                onClose={() => setIsLinkModalOpen(false)}
                user={selectedUser}
            />
            <ViewUserModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                user={selectedUser}
            />
            <div className="animate-fadeIn space-y-12">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة المستخدمين</h1>
                    <Button onClick={() => handleOpenEditModal(null)} icon={<Plus size={18} />}>
                        إضافة مستخدم
                    </Button>
                </div>

                <AdminSection title="قائمة المستخدمين" icon={<Users />}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="border-b-2">
                                <tr>
                                    <th className="p-3">الاسم</th>
                                    <th className="p-3">البريد الإلكتروني</th>
                                    <th className="p-3">الدور</th>
                                    <th className="p-3">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-semibold">{user.name}</td>
                                        <td className="p-3 text-sm">{user.email}</td>
                                        <td className="p-3">
                                            <Select 
                                                value={user.role} 
                                                onChange={e => updateUserRole.mutate({ userId: user.id, newRole: e.target.value as UserRole })}
                                                className="p-1 text-sm"
                                            >
                                                {staffRoles.map(roleKey => (
                                                    <option key={roleKey} value={roleKey}>{roleNames[roleKey]}</option>
                                                ))}
                                            </Select>
                                        </td>
                                        <td className="p-3 flex items-center gap-2">
                                            <Button onClick={() => handleOpenViewModal(user)} variant="ghost" size="icon" className="text-gray-500 hover:text-blue-600" title="عرض التفاصيل"><Eye size={20} /></Button>
                                            <Button onClick={() => handleOpenEditModal(user)} variant="ghost" size="icon" className="text-gray-500 hover:text-green-600" title="تعديل"><Edit size={20} /></Button>
                                            {user.role === 'student' && (
                                                <Button onClick={() => handleOpenLinkModal(user)} variant="ghost" size="icon" className="text-gray-500 hover:text-purple-600" title={`ربط بملف طفل ${user.children.find(c => c.student_user_id === user.id) ? `(مرتبط)` : ''}`}>
                                                    <UserCheck size={20} className={user.children.find(c => c.student_user_id === user.id) ? 'text-green-500' : ''}/>
                                                </Button>
                                            )}
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