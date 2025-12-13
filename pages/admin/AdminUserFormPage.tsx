
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useUserMutations } from '../../hooks/mutations/useUserMutations';
import { useAdminUsers } from '../../hooks/queries/admin/useAdminUsersQuery';
import { roleNames } from '../../lib/roles';
import type { UserRole } from '../../lib/database.types';
import { Button } from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card';
import { ArrowLeft, Save, User, Lock, AlertCircle } from 'lucide-react';
import PageLoader from '../../components/ui/PageLoader';
import { useAuth } from '../../contexts/AuthContext';

const AdminUserFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = !id;
    const { currentUser } = useAuth();

    const { data: users = [], isLoading: usersLoading } = useAdminUsers();
    const { updateUser, createUser, updateUserPassword } = useUserMutations(); 

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user' as UserRole,
        phone: '',
        address: ''
    });

    useEffect(() => {
        if (!isNew && users.length > 0) {
            const userToEdit = users.find(u => u.id === id);
            if (userToEdit) {
                setFormData({
                    name: userToEdit.name,
                    email: userToEdit.email,
                    password: '', // Don't show hash
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
            // 1. Prepare Profile Data (EXCLUDE password to prevent Schema Error)
            const profilePayload = { 
                name: formData.name, 
                email: formData.email,
                role: formData.role,
                phone: formData.phone,
                address: formData.address
            };

            if (isNew) {
                // Create new profile
                await createUser.mutateAsync(profilePayload);
                
                // Note: We cannot set the password for a new user here directly via client-side SDK for another user.
                // It requires server-side admin API. The profile is created, but Auth user is not.
            } else {
                // Update existing profile (Ensure 'id' is passed)
                await updateUser.mutateAsync({ id: id!, ...profilePayload });
                
                // 2. Handle Password Update Separately (if provided)
                if (formData.password && formData.password.trim() !== '') {
                    // This attempts to update the password via Auth API
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

    if (usersLoading && !isNew) return <PageLoader text="جاري تحميل بيانات المستخدم..." />;

    // Filter roles
    const availableRoles = Object.entries(roleNames);

    return (
        <div className="animate-fadeIn space-y-8 max-w-4xl mx-auto">
            <Link to="/admin/users" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-semibold">
                <ArrowLeft size={16} /> العودة لقائمة المستخدمين
            </Link>

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-foreground">
                    {isNew ? 'إضافة مستخدم جديد' : `تعديل المستخدم: ${formData.name}`}
                </h1>
                <Button type="submit" form="user-form" loading={isSaving} icon={<Save />}>
                    {isNew ? 'إنشاء الحساب' : 'حفظ التغييرات'}
                </Button>
            </div>

            <form id="user-form" onSubmit={handleSubmit} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><User /> المعلومات الأساسية</CardTitle>
                        <CardDescription>البيانات الشخصية وصلاحيات الدخول.</CardDescription>
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

                        <FormField label="الدور والصلاحية" htmlFor="role">
                            <Select id="role" name="role" value={formData.role} onChange={handleChange} disabled={id === currentUser?.id}>
                                {availableRoles.map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </Select>
                            {id === currentUser?.id && <p className="text-xs text-muted-foreground mt-1">لا يمكنك تغيير دور حسابك الحالي.</p>}
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

                <Card border="border-yellow-200" className="bg-yellow-50/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><Lock size={18}/> الأمان وكلمة المرور</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormField label={isNew ? "كلمة المرور (لإنشاء الحساب)" : "تعيين كلمة مرور جديدة (اختياري)"} htmlFor="password">
                            <Input 
                                id="password" 
                                name="password" 
                                type="password" 
                                value={formData.password} 
                                onChange={handleChange} 
                                placeholder={isNew ? "اكتب كلمة المرور" : "اتركه فارغاً للإبقاء على الكلمة الحالية"}
                                required={false} 
                            />
                        </FormField>
                        {isNew && (
                            <div className="mt-2 flex items-start gap-2 text-xs text-yellow-700 bg-yellow-50 p-2 rounded-md">
                                <AlertCircle size={20} className="flex-shrink-0" />
                                <span>ملاحظة: إنشاء حساب من لوحة التحكم ينشئ "الملف الشخصي" فقط في قاعدة البيانات. لن يتمكن المستخدم من تسجيل الدخول بكلمة المرور هذه لأن نظام المصادقة منفصل (يتطلب Supabase Admin API). يجب على المستخدم التسجيل بنفس الإيميل لربط الحساب.</span>
                            </div>
                        )}
                        {!isNew && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                <AlertCircle size={14} />
                                <span>تغيير كلمة المرور من هنا سيقوم بتحديثها في نظام المصادقة (إذا كنت تملك صلاحيات المشرف).</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </form>
        </div>
    );
};

export default AdminUserFormPage;
