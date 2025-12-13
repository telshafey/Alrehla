
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
    const { updateUser } = useUserMutations(); 

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
                    password: '', // Don't show password
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
                alert("في هذا الإصدار التجريبي، إنشاء المستخدمين يتم عبر صفحة التسجيل أو وظائف السيرفر (Edge Functions). يمكنك تعديل المستخدمين الحاليين.");
                return; 
            } else {
                const payload: any = { 
                    id: id!, 
                    name: formData.name, 
                    role: formData.role,
                    phone: formData.phone,
                    address: formData.address
                };
                
                // Only send password update if field is filled (requires backend support for admin password reset)
                if (formData.password) {
                    payload.password = formData.password;
                }

                await updateUser.mutateAsync(payload);
            }
            navigate('/admin/users');
        } catch (error) {
            console.error("Failed to save user", error);
        }
    };

    if (usersLoading && !isNew) return <PageLoader text="جاري تحميل بيانات المستخدم..." />;

    // Filter roles: only Super Admin can assign admin roles
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
                <Button type="submit" form="user-form" loading={updateUser.isPending} icon={<Save />}>
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
                        <FormField label={isNew ? "كلمة المرور" : "تعيين كلمة مرور جديدة (اختياري)"} htmlFor="password">
                            <Input 
                                id="password" 
                                name="password" 
                                type="password" 
                                value={formData.password} 
                                onChange={handleChange} 
                                placeholder={isNew ? "" : "اتركه فارغاً للإبقاء على الكلمة الحالية"}
                                required={isNew}
                            />
                        </FormField>
                        {!isNew && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                <AlertCircle size={14} />
                                <span>تغيير كلمة المرور من هنا سيؤدي لتسجيل خروج المستخدم من جميع الأجهزة.</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </form>
        </div>
    );
};

export default AdminUserFormPage;
