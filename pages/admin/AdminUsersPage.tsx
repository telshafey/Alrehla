import React, { useState, useMemo } from 'react';
import { Users, Plus, Edit, Trash2, Link as LinkIcon, Eye, ArrowUp, ArrowDown, UserPlus, Star } from 'lucide-react';
import { useAdminUsers, useAdminAllChildProfiles, transformUsersWithRelations } from '../../hooks/queries/admin/useAdminUsersQuery';
import { useAdminSubscriptions } from '../../hooks/queries/admin/useAdminEnhaLakQuery';
import { useUserMutations } from '../../hooks/mutations/useUserMutations';
import PageLoader from '../../components/ui/PageLoader';
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
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { formatDate } from '../../utils/helpers';
import FormField from '../../components/ui/FormField';
import StatCard from '../../components/admin/StatCard';

type SortableKeys = keyof UserProfileWithRelations;

const AdminUsersPage: React.FC = () => {
    const { data: users = [], isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useAdminUsers();
    const { data: children = [], isLoading: childrenLoading, error: childrenError, refetch: refetchChildren } = useAdminAllChildProfiles();
    const { data: subscriptions = [], isLoading: subsLoading, error: subsError, refetch: refetchSubs } = useAdminSubscriptions();
    const { createUser, updateUser, deleteUser } = useUserMutations();

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    
    const [selectedUser, setSelectedUser] = useState<UserProfileWithRelations | null>(null);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [userToLink, setUserToLink] = useState<User | null>(null);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
    const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'asc' | 'desc' } | null>({ key: 'created_at', direction: 'desc' });

    const isLoading = usersLoading || childrenLoading || subsLoading;
    const isSaving = createUser.isPending || updateUser.isPending;

    const usersWithRelations = useMemo(
        () => transformUsersWithRelations(users, children),
        [users, children]
    );
    
    const userStats = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const newUsersThisMonth = users.filter(user => new Date(user.created_at) >= startOfMonth).length;
        
        const activeSubscriberIds = new Set(
            subscriptions.filter(sub => sub.status === 'active').map(sub => sub.user_id)
        );
        
        return {
            totalUsers: users.length,
            newUsersThisMonth,
            activeSubscribers: activeSubscriberIds.size
        };
    }, [users, subscriptions]);

    const sortedAndFilteredUsers = useMemo(() => {
        let filtered = usersWithRelations.filter(user => {
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
            const matchesSearch = searchTerm === '' ||
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            
            const registrationDate = new Date(user.created_at);
            const fromDate = dateFilter.from ? new Date(dateFilter.from) : null;
            const toDate = dateFilter.to ? new Date(dateFilter.to) : null;
            
            if (fromDate && registrationDate < fromDate) return false;
            // Add one day to toDate to include the whole day
            if (toDate) {
                const toDateEnd = new Date(toDate);
                toDateEnd.setDate(toDateEnd.getDate() + 1);
                if (registrationDate > toDateEnd) return false;
            }

            return matchesRole && matchesSearch;
        });

        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];

                if (aVal === null || aVal === undefined) return 1;
                if (bVal === null || bVal === undefined) return -1;

                if (aVal < bVal) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aVal > bVal) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return filtered;
    }, [usersWithRelations, roleFilter, searchTerm, dateFilter, sortConfig]);

    const handleSort = (key: SortableKeys) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

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

    const error = usersError || childrenError || subsError;
    const refetch = () => {
        if (usersError) refetchUsers();
        if (childrenError) refetchChildren();
        if (subsError) refetchSubs();
    };

    const SortableTh: React.FC<{ sortKey: SortableKeys; label: string }> = ({ sortKey, label }) => (
        <TableHead>
            <Button variant="ghost" onClick={() => handleSort(sortKey)} className="px-0 h-auto py-0">
                <div className="flex items-center">
                   <span>{label}</span>
                    {sortConfig?.key === sortKey && (
                        sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4 mr-2" /> : <ArrowDown className="h-4 w-4 mr-2" />
                    )}
                </div>
            </Button>
        </TableHead>
    );

    if (isLoading) return <PageLoader text="جاري تحميل المستخدمين..." />;
    if (error) return <ErrorState message={(error as Error).message} onRetry={refetch} />;

    return (
        <>
            <ViewUserModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} user={selectedUser} />
            <EditUserModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveUser} user={userToEdit} isSaving={isSaving} />
            <LinkStudentModal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} user={userToLink} />

            <div className="animate-fadeIn space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-extrabold text-foreground">إدارة المستخدمين</h1>
                    <Button onClick={() => handleEditUser(null)} icon={<Plus size={18} />}>
                        إضافة مستخدم
                    </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="إجمالي المستخدمين" value={userStats.totalUsers} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
                    <StatCard title="مستخدمون جدد (هذا الشهر)" value={userStats.newUsersThisMonth} icon={<UserPlus className="h-4 w-4 text-muted-foreground" />} />
                    <StatCard title="مشتركون نشطون" value={userStats.activeSubscribers} icon={<Star className="h-4 w-4 text-muted-foreground" />} />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users /> قائمة المستخدمين</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 items-end">
                            <FormField label="بحث" htmlFor="search">
                                <Input 
                                    id="search"
                                    type="search"
                                    placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </FormField>
                            <FormField label="الدور" htmlFor="role">
                                <Select id="role" value={roleFilter} onChange={e => setRoleFilter(e.target.value as any)}>
                                    <option value="all">كل الأدوار</option>
                                    {Object.entries(roleNames).map(([key, name]) => (
                                        <option key={key} value={key}>{name}</option>
                                    ))}
                                </Select>
                            </FormField>
                             <FormField label="تاريخ التسجيل (من)" htmlFor="date-from">
                                <Input id="date-from" type="date" value={dateFilter.from} onChange={e => setDateFilter(prev => ({...prev, from: e.target.value}))}/>
                            </FormField>
                             <FormField label="تاريخ التسجيل (إلى)" htmlFor="date-to">
                                <Input id="date-to" type="date" value={dateFilter.to} onChange={e => setDateFilter(prev => ({...prev, to: e.target.value}))}/>
                            </FormField>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <SortableTh sortKey="name" label="الاسم" />
                                        <SortableTh sortKey="email" label="البريد الإلكتروني" />
                                        <SortableTh sortKey="role" label="الدور" />
                                        <SortableTh sortKey="created_at" label="تاريخ التسجيل" />
                                        <SortableTh sortKey="last_sign_in_at" label="آخر دخول" />
                                        <TableHead>إجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedAndFilteredUsers.map(user => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-semibold">{user.name}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                                            <TableCell><span className="px-2 py-1 text-xs font-semibold rounded-full bg-muted text-muted-foreground">{roleNames[user.role]}</span></TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{formatDate(user.created_at)}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{formatDate(user.last_sign_in_at)}</TableCell>
                                            <TableCell className="flex items-center gap-1 flex-wrap">
                                                <Button variant="ghost" size="icon" onClick={() => handleViewUser(user)} title="عرض التفاصيل"><Eye size={20} /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)} title="تعديل"><Edit size={20} /></Button>
                                                {user.role === 'student' && <Button variant="ghost" size="icon" onClick={() => handleLinkStudent(user)} title="ربط بطفل"><LinkIcon size={20} /></Button>}
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteUser(user.id)} title="حذف"><Trash2 size={20} /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {sortedAndFilteredUsers.length === 0 && <p className="text-center py-8 text-muted-foreground">لا توجد نتائج تطابق الفلاتر المحددة.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default AdminUsersPage;