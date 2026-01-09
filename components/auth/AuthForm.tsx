
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
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
    const { signIn, signUp, loading, error } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const role: UserRole = 'user'; // All signups are now standard 'user' role

    const isLogin = mode === 'login';
    // If user came from a specific protected page, use that. Otherwise default logic applies.
    const from = location.state?.from?.pathname;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let userResult = null;
        
        if (isLogin) {
            userResult = await signIn(email, password);
        } else {
            userResult = await signUp(email, password, name, role);
        }

        if (userResult) {
            // Priority 1: If user was redirected from a specific page (e.g. checkout), send them back there
            if (from) {
                navigate(from, { replace: true });
                return;
            }

            // Priority 2: Smart routing based on Role
            if (userResult.role === 'student') {
                navigate('/student/dashboard', { replace: true });
            } 
            else if (STAFF_ROLES.includes(userResult.role)) {
                navigate('/admin', { replace: true });
            } 
            else {
                // Parents and regular users go to account
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
                
                {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}
                
                <Button type="submit" loading={loading} className="w-full">
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
