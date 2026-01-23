
import React, { useState, useEffect } from 'react';
import { Save, Lock, AlertTriangle } from 'lucide-react';
import { useUserMutations } from '../../hooks/mutations/useUserMutations';
import type { EnrichedChildProfile } from '../../hooks/queries/user/useUserDataQuery';
import { Button } from '../ui/Button';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';
import Modal from '../ui/Modal';
import { useToast } from '../../contexts/ToastContext';

interface StudentPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    child: EnrichedChildProfile | null;
}

const StudentPasswordModal: React.FC<StudentPasswordModalProps> = ({ isOpen, onClose, child }) => {
    const { resetStudentPassword } = useUserMutations();
    const { addToast } = useToast();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (isOpen) {
            setNewPassword('');
            setConfirmPassword('');
        }
    }, [isOpen]);

    if (!child) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            addToast('كلمتا المرور غير متطابقتين', 'error');
            return;
        }

        if (!child.student_user_id) {
            addToast('لا يوجد حساب طالب مرتبط بهذا الملف لتغيير كلمة مروره.', 'error');
            return;
        }

        try {
            await resetStudentPassword.mutateAsync({
                studentUserId: child.student_user_id,
                newPassword
            });
            onClose();
        } catch (error) {
            // Error is handled by mutation, but we keep modal open
            console.error("Password reset error:", error);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`تغيير كلمة مرور الطالب: ${child.name}`}
            footer={
                <>
                    <Button type="button" onClick={onClose} disabled={resetStudentPassword.isPending} variant="ghost">إلغاء</Button>
                    <Button type="submit" form="reset-student-password-form" loading={resetStudentPassword.isPending} icon={<Save />}>
                        حفظ التغيير
                    </Button>
                </>
            }
        >
            <form id="reset-student-password-form" onSubmit={handleSubmit} className="space-y-6">
                {!child.student_user_id && (
                     <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2 text-sm border border-red-200">
                        <AlertTriangle size={16} />
                        <span>خطأ: هذا الملف غير مرتبط بحساب طالب فعلي. يرجى إنشاء حساب أولاً.</span>
                    </div>
                )}
                
                <FormField label="كلمة المرور الجديدة" htmlFor="newPassword">
                    <Input 
                        type="password" 
                        id="newPassword" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        required 
                        minLength={6}
                        placeholder="******"
                        disabled={!child.student_user_id}
                    />
                </FormField>
                <FormField label="تأكيد كلمة المرور" htmlFor="confirmPassword">
                    <Input 
                        type="password" 
                        id="confirmPassword" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        required 
                        disabled={!child.student_user_id}
                    />
                </FormField>
                <div className="flex items-center gap-2 text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
                    <Lock size={14}/>
                    <span>سيتمكن الطالب من الدخول بكلمة المرور الجديدة فوراً.</span>
                </div>
            </form>
        </Modal>
    );
};

export default StudentPasswordModal;
