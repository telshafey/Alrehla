import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Textarea } from '../../ui/Textarea';
import FormField from '../../ui/FormField';
import { useInstructorMutations } from '../../../hooks/mutations/useInstructorMutations';
import type { ScheduledSession } from '../../../lib/database.types';
import { useAuth } from '../../../contexts/AuthContext';
import { useAdminInstructors } from '../../../hooks/queries/admin/useAdminInstructorsQuery';
import Modal from '../../ui/Modal';


interface RequestSessionChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: ScheduledSession | null;
    childName?: string | null;
}

const RequestSessionChangeModal: React.FC<RequestSessionChangeModalProps> = ({ isOpen, onClose, session, childName }) => {
    const { createSupportSessionRequest } = useInstructorMutations();
    const { currentUser } = useAuth();
    const { data: instructors = [] } = useAdminInstructors();
    const [reason, setReason] = useState('');
    const isSaving = createSupportSessionRequest.isPending;

    if (!session) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const instructor = instructors.find(i => i.user_id === currentUser?.id);
        if (!instructor) return;
        
        await createSupportSessionRequest.mutateAsync({
            instructorId: instructor.id,
            childId: session.child_id,
            reason: `طلب تغيير/إلغاء جلسة يوم ${session.session_date}: ${reason}`
        });
        onClose();
        setReason('');
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="طلب تعديل/إلغاء جلسة"
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={onClose}>إلغاء</Button>
                    <Button form="request-change-form" type="submit" loading={isSaving} icon={<Send />}>إرسال الطلب للإدارة</Button>
                </>
            }
        >
            <form id="request-change-form" onSubmit={handleSubmit} className="space-y-6">
                <p>أنت تطلب تعديل الجلسة مع الطالب: <span className="font-bold">{childName}</span></p>
                <FormField label="السبب" htmlFor="reason">
                    <Textarea id="reason" value={reason} onChange={e => setReason(e.target.value)} rows={4} required placeholder="يرجى توضيح سبب طلب التغيير أو الإلغاء..." />
                </FormField>
            </form>
        </Modal>
    );
};

export default RequestSessionChangeModal;