import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import type { SubscriptionPlan } from '../../lib/database.types';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import FormField from '../ui/FormField';

interface SubscriptionPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: any) => void;
    isSaving: boolean;
    planToEdit: SubscriptionPlan | null;
}

export const SubscriptionPlanModal: React.FC<SubscriptionPlanModalProps> = ({ isOpen, onClose, onSave, isSaving, planToEdit }) => {
    const [name, setName] = useState('');
    const [duration, setDuration] = useState('');
    const [price, setPrice] = useState('');
    const [pricePerMonth, setPricePerMonth] = useState('');
    const [savings, setSavings] = useState('');
    const [isBestValue, setIsBestValue] = useState(false);
    
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useModalAccessibility({ modalRef, isOpen, onClose, initialFocusRef: closeButtonRef });

    useEffect(() => {
        if (isOpen) {
            if (planToEdit) {
                setName(planToEdit.name);
                setDuration(planToEdit.duration_months.toString());
                setPrice(planToEdit.price.toString());
                setPricePerMonth(planToEdit.price_per_month.toString());
                setSavings(planToEdit.savings_text || '');
                setIsBestValue(planToEdit.is_best_value || false);
            } else {
                setName('');
                setDuration('');
                setPrice('');
                setPricePerMonth('');
                setSavings('');
                setIsBestValue(false);
            }
        }
    }, [isOpen, planToEdit]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            id: planToEdit?.id,
            name,
            duration_months: parseInt(duration),
            price: parseFloat(price),
            price_per_month: parseFloat(pricePerMonth),
            savings_text: savings,
            is_best_value: isBestValue,
        };
        onSave(payload);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="plan-modal-title">
            <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 m-4 animate-fadeIn max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 id="plan-modal-title" className="text-2xl font-bold text-gray-800">{planToEdit ? 'تعديل الباقة' : 'إضافة باقة جديدة'}</h2>
                    <Button ref={closeButtonRef} onClick={onClose} variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600"><X size={24} /></Button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <FormField label="اسم الباقة*" htmlFor="name">
                        <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required />
                    </FormField>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <FormField label="المدة (بالأشهر)*" htmlFor="duration">
                            <Input id="duration" type="number" value={duration} onChange={e => setDuration(e.target.value)} required />
                        </FormField>
                         <FormField label="السعر الإجمالي (ج.م)*" htmlFor="price">
                            <Input id="price" type="number" value={price} onChange={e => setPrice(e.target.value)} required />
                        </FormField>
                    </div>
                     <FormField label="السعر المحسوب شهرياً (ج.م)*" htmlFor="pricePerMonth">
                        <Input id="pricePerMonth" type="number" value={pricePerMonth} onChange={e => setPricePerMonth(e.target.value)} required />
                    </FormField>
                     <FormField label="نص التوفير (اختياري)" htmlFor="savings">
                        <Input id="savings" type="text" value={savings} onChange={e => setSavings(e.target.value)} placeholder="مثال: وفر 15%" />
                    </FormField>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" checked={isBestValue} onChange={e => setIsBestValue(e.target.checked)} id="isBestValue-checkbox" className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
                        <label htmlFor="isBestValue-checkbox" className="text-sm font-medium text-gray-700">علامة "الأفضل قيمة"</label>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 mt-8 border-t">
                        <Button type="button" onClick={onClose} disabled={isSaving} variant="ghost">إلغاء</Button>
                        <Button type="submit" loading={isSaving} icon={<Save />}>
                            {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};