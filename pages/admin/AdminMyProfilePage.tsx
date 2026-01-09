
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserMutations } from '../../hooks/mutations/useUserMutations';
import { useToast } from '../../contexts/ToastContext';
import { User, Key, Globe } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { supportedCountries } from '../../data/mockData';

const AdminMyProfilePage: React.FC = () => {
    const { currentUser, updateCurrentUser } = useAuth();
    const { updateUser, updateUserPassword } = useUserMutations();
    const { addToast } = useToast();
    
    const [name, setName] = useState(currentUser?.name || '');
    const [email, setEmail] = useState(currentUser?.email || '');
    const [phone, setPhone] = useState(currentUser?.phone || '');
    const [country, setCountry] = useState(currentUser?.country ? supportedCountries.find(c => c.name === currentUser?.country)?.code || 'EG' : 'EG');
    const [city, setCity] = useState(currentUser?.city || '');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleBasicInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        const selectedCountryData = supportedCountries.find(c => c.code === country);

        const payload = {
            id: currentUser.id,
            name,
            phone,
            city,
            country: selectedCountryData?.name,
            timezone: selectedCountryData?.timezone,
            currency: selectedCountryData?.currency
        };

        try {
            await updateUser.mutateAsync(payload);
            updateCurrentUser(payload);
        } catch (error) {
            console.error("Profile update failed", error);
            // Toast is handled by hook
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        
        if (newPassword !== confirmPassword) {
            addToast("كلمتا المرور الجديدتان غير متطابقتين.", "warning");
            return;
        }
        
        try {
            await updateUserPassword.mutateAsync({ userId: currentUser.id, newPassword });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            // Toast handled by hook
        }
    };

    return (
        <div className="animate-fadeIn space-y-8 max-w-4xl mx-auto pb-20">
            <div>
                <h1 className="text-3xl font-extrabold text-foreground">إعدادات الحساب الشخصي</h1>
                <p className="text-muted-foreground mt-1">تعديل بياناتك الشخصية ومعلومات الدخول.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Basic Info */}
                <div className="lg:col-span-2 space-y-8">
                    <form onSubmit={handleBasicInfoSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><User /> المعلومات الأساسية</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField label="الاسم الكامل" htmlFor="name">
                                    <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                                </FormField>
                                <FormField label="البريد الإلكتروني" htmlFor="email">
                                    <Input id="email" value={email} disabled className="bg-muted text-muted-foreground cursor-not-allowed" />
                                    <p className="text-xs text-muted-foreground mt-1">لا يمكن تغيير البريد الإلكتروني.</p>
                                </FormField>
                                <FormField label="رقم الهاتف" htmlFor="phone">
                                    <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} dir="ltr" placeholder="+20..." />
                                </FormField>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                                    <div className="col-span-full">
                                        <p className="text-sm font-semibold mb-4 flex items-center gap-2 text-gray-700">
                                            <Globe size={16} /> المنطقة الجغرافية (اختياري)
                                        </p>
                                    </div>
                                    <FormField label="الدولة" htmlFor="country">
                                        <Select id="country" value={country} onChange={e => setCountry(e.target.value)}>
                                            {supportedCountries.map(c => (
                                                <option key={c.code} value={c.code}>{c.name}</option>
                                            ))}
                                        </Select>
                                    </FormField>
                                    <FormField label="المدينة" htmlFor="city">
                                        <Input id="city" value={city} onChange={e => setCity(e.target.value)} />
                                    </FormField>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <Button type="submit" loading={updateUser.isPending}>حفظ البيانات</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>

                {/* Password Change */}
                <div className="lg:col-span-1">
                    <form onSubmit={handlePasswordSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Key /> تغيير كلمة المرور</CardTitle>
                                <CardDescription>يستحسن تغيير كلمة المرور دورياً للأمان.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField label="كلمة المرور الجديدة" htmlFor="newPassword">
                                    <Input 
                                        type="password" 
                                        id="newPassword" 
                                        value={newPassword} 
                                        onChange={e => setNewPassword(e.target.value)} 
                                        required 
                                    />
                                </FormField>
                                <FormField label="تأكيد كلمة المرور" htmlFor="confirmPassword">
                                    <Input 
                                        type="password" 
                                        id="confirmPassword" 
                                        value={confirmPassword} 
                                        onChange={e => setConfirmPassword(e.target.value)} 
                                        required 
                                    />
                                </FormField>
                                <Button type="submit" variant="outline" className="w-full" loading={updateUserPassword.isPending}>
                                    تحديث كلمة المرور
                                </Button>
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminMyProfilePage;
