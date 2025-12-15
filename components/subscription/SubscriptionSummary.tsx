
import React from 'react';
import { Gift, Check, Send, Truck } from 'lucide-react';
import type { SubscriptionPlan } from '../../lib/database.types';
import { Button } from '../ui/Button';

interface SubscriptionSummaryProps {
    selectedPlan: SubscriptionPlan | null;
    isSubmitting: boolean;
    onSubmit: () => void;
    step: string;
    features?: string[];
    shippingCost?: number;
    governorate?: string;
}

// Fallback features in case they are not loaded from the backend for some reason.
const defaultFeatures = [
    "قصة مخصصة جديدة كل شهر.",
    "أنشطة تفاعلية وألعاب تعليمية.",
    "هدية إضافية مختارة بعناية."
];

const SubscriptionSummary: React.FC<SubscriptionSummaryProps> = ({ 
    selectedPlan, 
    isSubmitting, 
    onSubmit, 
    step, 
    features, 
    shippingCost = 0,
    governorate
}) => {
    
    const isConfirmStep = step === 'delivery';
    const displayFeatures = features && features.length > 0 && features.every(f => f.trim() !== '') ? features : defaultFeatures;
    
    // Calculate final total
    const planPrice = selectedPlan?.price || 0;
    const finalTotal = planPrice + shippingCost;

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
                 <div className="mt-6 pt-4 border-t space-y-3">
                    <div className="flex justify-between items-center text-gray-600">
                        <span>الباقة المختارة:</span>
                        <span className="font-bold text-gray-800">{selectedPlan.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-600 text-sm">
                        <span>سعر الباقة:</span>
                        <span>{planPrice} ج.م</span>
                    </div>
                    
                    {shippingCost > 0 ? (
                        <div className="flex justify-between items-center text-green-700 text-sm bg-green-50 p-2 rounded">
                            <span className="flex items-center gap-1"><Truck size={14}/> الشحن ({governorate}):</span>
                            <span className="font-bold">{shippingCost} ج.م</span>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center text-muted-foreground text-sm">
                            <span>الشحن:</span>
                            <span>{isConfirmStep ? 'مجاني / غير محدد' : 'يُحسب عند التوصيل'}</span>
                        </div>
                    )}

                    <div className="border-t border-dashed my-2"></div>

                    <div className="flex justify-between items-center text-xl font-extrabold text-primary">
                        <span>الإجمالي:</span>
                        <span>{finalTotal} ج.م</span>
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
