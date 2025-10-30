import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import type { Instructor } from '../../lib/database.types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import FormField from '../ui/FormField';
import Modal from '../ui/Modal';

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
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={instructor ? 'تعديل المدرب' : 'إضافة مدرب جديد'}
            footer={
                <>
                    <Button type="button" onClick={onClose} disabled={isSaving} variant="ghost">
                        إلغاء
                    </Button>
                    <Button type="submit" form="instructor-form" loading={isSaving}>
                        {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                    </Button>
                </>
            }
        >
            <form id="instructor-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center gap-4">
                    <img src={preview || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} alt="Avatar" className="w-20 h-20 rounded-full object-cover bg-muted" loading="lazy" />
                    <input type="file" onChange={handleFileChange} accept="image/*" className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                </div>
                <FormField label="اسم المدرب" htmlFor="name">
                    <Input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </FormField>
                    <FormField label="التخصص" htmlFor="specialty">
                    <Input type="text" id="specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
                </FormField>
                <FormField label="معرّف الرابط (Slug)" htmlFor="slug">
                    <Input type="text" id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="مثال: ahmed-masri" required />
                    <p className="text-xs text-muted-foreground mt-1">يُستخدم في رابط الصفحة الشخصية للمدرب. يجب أن يكون فريدًا وبدون مسافات.</p>
                </FormField>
                <FormField label="نبذة تعريفية" htmlFor="bio">
                    <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
                </FormField>
            </form>
        </Modal>
    );
};

export default InstructorModal;