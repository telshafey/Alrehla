import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, Calendar } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
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

const SessionSchedulerModal: React.FC<SessionSchedulerModalProps> = ({ isOpen, onClose, subscription }) => {
    const { addToast } = useToast();
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    const [dayOfWeek, setDayOfWeek] = useState('tuesday');
    const [time, setTime] = useState('17:00');
    const [startDate, setStartDate] = useState('');
    const [exceptions, setExceptions] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useModalAccessibility({ modalRef, isOpen, onClose, initialFocusRef: closeButtonRef });

    useEffect(() => {
        if (isOpen) {
            // Reset form on open
            setDayOfWeek('tuesday');
            setTime('17:00');
            setStartDate('');
            setExceptions('');
        }
    }, [isOpen]);

    if (!isOpen || !subscription) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Simulating session scheduling:', {
            subscriptionId: subscription.id,
            childName: subscription.child_name,
            dayOfWeek,
            time,
            startDate,
            exceptions,
        });
        addToast('تمت جدولة الجلسات بنجاح (محاكاة).', 'success');
        setIsSaving(false);
        onClose();
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="scheduler-modal-title">
            <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 m-4 animate-fadeIn max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 id="scheduler-modal-title" className="text-2xl font-bold text-gray-800">جدولة الجلسات</h2>
                    <Button ref={closeButtonRef} onClick={onClose} variant="ghost" size="icon"><X size={24} /></Button>
                </div>
                <p className="mb-6 text-gray-600">
                    جدولة جلسات الاشتراك للطفل: <span className="font-bold">{subscription.child_name}</span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField label="يوم الجلسة الأسبوعي*" htmlFor="dayOfWeek">
                            <Select id="dayOfWeek" value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)} required>
                                {dayOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </Select>
                        </FormField>
                        <FormField label="وقت الجلسة*" htmlFor="time">
                            <Input type="time" id="time" value={time} onChange={(e) => setTime(e.target.value)} required />
                        </FormField>
                    </div>
                    <FormField label="تاريخ بدء أول جلسة*" htmlFor="startDate">
                        <Input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                    </FormField>
                    <FormField label="تواريخ مستثناة (اختياري)" htmlFor="exceptions">
                        <Textarea id="exceptions" value={exceptions} onChange={(e) => setExceptions(e.target.value)} rows={3} placeholder="مثال: 2024-10-06, 2024-12-25 (افصل بين التواريخ بفاصلة)" />
                        <p className="text-xs text-gray-500 mt-1">لن يتم إنشاء جلسات في هذه التواريخ.</p>
                    </FormField>

                    <div className="flex justify-end gap-4 pt-4 mt-8 border-t">
                        <Button type="button" onClick={onClose} disabled={isSaving} variant="ghost">
                            إلغاء
                        </Button>
                        <Button type="submit" loading={isSaving} icon={<Calendar />}>
                            {isSaving ? 'جاري الجدولة...' : 'إنشاء الجدول'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SessionSchedulerModal;