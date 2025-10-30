import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Sparkles, Loader2, AlertTriangle } from 'lucide-react';

interface StoryIdea {
    title: string;
    goal: string;
}

interface StoryIdeasModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectIdea: (idea: StoryIdea) => void;
    childName: string;
    childAge: string;
    childTraits: string;
}

const StoryIdeaCard: React.FC<{ idea: StoryIdea; onSelect: () => void }> = ({ idea, onSelect }) => (
    <div className="p-4 border rounded-lg bg-muted/50 text-right">
        <h4 className="font-bold text-primary">{idea.title}</h4>
        <p className="text-sm text-muted-foreground mt-1">{idea.goal}</p>
        <Button onClick={onSelect} size="sm" variant="outline" className="mt-3">اختر هذه الفكرة</Button>
    </div>
);

const StoryIdeasModal: React.FC<StoryIdeasModalProps> = ({ isOpen, onClose, onSelectIdea, childName, childAge, childTraits }) => {
    const [ideas, setIdeas] = useState<StoryIdea[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateIdeas = async () => {
        if (!childName || !childAge) {
            setError("يرجى إدخال اسم وعمر الطفل أولاً في الخطوة السابقة.");
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setIdeas([]);
        
        const prompt = `
            أنت كاتب قصص أطفال مبدع. استنادًا إلى المعلومات التالية عن طفل، قم بتوليد 3 أفكار فريدة ومناسبة لقصص أطفال باللغة العربية.
            يجب أن يكون لكل فكرة عنوان جذاب وهدف تربوي واضح.
            
            معلومات الطفل:
            - الاسم: ${childName}
            - العمر: ${childAge}
            - صفاته واهتماماته: ${childTraits || 'غير محدد'}
        `;
        
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
            const schema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: 'عنوان القصة المقترح' },
                        goal: { type: Type.STRING, description: 'الهدف التربوي أو القيمة الأخلاقية من القصة' }
                    },
                    required: ['title', 'goal']
                }
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                },
            });
            
            const ideasArray = JSON.parse(response.text);
            if (!Array.isArray(ideasArray)) {
                throw new Error("Invalid response format from API");
            }
            setIdeas(ideasArray);

        } catch (e) {
            console.error("Gemini API error:", e);
            setError('عفواً، حدث خطأ أثناء توليد الأفكار. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="مولّد أفكار القصص بالذكاء الاصطناعي"
            size="2xl"
        >
            <div className="text-center">
                <p className="text-muted-foreground mb-6">
                    هل تحتاج إلى بعض الإلهام؟ بناءً على تفاصيل طفلك، يمكننا اقتراح بعض الأفكار للبدء.
                </p>
                <Button onClick={generateIdeas} loading={isLoading} disabled={isLoading} icon={<Sparkles />}>
                    {isLoading ? 'جاري التوليد...' : 'ولّد لي بعض الأفكار!'}
                </Button>
            </div>
            
            {error && (
                <div className="mt-6 p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-3">
                    <AlertTriangle />
                    <span>{error}</span>
                </div>
            )}
            
            {isLoading && (
                 <div className="mt-8 flex justify-center items-center h-48">
                    <Loader2 className="animate-spin h-12 w-12 text-primary" />
                </div>
            )}

            {ideas.length > 0 && (
                <div className="mt-8 space-y-4">
                    <h3 className="font-bold text-lg text-center">الأفكار المقترحة:</h3>
                    {ideas.map((idea, index) => (
                        <StoryIdeaCard key={index} idea={idea} onSelect={() => onSelectIdea(idea)} />
                    ))}
                </div>
            )}
        </Modal>
    );
};

export default StoryIdeasModal;