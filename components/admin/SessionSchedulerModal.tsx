import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, Calendar } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
// REFACTOR: Use the new feature-specific mutation hook.
import { useSchedulingMutations } from '../../hooks/mutations/useSchedulingMutations';
import type { Subscription } from '../../lib/database.types';
import { Button } from '../ui/Button';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';

interface SessionSchedulerModalProps {
    isOpen: boolean;
    onClose: () => void;
    subscription: Subscription | null;
}

export const SessionSchedulerModal: React.FC<SessionSchedulerModalProps> = ({ isOpen, onClose, subscription }) => {
    const { addToast } = useToast();
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const { scheduleSubscriptionSessions } = useSchedulingMutations();

    const [dayOfWeek, setDayOfWeek] = useState('tuesday');
    const [time, setTime] = useState('17:00');
    const [startDate, setStartDate] = useState('');
    const [exceptions, setExceptions] = useState('');
    
    const isSaving = scheduleSubscriptionSessions.isPending;

    useModalAccessibility({ modalRef, isOpen, onClose, initialFocusRef: closeButtonRef });

    useEffect(() => {
        if (isOpen) {
            // Reset form on open
            setDayOfWeek('tuesday');
            setTime('17:00');
            setStartDate(new Date().toISOString().split('T')[0]); // Default to today
            setExceptions('');
        }
    }, [isOpen]);

    if (!isOpen || !subscription) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!startDate) {
            addToast('يرجى تحديد تاريخ بدء الجدولة.', 'warning');
            return;
        }
        try {
            await scheduleSubscriptionSessions.mutateAsync({
                subscriptionId: subscription.id,
                childId: subscription.child_id,
                schedule: { dayOfWeek, time, startDate, exceptions },
            });
            onClose();
        } catch (error) {
            // Error handled by hook
        }
    };

    const dayOptions = [
        { value: 'saturday', label: 'السبت' },
        { value: 'sunday', label: 'الأحد' },
        { value: 'monday', label: 'الاثنين' },
        { value: 'tuesday', label: 'الثلاثاء' },
        { value: 'wednesday', label: 'الأربعاء' },
        { value: 'thursday', label: 'الخميس' },
        { value: 'friday', label: 'الجمعة' },
    ];

    const timeOptions = Array.from({ length: 24 }, (_, i) => {
        const hour = i.toString().padStart(2, '0');
        return `${hour}:00`;
    });


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="scheduler-modal-title">
            <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 m-4 animate-fadeIn" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 id="scheduler-modal-title" className="text-2xl font-bold text-gray-800">جدولة جلسات الاشتراك</h2>
                    <Button ref={closeButtonRef} onClick={onClose} variant="ghost" size="icon"><X size={24} /></Button>
                </div>
                <p className="mb-6 text-gray-600">
                    جدولة الجلسات الأسبوعية للاشتراك الخاص بالطفل <span className="font-bold">{subscription.child_name}</span>.
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="اليوم الأسبوعي" htmlFor="dayOfWeek">
                            <Select id="dayOfWeek" value={dayOfWeek} onChange={e => setDayOfWeek(e.target.value)}>
                                {dayOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </Select>
                        </FormField>
                        <FormField label="الوقت" htmlFor="time">
                             <Select id="time" value={time} onChange={e => setTime(e.target.value)}>
                                {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                            </Select>
                        </FormField>
                    </div>
                     <FormField label="تاريخ البدء" htmlFor="startDate">
                        <Input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                    </FormField>
                    <FormField label="استثناءات (تواريخ بصيغة YYYY-MM-DD مفصولة بفاصلة)" htmlFor="exceptions">
                        <Textarea id="exceptions" value={exceptions} onChange={e => setExceptions(e.target.value)} rows={2} placeholder="مثال: 2025-10-06, 2025-12-25" />
                    </FormField>

                     <div className="flex justify-end gap-4 pt-4 mt-8 border-t">
                        <Button type="button" onClick={onClose} disabled={isSaving} variant="ghost">إلغاء</Button>
                        <Button type="submit" loading={isSaving} icon={<Calendar />}>
                           {isSaving ? 'جاري الجدولة...' : 'جدولة الجلسات'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
