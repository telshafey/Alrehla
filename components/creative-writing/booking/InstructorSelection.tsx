
import React, { useState } from 'react';
import type { Instructor, CreativeWritingPackage } from '../../../lib/database.types';
import { cn } from '../../../lib/utils';
import { calculateCustomerPrice } from '../../../utils/pricingCalculator';

interface InstructorSelectionProps {
    instructors: Instructor[];
    onSelect: (instructor: Instructor) => void;
    selectedPackage: CreativeWritingPackage | null;
    pricingConfig: any;
}

const InstructorSelection: React.FC<InstructorSelectionProps> = ({ instructors, onSelect, selectedPackage, pricingConfig }) => {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const handleSelect = (instructor: Instructor) => {
        setSelectedId(instructor.id);
        onSelect(instructor);
    };

    return (
        <div className="animate-fadeIn">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {instructors.map(instructor => {
                    // حساب السعر الخاص بهذا المدرب لهذه الباقة
                    const netPrice = selectedPackage 
                        ? (instructor.package_rates?.[selectedPackage.id] ?? selectedPackage.price) 
                        : 0;
                    
                    const finalPrice = calculateCustomerPrice(netPrice, pricingConfig);

                    return (
                        <button
                            key={instructor.id}
                            type="button"
                            onClick={() => handleSelect(instructor)}
                            className={cn(
                                'p-4 border-2 rounded-2xl text-center transition-all hover:shadow-lg relative group',
                                 selectedId === instructor.id ? 'border-primary ring-2 ring-primary/30' : 'border-border bg-background hover:border-primary/50'
                            )}
                        >
                            <img src={instructor.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} alt={instructor.name} className="w-20 h-20 rounded-full mx-auto object-cover mb-3"/>
                            <h3 className="font-bold text-foreground">{instructor.name}</h3>
                            <p className="text-xs text-muted-foreground mb-2">{instructor.specialty}</p>
                            
                            {selectedPackage && (
                                <div className="mt-2 pt-2 border-t border-dashed">
                                    <p className="text-xs text-muted-foreground">سعر الباقة:</p>
                                    <p className="font-extrabold text-primary text-lg">
                                        {finalPrice === 0 ? 'مجانية' : `${finalPrice} ج.م`}
                                    </p>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default InstructorSelection;
