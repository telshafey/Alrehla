import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserMutations } from '../../hooks/mutations/useUserMutations';
import { User, Key, LogOut, Edit, Home } from 'lucide-react';
import { Button } from '../ui/Button';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { EGYPTIAN_GOVERNORATES } from '../../utils/governorates';


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
    const { currentUser, signOut, updateCurrentUser } = useAuth();
    const { updateUser, updateUserPassword } = useUserMutations();
    const [isEditingName, setIsEditingName] = useState(false);
    const [name, setName] = useState(currentUser!.name);
    
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [address, setAddress] = useState(currentUser!.address || '');
    const [governorate, setGovernorate] = useState(currentUser!.governorate || 'القاهرة');
    const [phone, setPhone] = useState(currentUser!.phone || '');

    const handleNameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { id: currentUser!.id, name };
        await updateUser.mutateAsync(payload);
        updateCurrentUser({ name }); // Manually update context state
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
    
    const handleAddressSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { 
            id: currentUser!.id,
            address,
            governorate,
            phone
        };
        await updateUser.mutateAsync(payload);
        updateCurrentUser(payload);
        setIsEditingAddress(false);
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

            <Section title="عنوان التوصيل الافتراضي" icon={<Home />}>
                {!isEditingAddress ? (
                    <div>
                        <div className="p-4 bg-gray-50 rounded-lg border space-y-2">
                            <p><span className="font-semibold text-gray-600 text-sm">العنوان:</span> {currentUser?.address || 'لم يحدد'}</p>
                            <p><span className="font-semibold text-gray-600 text-sm">المحافظة:</span> {currentUser?.governorate || 'لم يحدد'}</p>
                            <p><span className="font-semibold text-gray-600 text-sm">رقم الهاتف:</span> {currentUser?.phone || 'لم يحدد'}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setIsEditingAddress(true)} icon={<Edit size={14}/>} className="mt-2">تعديل العنوان</Button>
                    </div>
                ) : (
                    <form onSubmit={handleAddressSubmit} className="p-4 bg-gray-50 rounded-lg border space-y-4">
                        <FormField label="العنوان التفصيلي" htmlFor="address">
                            <Textarea id="address" value={address} onChange={e => setAddress(e.target.value)} />
                        </FormField>
                        <FormField label="المحافظة" htmlFor="governorate">
                            <Select id="governorate" value={governorate} onChange={e => setGovernorate(e.target.value)}>
                                {EGYPTIAN_GOVERNORATES.map(gov => <option key={gov} value={gov}>{gov}</option>)}
                            </Select>
                        </FormField>
                        <FormField label="رقم الهاتف" htmlFor="phone">
                            <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
                        </FormField>
                        <div className="flex gap-2">
                            <Button type="submit" size="sm" loading={updateUser.isPending}>حفظ</Button>
                            <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditingAddress(false)}>إلغاء</Button>
                        </div>
                    </form>
                )}
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