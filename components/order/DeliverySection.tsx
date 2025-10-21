import React from 'react';
import Accordion from '../ui/Accordion.tsx';
import { EGYPTIAN_GOVERNORATES } from '../../utils/governorates.ts';

interface DeliverySectionProps {
    formData: {
        deliveryType: 'printed' | 'electronic';
        shippingOption: 'my_address' | 'gift';
        governorate: string;
        giftName: string;
        giftAddress: string;
        giftPhone: string;
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const DeliverySection: React.FC<DeliverySectionProps> = ({ formData, handleChange }) => {
    return (
        <Accordion title="تفاصيل التوصيل">
            <div className="p-6 space-y-6">
                <div>
                    <label htmlFor="deliveryType" className="block text-sm font-bold text-gray-700 mb-2">نوع النسخة</label>
                    <select id="deliveryType" name="deliveryType" value={formData.deliveryType} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white">
                        <option value="printed">مطبوعة + إلكترونية</option>
                        <option value="electronic">إلكترونية فقط</option>
                    </select>
                </div>
                {formData.deliveryType === 'printed' && (
                    <div className="space-y-4 pt-4 border-t">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">خيار التوصيل</label>
                            <div className="flex gap-4 rounded-lg border p-1 bg-gray-100">
                                <button type="button" onClick={() => handleChange({ target: { name: 'shippingOption', value: 'my_address' } } as any)} className={`flex-1 p-2 rounded-md font-semibold text-sm transition-all ${formData.shippingOption === 'my_address' ? 'bg-blue-600 text-white shadow' : 'hover:bg-gray-200'}`}>
                                    توصيل لعنواني
                                </button>
                                <button type="button" onClick={() => handleChange({ target: { name: 'shippingOption', value: 'gift' } } as any)} className={`flex-1 p-2 rounded-md font-semibold text-sm transition-all ${formData.shippingOption === 'gift' ? 'bg-blue-600 text-white shadow' : 'hover:bg-gray-200'}`}>
                                    إرسال كهدية
                                </button>
                            </div>
                        </div>

                        {formData.shippingOption === 'gift' && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                                <div className="md:col-span-2">
                                    <label htmlFor="giftName" className="block text-sm font-bold text-gray-700 mb-2">اسم المستلم*</label>
                                    <input type="text" id="giftName" name="giftName" value={formData.giftName} onChange={handleChange} className="w-full p-2 border rounded-lg" required={formData.shippingOption === 'gift'} />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="giftAddress" className="block text-sm font-bold text-gray-700 mb-2">عنوان المستلم*</label>
                                    <input type="text" id="giftAddress" name="giftAddress" value={formData.giftAddress} onChange={handleChange} className="w-full p-2 border rounded-lg" required={formData.shippingOption === 'gift'} />
                                </div>
                                <div>
                                    <label htmlFor="giftPhone" className="block text-sm font-bold text-gray-700 mb-2">هاتف المستلم*</label>
                                    <input type="tel" id="giftPhone" name="giftPhone" value={formData.giftPhone} onChange={handleChange} className="w-full p-2 border rounded-lg" required={formData.shippingOption === 'gift'} />
                                </div>
                            </div>
                        )}
                        
                        <div>
                            <label htmlFor="governorate" className="block text-sm font-bold text-gray-700 mb-2">
                                {formData.shippingOption === 'gift' ? 'محافظة المستلم' : 'المحافظة'}
                            </label>
                            <select id="governorate" name="governorate" value={formData.governorate} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white">
                                {EGYPTIAN_GOVERNORATES.map(gov => <option key={gov} value={gov}>{gov}</option>)}
                            </select>
                        </div>
                    </div>
                )}
            </div>
        </Accordion>
    );
};

export default DeliverySection;
