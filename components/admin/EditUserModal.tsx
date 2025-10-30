import React, { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import type { UserProfile as User } from '../../contexts/AuthContext.tsx';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import FormField from '../ui/FormField';
import Modal from '../ui/Modal';

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
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditMode ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
            footer={
                 <>
                    <Button type="button" onClick={onClose} disabled={isSaving} variant="ghost">إلغاء</Button>
                    <Button type="submit" form="edit-user-form" loading={isSaving}>
                        {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                    </Button>
                </>
            }
        >
            <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-6">
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
            </form>
        </Modal>
    );
};

export default EditUserModal;