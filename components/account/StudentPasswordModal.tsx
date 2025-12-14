
import React, { useState, useEffect } from 'react';
import { Save, Lock } from 'lucide-react';
import { useUserMutations } from '../../hooks/mutations/useUserMutations';
import type { EnrichedChildProfile } from '../../hooks/queries/user/useUserDataQuery';
import { Button } from '../ui/Button';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';
import Modal from '../ui/Modal';

interface StudentPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    child: EnrichedChildProfile | null;
}

const StudentPasswordModal: React.FC<StudentPasswordModalProps> = ({ isOpen, onClose, child }) => {
    const { resetStudentPassword } = useUserMutations();
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
            alert('كلمتا المرور غير متطابقتين');
            return;
        }
        if (!child.student_user_id) return;

        await resetStudentPassword.mutateAsync({
            studentUserId: child.student_user_id,
            newPassword
        });
        onClose();
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
                <FormField label="كلمة المرور الجديدة" htmlFor="newPassword">
                    <Input 
                        type="password" 
                        id="newPassword" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        required 
                        minLength={6}
                        placeholder="******"
                    />
                </FormField>
                <FormField label="تأكيد كلمة المرور" htmlFor="confirmPassword">
                    <Input 
                        type="password" 
                        id="confirmPassword" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        required 
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
