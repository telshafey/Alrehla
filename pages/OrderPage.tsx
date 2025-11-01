import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useProduct } from '../contexts/ProductContext';
import { useOrderData } from '../hooks/queries/public/usePageDataQuery';
import OrderStepper from '../components/order/OrderStepper';
import ChildDetailsSection from '../components/order/ChildDetailsSection';
import StoryCustomizationSection from '../components/order/StoryCustomizationSection';
import ImageUploadSection from '../components/order/ImageUploadSection';
import AddonsSection from '../components/order/AddonsSection';
import DeliverySection from '../components/order/DeliverySection';
import InteractivePreview from '../components/order/InteractivePreview';
import { Button } from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import type { ChildProfile, PersonalizedProduct, TextFieldConfig } from '../lib/database.types';
import { Card, CardContent } from '../components/ui/card';

type OrderStep = string;

const defaultSteps = [
    { key: 'child', title: 'بيانات الطفل' },
    { key: 'customization', title: 'تخصيص القصة' },
    { key: 'images', title: 'رفع الصور' },
    { key: 'addons', title: 'إضافات' },
    { key: 'delivery', title: 'التوصيل' },
];

const emotionStorySteps = [
    { key: 'child_context', title: 'بيانات البطل والسياق' },
    { key: 'emotion_journey', title: 'رحلة المشاعر' },
    { key: 'creative_touches', title: 'لمسات إبداعية' },
    { key: 'images', title: 'رفع الصور' },
    { key: 'addons', title: 'إضافات' },
    { key: 'delivery', title: 'التوصيل' },
];

const DynamicTextFields: React.FC<{
    fields: TextFieldConfig[];
    formData: { [key: string]: any };
    errors: { [key: string]: string };
    handleChange: (e: any) => void;
}> = ({ fields, formData, errors, handleChange }) => (
    <div className="space-y-6">
        {fields.map(field => (
            <FormField key={field.id} label={field.label} htmlFor={field.id} error={errors[field.id]}>
                {field.type === 'textarea' ? (
                    <Textarea id={field.id} name={field.id} value={formData[field.id] || ''} onChange={handleChange} rows={4} placeholder={field.placeholder} required={field.required} />
                ) : (
                    <Input id={field.id} name={field.id} value={formData[field.id] || ''} onChange={handleChange} placeholder={field.placeholder} required={field.required} />
                )}
            </FormField>
        ))}
    </div>
);


const OrderPage: React.FC = () => {
    const { productKey } = useParams<{ productKey: string }>();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { addItemToCart } = useCart();
    const { shippingCosts, loading: productContextLoading } = useProduct();
    const { data: orderData, isLoading: orderDataLoading } = useOrderData();
    const { isLoggedIn, childProfiles, currentUser } = useAuth();
    
    const product = useMemo(() => 
        orderData?.personalizedProducts.find(p => p.key === productKey) as PersonalizedProduct | undefined, 
    [orderData, productKey]);

    const stepsConfig = useMemo(() => productKey === 'emotion_story' ? emotionStorySteps : defaultSteps, [productKey]);
    
    const [step, setStep] = useState<OrderStep>(stepsConfig[0].key);
    const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
    const [formData, setFormData] = useState<{[key: string]: any}>({
        deliveryType: 'printed',
        shippingOption: 'my_address',
        governorate: 'القاهرة',
        recipientName: '',
        recipientAddress: '',
        recipientPhone: '',
        recipientEmail: '',
        giftMessage: '',
        sendDigitalCard: true,
    });
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [imageFiles, setImageFiles] = useState<{ [key: string]: File | null }>({});
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

    
    useEffect(() => {
        if (product && !product.has_printed_version) {
            setFormData(prev => ({ ...prev, deliveryType: 'electronic' }));
        }
        if(product?.key === 'gift_box' && orderData) {
            const addonKeys = orderData.personalizedProducts
                .filter(p => p.is_addon)
                .map(p => p.key);
            setSelectedAddons(addonKeys);
        }
    }, [product, orderData]);

    const isLoading = productContextLoading || orderDataLoading;
    
    const addonProducts = useMemo(() => 
        orderData?.personalizedProducts.filter(p => p.is_addon) || [],
    [orderData]);

    const storyGoals = useMemo(() => product?.story_goals || [], [product]);

    const basePrice = useMemo(() => {
        if (!product) return 0;
        if (formData.deliveryType === 'electronic') {
            return product.price_electronic || 0;
        }
        return product.price_printed || 0;
    }, [product, formData.deliveryType]);
    
    const addonsPrice = useMemo(() => {
        return selectedAddons.reduce((total, key) => {
            const addonProd = addonProducts.find(p => p.key === key);
            if (!addonProd) return total;
            const price = addonProd.has_printed_version ? addonProd.price_printed : addonProd.price_electronic;
            return total + (price || 0);
        }, 0);
    }, [selectedAddons, addonProducts]);

    const shippingPrice = useMemo(() => {
        if (formData.deliveryType === 'electronic' || !shippingCosts) return 0;
        return shippingCosts[formData.governorate] || 0;
    }, [formData.governorate, formData.deliveryType, shippingCosts]);
    
    const totalPrice = basePrice + addonsPrice;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({ 
            ...prev, 
            [name]: isCheckbox ? checked : value 
        }));

        if(errors[name]) setErrors(prev => {
            const newErrors = {...prev};
            delete newErrors[name];
            return newErrors;
        });
    };

    const handleFileChange = (id: string, file: File | null) => {
        setImageFiles(prev => ({ ...prev, [id]: file }));
         if (id === product?.image_slots?.find(s => s.required)?.id) {
            if (file) {
                const url = URL.createObjectURL(file);
                setImagePreviewUrl(url);
            } else {
                setImagePreviewUrl(null);
            }
        }
        if(errors[id]) setErrors(prev => {
            const newErrors = {...prev};
            delete newErrors[id];
            return newErrors;
        });
    };

    const handleSelectChild = (child: ChildProfile | null) => {
        if (child) {
            setSelectedChildId(child.id);
            setFormData(prev => ({
                ...prev,
                childName: child.name,
                childBirthDate: child.birth_date,
                childGender: child.gender,
            }));
        } else {
            setSelectedChildId(null);
            setFormData(prev => ({
                ...prev,
                childName: '',
                childBirthDate: '',
                childGender: '',
            }));
        }
    };
    
    const handleSelectSelf = () => {
        setSelectedChildId(null);
        setFormData(prev => ({
            ...prev,
            childName: currentUser?.name || '',
            childBirthDate: '',
            childGender: '',
        }));
    };

    const handleToggleAddon = (key: string) => {
        setSelectedAddons(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    };

     const validateStep = () => {
        const newErrors: { [key: string]: string } = {};
        if (!product) return false;
        
        const checkRequiredTextFields = (fields: TextFieldConfig[]) => {
            fields.forEach(field => {
                if (field.required && !formData[field.id]?.trim()) {
                    newErrors[field.id] = `${field.label.replace('*','')} مطلوب.`;
                }
            });
        }

        switch(step) {
            case 'child':
            case 'child_context':
                if (!formData.childName?.trim()) newErrors.childName = 'الاسم مطلوب.';
                if (!formData.childBirthDate) newErrors.childBirthDate = 'تاريخ ميلاد الطفل مطلوب.';
                if (!formData.childGender) newErrors.childGender = 'الجنس مطلوب.';
                if (productKey === 'emotion_story') checkRequiredTextFields(product.text_fields?.slice(0, 4) || []);
                break;
            case 'customization':
                checkRequiredTextFields(product.text_fields || []);
                if (product.goal_config !== 'none' && !formData.storyValue) {
                    newErrors.storyValue = 'الهدف من القصة مطلوب.';
                }
                break;
            case 'emotion_journey':
                checkRequiredTextFields(product.text_fields?.slice(4, 8) || []);
                if (!formData.storyValue) newErrors.storyValue = 'المشاعر المستهدفة مطلوبة.';
                break;
            case 'creative_touches':
                checkRequiredTextFields(product.text_fields?.slice(8, 11) || []);
                break;
            case 'images':
                product.image_slots?.forEach(slot => {
                    if (slot.required && !imageFiles[slot.id]) {
                        newErrors[slot.id] = `${slot.label} مطلوب.`;
                    }
                });
                break;
            case 'delivery':
                 if (formData.deliveryType === 'printed' && formData.shippingOption === 'gift') {
                    if (!formData.recipientName) newErrors.recipientName = 'اسم المستلم مطلوب.';
                    if (!formData.recipientAddress) newErrors.recipientAddress = 'عنوان المستلم مطلوب.';
                    if (!formData.recipientPhone) newErrors.recipientPhone = 'هاتف المستلم مطلوب.';
                }
                break;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleNext = () => {
        if (!validateStep()) {
            addToast('يرجى إكمال الحقول المطلوبة للمتابعة.', 'warning');
            return;
        }
        errors && setErrors({});
        const currentIndex = stepsConfig.findIndex(s => s.key === step);
        if (currentIndex < stepsConfig.length - 1) {
            setStep(stepsConfig[currentIndex + 1].key as OrderStep);
        }
    };
    
    const handleBack = () => {
        const currentIndex = stepsConfig.findIndex(s => s.key === step);
        if (currentIndex > 0) {
            setStep(stepsConfig[currentIndex - 1].key as OrderStep);
        } else {
            navigate(-1);
        }
    };

    const handleSubmit = () => {
        if (!validateStep()) {
             addToast('يرجى مراجعة بيانات التوصيل.', 'warning');
            return;
        }
        if (!isLoggedIn) {
            addToast('الرجاء تسجيل الدخول أولاً لإضافة الطلب للسلة.', 'warning');
            navigate('/account');
            return;
        }

        setIsSubmitting(true);
        addItemToCart({
            type: 'order',
            payload: {
                productKey: product!.key,
                formData,
                imageFiles,
                selectedAddons,
                totalPrice,
                shippingPrice,
                summary: `${product!.title} لـ ${formData.childName}`
            }
        });
        
        addToast('تمت إضافة الطلب إلى السلة بنجاح!', 'success');
        navigate('/cart');
        setIsSubmitting(false);
    };


    if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;
    if (!product) return <div className="text-center py-20">المنتج غير موجود.</div>;
    
    const renderStepContent = () => {
        const childDetailsProps = {
            formData: { childName: formData.childName, childBirthDate: formData.childBirthDate, childGender: formData.childGender },
            handleChange: handleChange,
            errors: errors,
            childProfiles: childProfiles,
            onSelectChild: handleSelectChild,
            selectedChildId: selectedChildId,
            onSelectSelf: handleSelectSelf,
            currentUser: currentUser
        };

        switch (step) {
            case 'child': return <ChildDetailsSection {...childDetailsProps} />;
            case 'customization': return <StoryCustomizationSection formData={formData} handleChange={handleChange} errors={errors} textFields={product.text_fields || null} goalConfig={product.goal_config || 'none'} storyGoals={storyGoals}/>;
            case 'images': return <ImageUploadSection files={imageFiles} onFileChange={handleFileChange} errors={errors} imageSlots={product.image_slots || null}/>;
            case 'addons': return <AddonsSection addonProducts={addonProducts} selectedAddons={selectedAddons} onToggle={handleToggleAddon} />;
            case 'delivery': return <DeliverySection formData={formData as any} handleChange={handleChange} product={product} errors={errors} />;
            
            // Emotion Story Steps
            case 'child_context':
                return (
                    <div>
                        <ChildDetailsSection {...childDetailsProps} />
                        <div className="mt-8 pt-8 border-t">
                            <h3 className="text-xl font-bold text-gray-700 mb-4">معلومات إضافية عن السياق</h3>
                             <DynamicTextFields fields={product.text_fields?.slice(0, 4) || []} formData={formData} errors={errors} handleChange={handleChange} />
                        </div>
                    </div>
                );
            case 'emotion_journey':
                return (
                     <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">رحلة المشاعر</h3>
                        <StoryCustomizationSection formData={formData} handleChange={handleChange} errors={errors} textFields={[]} goalConfig={product.goal_config || 'none'} storyGoals={storyGoals}/>
                        <div className="mt-6">
                            <DynamicTextFields fields={product.text_fields?.slice(4, 8) || []} formData={formData} errors={errors} handleChange={handleChange} />
                        </div>
                    </div>
                );
            case 'creative_touches':
                 return (
                     <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">لمسات إبداعية</h3>
                        <DynamicTextFields fields={product.text_fields?.slice(8, 11) || []} formData={formData} errors={errors} handleChange={handleChange} />
                    </div>
                );
        }
    };

    return (
        <>
        <div className="bg-muted/50 py-12 sm:py-16">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-12">
                         <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-foreground mb-4">تخصيص: {product.title}</h1>
                         <OrderStepper steps={stepsConfig} currentStep={step} />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <Card className="lg:col-span-2">
                           <CardContent className="pt-8 space-y-10">
                              {renderStepContent()}
                              <div className="flex justify-between pt-6 border-t">
                                  <Button onClick={handleBack} variant="outline" icon={<ArrowLeft className="transform rotate-180" />}>
                                      {step === stepsConfig[0].key ? 'رجوع' : 'السابق'}
                                  </Button>
                                  {step !== stepsConfig[stepsConfig.length - 1].key ? (
                                      <Button onClick={handleNext}>التالي <ArrowLeft className="mr-2 h-4 w-4" /></Button>
                                  ) : (
                                      <Button onClick={handleSubmit} loading={isSubmitting} variant="success" icon={<ShoppingCart />}>إضافة إلى السلة</Button>
                                  )}
                              </div>
                           </CardContent>
                        </Card>
                        <div className="lg:col-span-1 sticky top-24">
                            <InteractivePreview 
                                formData={formData as any}
                                product={product}
                                basePrice={basePrice}
                                addons={selectedAddons.map(key => {
                                    const addonProd = addonProducts.find(p => p.key === key);
                                    if (!addonProd) return { key, title: '', price: 0 };
                                    const price = addonProd.has_printed_version ? addonProd.price_printed : addonProd.price_electronic;
                                    return { key, title: addonProd?.title || '', price: price || 0 };
                                })}
                                totalPrice={totalPrice}
                                imagePreviewUrl={imagePreviewUrl}
                                storyGoals={storyGoals}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default OrderPage;