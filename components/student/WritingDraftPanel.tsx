import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Save, Sparkles, Wand2, Forward, AlertCircle, Loader2 } from 'lucide-react';
import { useBookingMutations } from '../../hooks/mutations/useBookingMutations';
import { Card, CardContent } from '../ui/card';

interface WritingDraftPanelProps {
    journeyId: string;
    canInteract: boolean;
}

const AiToolButton: React.FC<{ onClick: () => void; icon: React.ReactNode; label: string; disabled?: boolean }> = ({ onClick, icon, label, disabled }) => (
    <Button variant="outline" size="sm" onClick={onClick} disabled={disabled} className="flex-1 min-w-[120px]">
        {icon}
        <span className="mr-2">{label}</span>
    </Button>
);

const WritingDraftPanel: React.FC<WritingDraftPanelProps> = ({ journeyId, canInteract }) => {
    const { updateBookingDraft } = useBookingMutations();
    const [draft, setDraft] = useState('');
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const handleSaveDraft = async () => {
        await updateBookingDraft.mutateAsync({ bookingId: journeyId, draft });
    };

    const handleAiAction = async (actionType: 'improve' | 'continue' | 'ideas') => {
        setIsLoadingAi(true);
        setAiSuggestion(null);
        setAiError(null);
        
        const selection = textAreaRef.current ? textAreaRef.current.value.substring(textAreaRef.current.selectionStart, textAreaRef.current.selectionEnd) : '';
        
        let prompt = '';
        switch(actionType) {
            case 'improve':
                if (!selection) {
                    setAiError('يرجى تحديد جزء من النص لتحسينه.');
                    setIsLoadingAi(false);
                    return;
                }
                prompt = `أنت محرر خبير في أدب الأطفال. قم بإعادة صياغة النص التالي باللغة العربية لجعله أكثر بلاغة وتأثيراً مع الحفاظ على الفكرة الأصلية:\n\n"${selection}"`;
                break;
            case 'continue':
                 if (!draft) {
                    setAiError('يرجى كتابة جزء من القصة أولاً.');
                    setIsLoadingAi(false);
                    return;
                }
                prompt = `أنت كاتب قصص أطفال مبدع. أكمل الفقرة التالية من القصة باللغة العربية بطريقة مشوقة:\n\n"${draft}"`;
                break;
            case 'ideas':
                prompt = `أنا أكتب قصة أطفال ولكني عالق. بناءً على النص التالي، اقترح 3 أفكار أو نقاط حبكة محتملة لإكمال القصة باللغة العربية:\n\n"${draft || 'قصة عن طفل شجاع يكتشف جزيرة سحرية.'}"`;
                break;
        }

        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setAiSuggestion(response.text);
        } catch (e) {
            console.error("Gemini API Error:", e);
            setAiError('عفواً، حدث خطأ أثناء التواصل مع مساعد الذكاء الاصطناعي.');
        } finally {
            setIsLoadingAi(false);
        }
    };
    
    const applySuggestion = () => {
        if (!aiSuggestion || !textAreaRef.current) return;
         const selectionStart = textAreaRef.current.selectionStart;
        const selectionEnd = textAreaRef.current.selectionEnd;

        // If text was selected (improve action), replace it. Otherwise, append.
        if (selectionEnd > selectionStart) {
            const newText = draft.substring(0, selectionStart) + aiSuggestion + draft.substring(selectionEnd);
            setDraft(newText);
        } else {
            setDraft(prev => `${prev}\n\n${aiSuggestion}`);
        }
        setAiSuggestion(null);
    }

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

            {canInteract && (
                <Card>
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Sparkles className="text-primary"/> مساعد الكتابة الذكي</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            <AiToolButton onClick={() => handleAiAction('improve')} icon={<Wand2 size={16}/>} label="حسّن النص المحدد" disabled={isLoadingAi} />
                            <AiToolButton onClick={() => handleAiAction('continue')} icon={<Forward size={16}/>} label="أكمل القصة" disabled={isLoadingAi} />
                            <AiToolButton onClick={() => handleAiAction('ideas')} icon={<Sparkles size={16}/>} label="اقترح أفكار" disabled={isLoadingAi} />
                        </div>
                        {aiError && (
                            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg flex items-center gap-2">
                                <AlertCircle size={16}/> {aiError}
                            </div>
                        )}
                         {isLoadingAi && (
                            <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground">
                                <Loader2 className="animate-spin" />
                                <span>جاري التفكير...</span>
                            </div>
                        )}
                        {aiSuggestion && (
                            <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg animate-fadeIn">
                                <h4 className="font-semibold text-primary mb-2">اقتراح المساعد:</h4>
                                <p className="text-sm whitespace-pre-wrap">{aiSuggestion}</p>
                                <div className="flex gap-2 mt-4">
                                    <Button size="sm" onClick={applySuggestion}>تطبيق الاقتراح</Button>
                                    <Button size="sm" variant="ghost" onClick={() => setAiSuggestion(null)}>تجاهل</Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default WritingDraftPanel;