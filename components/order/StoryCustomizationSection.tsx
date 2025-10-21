import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import Accordion from '../ui/Accordion.tsx';

const storyGoals = [
    { key: 'respect', title: 'الاستئذان والاحترام' },
    { key: 'cooperation', title: 'التعاون والمشاركة' },
    { key: 'honesty', title: 'الصدق والأمانة' },
    { key: 'cleanliness', title: 'النظافة والترتيب' },
    { key: 'time_management', title: 'تنظيم الوقت' },
    { key: 'emotion_management', title: 'إدارة العواطف' },
    { key: 'problem_solving', title: 'حل المشكلات' },
    { key: 'creative_thinking', title: 'التفكير الإبداعي' },
];

interface StoryCustomizationSectionProps {
    formData: {
        childTraits: string;
        storyValue: string;
        customGoal: string;
        familyNames: string;
        friendNames: string;
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onGenerateIdeas: () => void;
    isGeneratingIdeas: boolean;
}

const StoryCustomizationSection: React.FC<StoryCustomizationSectionProps> = ({ formData, handleChange, onGenerateIdeas, isGeneratingIdeas }) => {
    return (
        <Accordion title="تفاصيل تخصيص القصة">
            <div className="p-6 space-y-6">
                <div>
                    <label htmlFor="childTraits" className="block text-sm font-bold text-gray-700 mb-2">أخبرنا عن طفلك</label>
                    <textarea id="childTraits" name="childTraits" value={formData.childTraits} onChange={handleChange} rows={4} className="w-full p-2 border rounded-lg" placeholder="مثال: شجاع، يحب الديناصورات، خياله واسع، يحب مساعدة والدته..."></textarea>
                    <p className="text-xs text-gray-500 mt-1">هذا الوصف يساعدنا على كتابة قصة فريدة من نوعها.</p>
                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={onGenerateIdeas}
                            disabled={isGeneratingIdeas}
                            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2 border border-purple-600 text-purple-600 font-semibold rounded-full hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-wait"
                        >
                            {isGeneratingIdeas ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <Sparkles size={18} />
                            )}
                            <span>{isGeneratingIdeas ? 'جاري التفكير...' : 'اقترح لي أفكاراً بالذكاء الاصطناعي'}</span>
                        </button>
                    </div>
                </div>
                <div>
                    <label htmlFor="familyNames" className="block text-sm font-bold text-gray-700 mb-2">أسماء أفراد العائلة (اختياري)</label>
                    <textarea id="familyNames" name="familyNames" value={formData.familyNames} onChange={handleChange} rows={2} className="w-full p-2 border rounded-lg" placeholder="مثال: الأم: فاطمة، الأب: علي"></textarea>
                    <p className="text-xs text-gray-500 mt-1">يمكنك ذكر أسماء أفراد العائلة ليتم إدراجهم في القصة.</p>
                </div>
                <div>
                    <label htmlFor="friendNames" className="block text-sm font-bold text-gray-700 mb-2">أسماء الأصدقاء (اختياري)</label>
                    <textarea id="friendNames" name="friendNames" value={formData.friendNames} onChange={handleChange} rows={2} className="w-full p-2 border rounded-lg" placeholder="مثال: صديقه المقرب: خالد"></textarea>
                    <p className="text-xs text-gray-500 mt-1">يمكنك ذكر أسماء الأصدقاء ليتم إدراجهم في القصة.</p>
                </div>
                <div>
                    <label htmlFor="storyValue" className="block text-sm font-bold text-gray-700 mb-2">اختر القيمة أو المهارة التي تركز عليها القصة</label>
                    <select id="storyValue" name="storyValue" value={formData.storyValue} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white">
                        <option value="">-- اختر قيمة --</option>
                        {storyGoals.map(goal => <option key={goal.key} value={goal.key}>{goal.title}</option>)}
                        <option value="custom">هدف آخر (أذكره بالأسفل)</option>
                    </select>
                </div>
                {formData.storyValue === 'custom' && (
                    <div>
                        <label htmlFor="customGoal" className="block text-sm font-bold text-gray-700 mb-2">الهدف المخصص</label>
                        <input type="text" id="customGoal" name="customGoal" value={formData.customGoal} onChange={handleChange} className="w-full p-2 border rounded-lg" placeholder="اكتب الهدف الذي تريده هنا" />
                    </div>
                )}
            </div>
        </Accordion>
    );
};

export default StoryCustomizationSection;