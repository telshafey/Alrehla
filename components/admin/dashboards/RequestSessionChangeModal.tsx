import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Textarea } from '../../ui/Textarea';
import FormField from '../../ui/FormField';
import { useInstructorMutations } from '../../../hooks/mutations';
import type { ScheduledSession } from '../../../lib/database.types';
import { useAuth } from '../../../contexts/AuthContext';
import { useAdminInstructors } from '../../../hooks/adminQueries';


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

    if (!isOpen || !session) return null;

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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 m-4 animate-fadeIn" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">طلب تعديل/إلغاء جلسة</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <p>أنت تطلب تعديل الجلسة مع الطالب: <span className="font-bold">{childName}</span></p>
                    <FormField label="السبب" htmlFor="reason">
                        <Textarea id="reason" value={reason} onChange={e => setReason(e.target.value)} rows={4} required placeholder="يرجى توضيح سبب طلب التغيير أو الإلغاء..." />
                    </FormField>
                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={onClose}>إلغاء</Button>
                        <Button type="submit" loading={isSaving} icon={<Send />}>إرسال الطلب للإدارة</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequestSessionChangeModal;
