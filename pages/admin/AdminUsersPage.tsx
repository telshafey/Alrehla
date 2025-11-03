import React, { useState, useMemo } from 'react';
import { useAdminUsers, useAdminAllChildProfiles, transformUsersWithRelations } from '../../hooks/queries/admin/useAdminUsersQuery';
import { useUserMutations } from '../../hooks/mutations/useUserMutations';
import PageLoader from '../../components/ui/PageLoader';
import { Users, Plus, Edit, Trash2, Link as LinkIcon } from 'lucide-react';
import { roleNames } from '../../lib/roles';
import type { UserProfileWithRelations } from '../../lib/database.types';
import { Button } from '../../components/ui/Button';
import EditUserModal from '../../components/admin/EditUserModal';
import LinkStudentModal from '../../components/admin/LinkStudentModal';
import ErrorState from '../../components/ui/ErrorState';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import DataTable from '../../components/admin/ui/DataTable';

const AdminUsersPage: React.FC = () => {
    const { data: users = [], isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useAdminUsers();
    const { data: children = [], isLoading: childrenLoading, error: childrenError, refetch: refetchChildren } = useAdminAllChildProfiles();
    const { updateUser, bulkDeleteUsers } = useUserMutations();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<UserProfileWithRelations | null>(null);
    const [userToLink, setUserToLink] = useState<UserProfileWithRelations | null>(null);
    
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
        await updateUser.mutateAsync(payload);
        setIsEditModalOpen(false);
    };

    if (isLoading) return <PageLoader text="جاري تحميل المستخدمين..." />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

    return (
        <>
            <EditUserModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveUser} user={userToEdit} isSaving={updateUser.isPending} />
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
                        <DataTable<UserProfileWithRelations>
                            data={enrichedUsers}
                            columns={[
                                { accessorKey: 'name', header: 'الاسم' },
                                { accessorKey: 'email', header: 'البريد الإلكتروني' },
                                { accessorKey: 'role', header: 'الدور', cell: ({ value }) => roleNames[value as keyof typeof roleNames] || value },
                                { accessorKey: 'childrenCount', header: 'الأطفال' },
                            ]}
                            bulkActions={[
                                {
                                    label: 'حذف المحدد (لا يمكن التراجع)',
                                    action: (selected) => {
                                        if (window.confirm(`هل أنت متأكد من حذف ${selected.length} مستخدمين؟`)) {
                                            bulkDeleteUsers.mutate({ userIds: selected.map(s => s.id) });
                                        }
                                    },
                                    isDestructive: true,
                                }
                            ]}
                            renderRowActions={(user) => (
                                <>
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
                                </>
                            )}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default AdminUsersPage;