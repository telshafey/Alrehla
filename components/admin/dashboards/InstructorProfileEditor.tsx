import React, { useState } from 'react';
import { Save } from 'lucide-react';
import type { Instructor } from '../../../lib/database.types';
import { useInstructorMutations } from '../../../hooks/mutations/useInstructorMutations';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import FormField from '../../ui/FormField';

interface InstructorProfileEditorProps {
    instructor: Instructor;
    disabled: boolean;
}

const InstructorProfileEditor: React.FC<InstructorProfileEditorProps> = ({ instructor, disabled }) => {
    const { requestProfileUpdate } = useInstructorMutations();
    const [name, setName] = useState(instructor.name || '');
    const [specialty, setSpecialty] = useState(instructor.specialty || '');
    const [bio, setBio] = useState(instructor.bio || '');
    const [justification, setJustification] = useState('');
    const isSaving = requestProfileUpdate.isPending;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await requestProfileUpdate.mutateAsync({ 
            instructorId: instructor.id,
            updates: { name, specialty, bio },
            justification
        });
        setJustification('');
    };
    
    return (
        <form onSubmit={handleSubmit} className={`space-y-6 mt-4 ${disabled ? 'opacity-50' : ''}`}>
            <fieldset disabled={disabled || isSaving}>
                <FormField label="الاسم" htmlFor="name">
                    <Input 
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </FormField>
                 <FormField label="التخصص" htmlFor="specialty">
                    <Input 
                        id="specialty"
                        type="text"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                    />
                </FormField>
                <FormField label="نبذة تعريفية" htmlFor="bio">
                    <Textarea 
                        id="bio" 
                        value={bio} 
                        onChange={(e) => setBio(e.target.value)} 
                        rows={5}
                        placeholder="اكتب نبذة مختصرة عن خبراتك وأسلوبك في التدريب..."
                    />
                </FormField>
                <FormField label="مبررات التعديل (سيتم إرسالها للإدارة)" htmlFor="justification">
                     <Textarea 
                        id="justification" 
                        value={justification} 
                        onChange={(e) => setJustification(e.target.value)} 
                        rows={3}
                        placeholder="مثال: قمت بتحديث النبذة التعريفية لتشمل خبراتي الجديدة."
                        required
                    />
                </FormField>
                <div className="flex justify-end">
                    <Button type="submit" loading={isSaving} icon={<Save />}>
                        إرسال طلب التحديث
                    </Button>
                </div>
            </fieldset>
        </form>
    );
};

export default InstructorProfileEditor;