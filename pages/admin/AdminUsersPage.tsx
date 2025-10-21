import React, { useState, useMemo } from 'react';
import { Users, Plus, Edit, Link as LinkIcon } from 'lucide-react';
import { useAdminUsers, useAdminOrders, useAdminCwBookings } from '../../hooks/queries.ts';
import { useAppMutations } from '../../hooks/mutations.ts';
import PageLoader from '../../components/ui/PageLoader.tsx';
import AdminSection from '../../components/admin/AdminSection.tsx';
import { formatDate } from '../../utils/helpers.ts';
import { roleNames, staffRoles, UserRole } from '../../lib/roles.ts';
import ViewUserModal from '../../components/admin/ViewUserModal.tsx';
import EditUserModal from '../../components/admin/EditUserModal.tsx';
import LinkStudentModal from '../../components/admin/LinkStudentModal.tsx';
import type { UserProfile as User } from '../../contexts/AuthContext.tsx';

const AdminUsersPage: React.FC = () => {
    const { data: users = [], isLoading: usersLoading, error: usersError } = useAdminUsers();
    const { data: userOrders = [], isLoading: ordersLoading, error: ordersError } = useAdminOrders();
    const { data: userBookings = [], isLoading: bookingsLoading, error: bookingsError } = useAdminCwBookings();
    const { updateUserRole, createUser, updateUser } = useAppMutations();

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
    const [isSaving, setIsSaving] = useState(false);
    
    // Modals state
    const [viewUser, setViewUser] = useState<User | null>(null);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [linkUser, setLinkUser] = useState<User | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const isLoading = usersLoading || ordersLoading || bookingsLoading;
    const error = usersError || ordersError || bookingsError;

    const filteredUsers = useMemo(() => {
        return users
            .filter(user => {
                if (roleFilter !== 'all' && user.role !== roleFilter) return false;
                if (searchTerm && !user.name.includes(searchTerm) && !user.email.includes(searchTerm)) return false;
                return true;
            })
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [users, searchTerm, roleFilter]);

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        // Correctly call the mutation function using `.mutateAsync`.
        await updateUserRole.mutateAsync({ userId, newRole });
    };
    
    const handleSaveUser = async (payload: any) => {
        setIsSaving(true);
        try {
            if (payload.id) {
                // Correctly call the mutation function using `.mutateAsync`.
                await updateUser.mutateAsync(payload);
            } else {
                // Correctly call the mutation function using `.mutateAsync`.
                await createUser.mutateAsync(payload);
            }
            setEditUser(null);
            setIsAddModalOpen(false);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <PageLoader text="جاري تحميل المستخدمين..." />;
    if (error) return <div className="text-center text-red-500">{error.message}</div>;

    return (
       <>
         <ViewUserModal 
            user={viewUser} 
            userOrders={userOrders.filter(o => o.user_id === viewUser?.id)}
            userBookings={userBookings.filter(b => b.user_id === viewUser?.id)}
            isOpen={!!viewUser} 
            onClose={() => setViewUser(null)} 
         />
         <EditUserModal
            isOpen={isAddModalOpen || !!editUser}
            onClose={() => { setIsAddModalOpen(false); setEditUser(null); }}
            onSave={handleSaveUser}
            user={editUser}
            isSaving={isSaving}
         />
         <LinkStudentModal
            isOpen={!!linkUser}
            onClose={() => setLinkUser(null)}
            user={linkUser}
         />

        <div className="animate-fadeIn space-y-12">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة المستخدمين</h1>
                <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-700">
                    <Plus size={18} /><span>إضافة مستخدم</span>
                </button>
            </div>

            <AdminSection title="قائمة المستخدمين" icon={<Users />}>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="ابحث بالاسم أو البريد..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-2 border rounded-full bg-gray-50"
                    />
                    <select
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value as UserRole | 'all')}
                        className="w-full sm:w-48 p-2 border rounded-full bg-gray-50"
                    >
                        <option value="all">كل الأدوار</option>
                        {staffRoles.map(role => <option key={role} value={role}>{roleNames[role]}</option>)}
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="border-b-2">
                                <th className="p-3">المستخدم</th>
                                <th className="p-3">تاريخ التسجيل</th>
                                <th className="p-3">الدور</th>
                                <th className="p-3">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3" onClick={() => setViewUser(user)} style={{cursor: 'pointer'}}>
                                        <p className="font-semibold">{user.name}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </td>
                                    <td className="p-3">{formatDate(user.created_at)}</td>
                                    <td className="p-3">
                                        <select
                                            value={user.role}
                                            onChange={e => handleRoleChange(user.id, e.target.value as UserRole)}
                                            className="p-2 border rounded-lg bg-white"
                                        >
                                            {staffRoles.map(role => <option key={role} value={role}>{roleNames[role]}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-3">
                                        <button onClick={() => setEditUser(user)} className="text-gray-500 hover:text-blue-600"><Edit size={20} /></button>
                                        {user.role === 'student' && (
                                            <button onClick={() => setLinkUser(user)} className="text-gray-500 hover:text-green-600 mr-2"><LinkIcon size={20} /></button>
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
