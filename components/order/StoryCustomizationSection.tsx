import React from 'react';
import { Sparkles } from 'lucide-react';
import Accordion from '../ui/Accordion';
import { Button } from '../ui/Button';
import FormField from '../ui/FormField';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';

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
                <FormField label="أخبرنا عن طفلك" htmlFor="childTraits">
                    <Textarea id="childTraits" name="childTraits" value={formData.childTraits} onChange={handleChange} rows={4} placeholder="مثال: شجاع، يحب الديناصورات، خياله واسع، يحب مساعدة والدته..."/>
                    <p className="text-xs text-gray-500 mt-1">هذا الوصف يساعدنا على كتابة قصة فريدة من نوعها.</p>
                </FormField>
                <div className="mt-4">
                    <Button
                        type="button"
                        onClick={onGenerateIdeas}
                        loading={isGeneratingIdeas}
                        variant="outline"
                        icon={<Sparkles size={18} />}
                        className="border-purple-600 text-purple-600 hover:bg-purple-50 w-full sm:w-auto"
                    >
                        {isGeneratingIdeas ? 'جاري التفكير...' : 'اقترح لي أفكاراً بالذكاء الاصطناعي'}
                    </Button>
                </div>
                <FormField label="أسماء أفراد العائلة (اختياري)" htmlFor="familyNames">
                    <Textarea id="familyNames" name="familyNames" value={formData.familyNames} onChange={handleChange} rows={2} placeholder="مثال: الأم: فاطمة، الأب: علي" />
                    <p className="text-xs text-gray-500 mt-1">يمكنك ذكر أسماء أفراد العائلة ليتم إدراجهم في القصة.</p>
                </FormField>
                <FormField label="أسماء الأصدقاء (اختياري)" htmlFor="friendNames">
                    <Textarea id="friendNames" name="friendNames" value={formData.friendNames} onChange={handleChange} rows={2} placeholder="مثال: صديقه المقرب: خالد" />
                    <p className="text-xs text-gray-500 mt-1">يمكنك ذكر أسماء الأصدقاء ليتم إدراجهم في القصة.</p>
                </FormField>
                <FormField label="اختر القيمة أو المهارة التي تركز عليها القصة" htmlFor="storyValue">
                    <Select id="storyValue" name="storyValue" value={formData.storyValue} onChange={handleChange}>
                        <option value="">-- اختر قيمة --</option>
                        {storyGoals.map(goal => <option key={goal.key} value={goal.key}>{goal.title}</option>)}
                        <option value="custom">هدف آخر (أذكره بالأسفل)</option>
                    </Select>
                </FormField>
                {formData.storyValue === 'custom' && (
                    <FormField label="الهدف المخصص" htmlFor="customGoal">
                        <Input type="text" id="customGoal" name="customGoal" value={formData.customGoal} onChange={handleChange} placeholder="اكتب الهدف الذي تريده هنا" />
                    </FormField>
                )}
            </div>
        </Accordion>
    );
};

export default StoryCustomizationSection;