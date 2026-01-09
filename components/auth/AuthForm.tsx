
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../lib/database.types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import FormField from '../ui/FormField';
import { STAFF_ROLES } from '../../lib/roles';

interface AuthFormProps {
    mode: 'login' | 'signup';
    redirectTo?: string; // Explicit redirect path override
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode, redirectTo }) => {
    const { signIn, signUp, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);
    
    const role: UserRole = 'user'; // All public signups default to 'user'

    const isLogin = mode === 'login';
    const from = location.state?.from?.pathname || redirectTo;
    
    // هل يحاول المستخدم الدخول من بوابة الإدارة؟
    const isAdminPortal = redirectTo === '/admin' || location.pathname.includes('admin');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        
        let userResult = null;
        
        // استدعاء دالة الدخول (التي ستجلب الرتبة الحقيقية من القاعدة الآن)
        userResult = isLogin 
            ? await signIn(email, password) 
            : await signUp(email, password, name, role);

        if (userResult) {
            // التحقق الصارم من الرتبة القادمة من قاعدة البيانات
            const userRole = userResult.role;
            const isStaff = STAFF_ROLES.includes(userRole);

            // 1. سيناريو محاولة دخول مستخدم عادي لبوابة الإدارة
            if (isAdminPortal && !isStaff) {
                setLocalError("عذراً، هذا الحساب لا يملك صلاحيات إدارية. يرجى الدخول من الصفحة الرئيسية.");
                return; // نوقف التوجيه
            }

            // 2. التوجيه بناءً على الرتبة والمصدر
            if (redirectTo) {
                navigate(redirectTo, { replace: true });
                return;
            }

            if (from) {
                navigate(from, { replace: true });
                return;
            }

            // التوجيه الذكي الافتراضي
            if (userRole === 'student') {
                navigate('/student/dashboard', { replace: true });
            } 
            else if (isStaff) {
                navigate('/admin', { replace: true });
            } 
            else {
                navigate('/account', { replace: true });
            }
        }
    };

    return (
        <div className="w-full bg-white p-8 rounded-2xl shadow-lg border">
            <h2 className="text-2xl font-bold text-center mb-6">{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                    <FormField label="الاسم" htmlFor="name">
                        <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required />
                    </FormField>
                )}
                <FormField label="البريد الإلكتروني" htmlFor="email">
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </FormField>
                <FormField label="كلمة المرور" htmlFor="password">
                     <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </FormField>
                
                {localError && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-100 font-semibold">
                        {localError}
                    </div>
                )}
                
                <Button type="submit" loading={authLoading} className="w-full">
                    {isLogin ? 'دخول' : 'إنشاء حساب'}
                </Button>
            </form>
            <p className="text-center mt-6 text-sm text-muted-foreground">
                {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
                <Link to={isLogin ? '/register' : '/account'} className="text-primary hover:underline font-semibold ms-2">
                    {isLogin ? 'أنشئ حسابًا' : 'سجل الدخول'}
                </Link>
            </p>
        </div>
    );
};
