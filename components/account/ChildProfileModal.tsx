import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, User, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { ChildProfile } from '../../lib/database.types.ts';
import { useModalAccessibility } from '../../hooks/useModalAccessibility.ts';

interface ChildProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    childToEdit: ChildProfile | null;
}

const ChildProfileModal: React.FC<ChildProfileModalProps> = ({ isOpen, onClose, childToEdit }) => {
    const { addChildProfile, updateChildProfile } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<'ذكر' | 'أنثى'>('ذكر');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [interests, setInterests] = useState('');
    const [strengths, setStrengths] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useModalAccessibility({ modalRef, isOpen, onClose, initialFocusRef: closeButtonRef });

    useEffect(() => {
        if (isOpen) {
            if (childToEdit) {
                setName(childToEdit.name);
                setAge(childToEdit.age.toString());
                setGender(childToEdit.gender);
                setPreview(childToEdit.avatar_url);
                setInterests((childToEdit.interests || []).join(', '));
                setStrengths((childToEdit.strengths || []).join(', '));
            } else {
                setName('');
                setAge('');
                setGender('ذكر');
                setPreview(null);
                setInterests('');
                setStrengths('');
            }
            setAvatarFile(null);
        }
    }, [childToEdit, isOpen]);
    
    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setAvatarFile(file);
        if (file) {
            setPreview(URL.createObjectURL(file));
        } else {
            setPreview(childToEdit?.avatar_url || null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const interestsArray = interests.split(',').map(s => s.trim()).filter(Boolean);
            const strengthsArray = strengths.split(',').map(s => s.trim()).filter(Boolean);

            const profileData = {
                name,
                age: parseInt(age),
                gender,
                avatarFile,
                interests: interestsArray,
                strengths: strengthsArray,
            };
            if (childToEdit) {
                await updateChildProfile({ ...profileData, id: childToEdit.id, avatar_url: childToEdit.avatar_url });
            } else {
                await addChildProfile(profileData);
            }
            onClose();
        } catch (error) {
            console.error("Failed to save child profile", error);
            // Toast will be shown from context
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="child-profile-modal-title">
            <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 m-4 animate-fadeIn max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 id="child-profile-modal-title" className="text-2xl font-bold text-gray-800">{childToEdit ? 'تعديل ملف الطفل' : 'إضافة طفل جديد'}</h2>
                    <button ref={closeButtonRef} onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center gap-4">
                        <img src={preview || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} alt="Avatar" className="w-24 h-24 rounded-full object-cover bg-gray-200" loading="lazy" />
                        <input type="file" id="avatar-upload" onChange={handleFileChange} accept="image/*" className="hidden"/>
                        <label htmlFor="avatar-upload" className="cursor-pointer flex items-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full">
                           <ImageIcon size={16} /> <span>{preview ? 'تغيير الصورة الرمزية' : 'رفع صورة رمزية'}</span>
                        </label>
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">اسم الطفل*</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="age" className="block text-sm font-bold text-gray-700 mb-2">العمر*</label>
                            <input type="number" id="age" value={age} onChange={(e) => setAge(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                        </div>
                        <div>
                            <label htmlFor="gender" className="block text-sm font-bold text-gray-700 mb-2">الجنس*</label>
                            <select id="gender" value={gender} onChange={(e) => setGender(e.target.value as 'ذكر' | 'أنثى')} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white">
                                <option value="ذكر">ذكر</option>
                                <option value="أنثى">أنثى</option>
                            </select>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="interests" className="block text-sm font-bold text-gray-700 mb-2">اهتمامات الطفل</label>
                        <textarea id="interests" value={interests} onChange={(e) => setInterests(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows={2} placeholder="مثال: الديناصورات، الرسم، كرة القدم"></textarea>
                        <p className="text-xs text-gray-500 mt-1">افصل بين كل اهتمام بفاصلة (,)</p>
                    </div>
                     <div>
                        <label htmlFor="strengths" className="block text-sm font-bold text-gray-700 mb-2">نقاط قوة الطفل</label>
                        <textarea id="strengths" value={strengths} onChange={(e) => setStrengths(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows={2} placeholder="مثال: شجاع، خياله واسع، يحب مساعدة الآخرين"></textarea>
                         <p className="text-xs text-gray-500 mt-1">افصل بين كل نقطة قوة بفاصلة (,)</p>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 mt-8 border-t">
                        <button type="button" onClick={onClose} disabled={isSaving} className="px-6 py-2 rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200">إلغاء</button>
                        <button type="submit" disabled={isSaving} className="w-32 flex items-center justify-center px-6 py-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400">
                           {isSaving ? <Loader2 className="animate-spin"/> : 'حفظ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChildProfileModal;