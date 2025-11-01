import React from 'react';
import { EGYPTIAN_GOVERNORATES } from '../../utils/governorates';
import FormField from '../ui/FormField';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import type { PersonalizedProduct } from '../../lib/database.types';
import { Textarea } from '../ui/Textarea';

interface DeliverySectionProps {
    formData: {
        deliveryType: 'printed' | 'electronic';
        shippingOption: 'my_address' | 'gift';
        governorate: string;
        recipientName: string;
        recipientAddress: string;
        recipientPhone: string;
        recipientEmail: string;
        giftMessage: string;
        sendDigitalCard: boolean;
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    product: PersonalizedProduct | null;
    errors: { [key: string]: string };
}

const DeliverySection: React.FC<DeliverySectionProps> = ({ formData, handleChange, product, errors }) => {
    return (
        <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">تفاصيل التوصيل</h3>
            <div className="space-y-6">
                {product?.has_printed_version && (
                    <FormField label="نوع النسخة" htmlFor="deliveryType">
                        <Select id="deliveryType" name="deliveryType" value={formData.deliveryType} onChange={handleChange}>
                            <option value="printed">مطبوعة + إلكترونية</option>
                            <option value="electronic">إلكترونية فقط</option>
                        </Select>
                    </FormField>
                )}
                
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
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4 animate-fadeIn">
                                <FormField label="اسم المستلم*" htmlFor="recipientName" error={errors.recipientName}>
                                    <Input type="text" id="recipientName" name="recipientName" value={formData.recipientName} onChange={handleChange} required={formData.shippingOption === 'gift'} />
                                </FormField>
                                <FormField label="عنوان المستلم*" htmlFor="recipientAddress" error={errors.recipientAddress}>
                                    <Input type="text" id="recipientAddress" name="recipientAddress" value={formData.recipientAddress} onChange={handleChange} required={formData.shippingOption === 'gift'} />
                                </FormField>
                                <FormField label="هاتف المستلم*" htmlFor="recipientPhone" error={errors.recipientPhone}>
                                    <Input type="tel" id="recipientPhone" name="recipientPhone" value={formData.recipientPhone} onChange={handleChange} required={formData.shippingOption === 'gift'} />
                                </FormField>
                                <FormField label="البريد الإلكتروني للمستلم (لإرسال بطاقة الهدية)" htmlFor="recipientEmail">
                                    <Input type="email" id="recipientEmail" name="recipientEmail" value={formData.recipientEmail} onChange={handleChange} />
                                </FormField>
                                <FormField label="رسالة الهدية" htmlFor="giftMessage">
                                    <Textarea id="giftMessage" name="giftMessage" value={formData.giftMessage} onChange={handleChange} rows={3} placeholder="اكتب رسالتك هنا..."/>
                                </FormField>
                                <div>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" name="sendDigitalCard" checked={formData.sendDigitalCard} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>
                                        <span>إرسال بطاقة هدية رقمية للمستلم فور تأكيد الطلب</span>
                                    </label>
                                </div>
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