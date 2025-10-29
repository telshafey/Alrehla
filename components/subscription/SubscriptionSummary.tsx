import React from 'react';
import { Gift, Check, Send } from 'lucide-react';
import type { SubscriptionPlan } from '../../lib/database.types';
import { Button } from '../ui/Button';

interface SubscriptionSummaryProps {
    selectedPlan: SubscriptionPlan | null;
    isSubmitting: boolean;
    onSubmit: () => void;
    step: string;
    features?: string[];
}

// Fallback features in case they are not loaded from the backend for some reason.
const defaultFeatures = [
    "قصة مخصصة جديدة كل شهر.",
    "أنشطة تفاعلية وألعاب تعليمية.",
    "هدية إضافية مختارة بعناية."
];

const SubscriptionSummary: React.FC<SubscriptionSummaryProps> = ({ selectedPlan, isSubmitting, onSubmit, step, features }) => {
    
    const isConfirmStep = step === 'delivery';
    const displayFeatures = features && features.length > 0 && features.every(f => f.trim() !== '') ? features : defaultFeatures;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border">
            <h3 className="text-xl font-bold text-gray-800 mb-4 pb-3 border-b flex items-center gap-2">
                <Gift /> ملخص الاشتراك
            </h3>
            <div className="space-y-4 text-sm">
                <h4 className="font-bold text-gray-700">ماذا سأحصل عليه شهرياً؟</h4>
                <ul className="space-y-2 text-gray-600 pr-2">
                    {displayFeatures.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                            <Check size={16} className="text-green-500 mt-1 flex-shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>
            {selectedPlan && (
                 <div className="mt-6 pt-4 border-t">
                    <div className="flex justify-between items-center text-gray-600">
                        <span>الباقة المختارة:</span>
                        <span className="font-bold text-gray-800">{selectedPlan.name}</span>
                    </div>
                    <div className="mt-4 flex justify-between items-center text-xl font-bold">
                        <span>الإجمالي:</span>
                        <span>{selectedPlan.price} ج.م</span>
                    </div>
                </div>
            )}
             <Button 
                onClick={onSubmit}
                disabled={!isConfirmStep || isSubmitting}
                className="mt-6 w-full"
                loading={isSubmitting}
                icon={<Send />}
                variant="success"
            >
                {isSubmitting ? 'جاري الإضافة...' : 'أضف للسلة وأكمل'}
            </Button>
        </div>
    );
};

export default SubscriptionSummary;