import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { Instructor } from '../../lib/database.types.ts';
import { useModalAccessibility } from '../../hooks/useModalAccessibility.ts';

// InstructorModal Component
const InstructorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (details: { name: string; specialty: string; slug: string; bio: string; avatarFile: File | null; id?: number }) => void;
    instructor: Instructor | null;
    isSaving: boolean;
}> = ({ isOpen, onClose, onSave, instructor, isSaving }) => {
    const [name, setName] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [slug, setSlug] = useState('');
    const [bio, setBio] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useModalAccessibility({ modalRef, isOpen, onClose, initialFocusRef: closeButtonRef });

    useEffect(() => {
        if (isOpen) {
            if (instructor) {
                setName(instructor.name);
                setSpecialty(instructor.specialty || '');
                setSlug(instructor.slug || '');
                setBio(instructor.bio || '');
                setPreview(instructor.avatar_url || null);
            } else {
                setName('');
                setSpecialty('');
                setSlug('');
                setBio('');
                setPreview(null);
            }
            setAvatarFile(null);
        }
    }, [instructor, isOpen]);
    
    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setAvatarFile(file);
        if (file) {
            setPreview(URL.createObjectURL(file));
        } else {
            setPreview(instructor?.avatar_url || null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: instructor?.id, name, specialty, slug, bio, avatarFile });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="instructor-modal-title">
            <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 m-4 animate-fadeIn max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 id="instructor-modal-title" className="text-2xl font-bold text-gray-800">{instructor ? 'تعديل المدرب' : 'إضافة مدرب جديد'}</h2>
                    <button ref={closeButtonRef} onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center gap-4">
                        <img src={preview || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} alt="Avatar" className="w-20 h-20 rounded-full object-cover bg-gray-200" loading="lazy" />
                        <input type="file" onChange={handleFileChange} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">اسم المدرب</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                    </div>
                     <div>
                        <label htmlFor="specialty" className="block text-sm font-bold text-gray-700 mb-2">التخصص</label>
                        <input type="text" id="specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label htmlFor="slug" className="block text-sm font-bold text-gray-700 mb-2">معرّف الرابط (Slug)</label>
                        <input type="text" id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="مثال: ahmed-masri" required />
                        <p className="text-xs text-gray-500 mt-1">يُستخدم في رابط الصفحة الشخصية للمدرب. يجب أن يكون فريدًا وبدون مسافات.</p>
                    </div>
                    <div>
                        <label htmlFor="bio" className="block text-sm font-bold text-gray-700 mb-2">نبذة تعريفية</label>
                        <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows={4}></textarea>
                    </div>
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

export default InstructorModal;