
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../lib/database.types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import FormField from '../ui/FormField';
import { AlertCircle, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { authService } from '../../services/authService';

interface AuthFormProps {
    mode: 'login' | 'signup';
    redirectTo?: string; 
    allowedRoles?: UserRole[]; // Strict role enforcement
    disableSignup?: boolean; // Hide signup option
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode: initialMode, redirectTo, allowedRoles, disableSignup = false }) => {
    const { signIn, signUp, loading: authLoading, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Internal mode state to handle 'forgot_password' view
    const [view, setView] = useState<'login' | 'signup' | 'forgot_password'>(initialMode);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    
    const [localError, setLocalError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [redirecting, setRedirecting] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    
    const role: UserRole = 'user'; // Public signups default to 'user'

    const from = location.state?.from?.pathname || redirectTo;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        
        const userResult = await signIn(email, password);

        if (userResult) {
            // --- Strict Role Enforcement ---
            if (allowedRoles && allowedRoles.length > 0) {
                if (!allowedRoles.includes(userResult.role)) {
                    await signOut(); // Kick them out immediately
                    setLocalError("غير مسموح لهذا النوع من الحسابات بالدخول من هذه البوابة.");
                    return;
                }
            }

            // If allowed, proceed with redirection
            if (redirectTo) {
                navigate(redirectTo, { replace: true });
            } else if (from && !from.includes('/login')) {
                navigate(from, { replace: true });
            } else {
                // Default Smart Redirect
                if (userResult.role === 'student') {
                    navigate('/student/dashboard', { replace: true });
                } else if (['super_admin', 'instructor', 'general_supervisor'].includes(userResult.role)) {
                    navigate('/admin', { replace: true });
                } else {
                    navigate('/account', { replace: true });
                }
            }
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        const userResult = await signUp(email, password, name, role);
        
        if (userResult) {
            if (redirectTo) {
                navigate(redirectTo, { replace: true });
            } else {
                navigate('/account', { replace: true });
            }
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        setSuccessMessage(null);
        setIsResetting(true);

        try {
            await authService.resetPasswordForEmail(email);
            setSuccessMessage("تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.");
        } catch (err: any) {
            setLocalError(err.message || "فشل إرسال الرابط. تأكد من صحة البريد الإلكتروني.");
        } finally {
            setIsResetting(false);
        }
    };

    // --- Render: Forgot Password View ---
    if (view === 'forgot_password') {
        return (
            <div className="w-full bg-white p-8 rounded-2xl shadow-lg border">
                 <button onClick={() => setView('login')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4">
                    <ArrowRight size={16} />
                    <span>عودة لتسجيل الدخول</span>
                </button>
                <h2 className="text-2xl font-bold text-center mb-2">استعادة كلمة المرور</h2>
                <p className="text-center text-muted-foreground text-sm mb-6">أدخل بريدك الإلكتروني وسنرسل لك رابطاً لتعيين كلمة مرور جديدة.</p>

                {successMessage ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
                        <p className="text-green-800 font-medium">{successMessage}</p>
                        <p className="text-green-600 text-sm mt-2">يرجى التحقق من صندوق الوارد (أو الرسائل غير المرغوب فيها).</p>
                    </div>
                ) : (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <FormField label="البريد الإلكتروني" htmlFor="reset-email">
                            <Input id="reset-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@example.com" />
                        </FormField>

                        {localError && (
                            <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded text-sm flex items-center gap-2">
                                <AlertCircle size={16} /> {localError}
                            </div>
                        )}

                        <Button type="submit" loading={isResetting} className="w-full">
                            إرسال الرابط
                        </Button>
                    </form>
                )}
            </div>
        );
    }

    // --- Render: Login / Signup View ---
    const isLogin = view === 'login';

    return (
        <div className="w-full bg-white p-8 rounded-2xl shadow-lg border">
            <h2 className="text-2xl font-bold text-center mb-6">{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h2>
            
            <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
                {!isLogin && (
                    <FormField label="الاسم" htmlFor="name">
                        <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required />
                    </FormField>
                )}
                <FormField label="البريد الإلكتروني" htmlFor="email">
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </FormField>
                <div className="space-y-1">
                    <FormField label="كلمة المرور" htmlFor="password">
                        <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </FormField>
                    {isLogin && (
                        <div className="text-left">
                            <button 
                                type="button" 
                                onClick={() => setView('forgot_password')} 
                                className="text-xs text-primary hover:underline"
                            >
                                نسيت كلمة المرور؟
                            </button>
                        </div>
                    )}
                </div>
                
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
            
            {!redirecting && !disableSignup && (
                <p className="text-center mt-6 text-sm text-muted-foreground">
                    {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
                    <button 
                        type="button"
                        onClick={() => setView(isLogin ? 'signup' : 'login')} 
                        className="text-primary hover:underline font-semibold ms-2"
                    >
                        {isLogin ? 'أنشئ حسابًا' : 'سجل الدخول'}
                    </button>
                </p>
            )}
        </div>
    );
};
