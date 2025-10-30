import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import type { CreativeWritingPackage, AdditionalService } from '../../lib/database.types';
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
    itemType: 'package' | 'service';
    itemToEdit: CreativeWritingPackage | AdditionalService | null;
}

const CWSettingsModal: React.FC<CWSettingsModalProps> = ({ isOpen, onClose, onSave, isSaving, itemType, itemToEdit }) => {
    const [name, setName] = useState('');
    const [sessions, setSessions] = useState('');
    const [price, setPrice] = useState('');
    const [features, setFeatures] = useState('');
    const [popular, setPopular] = useState(false);
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (itemToEdit) {
                setName(itemToEdit.name);
                setPrice(itemToEdit.price.toString());
                if ('sessions' in itemToEdit) { // It's a package
                    setSessions(itemToEdit.sessions || '');
                    setFeatures((itemToEdit.features || []).join('\n'));
                    setPopular(itemToEdit.popular || false);
                    setDescription(itemToEdit.description || '');
                } else { // It's a service
                    setDescription(itemToEdit.description || '');
                }
            } else {
                setName('');
                setSessions('');
                setPrice('');
                setFeatures('');
                setPopular(false);
                setDescription('');
            }
        }
    }, [isOpen, itemToEdit]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let payload: any = { id: itemToEdit?.id };
        if (itemType === 'package') {
            payload = {
                ...payload,
                name,
                sessions,
                price: parseFloat(price),
                features: features.split('\n').filter(f => f.trim() !== ''),
                popular,
                description,
            };
        } else {
            payload = {
                ...payload,
                name,
                price: parseFloat(price),
                description,
            };
        }
        onSave(payload);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${itemToEdit ? 'تعديل' : 'إضافة'} ${itemType === 'package' ? 'باقة' : 'خدمة'}`}
            footer={
                <>
                    <Button type="button" onClick={onClose} disabled={isSaving} variant="ghost">
                        إلغاء
                    </Button>
                    <Button type="submit" form="cw-settings-form" loading={isSaving} icon={<Save />}>
                        {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                    </Button>
                </>
            }
        >
            <form id="cw-settings-form" onSubmit={handleSubmit} className="space-y-6">
                <FormField label="الاسم*" htmlFor="name">
                    <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </FormField>
                {itemType === 'package' && (
                    <FormField label="الجلسات*" htmlFor="sessions">
                        <Input id="sessions" type="text" value={sessions} onChange={(e) => setSessions(e.target.value)} placeholder="مثال: 4 جلسات" required />
                    </FormField>
                )}
                <FormField label="السعر (بالجنيه المصري)*" htmlFor="price">
                    <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </FormField>
                {itemType === 'package' ? (
                    <>
                        <FormField label="الوصف التفصيلي للباقة" htmlFor="description">
                            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
                        </FormField>
                        <FormField label="الميزات (كل ميزة في سطر)" htmlFor="features">
                            <Textarea id="features" value={features} onChange={(e) => setFeatures(e.target.value)} rows={4} />
                        </FormField>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" checked={popular} onChange={(e) => setPopular(e.target.checked)} id="popular-checkbox" className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
                            <label htmlFor="popular-checkbox" className="text-sm font-medium text-gray-700">علامة "الأكثر شيوعاً"</label>
                        </div>
                    </>
                ) : (
                    <FormField label="الوصف" htmlFor="description">
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                    </FormField>
                )}
            </form>
        </Modal>
    );
};

export default CWSettingsModal;