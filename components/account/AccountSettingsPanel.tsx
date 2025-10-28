import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserMutations } from '../../hooks/mutations';
import { User, Key, LogOut, Edit } from 'lucide-react';
import { Button } from '../ui/Button';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';

const Section: React.FC<{title: string, icon: React.ReactNode, children: React.ReactNode}> = ({title, icon, children}) => (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            {icon} {title}
        </h2>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

const AccountSettingsPanel: React.FC = () => {
    const { currentUser, signOut } = useAuth();
    const { updateUser, updateUserPassword } = useUserMutations();
    const [isEditingName, setIsEditingName] = useState(false);
    const [name, setName] = useState(currentUser!.name);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleNameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateUser.mutateAsync({ id: currentUser!.id, name });
        setIsEditingName(false);
    };
    
    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("كلمتا المرور الجديدتان غير متطابقتين.");
            return;
        }
        await updateUserPassword.mutateAsync({ userId: currentUser!.id, currentPassword, newPassword });
        setIsEditingPassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };


    return (
        <div className="space-y-8 animate-fadeIn">
            <Section title="الملف الشخصي" icon={<User />}>
                {!isEditingName ? (
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                        <div>
                            <p className="font-semibold text-gray-600 text-sm">الاسم:</p>
                            <p>{currentUser!.name}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setIsEditingName(true)} icon={<Edit size={14}/>}>تعديل</Button>
                    </div>
                ) : (
                    <form onSubmit={handleNameSubmit} className="p-4 bg-gray-50 rounded-lg border space-y-4">
                        <FormField label="الاسم" htmlFor="name">
                            <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                        </FormField>
                        <div className="flex gap-2">
                            <Button type="submit" size="sm" loading={updateUser.isPending}>حفظ</Button>
                            <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditingName(false)}>إلغاء</Button>
                        </div>
                    </form>
                )}
                <div className="p-4 bg-gray-50 rounded-lg border">
                     <p className="font-semibold text-gray-600 text-sm">البريد الإلكتروني:</p>
                     <p>{currentUser!.email}</p>
                </div>
            </Section>
            
            <Section title="الأمان" icon={<Key />}>
                 {!isEditingPassword ? (
                     <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                        <p className="text-sm text-gray-500">لأمان حسابك، نوصي بتغيير كلمة المرور بشكل دوري.</p>
                        <Button variant="outline" size="sm" onClick={() => setIsEditingPassword(true)}>تغيير كلمة المرور</Button>
                    </div>
                 ) : (
                     <form onSubmit={handlePasswordSubmit} className="p-4 bg-gray-50 rounded-lg border space-y-4">
                         <FormField label="كلمة المرور الحالية" htmlFor="currentPassword">
                             <Input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                         </FormField>
                         <FormField label="كلمة المرور الجديدة" htmlFor="newPassword">
                             <Input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                         </FormField>
                          <FormField label="تأكيد كلمة المرور الجديدة" htmlFor="confirmPassword">
                             <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                         </FormField>
                         <div className="flex gap-2">
                            <Button type="submit" size="sm" loading={updateUserPassword.isPending}>حفظ التغييرات</Button>
                            <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditingPassword(false)}>إلغاء</Button>
                        </div>
                     </form>
                 )}
                <div className="pt-4 mt-6 border-t">
                     <Button onClick={signOut} variant="ghost" className="w-full justify-start text-red-600 hover:text-red-800 hover:bg-red-50" icon={<LogOut size={16}/>}>
                        تسجيل الخروج
                     </Button>
                </div>
            </Section>
        </div>
    );
};

export default AccountSettingsPanel;
