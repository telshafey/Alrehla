import React from 'react';
import FormField from '../ui/FormField';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import type { TextFieldConfig, GoalConfig, StoryGoal } from '../../lib/database.types';

interface StoryCustomizationSectionProps {
    formData: { [key: string]: any };
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    errors: { [key: string]: string };
    textFields: TextFieldConfig[] | null;
    goalConfig: GoalConfig;
    storyGoals: StoryGoal[];
}

const StoryCustomizationSection: React.FC<StoryCustomizationSectionProps> = ({
    formData,
    handleChange,
    errors,
    textFields,
    goalConfig,
    storyGoals,
}) => {
    
    const showGoalSelector = goalConfig === 'predefined' || goalConfig === 'predefined_and_custom';
    const allowCustomGoal = goalConfig === 'custom' || goalConfig === 'predefined_and_custom';

    return (
        <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">تخصيص القصة</h3>
            <div className="space-y-6">
                {(textFields || []).map(field => (
                     <FormField key={field.id} label={field.label} htmlFor={field.id} error={errors[field.id]}>
                        {field.type === 'textarea' ? (
                            <Textarea
                                id={field.id}
                                name={field.id}
                                value={formData[field.id] || ''}
                                onChange={handleChange}
                                rows={4}
                                placeholder={field.placeholder}
                                className={errors[field.id] ? 'border-red-500' : ''}
                                required={field.required}
                            />
                        ) : (
                             <Input
                                id={field.id}
                                name={field.id}
                                value={formData[field.id] || ''}
                                onChange={handleChange}
                                placeholder={field.placeholder}
                                className={errors[field.id] ? 'border-red-500' : ''}
                                required={field.required}
                            />
                        )}
                    </FormField>
                ))}
                
                {goalConfig !== 'none' && (
                     <div className="space-y-2">
                        <label htmlFor="storyValue" className="block text-sm font-bold text-gray-700 mb-2">اختر الهدف من القصة*</label>
                        {showGoalSelector && (
                            <Select id="storyValue" name="storyValue" value={formData.storyValue} onChange={handleChange} required className={errors.storyValue ? 'border-red-500' : ''}>
                                <option value="">-- اختر قيمة --</option>
                                {storyGoals.map(goal => (
                                    <option key={goal.key} value={goal.key}>{goal.title}</option>
                                ))}
                                {allowCustomGoal && <option value="custom">هدف آخر (أكتبه بنفسي)</option>}
                            </Select>
                        )}
                        {errors.storyValue && <p className="mt-2 text-sm text-red-600">{errors.storyValue}</p>}
                    </div>
                )}
               
                {allowCustomGoal && formData.storyValue === 'custom' && (
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
            </div>
        </div>
    );
};

export default StoryCustomizationSection;