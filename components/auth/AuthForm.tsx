
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../lib/database.types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import FormField from '../ui/FormField';
import { STAFF_ROLES } from '../../lib/roles';
import { AlertCircle, Loader2 } from 'lucide-react';

interface AuthFormProps {
    mode: 'login' | 'signup';
    redirectTo?: string; // Explicit redirect path override
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode, redirectTo }) => {
    const { signIn, signUp, loading: authLoading, signOut } = useAuth(); // Add signOut
    const navigate = useNavigate();
    const location = useLocation();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);
    const [redirecting, setRedirecting] = useState(false);
    
    const role: UserRole = 'user'; // All public signups default to 'user'

    const isLogin = mode === 'login';
    const from = location.state?.from?.pathname || redirectTo;
    
    // هل يحاول المستخدم الدخول من بوابة الإدارة؟
    // Check if the current URL or the redirect target implies Admin Portal
    const isOnAdminPage = location.pathname.includes('/admin');
    const isTargetingAdmin = redirectTo === '/admin' || (from && from.includes('/admin'));
    const isAdminPortal = isOnAdminPage || isTargetingAdmin;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        
        let userResult = null;
        
        // استدعاء دالة الدخول
        userResult = isLogin 
            ? await signIn(email, password) 
            : await signUp(email, password, name, role);

        if (userResult) {
            const userRole = userResult.role;
            const isStaff = STAFF_ROLES.includes(userRole);

            // --- منطق الحماية وإعادة التوجيه الصارم ---

            // حالة 1: مستخدم عادي يحاول الدخول من بوابة الإدارة
            if (isAdminPortal && !isStaff) {
                setRedirecting(true);
                setLocalError("هذا الحساب ليس لديه صلاحيات إدارية. جاري توجيهك لصفحة المستخدمين...");
                // تأخير بسيط ليقرأ المستخدم الرسالة
                setTimeout(async () => {
                    navigate('/account', { replace: true });
                    setRedirecting(false);
                }, 2000);
                return;
            }

            // حالة 2: موظف/أدمن يحاول الدخول من بوابة المستخدمين العادية
            if (!isAdminPortal && isStaff && userRole !== 'student') { 
                // Student role is handled separately, technically they are 'users' in context of portal but handled via logic
                // If it's a staff member on the main site login
                setRedirecting(true);
                setLocalError("حساب إداري. جاري توجيهك لبوابة الإدارة...");
                
                setTimeout(async () => {
                    navigate('/admin', { replace: true });
                    setRedirecting(false);
                }, 2000);
                return;
            }

            // --- التوجيه الطبيعي في حالة تطابق البوابة مع الرتبة ---
            
            if (redirectTo) {
                navigate(redirectTo, { replace: true });
                return;
            }

            if (from && !from.includes('/login')) {
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
        } else {
             // If userResult is null, it means there was an error caught in Context but we want to ensure error is shown
             // Usually Context sets its own error state, but signIn returns null on failure.
             // Ensure generic fallback if context didn't catch specific message.
             if (!localError) setLocalError("فشلت عملية الدخول.");
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
                    <div className={`p-3 rounded border flex items-start gap-2 text-sm font-semibold ${redirecting ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                        {redirecting ? <Loader2 className="animate-spin h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                        <span>{localError}</span>
                    </div>
                )}
                
                <Button type="submit" loading={authLoading || redirecting} className="w-full">
                    {isLogin ? 'دخول' : 'إنشاء حساب'}
                </Button>
            </form>
            
            {!redirecting && (
                <p className="text-center mt-6 text-sm text-muted-foreground">
                    {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
                    <Link to={isLogin ? '/register' : '/account'} className="text-primary hover:underline font-semibold ms-2">
                        {isLogin ? 'أنشئ حسابًا' : 'سجل الدخول'}
                    </Link>
                </p>
            )}
        </div>
    );
};
