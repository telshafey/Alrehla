import React from 'react';
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
        familyNames: string;
        friendNames: string;
        storyValue: string;
        customGoal: string;
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const StoryCustomizationSection: React.FC<StoryCustomizationSectionProps> = ({
    formData,
    handleChange,
}) => {
    return (
        <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">تخصيص القصة</h3>
            <div className="space-y-6">
                <FormField label="أخبرنا عن طفلك" htmlFor="childTraits">
                    <Textarea
                        id="childTraits"
                        name="childTraits"
                        value={formData.childTraits}
                        onChange={handleChange}
                        rows={4}
                        placeholder="مثال: شجاع، يحب الديناصورات واللون الأزرق، ويخاف قليلاً من الظلام."
                    />
                </FormField>

                <FormField label="اختر الهدف التربوي من القصة*" htmlFor="storyValue">
                    <Select id="storyValue" name="storyValue" value={formData.storyValue} onChange={handleChange} required>
                        <option value="">-- اختر قيمة --</option>
                        {storyGoals.map(goal => (
                            <option key={goal.key} value={goal.key}>{goal.title}</option>
                        ))}
                        <option value="custom">هدف آخر (أكتبه بنفسي)</option>
                    </Select>
                </FormField>

                {formData.storyValue === 'custom' && (
                    <FormField label="اكتب الهدف التربوي المخصص" htmlFor="customGoal">
                        <Input
                            type="text"
                            id="customGoal"
                            name="customGoal"
                            value={formData.customGoal}
                            onChange={handleChange}
                            placeholder="مثال: تعلم أهمية مساعدة كبار السن"
                        />
                    </FormField>
                )}
                
                 <FormField label="أسماء أفراد العائلة (اختياري)" htmlFor="familyNames">
                    <Textarea id="familyNames" name="familyNames" value={formData.familyNames} onChange={handleChange} rows={2} placeholder="مثال: الأم: فاطمة، الأب: علي"/>
                </FormField>
                <FormField label="أسماء الأصدقاء (اختياري)" htmlFor="friendNames">
                    <Textarea id="friendNames" name="friendNames" value={formData.friendNames} onChange={handleChange} rows={2} placeholder="مثال: صديقه المقرب: خالد"/>
                </FormField>
            </div>
        </div>
    );
};

export default StoryCustomizationSection;