import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import type { CreativeWritingPackage } from '../../lib/database.types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import FormField from '../ui/FormField';
import Modal from '../ui/Modal';

interface CWSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: any) => void;
    isSaving: boolean;
    packageToEdit: CreativeWritingPackage | null;
}

export const CWSettingsModal: React.FC<CWSettingsModalProps> = ({ isOpen, onClose, onSave, isSaving, packageToEdit }) => {
    const [name, setName] = useState('');
    const [sessions, setSessions] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [features, setFeatures] = useState('');
    const [isPopular, setIsPopular] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (packageToEdit) {
                setName(packageToEdit.name);
                setSessions(packageToEdit.sessions);
                setPrice(packageToEdit.price.toString());
                setDescription(packageToEdit.description);
                setFeatures(packageToEdit.features.join('\n'));
                setIsPopular(packageToEdit.popular);
            } else {
                setName('');
                setSessions('');
                setPrice('');
                setDescription('');
                setFeatures('');
                setIsPopular(false);
            }
        }
    }, [isOpen, packageToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            id: packageToEdit?.id,
            name,
            sessions,
            price: parseFloat(price),
            description,
            features: features.split('\n').filter(f => f.trim() !== ''),
            popular: isPopular,
        };
        onSave(payload);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={packageToEdit ? 'تعديل الباقة' : 'إضافة باقة جديدة'}
            footer={
                <>
                    <Button type="button" onClick={onClose} disabled={isSaving} variant="ghost">إلغاء</Button>
                    <Button type="submit" form="package-form" loading={isSaving} icon={<Save />}>
                        {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                    </Button>
                </>
            }
        >
                <form id="package-form" onSubmit={handleSubmit} className="space-y-6">
                    <FormField label="اسم الباقة*" htmlFor="name">
                        <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required />
                    </FormField>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <FormField label="وصف عدد الجلسات*" htmlFor="sessions">
                            <Input id="sessions" type="text" value={sessions} onChange={e => setSessions(e.target.value)} placeholder="مثال: 4 جلسات" required />
                        </FormField>
                         <FormField label="السعر (ج.م)*" htmlFor="price">
                            <Input id="price" type="number" value={price} onChange={e => setPrice(e.target.value)} required />
                        </FormField>
                    </div>
                     <FormField label="الوصف القصير*" htmlFor="description">
                        <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} required />
                    </FormField>
                     <FormField label="الميزات (كل ميزة في سطر)*" htmlFor="features">
                        <Textarea id="features" value={features} onChange={e => setFeatures(e.target.value)} rows={4} required />
                    </FormField>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" checked={isPopular} onChange={e => setIsPopular(e.target.checked)} id="isPopular-checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                        <label htmlFor="isPopular-checkbox" className="text-sm font-medium text-gray-700">علامة "الأكثر شيوعاً"</label>
                    </div>
                </form>
        </Modal>
    );
};
