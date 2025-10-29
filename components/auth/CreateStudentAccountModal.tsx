import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, AlertCircle } from 'lucide-react';
import { useUserMutations } from '../../hooks/mutations/useUserMutations';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import type { ChildProfile } from '../../lib/database.types';
import { Button } from '../ui/Button';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';

interface CreateStudentAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    childProfile: ChildProfile | null;
}

const CreateStudentAccountModal: React.FC<CreateStudentAccountModalProps> = ({ isOpen, onClose, childProfile }) => {
    const { createAndLinkStudentAccount } = useUserMutations();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    useModalAccessibility({ modalRef, isOpen, onClose });

    useEffect(() => {
        if (!isOpen) {
            setEmail('');
            setPassword('');
        }
    }, [isOpen]);

    if (!isOpen || !childProfile) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createAndLinkStudentAccount.mutateAsync({
                name: childProfile.name,
                email,
                password,
                childProfileId: childProfile.id
            });
            onClose();
        } catch (error) {
            // Error is handled in the mutation hook
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="create-student-modal-title">
            <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 m-4 animate-fadeIn" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 id="create-student-modal-title" className="text-2xl font-bold text-gray-800">إنشاء حساب للطالب: {childProfile.name}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <FormField label="البريد الإلكتروني للطالب*" htmlFor="email">
                        <Input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </FormField>
                    <FormField label="كلمة المرور*" htmlFor="password">
                        <Input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </FormField>
                    
                    <div className="mt-2 flex items-start gap-2 text-xs text-yellow-700 bg-yellow-50 p-2 rounded-md">
                        <AlertCircle size={20} className="flex-shrink-0" />
                        <span>سيتمكن الطالب من استخدام هذا الحساب للدخول إلى لوحة التحكم الخاصة به ومتابعة الجلسات.</span>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 mt-8 border-t">
                        <Button type="button" onClick={onClose} disabled={createAndLinkStudentAccount.isPending} variant="ghost">إلغاء</Button>
                        <Button type="submit" loading={createAndLinkStudentAccount.isPending} icon={<Save />}>
                           {createAndLinkStudentAccount.isPending ? 'جاري الإنشاء...' : 'إنشاء وربط الحساب'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateStudentAccountModal;