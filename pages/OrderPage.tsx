
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOrderData } from '../hooks/queries/public/usePageDataQuery';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useProduct } from '../contexts/ProductContext';
import { useToast } from '../contexts/ToastContext';
import { createOrderSchema, OrderFormValues } from '../lib/schemas';
import PageLoader from '../components/ui/PageLoader';
import { Button } from '../components/ui/Button';
import OrderStepper from '../components/order/OrderStepper';
import ChildDetailsSection from '../components/order/ChildDetailsSection';
import StoryCustomizationSection from '../components/order/StoryCustomizationSection';
import ImageUploadSection from '../components/order/ImageUploadSection';
import AddonsSection from '../components/order/AddonsSection';
import DeliverySection from '../components/order/DeliverySection';
import InteractivePreview from '../components/order/InteractivePreview';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import ChildProfileModal from '../components/account/ChildProfileModal';
import { EGYPTIAN_GOVERNORATES } from '../utils/governorates';

const steps = [
    { key: 'child', title: 'بيانات الطفل' },
    { key: 'story', title: 'تخصيص القصة' },
    { key: 'addons', title: 'إضافات' },
    { key: 'delivery', title: 'الشحن' },
    { key: 'review', title: 'المراجعة' },
];

const OrderPage: React.FC = () => {
    const { productKey } = useParams<{ productKey: string }>();
    const navigate = useNavigate();
    const { addItemToCart } = useCart();
    const { addToast } = useToast();
    const { isLoggedIn, currentUser, childProfiles, isProfileComplete, triggerProfileUpdate } = useAuth();
    const { shippingCosts } = useProduct();
    const { data, isLoading } = useOrderData();

    const [step, setStep] = useState(0);
    const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isChildModalOpen, setIsChildModalOpen] = useState(false);

    // Get current product
    const product = useMemo(() => 
        data?.personalizedProducts.find(p => p.key === productKey), 
    [data, productKey]);

    const addonProducts = useMemo(() => 
        data?.personalizedProducts.filter(p => p.is_addon) || [],
    [data]);

    // Setup Form
    const methods = useForm<OrderFormValues>({
        resolver: zodResolver(createOrderSchema(product)),
        mode: 'onChange',
        defaultValues: {
            deliveryType: 'printed',
            shippingOption: 'my_address'
        }
    });

    const { handleSubmit, watch, setValue, trigger, reset, getValues } = methods;
    
    // Explicitly cast formData to OrderFormValues to satisfy TypeScript during build
    const formData = watch() as OrderFormValues;

    // Reset form when child is selected
    useEffect(() => {
        if (selectedChildId) {
            const child = childProfiles.find(c => c.id === selectedChildId);
            if (child) {
                setValue('childName', child.name);
                setValue('childBirthDate', child.birth_date);
                setValue('childGender', child.gender);
            }
        }
    }, [selectedChildId, childProfiles, setValue]);
    
    // Auto-fill shipping if user is logged in
    useEffect(() => {
        if (isLoggedIn && currentUser && formData.shippingOption === 'my_address') {
            setValue('recipientName', currentUser.name || '');
            setValue('recipientAddress', currentUser.address || '');
            setValue('recipientPhone', currentUser.phone || '');
            setValue('recipientEmail', currentUser.email || '');
            const gov = currentUser.governorate || (currentUser.city && EGYPTIAN_GOVERNORATES.includes(currentUser.city) ? currentUser.city : '');
            setValue('governorate', gov);
        }
    }, [isLoggedIn, currentUser, formData.shippingOption, setValue]);

    if (isLoading) return <PageLoader text="جاري تحميل المنتج..." />;
    if (!product) return <div className="text-center py-20">المنتج غير موجود</div>;

    // Calculations
    const basePrice = (formData.deliveryType === 'electronic' ? product.price_electronic : product.price_printed) || 0;
    
    const addonsPrice = selectedAddons.reduce((sum, addonKey) => {
        const addon = addonProducts.find(p => p.key === addonKey);
        if (!addon) return sum;
        const price = formData.deliveryType === 'electronic' ? addon.price_electronic : addon.price_printed;
        return sum + (price || 0);
    }, 0);

    const totalPrice = basePrice + addonsPrice;

    // Calculate Shipping
    let shippingPrice = 0;
    if (formData.deliveryType === 'printed' && shippingCosts) {
        const gov = formData.governorate;
        if (gov) {
            const egyptCosts = shippingCosts['مصر'] || {};
            shippingPrice = egyptCosts[gov] || egyptCosts['باقي المحافظات'] || 0;
        }
    }

    const currentStepKey = steps[step].key;

    const handleNext = async () => {
        let fieldsToValidate: any[] = [];
        
        if (currentStepKey === 'child') fieldsToValidate = ['childName', 'childBirthDate', 'childGender'];
        if (currentStepKey === 'story') {
             fieldsToValidate = ['storyValue', 'customGoal'];
             if (product.text_fields) {
                 fieldsToValidate = [...fieldsToValidate, ...product.text_fields.filter(f => f.required).map(f => f.id)];
             }
        }
        if (currentStepKey === 'delivery' && formData.deliveryType === 'printed') {
             fieldsToValidate = ['recipientName', 'recipientAddress', 'recipientPhone', 'governorate'];
             if(formData.sendDigitalCard) fieldsToValidate.push('recipientEmail');
        }

        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            setStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const onSubmit = async (data: OrderFormValues) => {
         // Enforce Profile Completion
        if (!isProfileComplete) {
            triggerProfileUpdate(true); // Mandatory
            return;
        }

        // STRICT CHECK: Double validation for Shipping Logic
        if (data.deliveryType === 'printed') {
            // 1. Check if governorate is present in the final data
            if (!data.governorate || data.governorate.trim() === '') {
                 addToast('عذراً، يجب تحديد المحافظة لحساب تكلفة الشحن.', 'error');
                 // Redirect back to delivery step
                 const deliveryStepIndex = steps.findIndex(s => s.key === 'delivery');
                 setStep(deliveryStepIndex);
                 return;
            }

            // 2. Re-calculate shipping cost to ensure it's valid (> 0)
            let calculatedShipping = 0;
            if (shippingCosts && data.governorate) {
                const egyptCosts = shippingCosts['مصر'] || {};
                calculatedShipping = egyptCosts[data.governorate] || egyptCosts['باقي المحافظات'] || 0;
            }

            if (calculatedShipping <= 0) {
                 addToast('حدث خطأ في حساب الشحن للمحافظة المختارة. يرجى التأكد من الاختيار.', 'error');
                 const deliveryStepIndex = steps.findIndex(s => s.key === 'delivery');
                 setStep(deliveryStepIndex);
                 return;
            }
        }

        setIsSubmitting(true);
        
        // Prepare file uploads
        const files: Record<string, File> = {};
        if (product.image_slots) {
            product.image_slots.forEach(slot => {
                if ((data as any)[slot.id] instanceof File) {
                    files[slot.id] = (data as any)[slot.id];
                }
            });
        }
        
        // Use the strictly calculated shipping price inside this function
        // Re-calculate one last time to be safe based on 'data' argument, not 'formData' state
        let finalShippingPrice = 0;
        if (data.deliveryType === 'printed' && shippingCosts) {
             const egyptCosts = shippingCosts['مصر'] || {};
             finalShippingPrice = egyptCosts[data.governorate || ''] || egyptCosts['باقي المحافظات'] || 0;
        }

        const finalTotal = totalPrice; // Base + Addons

        addItemToCart({
            type: 'order',
            payload: {
                productKey: product.key,
                formData: data, 
                files, 
                selectedAddons,
                totalPrice: finalTotal,
                shippingPrice: finalShippingPrice, // Use the strictly calculated value
                summary: `${product.title} لـ ${data.childName}`,
                details: {
                    ...data,
                    productTitle: product.title,
                    isPrinted: data.deliveryType === 'printed'
                }
            }
        });

        addToast('تمت إضافة الطلب للسلة بنجاح!', 'success');
        navigate('/cart');
        setIsSubmitting(false);
    };

    return (
        <FormProvider {...methods}>
            <ChildProfileModal isOpen={isChildModalOpen} onClose={() => setIsChildModalOpen(false)} childToEdit={null} />
            <div className="bg-muted/30 py-12 sm:py-16 min-h-screen">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-extrabold text-foreground mb-2">{product.title}</h1>
                            <OrderStepper steps={steps} currentStep={currentStepKey} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                            <div className="lg:col-span-2 space-y-6">
                                <Card>
                                    <CardContent className="pt-6">
                                        {currentStepKey === 'child' && (
                                            <ChildDetailsSection 
                                                childProfiles={childProfiles}
                                                onSelectChild={(child) => setSelectedChildId(child ? child.id : null)}
                                                selectedChildId={selectedChildId}
                                                currentUser={currentUser}
                                                onAddChild={() => setIsChildModalOpen(true)}
                                            />
                                        )}
                                        {currentStepKey === 'story' && (
                                            <>
                                                <StoryCustomizationSection 
                                                    textFields={product.text_fields || []}
                                                    goalConfig={product.goal_config}
                                                    storyGoals={product.story_goals || []}
                                                />
                                                <div className="mt-8 border-t pt-6">
                                                    <ImageUploadSection imageSlots={product.image_slots || []} />
                                                </div>
                                            </>
                                        )}
                                        {currentStepKey === 'addons' && (
                                            <AddonsSection 
                                                addonProducts={addonProducts}
                                                selectedAddons={selectedAddons}
                                                onToggle={(key) => setSelectedAddons(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])}
                                            />
                                        )}
                                        {currentStepKey === 'delivery' && (
                                            <DeliverySection product={product} />
                                        )}
                                        {currentStepKey === 'review' && (
                                            <div className="space-y-4">
                                                <h3 className="text-xl font-bold">مراجعة نهائية</h3>
                                                <p className="text-muted-foreground">يرجى التأكد من صحة جميع البيانات قبل الإضافة للسلة.</p>
                                                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm text-yellow-800">
                                                    <p>بمجرد تأكيد الطلب، سيتم البدء في تجهيز قصتك المخصصة.</p>
                                                </div>
                                                {/* عرض تنبيه إذا كانت المحافظة فارغة في هذه الخطوة */}
                                                {formData.deliveryType === 'printed' && (!formData.governorate || shippingPrice === 0) && (
                                                    <div className="bg-red-50 p-3 rounded border border-red-200 text-red-700 font-bold text-sm">
                                                        تنبيه: لم يتم تحديد المحافظة أو حساب الشحن. يرجى العودة لخطوة الشحن.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                                
                                <div className="flex justify-between mt-6">
                                    <Button 
                                        onClick={handleBack} 
                                        disabled={step === 0} 
                                        variant="outline"
                                        icon={<ArrowRight size={16} />}
                                    >
                                        السابق
                                    </Button>
                                    
                                    {step === steps.length - 1 ? (
                                        <Button 
                                            onClick={handleSubmit(onSubmit)} 
                                            loading={isSubmitting} 
                                            icon={<ArrowLeft size={16} />}
                                            variant="success"
                                            className="w-40"
                                        >
                                            إضافة للسلة
                                        </Button>
                                    ) : (
                                        <Button 
                                            onClick={handleNext} 
                                            icon={<ArrowLeft size={16} />}
                                            className="w-32"
                                        >
                                            التالي
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="lg:col-span-1 sticky top-24">
                                <InteractivePreview 
                                    formData={formData as any}
                                    product={product}
                                    basePrice={basePrice}
                                    addons={selectedAddons.map(key => {
                                        const p = addonProducts.find(ap => ap.key === key);
                                        return { key, title: p?.title || '', price: (formData.deliveryType === 'electronic' ? p?.price_electronic : p?.price_printed) || 0 };
                                    })}
                                    totalPrice={totalPrice}
                                    shippingPrice={shippingPrice}
                                    imagePreviewUrl={null} 
                                    storyGoals={product.story_goals || []}
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
