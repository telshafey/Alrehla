
import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Save, CheckCircle } from 'lucide-react';
import { useBookingMutations } from '../../hooks/mutations/useBookingMutations';

interface WritingDraftPanelProps {
    journeyId: string;
    canInteract: boolean;
    initialDraft?: string;
}

const WritingDraftPanel: React.FC<WritingDraftPanelProps> = ({ journeyId, canInteract, initialDraft }) => {
    const { updateBookingDraft } = useBookingMutations();
    const [draft, setDraft] = useState(initialDraft || '');
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    // تحديث النص إذا تغير من المصدر (عند التحميل الأول فقط لتجنب الكتابة فوق ما يكتبه المستخدم)
    useEffect(() => {
        if (initialDraft && draft === '') {
            setDraft(initialDraft);
        }
    }, [initialDraft]);

    const handleSaveDraft = async () => {
        await updateBookingDraft.mutateAsync({ bookingId: journeyId, draft });
        setLastSaved(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));
    };

    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                <div>
                    <p className="text-sm font-bold text-yellow-800">مساحة الكتابة الحرة</p>
                    <p className="text-xs text-yellow-700">هنا يمكنك كتابة قصتك، خواطرك، أو واجباتك. لا تنسَ الضغط على حفظ لمشاركتها مع المدرب.</p>
                </div>
                <div className="flex items-center gap-2">
                    {lastSaved && <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle size={12}/> تم الحفظ {lastSaved}</span>}
                    {canInteract && (
                        <Button onClick={handleSaveDraft} loading={updateBookingDraft.isPending} icon={<Save size={16}/>} disabled={!draft} size="sm">
                            {updateBookingDraft.isPending ? 'جاري الحفظ...' : 'حفظ المسودة'}
                        </Button>
                    )}
                </div>
            </div>

            <Textarea
                placeholder="ابدأ بكتابة قصتك هنا... أطلق العنان لخيالك!"
                className="flex-grow min-h-[400px] text-lg leading-loose p-6 bg-white shadow-inner border-2 focus:border-primary/50 transition-all"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={!canInteract || updateBookingDraft.isPending}
            />
        </div>
    );
};

export default WritingDraftPanel;
