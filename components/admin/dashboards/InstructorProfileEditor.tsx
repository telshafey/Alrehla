import React, { useState } from 'react';
import { Save } from 'lucide-react';
import type { Instructor } from '../../../lib/database.types';
import { useInstructorMutations } from '../../../hooks/mutations';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import FormField from '../../ui/FormField';

interface InstructorProfileEditorProps {
    instructor: Instructor;
    disabled: boolean;
}

const InstructorProfileEditor: React.FC<InstructorProfileEditorProps> = ({ instructor, disabled }) => {
    const { updateInstructor: requestProfileUpdate } = useInstructorMutations();
    const [bio, setBio] = useState(instructor.bio || '');
    const [rate, setRate] = useState(instructor.rate_per_session?.toString() || '');
    const [justification, setJustification] = useState('');
    const isSaving = requestProfileUpdate.isPending;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await requestProfileUpdate.mutateAsync({ 
            id: instructor.id,
            pending_profile_data: {
                updates: {
                    bio,
                    rate_per_session: parseFloat(rate) || 0,
                },
                justification
            },
            profile_update_status: 'pending'
        });
        setJustification('');
    };
    
    return (
        <form onSubmit={handleSubmit} className={`space-y-6 mt-4 ${disabled ? 'opacity-50' : ''}`}>
            <fieldset disabled={disabled || isSaving}>
                <FormField label="نبذة تعريفية" htmlFor="bio">
                    <Textarea 
                        id="bio" 
                        value={bio} 
                        onChange={(e) => setBio(e.target.value)} 
                        rows={5}
                        placeholder="اكتب نبذة مختصرة عن خبراتك وأسلوبك في التدريب..."
                    />
                </FormField>
                <FormField label="السعر المقترح للجلسة (بالجنيه المصري)" htmlFor="rate">
                    <Input 
                        id="rate"
                        type="number"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                    />
                </FormField>
                <FormField label="مبررات التعديل (سيتم إرسالها للإدارة)" htmlFor="justification">
                     <Textarea 
                        id="justification" 
                        value={justification} 
                        onChange={(e) => setJustification(e.target.value)} 
                        rows={3}
                        placeholder="مثال: قمت بتحديث النبذة التعريفية لتشمل خبراتي الجديدة. أقترح تعديل السعر ليتناسب مع أسعار السوق الحالية."
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
