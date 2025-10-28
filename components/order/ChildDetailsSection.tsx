import React, { useState } from 'react';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import type { ChildProfile } from '../../lib/database.types';
import { UserPlus } from 'lucide-react';

interface ChildDetailsSectionProps {
    formData: {
        childName: string;
        childAge: string;
        childGender: 'ذكر' | 'أنثى';
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    errors: {
        childName?: string;
        childAge?: string;
    };
    childProfiles: ChildProfile[];
    onSelectChild: (child: ChildProfile | null) => void;
    selectedChildId: number | null;
}

const ChildDetailsSection: React.FC<ChildDetailsSectionProps> = ({ formData, handleChange, errors, childProfiles, onSelectChild, selectedChildId }) => {
    
    const [isManual, setIsManual] = useState(childProfiles.length === 0);

    const handleSelect = (child: ChildProfile) => {
        onSelectChild(child);
        setIsManual(false); 
    }

    const handleManualEntry = () => {
        onSelectChild(null); // Clear selections
        setIsManual(true);
    }
    
    return (
        <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">لمن هذا الطلب؟</h3>
            {childProfiles.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    {childProfiles.map(child => (
                        <button 
                            type="button"
                            key={child.id} 
                            onClick={() => handleSelect(child)} 
                            className={`p-4 border-2 rounded-2xl text-center transition-all flex flex-col items-center gap-2 hover:shadow-md hover:border-blue-400 ${selectedChildId === child.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                        >
                            <img src={child.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} alt={child.name} className="w-16 h-16 rounded-full object-cover"/>
                            <span className="font-bold text-gray-800 text-sm">{child.name}</span>
                        </button>
                    ))}
                     <button 
                        type="button"
                        onClick={handleManualEntry} 
                        className={`p-4 border-2 rounded-2xl text-center transition-all flex flex-col items-center justify-center gap-2 hover:shadow-md hover:border-blue-400 ${isManual && !selectedChildId ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                    >
                        <UserPlus className="w-10 h-10 text-gray-400"/>
                        <span className="font-bold text-gray-800 text-sm">طفل آخر / هدية</span>
                     </button>
                </div>
            )}

            {(isManual || childProfiles.length === 0) && (
                <div className="p-4 bg-gray-50 rounded-lg border grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                    <FormField label="اسم الطفل*" htmlFor="childName" error={errors.childName}>
                        <Input type="text" id="childName" name="childName" value={formData.childName} onChange={handleChange} required className={errors.childName ? 'border-red-500' : ''}/>
                    </FormField>
                    <FormField label="العمر*" htmlFor="childAge" error={errors.childAge}>
                        <Input type="number" id="childAge" name="childAge" value={formData.childAge} onChange={handleChange} required className={errors.childAge ? 'border-red-500' : ''} />
                    </FormField>
                    <FormField label="الجنس*" htmlFor="childGender" className="md:col-span-2">
                        <Select id="childGender" name="childGender" value={formData.childGender} onChange={handleChange}>
                            <option value="ذكر">ذكر</option>
                            <option value="أنثى">أنثى</option>
                        </Select>
                    </FormField>
                </div>
            )}
        </div>
    );
};

export default ChildDetailsSection;