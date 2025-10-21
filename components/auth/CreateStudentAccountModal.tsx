import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, AlertCircle } from 'lucide-react';
import { useAppMutations } from '../../hooks/mutations.ts';
import { useModalAccessibility } from '../../hooks/useModalAccessibility.ts';

interface CreateStudentAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    childProfileId: number | null; // The child profile to link this new account to
}

const CreateStudentAccountModal: React.FC<CreateStudentAccountModalProps> = ({ isOpen, onClose, childProfileId }) => {
    const { createUser } = useAppMutations(); // Assuming createUser can handle student role
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    useModalAccessibility({ modalRef, isOpen, onClose });

    useEffect(() => {
        if (!isOpen) {
            setName('');
            setEmail('');
            setPassword('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!childProfileId) return;

        setIsSaving(true);
        try {
            // This is a simplified version. A real implementation would:
            // 1. Create the user with role 'student'
            // 2. Link the new user's ID to the childProfileId
            await createUser.mutateAsync({ name, email, password, role: 'student' });
            onClose();
        } catch (error) {
            // Error is handled in the mutation hook
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 m-4 animate-fadeIn" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">إنشاء حساب للطالب</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">اسم الطالب*</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني*</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور*</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                    </div>
                    <div className="mt-2 flex items-start gap-2 text-xs text-yellow-700 bg-yellow-50 p-2 rounded-md">
                        <AlertCircle size={20} className="flex-shrink-0" />
                        <span>سيتمكن الطالب من استخدام هذا الحساب للدخول إلى لوحة التحكم الخاصة به ومتابعة الجلسات.</span>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 mt-8 border-t">
                        <button type="button" onClick={onClose} disabled={isSaving} className="px-6 py-2 rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200">إلغاء</button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400">
                           {isSaving ? <Loader2 className="animate-spin"/> : <Save />}
                           <span>{isSaving ? 'جاري الإنشاء...' : 'إنشاء وربط الحساب'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateStudentAccountModal;
