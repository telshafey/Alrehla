import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import type { UserRole } from '../../lib/database.types.ts';

export const AuthForm: React.FC = () => {
    const { signIn, signUp, loading, error } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<UserRole>('guardian');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLogin) {
            signIn(email, password);
        } else {
            signUp(email, password, name, role);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-2">{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h2>
            <p className="text-center text-xs text-gray-500 mb-6">هذا النموذج للحسابات الحقيقية. لتجربة المنصة، استخدم أزرار الدخول السريع.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                     <>
                        <div className="p-4 bg-gray-50 rounded-lg border">
                            <p className="font-bold text-sm text-gray-700 mb-3">اختر نوع الحساب:</p>
                             <div className="flex gap-4">
                                <label className="flex-1 p-3 border rounded-lg flex items-center gap-3 cursor-pointer has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500">
                                    <input type="radio" name="role" value="guardian" checked={role === 'guardian'} onChange={() => setRole('guardian')} className="w-4 h-4 text-blue-600 focus:ring-blue-500"/>
                                    <div>
                                        <span className="font-semibold">ولي أمر</span>
                                        <p className="text-xs text-gray-500">لإدارة ملفات أطفالي</p>
                                    </div>
                                </label>
                                <label className="flex-1 p-3 border rounded-lg flex items-center gap-3 cursor-pointer has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500">
                                    <input type="radio" name="role" value="user" checked={role === 'user'} onChange={() => setRole('user')} className="w-4 h-4 text-blue-600 focus:ring-blue-500"/>
                                    <div>
                                        <span className="font-semibold">حساب فردي</span>
                                         <p className="text-xs text-gray-500">(فوق 13 سنة)</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">الاسم</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" required />
                        </div>
                    </>
                )}
                <div>
                    <label className="block text-sm font-bold mb-2">البريد الإلكتروني</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" required />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-2">كلمة المرور</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded" required />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
                    {loading ? 'جاري...' : (isLogin ? 'دخول' : 'إنشاء حساب')}
                </button>
            </form>
            <p className="text-center mt-4 text-sm">
                {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
                <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:underline font-semibold ms-2">
                    {isLogin ? 'أنشئ حسابًا' : 'سجل الدخول'}
                </button>
            </p>
        </div>
    );
};

export default AuthForm;