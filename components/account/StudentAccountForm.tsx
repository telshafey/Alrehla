
import React, { useState } from 'react';
import { Save, AlertCircle, ArrowLeft, UserPlus } from 'lucide-react';
import { useUserMutations } from '../../hooks/mutations/useUserMutations';
import type { ChildProfile } from '../../lib/database.types';
import { Button } from '../ui/Button';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';
import { Card, CardContent } from '../ui/card';

interface StudentAccountFormProps {
    childProfile: ChildProfile;
    onCancel: () => void;
    onSuccess: () => void;
}

const StudentAccountForm: React.FC<StudentAccountFormProps> = ({ childProfile, onCancel, onSuccess }) => {
    const { createAndLinkStudentAccount } = useUserMutations();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // ننتظر انتهاء العملية فعلياً قبل تنفيذ onSuccess
            await createAndLinkStudentAccount.mutateAsync({
                name: childProfile.name,
                email,
                password,
                childProfileId: childProfile.id
            });
            onSuccess();
        } catch (error) {
            // يتم عرض الخطأ عبر التوست من خلال الهوك
            console.error("Creation failed", error);
        }
    };

    return (
        <div className="animate-fadeIn">
            <div className="flex items-center gap-4 mb-6 pb-4 border-b">
                <Button variant="ghost" size="icon" onClick={onCancel}>
                    <ArrowLeft size={20} className="text-gray-500" />
                </Button>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">
                        إنشاء حساب طالب لـ: <span className="text-primary">{childProfile.name}</span>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        هذا الحساب سيمكن طفلك من الدخول إلى منصة "بداية الرحلة" وحضور الجلسات.
                    </p>
                </div>
            </div>

            <div className="max-w-xl mx-auto">
                <Card className="bg-yellow-50 border-yellow-200 mb-8">
                    <CardContent className="pt-6 flex items-start gap-3 text-yellow-800">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-bold mb-1">تنبيه هام</p>
                            <p>سيتم ربط هذا الحساب بملف الطفل الحالي تلقائياً. يرجى حفظ بيانات الدخول (البريد وكلمة المرور) وإعطائها لطفلك.</p>
                        </div>
                    </CardContent>
                </Card>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <FormField label="البريد الإلكتروني للطالب*" htmlFor="email">
                        <Input 
                            type="email" 
                            id="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            placeholder="student@example.com"
                            className="bg-white"
                        />
                    </FormField>
                    
                    <FormField label="كلمة المرور*" htmlFor="password">
                        <Input 
                            type="password" 
                            id="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            minLength={6}
                            placeholder="******"
                            className="bg-white"
                        />
                         <p className="text-xs text-muted-foreground mt-1">يجب أن تكون 6 أحرف على الأقل.</p>
                    </FormField>

                    <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                        <Button type="button" onClick={onCancel} disabled={createAndLinkStudentAccount.isPending} variant="ghost">
                            إلغاء
                        </Button>
                        <Button type="submit" loading={createAndLinkStudentAccount.isPending} icon={<UserPlus size={18} />} className="w-48">
                            {createAndLinkStudentAccount.isPending ? 'جاري الإنشاء...' : 'إنشاء وربط الحساب'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentAccountForm;
