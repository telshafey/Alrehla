import React from 'react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { User, Feather, Shield } from 'lucide-react';

const DemoLogins: React.FC = () => {
    const { signIn, loading } = useAuth();

    const demoUsers = [
        { role: 'Guardian', email: 'guardian@alrehlah.com', icon: <User /> },
        { role: 'Instructor', email: 'instructor@alrehlah.com', icon: <Feather /> },
        { role: 'Admin', email: 'admin@alrehlah.com', icon: <Shield /> },
    ];

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-2">الدخول السريع (للتجربة)</h2>
            <p className="text-center text-sm text-gray-500 mb-6">
                استخدم هذه الحسابات التجريبية لاستكشاف المنصة. كلمة المرور لجميع الحسابات هي <span className="font-mono font-bold">123456</span>
            </p>
            <div className="space-y-4">
                {demoUsers.map(user => (
                    <button
                        key={user.role}
                        onClick={() => signIn(user.email, '123456')}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors disabled:bg-gray-300"
                    >
                        {user.icon}
                        <span>{`الدخول كـ ${user.role}`}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default DemoLogins;
