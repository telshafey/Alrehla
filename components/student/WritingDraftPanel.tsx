
import React, { useState, useEffect } from 'react';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Save, CheckCircle, Lock } from 'lucide-react';
import { useBookingMutations } from '../../hooks/mutations/useBookingMutations';

interface WritingDraftPanelProps {
    journeyId: string;
    canEdit: boolean; // Changed from canInteract to be more specific about editing rights
    initialDraft?: string;
}

const WritingDraftPanel: React.FC<WritingDraftPanelProps> = ({ journeyId, canEdit, initialDraft }) => {
    const { updateBookingDraft } = useBookingMutations();
    const [draft, setDraft] = useState(initialDraft || '');
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    // تحديث النص إذا تغير من المصدر (عند التحميل الأول فقط)
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
            <div className={`flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-3 rounded-lg border ${canEdit ? 'bg-yellow-50 border-yellow-100' : 'bg-gray-50 border-gray-200'}`}>
                <div>
                    <p className={`text-sm font-bold ${canEdit ? 'text-yellow-800' : 'text-gray-700'}`}>
                        {canEdit ? 'مساحة الكتابة الحرة' : 'مسودة الطالب (للاطلاع فقط)'}
                    </p>
                    <p className={`text-xs ${canEdit ? 'text-yellow-700' : 'text-gray-500'}`}>
                        {canEdit 
                            ? 'هنا يمكنك كتابة قصتك، خواطرك، أو واجباتك. لا تنسَ الضغط على حفظ لمشاركتها مع المدرب.'
                            : 'يمكنك قراءة ما يكتبه الطالب هنا. لا يمكنك التعديل على نص الطالب.'
                        }
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {lastSaved && <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle size={12}/> تم الحفظ {lastSaved}</span>}
                    
                    {canEdit ? (
                        <Button onClick={handleSaveDraft} loading={updateBookingDraft.isPending} icon={<Save size={16}/>} disabled={!draft} size="sm">
                            {updateBookingDraft.isPending ? 'جاري الحفظ...' : 'حفظ المسودة'}
                        </Button>
                    ) : (
                        <div className="flex items-center gap-1 text-xs text-gray-400 bg-white px-2 py-1 rounded border">
                            <Lock size={12} />
                            <span>للقراءة فقط</span>
                        </div>
                    )}
                </div>
            </div>

            <Textarea
                placeholder={canEdit ? "ابدأ بكتابة قصتك هنا... أطلق العنان لخيالك!" : "لم يبدأ الطالب الكتابة بعد."}
                className={`flex-grow min-h-[400px] text-lg leading-loose p-6 shadow-inner border-2 transition-all ${
                    canEdit 
                    ? 'bg-white focus:border-primary/50' 
                    : 'bg-gray-50 text-gray-600 cursor-not-allowed border-gray-200'
                }`}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={!canEdit || updateBookingDraft.isPending}
            />
        </div>
    );
};

export default WritingDraftPanel;
