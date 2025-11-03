import React, { useState } from 'react';
import type { Instructor } from '../../../lib/database.types';
import { cn } from '../../../lib/utils';

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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {instructors.map(instructor => (
                    <button
                        key={instructor.id}
                        type="button"
                        onClick={() => handleSelect(instructor)}
                        className={cn(
                            'p-4 border-2 rounded-2xl text-center transition-all hover:shadow-lg',
                             selectedId === instructor.id ? 'border-primary ring-2 ring-primary/30' : 'border-border bg-background hover:border-primary/50'
                        )}
                    >
                        <img src={instructor.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} alt={instructor.name} className="w-20 h-20 rounded-full mx-auto object-cover mb-3"/>
                        <h3 className="font-bold text-foreground">{instructor.name}</h3>
                        <p className="text-xs text-muted-foreground">{instructor.specialty}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default InstructorSelection;
