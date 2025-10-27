
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, AlertCircle } from 'lucide-react';
import type { UserProfile as User } from '../../contexts/AuthContext.tsx';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import FormField from '../ui/FormField';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: any) => void;
    user: User | null;
    isSaving: boolean;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, onSave, user, isSaving }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    const isEditMode = !!user;

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        } else {
            setName('');
            setEmail('');
            setPassword('');
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = isEditMode
            ? { id: user.id, name }
            : { name, email, password };
        onSave(payload);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 m-4 animate-fadeIn" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </Button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <FormField label="الاسم*" htmlFor="name">
                        <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    </FormField>
                     <FormField label="البريد الإلكتروني*" htmlFor="email">
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isEditMode} />
                    </FormField>
                     {!isEditMode && (
                        <FormField label="كلمة المرور*" htmlFor="password">
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                             <div className="mt-2 flex items-start gap-2 text-xs text-yellow-700 bg-yellow-50 p-2 rounded-md">
                                <AlertCircle size={20} className="flex-shrink-0" />
                                <span>سيتم إرسال بريد إلكتروني للمستخدم الجديد لتأكيد حسابه.</span>
                            </div>
                        </FormField>
                    )}
                    <div className="flex justify-end gap-4 pt-4 mt-8 border-t">
                        <Button type="button" onClick={onClose} disabled={isSaving} variant="ghost">إلغاء</Button>
                        <Button type="submit" loading={isSaving} icon={<Save />}>
                           {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;
