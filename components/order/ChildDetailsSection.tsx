import React from 'react';

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
                <div>
                    <label htmlFor="childName" className="block text-sm font-bold text-gray-700 mb-2">اسم الطفل*</label>
                    <input type="text" id="childName" name="childName" value={formData.childName} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                </div>
                <div>
                    <label htmlFor="childAge" className="block text-sm font-bold text-gray-700 mb-2">العمر*</label>
                    <input type="number" id="childAge" name="childAge" value={formData.childAge} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="childGender" className="block text-sm font-bold text-gray-700 mb-2">الجنس*</label>
                    <select id="childGender" name="childGender" value={formData.childGender} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white">
                        <option value="ذكر">ذكر</option>
                        <option value="أنثى">أنثى</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default ChildDetailsSection;
