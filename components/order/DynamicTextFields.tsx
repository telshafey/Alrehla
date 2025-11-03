import React from 'react';
import FormField from '../ui/FormField';
import { Textarea } from '../ui/Textarea';
import { Input } from '../ui/Input';
import type { TextFieldConfig } from '../../lib/database.types';

const DynamicTextFields: React.FC<{
    fields: TextFieldConfig[];
    formData: { [key: string]: any };
    errors: { [key: string]: string };
    handleChange: (e: any) => void;
}> = ({ fields, formData, errors, handleChange }) => (
    <div className="space-y-6">
        {fields.map(field => (
            <FormField key={field.id} label={field.label} htmlFor={field.id} error={errors[field.id]}>
                {field.type === 'textarea' ? (
                    <Textarea id={field.id} name={field.id} value={formData[field.id] || ''} onChange={handleChange} rows={4} placeholder={field.placeholder} required={field.required} />
                ) : (
                    <Input id={field.id} name={field.id} value={formData[field.id] || ''} onChange={handleChange} placeholder={field.placeholder} required={field.required} />
                )}
            </FormField>
        ))}
    </div>
);

export default React.memo(DynamicTextFields);