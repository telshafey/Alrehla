import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import { PersonalizedProduct } from '../../lib/database.types.ts';
import { useModalAccessibility } from '../../hooks/useModalAccessibility.ts';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: any) => void;
    product: PersonalizedProduct | null;
    isSaving: boolean;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, product, isSaving }) => {
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
            if (product) {
                setTitle(product.title);
                setKey(product.key);
                setDescription(product.description || '');
                setFeatures((product.features || []).join('\n'));
                setSortOrder((product.sort_order || 99).toString());
                setPreview(product.image_url);
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
    }, [product, isOpen]);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setImageFile(file);
        if (file) {
            setPreview(URL.createObjectURL(file));
        } else {
            setPreview(product?.image_url || null);
        }
    };

    const generateKey = (text: string) => {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]+/g, '')
            .replace(/__+/g, '_');
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        if (!product) {
            setKey(generateKey(newTitle));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: product?.id,
            key,
            title,
            description,
            features: features.split('\n').filter(f => f.trim() !== ''),
            sort_order: sortOrder,
            imageFile,
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
            <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 m-4 animate-fadeIn max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 id="product-modal-title" className="text-2xl font-bold text-gray-800">{product ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
                    <button ref={closeButtonRef} onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">اسم المنتج*</label>
                        <input type="text" value={title} onChange={handleTitleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">المعرّف (Key)*</label>
                        <input type="text" value={key} onChange={(e) => setKey(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50" required dir="ltr" />
                        <p className="text-xs text-gray-500 mt-1">معرّف فريد باللغة الإنجليزية بدون مسافات.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">الوصف</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows={3}></textarea>
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">الميزات (كل ميزة في سطر)</label>
                        <textarea value={features} onChange={(e) => setFeatures(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows={4}></textarea>
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">ترتيب العرض</label>
                        <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">صورة المنتج</label>
                        <div className="flex items-center gap-4">
                            {preview && <img src={preview} alt="Preview" className="w-24 h-24 object-contain rounded-md bg-white border" />}
                            <input type="file" onChange={handleFileChange} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 mt-8 border-t">
                        <button type="button" onClick={onClose} disabled={isSaving} className="px-6 py-2 rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200">إلغاء</button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400">
                           {isSaving ? <Loader2 className="animate-spin"/> : <Save />}
                           <span>{isSaving ? 'جاري الحفظ...' : 'حفظ'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;