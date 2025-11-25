
import React from 'react';
import FormField from '../ui/FormField';
import { Select } from '../ui/Select';
import type { PersonalizedProduct } from '../../lib/database.types';
import ShippingAddressForm from '../shared/ShippingAddressForm';
import { useFormContext } from 'react-hook-form';

interface DeliverySectionProps {
    product: PersonalizedProduct | null;
}

const DeliverySection: React.FC<DeliverySectionProps> = ({ product }) => {
    const { register, watch } = useFormContext();
    const deliveryType = watch('deliveryType');

    return (
        <div>
            <div className="space-y-6">
                {product?.has_printed_version && (
                    <FormField label="نوع النسخة" htmlFor="deliveryType">
                        <Select id="deliveryType" {...register('deliveryType')}>
                            <option value="printed">مطبوعة + إلكترونية</option>
                            <option value="electronic">إلكترونية فقط</option>
                        </Select>
                    </FormField>
                )}
                
                {deliveryType === 'printed' && (
                    <div className="space-y-4 pt-4 border-t">
                        <ShippingAddressForm />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliverySection;
