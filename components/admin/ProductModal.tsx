

import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import { PersonalizedProduct } from '../../lib/database.types';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import { Button } from '../ui/Button';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: any) => void;
    productToEdit: PersonalizedProduct | null;
    isSaving: boolean;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, productToEdit, isSaving }) => {
    const [title, setTitle] = useState('');
    const [key, setKey] = useState('');
    const [description, setDescription] = useState('');
    const [features, setFeatures] = useState('');
    const [sortOrder, setSortOrder] = useState('99');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useModalAccessibility({ modalRef, isOpen, onClose, initialFocusRef: closeButtonRef });

    useEffect(() => {
        if (isOpen) {
            if (productToEdit) {
                setTitle(productToEdit.title);
                setKey(productToEdit.key);
                setDescription(productToEdit.description || '');
                setFeatures((productToEdit.features || []).join('\n'));
                setSortOrder((productToEdit.sort_order || 99).toString());
                setPreview(productToEdit.image_url);
            } else {
                setTitle('');
                setKey('');
                setDescription('');
                setFeatures('');
                setSortOrder('99');
                setPreview(null);
            }
            setImageFile(null);
        }
    }, [productToEdit, isOpen]);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setImageFile(file);
        if (file) {
            setPreview(URL.createObjectURL(file));
        } else {
            setPreview(productToEdit?.image_url || null);
        }
    };

    const generateKey = (text: string) => {
        return text.toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^\w\u0621-\u064A0-9_]+/g, '') // Keep Arabic letters, numbers, _,
            .replace(/__+/g, '_');
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        if (!productToEdit) {
            setKey(generateKey(newTitle));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: productToEdit?.id,
            key,
            title,
            description,
            features: features.split('\n').filter(f => f.trim() !== ''),
            sort_order: parseInt(sortOrder) || 99,
            imageFile,
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
            <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 m-4 animate-fadeIn max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 id="product-modal-title" className="text-2xl font-bold text-gray-800">{productToEdit ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
                    <Button ref={closeButtonRef} onClick={onClose} variant="ghost" size="icon"><X size={24} /></Button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <FormField label="اسم المنتج*" htmlFor="title">
                       <Input type="text" id="title" value={title} onChange={handleTitleChange} required />
                    </FormField>
                     <FormField label="المعرّف (Key)*" htmlFor="key">
                        <Input type="text" id="key" value={key} onChange={(e) => setKey(e.target.value)} required dir="ltr" disabled={!!productToEdit} />
                        <p className="text-xs text-gray-500 mt-1">معرّف فريد باللغة الإنجليزية بدون مسافات. يتم إنشاؤه تلقائياً ولا يمكن تغييره.</p>
                    </FormField>
                    <FormField label="الوصف" htmlFor="description">
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3}></Textarea>
                    </FormField>
                     <FormField label="الميزات (كل ميزة في سطر)" htmlFor="features">
                        <Textarea id="features" value={features} onChange={(e) => setFeatures(e.target.value)} rows={4}></Textarea>
                    </FormField>
                     <FormField label="ترتيب العرض" htmlFor="sortOrder">
                        <Input type="number" id="sortOrder" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
                    </FormField>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">صورة المنتج</label>
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border">
                                {preview ? <img src={preview} alt="Preview" className="h-full w-full object-contain" /> : <ImageIcon className="text-gray-400" />}
                            </div>
                            <input type="file" onChange={handleFileChange} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 mt-8 border-t">
                         <Button type="button" onClick={onClose} disabled={isSaving} variant="ghost">
                            إلغاء
                        </Button>
                        <Button type="submit" loading={isSaving} icon={<Save />}>
                           {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;