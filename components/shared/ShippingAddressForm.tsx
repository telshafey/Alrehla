
import React from 'react';
import { EGYPTIAN_GOVERNORATES } from '../../utils/governorates';
import FormField from '../ui/FormField';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { useFormContext } from 'react-hook-form';

interface ShippingAddressFormProps {
    formData?: any;
    handleChange?: (e: React.ChangeEvent<any>) => void;
    setValue?: (name: string, value: any) => void;
    errors?: any;
}

const ShippingAddressForm: React.FC<ShippingAddressFormProps> = (props) => {
    // Try to get context, but don't crash if it's null
    const context = useFormContext();
    
    // Determine mode: Context-based (RHF) or Manual (Props)
    const isContextMode = !!context;

    // Extract methods/data based on mode
    const register = isContextMode ? context.register : null;
    const contextErrors = isContextMode ? context.formState.errors : {};
    const contextWatch = isContextMode ? context.watch : null;
    const contextSetValue = isContextMode ? context.setValue : null;

    // Unified Accessors
    const errors = isContextMode ? contextErrors : (props.errors || {});
    const shippingOption = isContextMode && contextWatch ? contextWatch('shippingOption') : props.formData?.shippingOption;
    
    const handleOptionChange = (value: 'my_address' | 'gift') => {
        if (isContextMode && contextSetValue) {
            contextSetValue('shippingOption', value);
        } else if (props.setValue) {
            props.setValue('shippingOption', value);
        }
    };

    // Helper to generate props for inputs
    const getInputProps = (fieldName: string) => {
        if (isContextMode && register) {
            return { ...register(fieldName) };
        }
        return {
            name: fieldName,
            id: fieldName,
            value: props.formData?.[fieldName] || '',
            onChange: props.handleChange
        };
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
                    <FormField label="اسم المستلم*" htmlFor="recipientName" error={errors.recipientName?.message || errors.recipientName}>
                        <Input type="text" {...getInputProps('recipientName')} />
                    </FormField>
                    <FormField label="عنوان المستلم*" htmlFor="recipientAddress" error={errors.recipientAddress?.message || errors.recipientAddress}>
                        <Input type="text" {...getInputProps('recipientAddress')} />
                    </FormField>
                    <FormField label="هاتف المستلم*" htmlFor="recipientPhone" error={errors.recipientPhone?.message || errors.recipientPhone}>
                        <Input type="tel" {...getInputProps('recipientPhone')} />
                    </FormField>
                    <FormField label="البريد الإلكتروني للمستلم (لإرسال بطاقة الهدية)" htmlFor="recipientEmail" error={errors.recipientEmail?.message || errors.recipientEmail}>
                        <Input type="email" {...getInputProps('recipientEmail')} />
                    </FormField>
                    <FormField label="رسالة الهدية" htmlFor="giftMessage">
                        <Textarea rows={3} placeholder="اكتب رسالتك هنا..." {...getInputProps('giftMessage')} />
                    </FormField>
                    <div>
                        <label className="flex items-center gap-2 text-sm">
                            {isContextMode && register ? (
                                <input type="checkbox" {...register('sendDigitalCard')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>
                            ) : (
                                <input 
                                    type="checkbox" 
                                    name="sendDigitalCard" 
                                    checked={props.formData?.sendDigitalCard || false} 
                                    onChange={props.handleChange} 
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                            )}
                            <span>إرسال بطاقة هدية رقمية للمستلم فور تأكيد الطلب</span>
                        </label>
                    </div>
                </div>
            )}
            
            <FormField label={shippingOption === 'gift' ? 'محافظة المستلم' : 'المحافظة'} htmlFor="governorate">
                <Select {...getInputProps('governorate')}>
                    {EGYPTIAN_GOVERNORATES.map(gov => <option key={gov} value={gov}>{gov}</option>)}
                </Select>
            </FormField>
        </div>
    );
};

export default ShippingAddressForm;
