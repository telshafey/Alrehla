import React from 'react';
import { Package, User, Palette, Sparkles } from 'lucide-react';
import { PersonalizedProduct } from '../../lib/database.types.ts';

const storyGoals = [
    { key: 'respect', title: 'الاستئذان والاحترام' },
    { key: 'cooperation', title: 'التعاون والمشاركة' },
    { key: 'honesty', title: 'الصدق والأمانة' },
    { key: 'cleanliness', title: 'النظافة والترتيب' },
    { key: 'time_management', title: 'تنظيم الوقت' },
    { key: 'emotion_management', title: 'إدارة العواطف' },
    { key: 'problem_solving', title: 'حل المشكلات' },
    { key: 'creative_thinking', title: 'التفكير الإبداعي' },
];

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
}

const InteractivePreview: React.FC<InteractivePreviewProps> = ({ formData, product, basePrice, addons, totalPrice }) => {
    const { childName, childTraits, storyValue, customGoal } = formData;
    
    if (!product) {
        return null; 
    }

    const showFullCustomization = product.key === 'custom_story' || product.key === 'gift_box';
    
    const getGoalTitle = () => {
        if (showFullCustomization) {
            return storyValue === 'custom' ? customGoal : storyGoals.find(v => v.key === storyValue)?.title;
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
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600 text-center">
                            {childName || 'اسم الطفل'}
                        </p>
                    </div>
                </div>

                {showFullCustomization && childTraits && (
                     <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Palette size={18} />
                            وصف الشخصية
                        </h3>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">{childTraits}</p>
                    </div>
                )}
                
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