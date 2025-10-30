import React, { useState, useEffect } from 'react';
import { Save, Calendar } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useSchedulingMutations } from '../../hooks/mutations/useSchedulingMutations';
import type { Instructor } from '../../lib/database.types';
import { Button } from '../ui/Button';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';
import Modal from '../ui/Modal';

interface IntroductorySessionSchedulerModalProps {
    isOpen: boolean;
    onClose: () => void;
    instructor: Instructor | null;
}

const IntroductorySessionSchedulerModal: React.FC<IntroductorySessionSchedulerModalProps> = ({ isOpen, onClose, instructor }) => {
    const { addToast } = useToast();
    const { scheduleIntroductorySession } = useSchedulingMutations();

    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    
    const isSaving = scheduleIntroductorySession.isPending;

    useEffect(() => {
        if (isOpen) {
            setDate(new Date().toISOString().split('T')[0]);
            setTime('17:00');
        }
    }, [isOpen]);

    if (!instructor) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !time) {
            addToast('يرجى تحديد التاريخ والوقت.', 'warning');
            return;
        }
        try {
            await scheduleIntroductorySession.mutateAsync({
                instructorId: instructor.id,
                date,
                time,
            });
            onClose();
        } catch (error) {
            // Error handled by hook
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`جدولة جلسة تعريفية للمدرب: ${instructor.name}`}
            footer={
                <>
                    <Button type="button" onClick={onClose} disabled={isSaving} variant="ghost">إلغاء</Button>
                    <Button type="submit" form="scheduler-form" loading={isSaving} icon={<Calendar />}>
                        {isSaving ? 'جاري الجدولة...' : 'تأكيد الجدولة'}
                    </Button>
                </>
            }
        >
            <form id="scheduler-form" onSubmit={handleSubmit} className="space-y-6">
                <p className="text-muted-foreground">اختر التاريخ والوقت لجدولة الجلسة التعريفية المجانية.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="التاريخ" htmlFor="session-date">
                        <Input type="date" id="session-date" value={date} onChange={e => setDate(e.target.value)} required />
                    </FormField>
                    <FormField label="الوقت" htmlFor="session-time">
                        <Input type="time" id="session-time" value={time} onChange={e => setTime(e.target.value)} required />
                    </FormField>
                </div>
            </form>
        </Modal>
    );
};

export default IntroductorySessionSchedulerModal;