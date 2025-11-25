
import React from 'react';
import { EGYPTIAN_GOVERNORATES } from '../../utils/governorates';
import FormField from '../ui/FormField';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { useFormContext } from 'react-hook-form';

const ShippingAddressForm: React.FC = () => {
    const { register, formState: { errors }, watch, setValue } = useFormContext();
    const shippingOption = watch('shippingOption');

    const handleOptionChange = (value: 'my_address' | 'gift') => {
        setValue('shippingOption', value);
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">خيار التوصيل</label>
                <div className="flex gap-4 rounded-lg border p-1 bg-gray-100">
                    <button type="button" onClick={() => handleOptionChange('my_address')} className={`flex-1 p-2 rounded-md font-semibold text-sm transition-all ${shippingOption === 'my_address' ? 'bg-blue-600 text-white shadow' : 'hover:bg-gray-200'}`}>
                        توصيل لعنواني
                    </button>
                    <button type="button" onClick={() => handleOptionChange('gift')} className={`flex-1 p-2 rounded-md font-semibold text-sm transition-all ${shippingOption === 'gift' ? 'bg-blue-600 text-white shadow' : 'hover:bg-gray-200'}`}>
                        إرسال كهدية
                    </button>
                </div>
            </div>

            {shippingOption === 'gift' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4 animate-fadeIn">
                    <FormField label="اسم المستلم*" htmlFor="recipientName" error={errors.recipientName?.message as string}>
                        <Input type="text" id="recipientName" {...register('recipientName')} />
                    </FormField>
                    <FormField label="عنوان المستلم*" htmlFor="recipientAddress" error={errors.recipientAddress?.message as string}>
                        <Input type="text" id="recipientAddress" {...register('recipientAddress')} />
                    </FormField>
                    <FormField label="هاتف المستلم*" htmlFor="recipientPhone" error={errors.recipientPhone?.message as string}>
                        <Input type="tel" id="recipientPhone" {...register('recipientPhone')} />
                    </FormField>
                    <FormField label="البريد الإلكتروني للمستلم (لإرسال بطاقة الهدية)" htmlFor="recipientEmail" error={errors.recipientEmail?.message as string}>
                        <Input type="email" id="recipientEmail" {...register('recipientEmail')} />
                    </FormField>
                    <FormField label="رسالة الهدية" htmlFor="giftMessage">
                        <Textarea id="giftMessage" {...register('giftMessage')} rows={3} placeholder="اكتب رسالتك هنا..."/>
                    </FormField>
                    <div>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" {...register('sendDigitalCard')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>
                            <span>إرسال بطاقة هدية رقمية للمستلم فور تأكيد الطلب</span>
                        </label>
                    </div>
                </div>
            )}
            
            <FormField label={shippingOption === 'gift' ? 'محافظة المستلم' : 'المحافظة'} htmlFor="governorate">
                <Select id="governorate" {...register('governorate')}>
                    {EGYPTIAN_GOVERNORATES.map(gov => <option key={gov} value={gov}>{gov}</option>)}
                </Select>
            </FormField>
        </div>
    );
};

export default ShippingAddressForm;
