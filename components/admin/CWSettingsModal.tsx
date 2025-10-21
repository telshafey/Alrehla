import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import type { CreativeWritingPackage, AdditionalService } from '../../lib/database.types.ts';

interface CWSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: any) => void;
    isSaving: boolean;
    itemType: 'package' | 'service';
}

const CWSettingsModal: React.FC<CWSettingsModalProps> = ({ isOpen, onClose, onSave, isSaving, itemType }) => {
    const [name, setName] = useState('');
    const [sessions, setSessions] = useState('');
    const [price, setPrice] = useState('');
    const [features, setFeatures] = useState('');
    const [popular, setPopular] = useState(false);
    const [description, setDescription] = useState('');

    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setName('');
            setSessions('');
            setPrice('');
            setFeatures('');
            setPopular(false);
            setDescription('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let payload = {};
        if (itemType === 'package') {
            payload = {
                name,
                sessions,
                price: parseFloat(price),
                features: features.split('\n').filter(f => f.trim() !== ''),
                popular,
            };
        } else {
            payload = {
                name,
                price: parseFloat(price),
                description,
            };
        }
        onSave(payload);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 m-4 animate-fadeIn" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">{itemType === 'package' ? 'إضافة باقة جديدة' : 'إضافة خدمة جديدة'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">الاسم*</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                    </div>
                    {itemType === 'package' && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">الجلسات*</label>
                            <input type="text" value={sessions} onChange={(e) => setSessions(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="مثال: 4 جلسات" required />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">السعر (بالجنيه المصري)*</label>
                        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                    </div>
                    {itemType === 'package' ? (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">الميزات (كل ميزة في سطر)</label>
                                <textarea value={features} onChange={(e) => setFeatures(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows={4}></textarea>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={popular} onChange={(e) => setPopular(e.target.checked)} id="popular-checkbox" className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
                                <label htmlFor="popular-checkbox" className="text-sm font-medium text-gray-700">علامة "الأكثر شيوعاً"</label>
                            </div>
                        </>
                    ) : (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">الوصف</label>
                            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                        </div>
                    )}
                    <div className="flex justify-end gap-4 pt-4 mt-8 border-t">
                        <button type="button" onClick={onClose} disabled={isSaving} className="px-6 py-2 rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200">إلغاء</button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400">
                           {isSaving ? <Loader2 className="animate-spin"/> : 'حفظ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CWSettingsModal;