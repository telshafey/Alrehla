import React from 'react';
import { Check } from 'lucide-react';
import type { PersonalizedProduct } from '../../lib/database.types.ts';
import type { Prices } from '../../contexts/ProductContext.tsx';
import Accordion from '../ui/Accordion.tsx';

const getPrice = (key: string, prices: Prices | null): number | null => {
    if (!prices) return null;
    const camelKey = key.replace(/_(\w)/g, (_, c) => c.toUpperCase()) as keyof Prices;
    if (key === 'custom_story') return prices.story.printed;
    return (prices as any)[camelKey] || null;
};

interface AddonsSectionProps {
    addonProducts: PersonalizedProduct[];
    selectedAddons: string[];
    onToggle: (key: string) => void;
    prices: Prices | null;
}

const AddonsSection: React.FC<AddonsSectionProps> = ({ addonProducts, selectedAddons, onToggle, prices }) => {
    if (addonProducts.length === 0) return null;

    return (
        <Accordion title="أضف كنوزاً إضافية لطلبك">
            <div className="p-6 space-y-4">
                {addonProducts.map(product => {
                    const isSelected = selectedAddons.includes(product.key);
                    const price = getPrice(product.key, prices);
                    return (
                        <div 
                            key={product.key} 
                            onClick={() => onToggle(product.key)} 
                            className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                        >
                            <div className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full border-2 ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                {isSelected && <Check size={16} className="text-white" />}
                            </div>
                            <img src={product.image_url || ''} alt={product.title} className="w-12 h-12 rounded-md object-cover" />
                            <div className="flex-grow">
                                <h4 className="font-bold text-gray-800">{product.title}</h4>
                                <p className="text-sm text-gray-500">{product.description}</p>
                            </div>
                            {price && <span className="font-bold text-lg text-blue-600">{price} ج.م</span>}
                        </div>
                    );
                })}
            </div>
        </Accordion>
    );
};

export default AddonsSection;