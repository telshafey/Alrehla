import React from 'react';
import { EGYPTIAN_GOVERNORATES } from '../../utils/governorates';
import FormField from '../ui/FormField';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';

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
        <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">تفاصيل التوصيل</h3>
            <div className="space-y-6">
                <FormField label="نوع النسخة" htmlFor="deliveryType">
                     <Select id="deliveryType" name="deliveryType" value={formData.deliveryType} onChange={handleChange}>
                        <option value="printed">مطبوعة + إلكترونية</option>
                        <option value="electronic">إلكترونية فقط</option>
                    </Select>
                </FormField>
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
                                <FormField label="اسم المستلم*" htmlFor="giftName" className="md:col-span-2">
                                    <Input type="text" id="giftName" name="giftName" value={formData.giftName} onChange={handleChange} required={formData.shippingOption === 'gift'} />
                                </FormField>
                                <FormField label="عنوان المستلم*" htmlFor="giftAddress" className="md:col-span-2">
                                    <Input type="text" id="giftAddress" name="giftAddress" value={formData.giftAddress} onChange={handleChange} required={formData.shippingOption === 'gift'} />
                                </FormField>
                                <FormField label="هاتف المستلم*" htmlFor="giftPhone">
                                    <Input type="tel" id="giftPhone" name="giftPhone" value={formData.giftPhone} onChange={handleChange} required={formData.shippingOption === 'gift'} />
                                </FormField>
                            </div>
                        )}
                        
                        <FormField label={formData.shippingOption === 'gift' ? 'محافظة المستلم' : 'المحافظة'} htmlFor="governorate">
                            <Select id="governorate" name="governorate" value={formData.governorate} onChange={handleChange}>
                                {EGYPTIAN_GOVERNORATES.map(gov => <option key={gov} value={gov}>{gov}</option>)}
                            </Select>
                        </FormField>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliverySection;