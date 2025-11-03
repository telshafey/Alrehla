import React, { useState, useEffect } from 'react';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import type { ChildProfile, UserProfile } from '../../lib/database.types';
import { UserPlus, User as UserIcon } from 'lucide-react';
import { Button } from '../ui/Button';

interface ChildDetailsSectionProps {
    formData: {
        childName: string;
        childBirthDate: string;
        childGender: 'ذكر' | 'أنثى' | '';
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    errors: {
        childName?: string;
        childBirthDate?: string;
        childGender?: string;
    };
    childProfiles: ChildProfile[];
    onSelectChild: (child: ChildProfile | null) => void;
    selectedChildId: number | null;
    onSelectSelf: () => void;
    currentUser: UserProfile | null;
    onAddChild: () => void;
}

const ChildDetailsSection: React.FC<ChildDetailsSectionProps> = React.memo(({ 
    formData, 
    handleChange, 
    errors, 
    childProfiles, 
    onSelectChild, 
    selectedChildId, 
    onSelectSelf,
    currentUser,
    onAddChild
}) => {
    
    type SelectionMode = 'profile' | 'self' | 'manual';
    
    const [mode, setMode] = useState<SelectionMode>(() => {
        if (childProfiles.length > 0) return 'profile';
        return 'manual';
    });

    useEffect(() => {
        if (mode === 'profile' && childProfiles.length > 0 && !selectedChildId) {
            onSelectChild(childProfiles[0]);
        }
    }, [mode, childProfiles, selectedChildId, onSelectChild]);

    const handleProfileSelect = (child: ChildProfile) => {
        setMode('profile');
        onSelectChild(child);
    }

    const handleSelfSelect = () => {
        setMode('self');
        onSelectSelf();
    }

    const handleManualSelect = () => {
        setMode('manual');
        onSelectChild(null);
    }
    
    const hasMultipleOptions = childProfiles.length > 0;

    return (
        <div>
            {hasMultipleOptions && (
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {childProfiles.map(child => (
                        <button 
                            type="button"
                            key={child.id} 
                            onClick={() => handleProfileSelect(child)} 
                            className={`p-4 border-2 rounded-2xl text-center transition-all flex flex-col items-center gap-2 hover:shadow-md hover:border-blue-400 ${mode === 'profile' && selectedChildId === child.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                        >
                            <img src={child.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} alt={child.name} className="w-16 h-16 rounded-full object-cover"/>
                            <span className="font-bold text-gray-800 text-sm">{child.name}</span>
                        </button>
                    ))}
                     <button 
                        type="button"
                        onClick={handleSelfSelect} 
                        className={`p-4 border-2 rounded-2xl text-center transition-all flex flex-col items-center justify-center gap-2 hover:shadow-md hover:border-blue-400 ${mode === 'self' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                    >
                        <UserIcon className="w-10 h-10 text-gray-400"/>
                        <span className="font-bold text-gray-800 text-sm">لي شخصيًا</span>
                     </button>
                     <button 
                        type="button"
                        onClick={handleManualSelect} 
                        className={`p-4 border-2 rounded-2xl text-center transition-all flex flex-col items-center justify-center gap-2 hover:shadow-md hover:border-blue-400 ${mode === 'manual' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                    >
                        <UserPlus className="w-10 h-10 text-gray-400"/>
                        <span className="font-bold text-gray-800 text-sm">طفل آخر / هدية</span>
                     </button>
                </div>
            )}

            {(mode === 'manual' || mode === 'self' || childProfiles.length === 0) && (
                <div className="p-4 bg-gray-50 rounded-lg border grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                    <FormField label="الاسم*" htmlFor="childName" error={errors.childName}>
                        <Input type="text" id="childName" name="childName" value={formData.childName} onChange={handleChange} required aria-invalid={!!errors.childName} disabled={mode === 'self'} />
                    </FormField>
                    <FormField label="تاريخ الميلاد*" htmlFor="childBirthDate" error={errors.childBirthDate}>
                        <Input type="date" id="childBirthDate" name="childBirthDate" value={formData.childBirthDate} onChange={handleChange} required aria-invalid={!!errors.childBirthDate} />
                    </FormField>
                    <FormField label="الجنس*" htmlFor="childGender" className="md:col-span-2" error={errors.childGender}>
                        <Select id="childGender" name="childGender" value={formData.childGender} onChange={handleChange} required aria-invalid={!!errors.childGender}>
                            <option value="" disabled>-- اختر الجنس --</option>
                            <option value="ذكر">ذكر</option>
                            <option value="أنثى">أنثى</option>
                        </Select>
                    </FormField>
                </div>
            )}

             <div className="mt-6 text-center">
                <Button variant="link" onClick={onAddChild} icon={<UserPlus size={16}/>}>
                    إضافة طفل جديد للملف العائلي
                </Button>
            </div>
        </div>
    );
});
ChildDetailsSection.displayName = "ChildDetailsSection";

export default ChildDetailsSection;