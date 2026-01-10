
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Loader2, BookOpen, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import Modal from '../ui/Modal';
import { Card, CardContent } from '../ui/card';
import { useToast } from '../../contexts/ToastContext';

interface AIStoryAssistantProps {
    isOpen: boolean;
    onClose: () => void;
    childName: string;
    childAge: string | number;
    childGender: string;
    childInterests?: string; // Optional context from text fields
    onSelectIdea: (idea: string) => void;
}

const AIStoryAssistant: React.FC<AIStoryAssistantProps> = ({
    isOpen,
    onClose,
    childName,
    childAge,
    childGender,
    childInterests,
    onSelectIdea
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [ideas, setIdeas] = useState<{ title: string; plot: string }[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { addToast } = useToast();

    const generateIdeas = async () => {
        if (!childName) {
            setError("يرجى إدخال اسم الطفل أولاً في النموذج الأساسي.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Initialize Gemini Client
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = `
            Act as a creative children's book author.
            Generate 3 short, unique, and educational story plots for a child with these details:
            - Name: ${childName}
            - Gender: ${childGender}
            - Age: ${childAge} years old
            ${childInterests ? `- Interests/Themes: ${childInterests}` : ''}

            The stories should be engaging, empowering, and suitable for the age.
            
            Return the response strictly in this JSON format:
            [
              { "title": "Arabic Title", "plot": "Arabic Summary (max 30 words)" },
              ...
            ]
            Ensure all text in the JSON values is in Arabic.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-latest', // Using fast model for UI responsiveness
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                }
            });

            const text = response.text;
            if (text) {
                const parsedIdeas = JSON.parse(text);
                setIdeas(parsedIdeas);
            } else {
                throw new Error("No content generated");
            }

        } catch (err: any) {
            console.error("Gemini Error:", err);
            setError("حدث خطأ أثناء توليد الأفكار. تأكد من الاتصال بالإنترنت.");
            addToast("تعذر الاتصال بالمساعد الذكي", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-generate on open if empty
    React.useEffect(() => {
        if (isOpen && ideas.length === 0 && !isLoading && !error && childName) {
            generateIdeas();
        }
    }, [isOpen]);

    const handleSelect = (plot: string) => {
        onSelectIdea(plot);
        onClose();
        addToast("تم اعتماد الفكرة في طلبك!", "success");
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="✨ مساعد الحكايات الذكي"
            size="lg"
            footer={
                <div className="flex justify-between w-full">
                    <Button variant="ghost" onClick={onClose} disabled={isLoading}>إلغاء</Button>
                    <Button variant="outline" onClick={generateIdeas} disabled={isLoading} icon={<RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />}>
                        توليد أفكار جديدة
                    </Button>
                </div>
            }
        >
            <div className="space-y-6">
                {!childName ? (
                    <div className="text-center py-8 text-muted-foreground bg-gray-50 rounded-xl border-2 border-dashed">
                        <AlertCircle className="mx-auto h-10 w-10 mb-2 text-yellow-500" />
                        <p>يرجى كتابة اسم الطفل في النموذج الرئيسي أولاً.</p>
                    </div>
                ) : isLoading ? (
                    <div className="text-center py-12 space-y-4">
                        <div className="relative mx-auto w-16 h-16">
                            <div className="absolute inset-0 bg-purple-100 rounded-full animate-ping"></div>
                            <div className="relative bg-white p-4 rounded-full shadow-lg flex items-center justify-center">
                                <Sparkles className="text-purple-600 animate-pulse" size={32} />
                            </div>
                        </div>
                        <p className="text-purple-700 font-bold animate-pulse">جاري نسج خيوط الحكاية لـ {childName}...</p>
                        <p className="text-xs text-muted-foreground">نستخدم الذكاء الاصطناعي لصناعة أفكار فريدة</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-red-500 bg-red-50 rounded-xl">
                        <p>{error}</p>
                        <Button variant="link" onClick={generateIdeas} className="mt-2 text-red-700 underline">حاول مرة أخرى</Button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        <p className="text-sm text-gray-500 mb-2">إليك بعض الأفكار المقترحة بناءً على ملف {childName}:</p>
                        {ideas.map((idea, idx) => (
                            <Card 
                                key={idx} 
                                className="cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all group relative overflow-hidden"
                                onClick={() => handleSelect(idea.plot)}
                            >
                                <CardContent className="p-4 flex gap-4 items-start">
                                    <div className="bg-purple-100 text-purple-600 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-purple-700">{idea.title}</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">{idea.plot}</p>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 self-center transition-opacity">
                                        <Button size="icon" variant="ghost" className="text-purple-600">
                                            <Check />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default AIStoryAssistant;
