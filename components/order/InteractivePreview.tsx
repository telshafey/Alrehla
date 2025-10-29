import React from 'react';
import { Package, User, Palette, Sparkles, Image as ImageIcon } from 'lucide-react';
import type { PersonalizedProduct } from '../../lib/database.types';

interface StoryGoal {
  key: string;
  title: string;
}

interface InteractivePreviewProps {
    formData: {
        childName: string;
        childTraits: string;
        storyValue: string;
        customGoal: string;
    };
    product: PersonalizedProduct | null;
    basePrice: number;
    addons: { key: string; title: string; price: number }[];
    totalPrice: number;
    imagePreviewUrl: string | null;
    storyGoals: StoryGoal[];
}

const InteractivePreview: React.FC<InteractivePreviewProps> = ({ formData, product, basePrice, addons, totalPrice, imagePreviewUrl, storyGoals }) => {
    const { childName, childTraits, storyValue, customGoal } = formData;
    
    if (!product) {
        return null; 
    }

    const showFullCustomization = product.key === 'custom_story' || product.key === 'gift_box';
    
    const getGoalTitle = () => {
        if (product.goal_config !== 'none') {
            return storyValue === 'custom' ? customGoal : (storyGoals || []).find(v => v.key === storyValue)?.title;
        }
        return null;
    };

    const goalTitle = getGoalTitle();
    const goalIcon = <Sparkles size={18}/>;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-100 flex items-center gap-3">
                <Package className="text-blue-500" />
                ملخص الطلب
            </h2>

            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <User size={18} />
                        بطل القصة
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center gap-3">
                         <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                            {imagePreviewUrl ? (
                                <img src={imagePreviewUrl} alt="Preview" className="h-full w-full object-cover" />
                            ) : (
                                <ImageIcon className="text-gray-400" size={40} />
                            )}
                        </div>
                        <p className="text-2xl font-bold text-blue-600 text-center">
                            {childName || 'اسم الطفل'}
                        </p>
                    </div>
                </div>

                {product.text_fields?.map(field => field.required && formData[field.id] && (
                     <div key={field.id}>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Palette size={18} />
                            {field.label.replace('*','')}
                        </h3>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">{formData[field.id]}</p>
                    </div>
                ))}
                
                {goalTitle && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            {goalIcon}
                            الهدف من القصة
                        </h3>
                        <p className="text-md text-gray-800 font-semibold bg-gray-50 p-3 rounded-lg text-center">
                           {goalTitle}
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-8 pt-6 border-t space-y-2">
                <div className="flex justify-between items-center text-gray-600">
                    <span>{product.title}</span>
                    <span className="font-semibold">{basePrice} ج.م</span>
                </div>
                {addons.map(addon => (
                    <div key={addon.key} className="flex justify-between items-center text-gray-600 animate-fadeIn">
                        <span>+ {addon.title}</span>
                        <span className="font-semibold">{addon.price} ج.م</span>
                    </div>
                ))}
                <div className="border-t my-2"></div>
                <div className="flex justify-between items-center text-xl font-bold text-gray-800">
                    <span>الإجمالي</span>
                    <span>{totalPrice} ج.م</span>
                </div>
            </div>
        </div>
    );
};

export default InteractivePreview;