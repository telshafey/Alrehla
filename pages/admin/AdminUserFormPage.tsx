
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { useUserMutations } from '../../hooks/mutations/useUserMutations';
import { useAdminUsers, useAdminAllChildProfiles, transformUsersWithRelations } from '../../hooks/queries/admin/useAdminUsersQuery';
import { roleNames, STAFF_ROLES, CUSTOMER_ROLES } from '../../lib/roles';
import type { UserRole } from '../../lib/database.types';
import { Button } from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card';
import { ArrowLeft, Save, User, Lock, Shield, Briefcase, GraduationCap, Link as LinkIcon, Users, AlertTriangle, Trash2 } from 'lucide-react';
import PageLoader from '../../components/ui/PageLoader';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../../components/ui/Modal';

const AdminUserFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const isNew = !id;
    const { currentUser: loggedInAdmin } = useAuth();

    const type = searchParams.get('type') || 'customer';
    const isStaffFlow = type === 'staff';

    const { data: users = [], isLoading: usersLoading } = useAdminUsers();
    const { data: children = [] } = useAdminAllChildProfiles();
    const { updateUser, createUser, updateUserPassword, bulkDeleteUsers } = useUserMutations(); 

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: (isStaffFlow ? 'instructor' : 'user') as UserRole,
        phone: '',
        address: ''
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const enrichedUser = useMemo(() => {
        if (isNew) return null;
        const allEnriched = transformUsersWithRelations(users, children);
        return allEnriched.find(u => u.id === id);
    }, [users, children, id, isNew]);

    useEffect(() => {
        if (!isNew && users.length > 0) {
            const userToEdit = users.find(u => u.id === id);
            if (userToEdit) {
                setFormData({
                    name: userToEdit.name,
                    email: userToEdit.email,
                    password: '', 
                    role: userToEdit.role,
                    phone: userToEdit.phone || '',
                    address: userToEdit.address || ''
                });
            }
        }
    }, [id, isNew, users]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isNew) {
                await createUser.mutateAsync(formData);
            } else {
                await updateUser.mutateAsync({ id: id!, ...formData });
                if (formData.password) {
                    await updateUserPassword.mutateAsync({ userId: id!, newPassword: formData.password });
                }
            }
            navigate('/admin/users');
        } catch (error) {
            // Error handling via mutation feedback
        }
    };

    const handleConfirmDelete = async () => {
        if (!id) return;
        try {
            await bulkDeleteUsers.mutateAsync({ userIds: [id] });
            navigate('/admin/users');
        } catch (error) {
            // Error handled in hook
        } finally {
            setIsDeleteModalOpen(false);
        }
    };

    const isSaving = createUser.isPending || updateUser.isPending || bulkDeleteUsers.isPending;

    if (usersLoading && !isNew) return <PageLoader />;

    const deleteWarningMessage = enrichedUser?.role === 'student' 
        ? `أنت على وشك حذف حساب الطالب "${formData.name}". سيؤدي هذا إلى فك ارتباطه بملف الطفل فوراً ولن يتمكن من الدخول إلى المنصة مرة أخرى.`
        : `أنت على وشك حذف حساب المستخدم "${formData.name}". سيتم حذف كافة البيانات المرتبطة به نهائياً ولا يمكن التراجع عن هذا الإجراء.`;

    return (
        <div className="animate-fadeIn space-y-8 max-w-4xl mx-auto">
            {/* نافذة تأكيد الحذف */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="تأكيد حذف الحساب"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)} disabled={bulkDeleteUsers.isPending}>
                            إلغاء
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleConfirmDelete} 
                            loading={bulkDeleteUsers.isPending}
                            icon={<Trash2 size={16} />}
                        >
                            تأكيد وحذف
                        </Button>
                    </>
                }
            >
                <div className="flex flex-col items-center text-center space-y-4 py-4">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                        <AlertTriangle size={32} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">هل أنت متأكد تماماً؟</h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                            {deleteWarningMessage}
                        </p>
                    </div>
                </div>
            </Modal>

            <div className="flex justify-between items-center">
                <Link to="/admin/users" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-semibold">
                    <ArrowLeft size={16} /> العودة لقائمة المستخدمين
                </Link>
                
                {!isNew && id !== loggedInAdmin?.id && (
                    <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => setIsDeleteModalOpen(true)} 
                        loading={bulkDeleteUsers.isPending}
                        icon={<Trash2 size={16} />}
                    >
                        حذف الحساب نهائياً
                    </Button>
                )}
            </div>

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-3">
                    {enrichedUser?.role === 'student' ? <GraduationCap className="text-blue-500"/> : isStaffFlow ? <Shield className="text-primary"/> : <Briefcase className="text-pink-500"/>}
                    {isNew ? (isStaffFlow ? 'إضافة موظف جديد' : 'إضافة عميل جديد') : `تعديل حساب: ${formData.name}`}
                </h1>
                <Button type="submit" form="user-form" loading={isSaving} icon={<Save size={18} />}>حفظ التغييرات</Button>
            </div>

            <form id="user-form" onSubmit={handleSubmit} className="space-y-8">
                {enrichedUser?.parentName && (
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="pt-6 flex gap-4 items-center">
                            <div className="bg-blue-100 p-2 rounded-full text-blue-600"><LinkIcon size={24} /></div>
                            <div className="flex-grow">
                                <p className="font-bold text-blue-900">هذا الحساب تابع لولي الأمر: {enrichedUser.parentName}</p>
                                <p className="text-sm text-blue-700">البريد الإلكتروني للأب/الأم: {enrichedUser.parentEmail}</p>
                            </div>
                            <div className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-bold">حساب مرتبـط</div>
                        </CardContent>
                    </Card>
                )}

                {enrichedUser?.role === 'student' && !enrichedUser?.parentName && (
                    <Card className="bg-red-50 border-red-200 border-2">
                        <CardContent className="pt-6 flex gap-4 items-center">
                            <div className="bg-red-100 p-2 rounded-full text-red-600"><AlertTriangle size={24} /></div>
                            <div>
                                <p className="font-bold text-red-900">حساب طالب غير مرتبط (يتيم)</p>
                                <p className="text-sm text-red-700">هذا الحساب لا يتبع لأي ولي أمر حالياً. يمكنك حذفه إذا كان مكرراً أو ناتجاً عن خطأ في النظام.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="border-t-4 border-t-primary">
                    <CardHeader>
                        <CardTitle className="text-lg">المعلومات الأساسية</CardTitle>
                        <CardDescription>البريد الإلكتروني يجب أن يكون فريداً وغير مستخدم في أي حساب آخر.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="الاسم الكامل" htmlFor="name">
                                <Input id="name" name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            </FormField>
                            <FormField label="البريد الإلكتروني" htmlFor="email">
                                <Input id="email" name="email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required disabled={!isNew} />
                            </FormField>
                        </div>
                        <FormField label="الدور / الرتبة" htmlFor="role">
                            <Select 
                                id="role" 
                                name="role" 
                                value={formData.role} 
                                onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                                disabled={enrichedUser?.role === 'student' || (enrichedUser && (enrichedUser.totalChildrenCount ?? 0) > 0)}
                            >
                                {(isStaffFlow ? STAFF_ROLES : CUSTOMER_ROLES).map(role => (
                                    <option key={role} value={role}>{roleNames[role]}</option>
                                ))}
                            </Select>
                            {enrichedUser && (enrichedUser.totalChildrenCount ?? 0) > 0 && <p className="text-xs text-orange-600 mt-1 italic">لا يمكن تغيير رتبة ولي الأمر لوجود أطفال مرتبطين.</p>}
                        </FormField>
                        
                        {!isNew && (
                            <div className="pt-4 border-t">
                                <h4 className="font-bold text-sm text-gray-700 mb-2">تحديث الأمان</h4>
                                <FormField label="كلمة مرور جديدة (اختياري)" htmlFor="password">
                                    <Input id="password" name="password" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="اتركه فارغاً لعدم التغيير" />
                                </FormField>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </form>
        </div>
    );
};

export default AdminUserFormPage;
