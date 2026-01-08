
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
import { ArrowLeft, Save, User, Lock, Shield, Briefcase, GraduationCap, Link as LinkIcon, Users } from 'lucide-react';
import PageLoader from '../../components/ui/PageLoader';
import { useAuth } from '../../contexts/AuthContext';

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
    const { updateUser, createUser, updateUserPassword } = useUserMutations(); 

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: (isStaffFlow ? 'instructor' : 'user') as UserRole,
        phone: '',
        address: ''
    });

    // جلب بيانات المستخدم المفصلة مع علاقاته
    const enrichedUser = useMemo(() => {
        if (isNew) return null;
        const allEnriched = transformUsersWithRelations(users, children);
        return allEnriched.find(u => u.id === id);
    }, [users, children, id, isNew]);

    const parentName = enrichedUser?.parentName;
    const childrenCount = enrichedUser?.totalChildrenCount || 0;
    const hasChildren = childrenCount > 0;

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
            } else if (!usersLoading) {
                navigate('/admin/users');
            }
        }
    }, [id, isNew, users, usersLoading, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isNew) {
                await createUser.mutateAsync({ 
                    name: formData.name, 
                    email: formData.email,
                    role: formData.role,
                    phone: formData.phone,
                    address: formData.address,
                    password: formData.password
                });
            } else {
                const profilePayload = { 
                    name: formData.name, 
                    email: formData.email,
                    role: formData.role,
                    phone: formData.phone,
                    address: formData.address
                };
                
                await updateUser.mutateAsync({ id: id!, ...profilePayload });
                
                if (formData.password && formData.password.trim() !== '') {
                    await updateUserPassword.mutateAsync({
                        userId: id!,
                        newPassword: formData.password
                    });
                }
            }
            navigate('/admin/users');
        } catch (error) {
            console.error("Failed to save user", error);
        }
    };

    const isSaving = isNew ? createUser.isPending : (updateUser.isPending || updateUserPassword.isPending);

    const filteredRoles = useMemo(() => {
        const allowedRoles = isStaffFlow ? STAFF_ROLES : CUSTOMER_ROLES;
        return Object.entries(roleNames).filter(([key]) => allowedRoles.includes(key as UserRole));
    }, [isStaffFlow]);

    const isStudentAccount = formData.role === 'student';
    const isLockedParent = !isStaffFlow && hasChildren;

    if (usersLoading && !isNew) return <PageLoader text="جاري تحميل بيانات المستخدم..." />;

    return (
        <div className="animate-fadeIn space-y-8 max-w-4xl mx-auto">
            <Link to="/admin/users" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-semibold">
                <ArrowLeft size={16} /> العودة لقائمة المستخدمين
            </Link>

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-3">
                    {isStudentAccount ? <GraduationCap className="text-blue-500"/> : isStaffFlow ? <Shield className="text-primary"/> : <Briefcase className="text-pink-500"/>}
                    {isNew ? (isStaffFlow ? 'إضافة موظف جديد' : 'إضافة عميل جديد') : `تعديل الحساب: ${formData.name}`}
                </h1>
                <Button type="submit" form="user-form" loading={isSaving} icon={<Save />}>
                    {isNew ? 'إنشاء الحساب' : 'حفظ التغييرات'}
                </Button>
            </div>

            <form id="user-form" onSubmit={handleSubmit} className="space-y-8">
                {/* تنبيه حساب الطالب */}
                {isStudentAccount && (
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="pt-6 flex gap-4 items-center">
                            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                <LinkIcon size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-blue-900">حساب طالب تابع (محمي)</p>
                                <p className="text-sm text-blue-700">
                                    هذا الحساب مرتبط بولي الأمر <span className="font-black">"{parentName || 'غير محدد'}"</span>. لا يمكن تغيير دور هذا الحساب لضمان استمرارية العملية التعليمية.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* تنبيه حساب ولي الأمر */}
                {isLockedParent && (
                    <Card className="bg-orange-50 border-orange-200">
                        <CardContent className="pt-6 flex gap-4 items-center">
                            <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-orange-900">حساب ولي أمر نشط (محمي)</p>
                                <p className="text-sm text-orange-700">
                                    هذا الحساب لديه <span className="font-black">{childrenCount} أطفال/طلاب</span> مرتبطين به. لا يمكن تحويله إلى حساب مستخدم عادي أو طالب إلا بعد حذف أو نقل تبعية الملفات العائلية المرتبطة به.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className={isStudentAccount ? "border-t-4 border-t-blue-500" : isStaffFlow ? "border-t-4 border-t-primary" : "border-t-4 border-t-pink-500"}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><User /> المعلومات الأساسية</CardTitle>
                        <CardDescription>
                            {isStudentAccount 
                                ? 'إدارة بيانات الطالب المرتبط بملف عائلي.' 
                                : isStaffFlow 
                                ? 'إدارة حسابات الإدارة والمدربين.' 
                                : 'إدارة حسابات أولياء الأمور والعملاء.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="الاسم الكامل" htmlFor="name">
                                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                            </FormField>
                            <FormField label="البريد الإلكتروني" htmlFor="email">
                                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required disabled={!isNew} />
                            </FormField>
                        </div>

                        <FormField label={isStaffFlow ? "الدور الوظيفي" : "نوع حساب العميل"} htmlFor="role">
                            <Select 
                                id="role" 
                                name="role" 
                                value={formData.role} 
                                onChange={handleChange} 
                                disabled={id === loggedInAdmin?.id || isStudentAccount || isLockedParent}
                            >
                                {filteredRoles.map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </Select>
                            {id === loggedInAdmin?.id && <p className="text-xs text-red-600 mt-1">لا يمكنك تغيير دور حسابك الحالي.</p>}
                            {isStudentAccount && <p className="text-xs text-blue-600 mt-1 italic">أدوار الطلاب ثابتة ولا يمكن تعديلها.</p>}
                            {isLockedParent && <p className="text-xs text-orange-600 mt-1 italic">لا يمكن تغيير الدور لوجود أطفال مرتبطين بهذا الحساب.</p>}
                        </FormField>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <FormField label="رقم الهاتف" htmlFor="phone">
                                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                            </FormField>
                             <FormField label="العنوان" htmlFor="address">
                                <Input id="address" name="address" value={formData.address} onChange={handleChange} />
                            </FormField>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><Lock size={18}/> الأمان</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormField label={isNew ? "كلمة المرور" : "تغيير كلمة المرور (اختياري)"} htmlFor="password">
                            <Input 
                                id="password" 
                                name="password" 
                                type="password" 
                                value={formData.password} 
                                onChange={handleChange} 
                                placeholder={isNew ? "6 أحرف على الأقل" : "اتركه فارغاً للإبقاء على الحالية"}
                                required={isNew} 
                                minLength={6}
                            />
                        </FormField>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
};

export default AdminUserFormPage;
