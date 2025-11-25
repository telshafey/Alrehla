
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useProduct } from '../contexts/ProductContext';
import { useOrderData } from '../hooks/queries/public/usePageDataQuery';
import { createOrderSchema } from '../lib/schemas';
import OrderStepper from '../components/order/OrderStepper';
import ChildDetailsSection from '../components/order/ChildDetailsSection';
import StoryCustomizationSection from '../components/order/StoryCustomizationSection';
import ImageUploadSection from '../components/order/ImageUploadSection';
import AddonsSection from '../components/order/AddonsSection';
import DeliverySection from '../components/order/DeliverySection';
import InteractivePreview from '../components/order/InteractivePreview';
import { Button } from '../components/ui/Button';
import type { ChildProfile, PersonalizedProduct } from '../lib/database.types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import DynamicTextFields from '../components/order/DynamicTextFields';
import ChildProfileModal from '../components/account/ChildProfileModal';

// --- Steps Configuration ---
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

const OrderPage: React.FC = () => {
    const { productKey } = useParams<{ productKey: string }>();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { addItemToCart } = useCart();
    const { shippingCosts, loading: productContextLoading } = useProduct();
    const { data: orderData, isLoading: orderDataLoading } = useOrderData();
    const { isLoggedIn, childProfiles, currentUser } = useAuth();
    
    const [step, setStep] = useState<string>('child');
    const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [isChildModalOpen, setIsChildModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const product = useMemo(() => 
        orderData?.personalizedProducts.find(p => p.key === productKey) as PersonalizedProduct | undefined, 
    [orderData, productKey]);

    const stepsConfig = useMemo(() => productKey === 'emotion_story' ? emotionStorySteps : defaultSteps, [productKey]);

    // --- React Hook Form Setup ---
    const schema = useMemo(() => createOrderSchema(product), [product]);
    
    const methods = useForm({
        resolver: zodResolver(schema),
        mode: 'onChange',
        defaultValues: {
            childName: '',
            childBirthDate: '',
            childGender: '',
            deliveryType: 'printed',
            shippingOption: 'my_address',
            governorate: 'القاهرة',
            recipientName: '',
            recipientAddress: '',
            recipientPhone: '',
            recipientEmail: '',
            giftMessage: '',
            sendDigitalCard: true,
            storyValue: '',
            customGoal: '',
        }
    });

    const { watch, trigger, setValue, reset, formState: { errors } } = methods;
    const formData = watch();

    useEffect(() => {
        if (product) {
            setStep(stepsConfig[0].key);
            if (!product.has_printed_version) {
                setValue('deliveryType', 'electronic');
            }
            if (product.component_keys && product.component_keys.length > 0) {
                setSelectedAddons(product.component_keys);
            } else {
                setSelectedAddons([]);
            }
        }
    }, [product, setValue, stepsConfig]);

    const isLoading = productContextLoading || orderDataLoading;
    const allProducts = useMemo(() => orderData?.personalizedProducts || [], [orderData]);
    const addonProducts = useMemo(() => allProducts.filter(p => p.is_addon), [allProducts]);
    const storyGoals = useMemo(() => product?.story_goals || [], [product]);

    // --- Price Calculations ---
    const basePrice = useMemo(() => {
        if (!product) return 0;
        if (formData.deliveryType === 'electronic') {
            return product.price_electronic || 0;
        }
        return product.price_printed || 0;
    }, [product, formData.deliveryType]);
    
    const addonsPrice = useMemo(() => {
        return selectedAddons.reduce((total, key) => {
            const componentProd = allProducts.find(p => p.key === key);
            if (!componentProd) return total;
            const price = componentProd.has_printed_version ? componentProd.price_printed : componentProd.price_electronic;
            return total + (price || 0);
        }, 0);
    }, [selectedAddons, allProducts]);

    const shippingPrice = useMemo(() => {
        if (formData.deliveryType === 'electronic' || !shippingCosts) return 0;
        return shippingCosts[formData.governorate] || 0;
    }, [formData.governorate, formData.deliveryType, shippingCosts]);
    
    const totalPrice = basePrice + addonsPrice;

    // --- Handlers ---

    const handleChildSelect = (child: ChildProfile | null) => {
        setSelectedChildId(child ? child.id : null);
        if (child) {
            setValue('childName', child.name);
            setValue('childBirthDate', child.birth_date);
            setValue('childGender', child.gender);
        } else {
            setValue('childName', '');
            setValue('childBirthDate', '');
            setValue('childGender', '');
        }
    };

    const handleSelfSelect = () => {
        setSelectedChildId(null);
        setValue('childName', currentUser?.name || '');
        setValue('childBirthDate', '');
        setValue('childGender', '');
    };

    const handleAddonToggle = (key: string) => {
        setSelectedAddons(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    };

    // --- Navigation Logic ---
    const getFieldsToValidate = (stepKey: string): string[] => {
        if (!product) return [];
        const fields: string[] = [];
        
        switch(stepKey) {
            case 'child':
            case 'child_context':
                fields.push('childName', 'childBirthDate', 'childGender');
                if (productKey === 'emotion_story') {
                    product.text_fields?.slice(0, 4).forEach(f => f.required && fields.push(f.id));
                }
                break;
            case 'customization':
                product.text_fields?.forEach(f => f.required && fields.push(f.id));
                if (product.goal_config !== 'none') {
                    fields.push('storyValue');
                    if (formData.storyValue === 'custom') fields.push('customGoal');
                }
                break;
            case 'emotion_journey':
                product.text_fields?.slice(4, 8).forEach(f => f.required && fields.push(f.id));
                fields.push('storyValue');
                break;
            case 'creative_touches':
                product.text_fields?.slice(8, 11).forEach(f => f.required && fields.push(f.id));
                break;
            case 'images':
                product.image_slots?.forEach(slot => slot.required && fields.push(slot.id));
                break;
            case 'delivery':
                if (formData.deliveryType === 'printed' && formData.shippingOption === 'gift') {
                    fields.push('recipientName', 'recipientAddress', 'recipientPhone');
                }
                break;
        }
        return fields;
    };

    const handleNext = async () => {
        const fieldsToValidate = getFieldsToValidate(step);
        const isValid = await trigger(fieldsToValidate as any);

        if (isValid) {
            const currentIndex = stepsConfig.findIndex(s => s.key === step);
            if (currentIndex < stepsConfig.length - 1) {
                setStep(stepsConfig[currentIndex + 1].key);
                // Scroll to top of form
                window.scrollTo({ top: 100, behavior: 'smooth' });
            }
        } else {
            addToast('يرجى إكمال الحقول المطلوبة للمتابعة.', 'warning');
        }
    };
    
    const handleBack = () => {
        const currentIndex = stepsConfig.findIndex(s => s.key === step);
        if (currentIndex > 0) {
            setStep(stepsConfig[currentIndex - 1].key);
        } else {
            navigate(-1);
        }
    };

    const handleSubmit = async () => {
        // Validate entire form first
        const isValid = await trigger();
        if (!isValid) {
             addToast('يرجى مراجعة البيانات الناقصة.', 'warning');
            return;
        }
        if (!isLoggedIn) {
            addToast('الرجاء تسجيل الدخول أولاً لإضافة الطلب للسلة.', 'warning');
            navigate('/account');
            return;
        }

        setIsSubmitting(true);
        
        // Extract image files from form data
        const imageFiles: Record<string, File> = {};
        product?.image_slots?.forEach(slot => {
            if (formData[slot.id] instanceof File) {
                imageFiles[slot.id] = formData[slot.id];
            }
        });

        addItemToCart({
            type: 'order',
            payload: {
                productKey: product!.key,
                formData: methods.getValues(),
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
    
    // Find the image preview url if any
    const previewSourceSlot = product.image_slots?.find(s => s.required)?.id;
    const previewFile = previewSourceSlot ? formData[previewSourceSlot] : null;
    const imagePreviewUrl = previewFile instanceof File ? URL.createObjectURL(previewFile) : null;

    const currentStepTitle = stepsConfig.find(s => s.key === step)?.title;

    // Render Helpers
    const renderStepContent = () => {
        switch(step) {
            case 'child':
                return (
                    <ChildDetailsSection 
                        childProfiles={childProfiles}
                        onSelectChild={handleChildSelect}
                        selectedChildId={selectedChildId}
                        onSelectSelf={handleSelfSelect}
                        currentUser={currentUser}
                        onAddChild={() => setIsChildModalOpen(true)}
                    />
                );
            case 'child_context':
                return (
                    <div>
                        <ChildDetailsSection 
                            childProfiles={childProfiles}
                            onSelectChild={handleChildSelect}
                            selectedChildId={selectedChildId}
                            onSelectSelf={handleSelfSelect}
                            currentUser={currentUser}
                            onAddChild={() => setIsChildModalOpen(true)}
                        />
                        <div className="mt-8 pt-8 border-t">
                            <h3 className="text-xl font-bold text-gray-700 mb-4">معلومات إضافية عن السياق</h3>
                            <DynamicTextFields fields={product.text_fields?.slice(0, 4) || []} />
                        </div>
                    </div>
                );
            case 'customization':
                return (
                    <StoryCustomizationSection 
                        textFields={product.text_fields || null} 
                        goalConfig={product.goal_config || 'none'} 
                        storyGoals={storyGoals} 
                    />
                );
            case 'emotion_journey':
                return (
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">رحلة المشاعر</h3>
                        <StoryCustomizationSection 
                            textFields={[]} 
                            goalConfig={product.goal_config || 'none'} 
                            storyGoals={storyGoals} 
                        />
                        <div className="mt-6">
                            <DynamicTextFields fields={product.text_fields?.slice(4, 8) || []} />
                        </div>
                    </div>
                );
            case 'creative_touches':
                return (
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">لمسات إبداعية</h3>
                        <DynamicTextFields fields={product.text_fields?.slice(8, 11) || []} />
                    </div>
                );
            case 'images':
                return (
                    <ImageUploadSection imageSlots={product.image_slots || null} />
                );
            case 'addons':
                return (
                    <AddonsSection 
                        addonProducts={addonProducts} 
                        selectedAddons={selectedAddons} 
                        onToggle={handleAddonToggle} 
                    />
                );
            case 'delivery':
                return <DeliverySection product={product} />;
            default:
                return null;
        }
    };

    return (
        <FormProvider {...methods}>
            <ChildProfileModal isOpen={isChildModalOpen} onClose={() => setIsChildModalOpen(false)} childToEdit={null} />
            <div className="bg-muted/50 py-12 sm:py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-12">
                             <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-foreground mb-4">تخصيص: {product.title}</h1>
                             <OrderStepper steps={stepsConfig} currentStep={step} />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                            <Card className="lg:col-span-2">
                                {currentStepTitle && (
                                    <CardHeader>
                                        <CardTitle className="text-2xl">{currentStepTitle}</CardTitle>
                                    </CardHeader>
                                )}
                               <CardContent className="pt-2 space-y-10">
                                  {renderStepContent()}
                                  <div className="flex justify-between pt-6 border-t">
                                      <Button type="button" onClick={handleBack} variant="outline" icon={<ArrowLeft className="transform rotate-180" />}>
                                          {step === stepsConfig[0].key ? 'رجوع' : 'السابق'}
                                      </Button>
                                      {step !== stepsConfig[stepsConfig.length - 1].key ? (
                                          <Button type="button" onClick={handleNext}>التالي <ArrowLeft className="mr-2 h-4 w-4" /></Button>
                                      ) : (
                                          <Button type="button" onClick={handleSubmit} loading={isSubmitting} variant="success" icon={<ShoppingCart />}>إضافة إلى السلة</Button>
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
                                        const componentProd = allProducts.find(p => p.key === key);
                                        if (!componentProd) return { key, title: `Unknown (${key})`, price: 0 };
                                        const price = componentProd.has_printed_version ? componentProd.price_printed : componentProd.price_electronic;
                                        return { key, title: componentProd?.title || '', price: price || 0 };
                                    })}
                                    totalPrice={totalPrice}
                                    shippingPrice={shippingPrice}
                                    imagePreviewUrl={imagePreviewUrl}
                                    storyGoals={storyGoals}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FormProvider>
    );
};

export default OrderPage;
