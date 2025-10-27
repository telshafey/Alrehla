import React from 'react';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface ChildDetailsSectionProps {
    formData: {
        childName: string;
        childAge: string;
        childGender: 'ذكر' | 'أنثى';
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const ChildDetailsSection: React.FC<ChildDetailsSectionProps> = ({ formData, handleChange }) => {
    return (
        <div>
            <h3 className="text-lg font-bold text-gray-700 mb-4">تفاصيل الطفل الأساسية</h3>
            <div className="p-4 bg-gray-50 rounded-lg border grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="اسم الطفل*" htmlFor="childName">
                    <Input type="text" id="childName" name="childName" value={formData.childName} onChange={handleChange} required />
                </FormField>
                <FormField label="العمر*" htmlFor="childAge">
                    <Input type="number" id="childAge" name="childAge" value={formData.childAge} onChange={handleChange} required />
                </FormField>
                <FormField label="الجنس*" htmlFor="childGender" className="md:col-span-2">
                    <Select id="childGender" name="childGender" value={formData.childGender} onChange={handleChange}>
                        <option value="ذكر">ذكر</option>
                        <option value="أنثى">أنثى</option>
                    </Select>
                </FormField>
            </div>
        </div>
    );
};

export default ChildDetailsSection;