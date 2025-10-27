import React, { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { useInstructorMutations } from '../../hooks/mutations';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import { Button } from '../ui/Button';
import FormField from '../ui/FormField';
import { Textarea } from '../ui/Textarea';

interface RequestSupportSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    instructorId: number;
    childId: number | null;
}

const RequestSupportSessionModal: React.FC<RequestSupportSessionModalProps> = ({ isOpen, onClose, instructorId, childId }) => {
    const { requestSupportSession } = useInstructorMutations();
    const [reason, setReason] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useModalAccessibility({ modalRef, isOpen, onClose, initialFocusRef: closeButtonRef });

    useEffect(() => {
        if (isOpen) {
            setReason('');
        }
    }, [isOpen]);

    if (!isOpen || !childId) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await requestSupportSession.mutateAsync({
            instructorId,
            childId,
            reason,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="support-session-title">
            <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 m-4 animate-fadeIn" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 id="support-session-title" className="text-2xl font-bold text-gray-800">طلب جلسة دعم إضافية (15 دقيقة)</h2>
                    <Button ref={closeButtonRef} onClick={onClose} variant="ghost" size="icon"><X size={24} /></Button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <FormField label="سبب الطلب" htmlFor="reason">
                        <Textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={5}
                            placeholder="يرجى توضيح سبب حاجتك لجلسة دعم إضافية مع الطالب..."
                            required
                        />
                    </FormField>

                    <div className="flex justify-end gap-4 pt-4 mt-8 border-t">
                        <Button type="button" onClick={onClose} disabled={requestSupportSession.isPending} variant="ghost">
                            إلغاء
                        </Button>
                        <Button type="submit" loading={requestSupportSession.isPending} icon={<Send />}>
                            إرسال الطلب
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequestSupportSessionModal;