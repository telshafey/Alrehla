
import React, { useState } from 'react';
import { Instructor } from '../../../lib/database.types.ts';

interface InstructorSelectionProps {
    instructors: Instructor[];
    onSelect: (instructor: Instructor) => void;
}

const InstructorSelection: React.FC<InstructorSelectionProps> = ({ instructors, onSelect }) => {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const handleSelect = (instructor: Instructor) => {
        setSelectedId(instructor.id);
        onSelect(instructor);
    };

    return (
        <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">اختر المدرب المفضل لديك</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {instructors.map(instructor => (
                    <button
                        key={instructor.id}
                        onClick={() => handleSelect(instructor)}
                        className={`p-4 border-2 rounded-2xl text-center transition-all hover:shadow-lg hover:border-blue-500 ${selectedId === instructor.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}
                    >
                        <img src={instructor.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} alt={instructor.name} className="w-20 h-20 rounded-full mx-auto object-cover mb-3" />
                        <h3 className="font-bold">{instructor.name}</h3>
                        <p className="text-xs text-gray-500">{instructor.specialty}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default InstructorSelection;
