import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../lib/database.types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import FormField from '../ui/FormField';


interface AuthFormProps {
    mode: 'login' | 'signup';
    initialRole?: UserRole;
    disableRoleSelection?: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode, initialRole = 'parent', disableRoleSelection = false }) => {
    const { signIn, signUp, loading, error } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<UserRole>(initialRole);

    const isLogin = mode === 'login';
    const from = location.state?.from?.pathname || '/account';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let success = false;
        if (isLogin) {
            success = await signIn(email, password);
        } else {
            success = await signUp(email, password, name, role);
        }

        if (success) {
            navigate(from, { replace: true });
        }
    };

    return (
        <div className="w-full bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-6">{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h2>
            
            {isLogin && <p className="text-center text-xs text-gray-500 -mt-4 mb-6">لتجربة المنصة، استخدم أزرار الدخول السريع.</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                     <>
                        <div className={`p-4 bg-gray-50 rounded-lg border ${disableRoleSelection ? 'opacity-70' : ''}`}>
                            <p className="font-bold text-sm text-gray-700 mb-3">اختر نوع الحساب:</p>
                             <div className="flex gap-4">
                                <label className="flex-1 p-3 border rounded-lg flex items-center gap-3 cursor-pointer has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500">
                                    <input type="radio" name="role" value="parent" checked={role === 'parent'} onChange={() => setRole('parent')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" disabled={disableRoleSelection} />
                                    <div>
                                        <span className="font-semibold">ولي أمر</span>
                                        <p className="text-xs text-gray-500">لإدارة ملفات أطفالي</p>
                                    </div>
                                </label>
                                <label className="flex-1 p-3 border rounded-lg flex items-center gap-3 cursor-pointer has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500">
                                    <input type="radio" name="role" value="user" checked={role === 'user'} onChange={() => setRole('user')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" disabled={disableRoleSelection} />
                                    <div>
                                        <span className="font-semibold">حساب فردي</span>
                                         <p className="text-xs text-gray-500">(فوق 12 سنة)</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                        <FormField label="الاسم" htmlFor="name">
                            <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required />
                        </FormField>
                    </>
                )}
                <FormField label="البريد الإلكتروني" htmlFor="email">
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </FormField>
                <FormField label="كلمة المرور" htmlFor="password">
                     <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </FormField>
                
                {error && <p className="text-red-500 text-sm">{error}</p>}
                
                <Button type="submit" loading={loading} className="w-full">
                    {isLogin ? 'دخول' : 'إنشاء حساب'}
                </Button>
            </form>
            <p className="text-center mt-4 text-sm">
                {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
                <Link to={isLogin ? '/register' : '/account'} className="text-blue-600 hover:underline font-semibold ms-2">
                    {isLogin ? 'أنشئ حسابًا' : 'سجل الدخول'}
                </Link>
            </p>
        </div>
    );
};
