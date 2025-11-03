import React from 'react';
import FormField from '../ui/FormField';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import type { TextFieldConfig, StoryGoal, GoalConfig } from '../../lib/database.types';
import DynamicTextFields from './DynamicTextFields';

interface StoryCustomizationSectionProps {
    formData: { [key: string]: any };
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    errors: { [key: string]: string };
    textFields: TextFieldConfig[] | null;
    goalConfig: GoalConfig;
    storyGoals: StoryGoal[];
}

const StoryCustomizationSection: React.FC<StoryCustomizationSectionProps> = React.memo(({
    formData,
    handleChange,
    errors,
    textFields,
    goalConfig,
    storyGoals,
}) => {
    const showPredefinedGoals = goalConfig === 'predefined' || goalConfig === 'predefined_and_custom';
    const showCustomGoal = goalConfig === 'custom' || goalConfig === 'predefined_and_custom';
    
    return (
        <div className="space-y-8">
            {textFields && textFields.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg border">
                    <h4 className="text-xl font-bold text-gray-700 mb-4">تفاصيل القصة</h4>
                    <DynamicTextFields fields={textFields} formData={formData} errors={errors} handleChange={handleChange} />
                </div>
            )}

            {goalConfig !== 'none' && (
                <div className="p-4 bg-gray-50 rounded-lg border">
                    <FormField label="الهدف من القصة*" htmlFor="storyValue" error={errors.storyValue}>
                        <Select id="storyValue" name="storyValue" value={formData.storyValue || ''} onChange={handleChange} required>
                            <option value="" disabled>-- اختر هدفًا --</option>
                            {showPredefinedGoals && storyGoals.map(goal => (
                                <option key={goal.key} value={goal.key}>{goal.title}</option>
                            ))}
                            {showCustomGoal && <option value="custom">هدف آخر (مخصص)</option>}
                        </Select>
                    </FormField>

                    {showCustomGoal && formData.storyValue === 'custom' && (
                        <FormField label="الهدف المخصص*" htmlFor="customGoal" error={errors.customGoal} className="mt-4">
                            <Textarea id="customGoal" name="customGoal" value={formData.customGoal || ''} onChange={handleChange} rows={3} placeholder="اكتب الهدف الذي تريد التركيز عليه في القصة..." required />
                        </FormField>
                    )}
                </div>
            )}
        </div>
    );
});
StoryCustomizationSection.displayName = "StoryCustomizationSection";

export default StoryCustomizationSection;