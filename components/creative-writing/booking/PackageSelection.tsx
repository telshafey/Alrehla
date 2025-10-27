import React from 'react';
import type { CreativeWritingPackage } from '../../../lib/database.types';
import { CheckCircle } from 'lucide-react';

interface PackageSelectionProps {
    packages: CreativeWritingPackage[];
    onSelect: (pkg: CreativeWritingPackage) => void;
}

const PackageSelection: React.FC<PackageSelectionProps> = ({ packages, onSelect }) => {
    return (
        <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">اختر الباقة المناسبة لك</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {packages.map(pkg => {
                    const isFree = pkg.price === 0;
                    return (
                        <button
                            key={pkg.id}
                            onClick={() => onSelect(pkg)}
                            className={`p-6 border-2 rounded-2xl text-right transition-all hover:shadow-lg hover:border-blue-500 
                                ${pkg.popular ? 'border-blue-500 bg-blue-50' : (isFree ? 'border-green-500 bg-green-50 hover:border-green-600' : 'border-gray-200 bg-white')}
                            `}
                        >
                            {pkg.popular && <span className="text-xs font-bold bg-blue-500 text-white px-3 py-1 rounded-full mb-2 inline-block">الأكثر شيوعاً</span>}
                             {isFree && <span className="text-xs font-bold bg-green-500 text-white px-3 py-1 rounded-full mb-2 inline-block">ابدأ مجاناً</span>}
                            <h3 className="text-xl font-bold">{pkg.name}</h3>
                            <p className="text-3xl font-extrabold my-3">{isFree ? 'مجانية' : `${pkg.price} ج.م`}</p>
                            <p className="text-sm text-gray-500">{pkg.sessions}</p>
                            <ul className="mt-4 space-y-2 text-sm">
                                {pkg.features.map(feature => (
                                    <li key={feature} className="flex items-center gap-2">
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