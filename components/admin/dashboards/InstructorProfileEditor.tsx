import React, { useState, useEffect } from 'react';
import { Instructor } from '../../../lib/database.types';
import { useInstructorMutations } from '../../../hooks/mutations';
import { Button } from '../../ui/Button';
import FormField from '../../ui/FormField';
import { Textarea } from '../../ui/Textarea';
import { Input } from '../../ui/Input';
import { AlertCircle } from 'lucide-react';

interface InstructorProfileEditorProps {
    instructor: Instructor;
}

const InstructorProfileEditor: React.FC<InstructorProfileEditorProps> = ({ instructor }) => {
    const { requestProfileUpdate } = useInstructorMutations();
    const [bio, setBio] = useState(instructor.bio || '');
    const [rate, setRate] = useState((instructor.rate_per_session || 0).toString());

    useEffect(() => {
        setBio(instructor.bio || '');
        setRate((instructor.rate_per_session || 0).toString());
    }, [instructor]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        requestProfileUpdate.mutate({
            instructorId: instructor.id,
            bio,
            rate: parseInt(rate, 10),
        });
    };
    
    const isUpdatePending = instructor.profile_update_status === 'pending';

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            {isUpdatePending && (
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-lg flex items-center gap-3">
                    <AlertCircle />
                    <p className="font-semibold">لديك طلب تحديث معلق قيد المراجعة حاليًا. لا يمكنك إرسال طلب جديد حتى يتم مراجعة الطلب الحالي.</p>
                </div>
            )}
            <FormField label="النبذة التعريفية" htmlFor="bio">
                <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} rows={5} disabled={isUpdatePending} />
            </FormField>
            <FormField label="السعر المقترح للجلسة الواحدة (ج.م)" htmlFor="rate">
                <Input id="rate" type="number" value={rate} onChange={e => setRate(e.target.value)} disabled={isUpdatePending} />
            </FormField>
            <Button type="submit" loading={requestProfileUpdate.isPending} disabled={isUpdatePending}>
                إرسال طلب التحديث
            </Button>
        </form>
    );
};

export default InstructorProfileEditor;