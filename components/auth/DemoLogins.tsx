import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, Feather, Shield, ShoppingBag, Edit3, MessageSquare, BookOpen, GraduationCap, Briefcase } from 'lucide-react';
import { Button } from '../ui/Button';

const DemoButton: React.FC<{ email: string, label: string, icon: React.ReactNode, onSignIn: (email: string) => void, loading: boolean }> = ({ email, label, icon, onSignIn, loading }) => (
     <Button
        onClick={() => onSignIn(email)}
        loading={loading}
        variant="subtle"
        className="w-full justify-start"
        icon={icon}
    >
        {label}
    </Button>
);


const DemoLogins: React.FC = () => {
    const { signIn, loading } = useAuth();

    const handleSignIn = (email: string) => {
        signIn(email, '123456');
    };

    const userLogins = [
        { label: 'ولي أمر (Parent)', email: 'parent@alrehlah.com', icon: <User size={20} className="text-blue-500"/> },
        { label: 'مستخدم عادي (User)', email: 'user@alrehlah.com', icon: <User size={20} className="text-gray-500"/> },
    ];
    
    const staffLogins = [
        { label: 'مدير عام', email: 'admin@alrehlah.com', icon: <Shield size={20} className="text-red-500"/> },
        { label: 'مشرف عام', email: 'supervisor@alrehlah.com', icon: <Briefcase size={20} className="text-orange-500"/> },
        { label: 'مشرف "إنها لك"', email: 'enhalak@alrehlah.com', icon: <ShoppingBag size={20} className="text-pink-500"/> },
        { label: 'مشرف "بداية الرحلة"', email: 'cws@alrehlah.com', icon: <BookOpen size={20} className="text-purple-500"/> },
        { label: 'مدرب', email: 'instructor@alrehlah.com', icon: <Feather size={20} className="text-green-500"/> },
        { label: 'محرر محتوى', email: 'editor@alrehlah.com', icon: <Edit3 size={20} className="text-yellow-500"/> },
        { label: 'وكيل دعم', email: 'support@alrehlah.com', icon: <MessageSquare size={20} className="text-cyan-500"/> },
    ];

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-2">الدخول السريع (للتجربة)</h2>
            <p className="text-center text-sm text-gray-500 mb-6">
                استخدم هذه الحسابات التجريبية لاستكشاف المنصة. كلمة المرور لجميع الحسابات هي <span className="font-mono font-bold">123456</span>
            </p>

            <div className="space-y-6">
                <div>
                    <h3 className="font-bold text-gray-600 mb-3 text-center border-b pb-2">حسابات المستخدمين</h3>
                    <div className="space-y-3 pt-3">
                         {userLogins.map(user => <DemoButton key={user.email} {...user} onSignIn={handleSignIn} loading={loading} />)}
                         <Button asChild variant="subtle" className="w-full justify-start" icon={<GraduationCap size={20} className="text-indigo-500"/>}>
                            <Link to="/student/login">
                                طالب (Student)
                            </Link>
                         </Button>
                    </div>
                </div>
                 <div>
                    <h3 className="font-bold text-gray-600 mb-3 text-center border-b pb-2">حسابات فريق العمل</h3>
                    <div className="space-y-3 pt-3">
                        {staffLogins.map(user => <DemoButton key={user.email} {...user} onSignIn={handleSignIn} loading={loading} />)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemoLogins;