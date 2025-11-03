import React, { useState } from 'react';
import type { CreativeWritingPackage } from '../../../lib/database.types';
import { CheckCircle, Star } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface PackageSelectionProps {
    packages: CreativeWritingPackage[];
    onSelect: (pkg: CreativeWritingPackage) => void;
}

const PackageSelection: React.FC<PackageSelectionProps> = ({ packages, onSelect }) => {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const handleSelect = (pkg: CreativeWritingPackage) => {
        setSelectedId(pkg.id);
        onSelect(pkg);
    };

    return (
        <div className="animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {packages.map(pkg => {
                    const isFree = pkg.price === 0;
                    return (
                        <button
                            key={pkg.id}
                            type="button"
                            onClick={() => handleSelect(pkg)}
                            className={cn(
                                'relative p-6 border-2 rounded-2xl text-right transition-all hover:shadow-lg',
                                selectedId === pkg.id ? 'border-primary ring-2 ring-primary/30' : 'border-border',
                                pkg.popular ? 'bg-primary/5' : (isFree ? 'bg-green-50/50 hover:border-green-400' : 'bg-background hover:border-primary/50')
                            )}
                        >
                            {pkg.popular && <span className="absolute -top-3 right-4 text-xs font-bold bg-primary text-primary-foreground px-3 py-1 rounded-full flex items-center gap-1"><Star size={12} /> الأكثر شيوعاً</span>}
                             {isFree && <span className="absolute -top-3 right-4 text-xs font-bold bg-green-600 text-white px-3 py-1 rounded-full">ابدأ مجاناً</span>}
                            <h3 className="text-xl font-bold text-foreground">{pkg.name}</h3>
                            <p className="text-3xl font-extrabold my-3">{isFree ? 'مجانية' : `${pkg.price} ج.م`}</p>
                            <p className="text-sm text-muted-foreground">{pkg.sessions}</p>
                            <ul className="mt-4 space-y-2 text-sm text-left">
                                {pkg.features.map(feature => (
                                    <li key={feature} className="flex items-center gap-2 text-muted-foreground">
                                        <CheckCircle size={16} className="text-green-500" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export default PackageSelection;
