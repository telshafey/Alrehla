import React from 'react';
import type { UserProfile } from '../../contexts/AuthContext.tsx';
import { User, Key, LogOut } from 'lucide-react';

interface ProfilePanelProps {
    currentUser: UserProfile;
    onSignOut: () => void;
}

const Section: React.FC<{title: string, icon: React.ReactNode, children: React.ReactNode}> = ({title, icon, children}) => (
    <div>
        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            {icon} {title}
        </h3>
        <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
            {children}
        </div>
    </div>
);

const ProfilePanel: React.FC<ProfilePanelProps> = ({ currentUser, onSignOut }) => {
    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg space-y-8">
            <h2 className="text-2xl font-bold">الملف الشخصي والإعدادات</h2>
            
            <Section title="معلومات الحساب" icon={<User size={18} />}>
                <p><span className="font-semibold text-gray-600">الاسم:</span> {currentUser.name}</p>
                <p><span className="font-semibold text-gray-600">البريد الإلكتروني:</span> {currentUser.email}</p>
                <button className="text-sm text-blue-600 font-semibold hover:underline mt-2">تعديل المعلومات (قريباً)</button>
            </Section>
            
            <Section title="الأمان" icon={<Key size={18} />}>
                 <div>
                    <p className="font-semibold">تغيير كلمة المرور</p>
                    <p className="text-sm text-gray-500">لأمان حسابك، نوصي بتغيير كلمة المرور بشكل دوري.</p>
                    <button className="text-sm text-blue-600 font-semibold hover:underline mt-2">تغيير كلمة المرور (قريباً)</button>
                </div>
                <div className="pt-3 border-t">
                     <button onClick={onSignOut} className="w-full text-left flex items-center gap-2 text-red-600 font-semibold hover:text-red-800 p-2 -m-2 rounded-lg hover:bg-red-50 transition-colors">
                        <LogOut size={16}/> تسجيل الخروج
                    </button>
                </div>
            </Section>
        </div>
    );
};

export default ProfilePanel;
