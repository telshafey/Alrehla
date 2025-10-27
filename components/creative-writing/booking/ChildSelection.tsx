import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ChildProfile } from '../../../lib/database.types';

interface ChildSelectionProps {
    childProfiles: ChildProfile[];
    onSelect: (child: ChildProfile) => void;
}

const ChildSelection: React.FC<ChildSelectionProps> = ({ childProfiles, onSelect }) => {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const handleSelect = (child: ChildProfile) => {
        setSelectedId(child.id);
        onSelect(child);
    };

    if (childProfiles.length === 0) {
        return (
            <div className="text-center p-8 bg-yellow-50 border-l-4 border-yellow-400">
                <h3 className="text-xl font-bold text-yellow-800">لا يوجد أطفال في ملفك!</h3>
                <p className="text-yellow-700 mt-2">يجب إضافة ملف طفل أولاً لتتمكن من إكمال الحجز.</p>
                <Link to="/account" state={{ defaultTab: 'family' }} className="mt-4 inline-block text-sm font-semibold text-yellow-900 underline">
                    اذهب للمركز العائلي لإضافة طفل
                </Link>
            </div>
        );
    }
    
    return (
        <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">لمن هذا الحجز؟</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {childProfiles.map(child => (
                    <button
                        key={child.id}
                        onClick={() => handleSelect(child)}
                        className={`p-4 border-2 rounded-2xl text-center transition-all hover:shadow-lg hover:border-blue-500 ${selectedId === child.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}
                    >
                        <img src={child.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} alt={child.name} className="w-20 h-20 rounded-full mx-auto object-cover mb-3" />
                        <h3 className="font-bold">{child.name}</h3>
                        <p className="text-xs text-gray-500">{child.age} سنوات</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ChildSelection;