import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ChildProfile } from '../../lib/database.types';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import { Button } from '../ui/Button';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';

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

            let newAvatarUrl = childToEdit?.avatar_url || null;
            if (avatarFile) {
                // In a real app, this would be an upload. For mock, we use a placeholder.
                newAvatarUrl = 'https://i.ibb.co/2S4xT8w/male-avatar.png';
            }
            
            const profileData = {
                name,
                age: parseInt(age),
                gender,
                avatar_url: newAvatarUrl,
                interests: interestsArray.length > 0 ? interestsArray : null,
                strengths: strengthsArray.length > 0 ? strengthsArray : null,
            };

            if (childToEdit) {
                await updateChildProfile({ ...profileData, id: childToEdit.id });
            } else {
                await addChildProfile({ ...profileData, student_user_id: null });
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
                    <Button ref={closeButtonRef} onClick={onClose} variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </Button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center gap-4">
                        <img src={preview || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} alt="Avatar" className="w-24 h-24 rounded-full object-cover bg-gray-200" loading="lazy" />
                        <input type="file" id="avatar-upload" onChange={handleFileChange} accept="image/*" className="hidden"/>
                        <label htmlFor="avatar-upload" className="cursor-pointer flex items-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full">
                           <ImageIcon size={16} /> <span>{preview ? 'تغيير الصورة الرمزية' : 'رفع صورة رمزية'}</span>
                        </label>
                    </div>
                    <FormField label="اسم الطفل*" htmlFor="name">
                        <Input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </FormField>
                     <div className="grid grid-cols-2 gap-4">
                        <FormField label="العمر*" htmlFor="age">
                            <Input type="number" id="age" value={age} onChange={(e) => setAge(e.target.value)} required />
                        </FormField>
                        <FormField label="الجنس*" htmlFor="gender">
                            <Select id="gender" value={gender} onChange={(e) => setGender(e.target.value as 'ذكر' | 'أنثى')}>
                                <option value="ذكر">ذكر</option>
                                <option value="أنثى">أنثى</option>
                            </Select>
                        </FormField>
                    </div>
                     <FormField label="اهتمامات الطفل" htmlFor="interests">
                        <Textarea id="interests" value={interests} onChange={(e) => setInterests(e.target.value)} rows={2} placeholder="مثال: الديناصورات، الرسم، كرة القدم"/>
                        <p className="text-xs text-gray-500 mt-1">افصل بين كل اهتمام بفاصلة (,)</p>
                    </FormField>
                     <FormField label="نقاط قوة الطفل" htmlFor="strengths">
                        <Textarea id="strengths" value={strengths} onChange={(e) => setStrengths(e.target.value)} rows={2} placeholder="مثال: شجاع، خياله واسع، يحب مساعدة الآخرين"/>
                         <p className="text-xs text-gray-500 mt-1">افصل بين كل نقطة قوة بفاصلة (,)</p>
                    </FormField>

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

export default ChildProfileModal;