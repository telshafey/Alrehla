import React from 'react';
import FormField from '../ui/FormField';
import { Select } from '../ui/Select';
import type { PersonalizedProduct } from '../../lib/database.types';
import ShippingAddressForm from '../shared/ShippingAddressForm';

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

const DeliverySection: React.FC<DeliverySectionProps> = React.memo(({ formData, handleChange, product, errors }) => {
    return (
        <div>
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
                        <ShippingAddressForm
                            formData={formData}
                            handleChange={handleChange}
                            errors={errors}
                        />
                    </div>
                )}
            </div>
        </div>
    );
});
DeliverySection.displayName = "DeliverySection";

export default DeliverySection;