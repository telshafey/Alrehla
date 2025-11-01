import React, { useState, useRef } from 'react';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Save } from 'lucide-react';
import { useBookingMutations } from '../../hooks/mutations/useBookingMutations';

interface WritingDraftPanelProps {
    journeyId: string;
    canInteract: boolean;
}

const WritingDraftPanel: React.FC<WritingDraftPanelProps> = ({ journeyId, canInteract }) => {
    const { updateBookingDraft } = useBookingMutations();
    const [draft, setDraft] = useState('');
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const handleSaveDraft = async () => {
        await updateBookingDraft.mutateAsync({ bookingId: journeyId, draft });
    };

    return (
        <div className="space-y-4 h-full">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <p className="text-sm text-muted-foreground">هنا يمكنك كتابة مسودات قصتك ومشاركتها مع مدربك.</p>
                {canInteract && (
                    <Button onClick={handleSaveDraft} loading={updateBookingDraft.isPending} icon={<Save size={16}/>} disabled={!draft}>
                        {updateBookingDraft.isPending ? 'جاري الحفظ...' : 'حفظ المسودة'}
                    </Button>
                )}
            </div>

            <Textarea
                ref={textAreaRef}
                placeholder="ابدأ بكتابة قصتك هنا..."
                className="min-h-[300px] text-base leading-relaxed"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={!canInteract || updateBookingDraft.isPending}
            />
        </div>
    );
};

export default WritingDraftPanel;