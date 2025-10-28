import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useProduct } from '../contexts/ProductContext';
import { useOrderData } from '../hooks/publicQueries';
import OrderStepper from '../components/order/OrderStepper';
import ChildDetailsSection from '../components/order/ChildDetailsSection';
import StoryCustomizationSection from '../components/order/StoryCustomizationSection';
import ImageUploadSection from '../components/order/ImageUploadSection';
import AddonsSection from '../components/order/AddonsSection';
import DeliverySection from '../components/order/DeliverySection';
import InteractivePreview from '../components/order/InteractivePreview';
import { Button } from '../components/ui/Button';
import type { ChildProfile } from '../lib/database.types';

type OrderStep = 'child' | 'customization' | 'images' | 'addons' | 'delivery';

const stepsConfig = [
    { key: 'child', title: 'بيانات الطفل' },
    { key: 'customization', title: 'تخصيص القصة' },
    { key: 'images', title: 'رفع الصور' },
    { key: 'addons', title: 'إضافات' },
    { key: 'delivery', title: 'التوصيل' },
];

const getPrice = (key: string, prices: any): number => {
    if (!prices) return 0;
    const camelKey = key.replace(/_(\w)/g, (_, c) => c.toUpperCase());
    if (key === 'custom_story') return prices.story.printed;
    return prices[camelKey as keyof typeof prices] || 0;
};


const OrderPage: React.FC = () => {
    const { productKey } = useParams<{ productKey: string }>();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { addItemToCart } = useCart();
    const { prices, shippingCosts, loading: productContextLoading } = useProduct();
    const { data: orderData, isLoading: orderDataLoading } = useOrderData();
    const { isLoggedIn, childProfiles } = useAuth();
    
    const [step, setStep] = useState<OrderStep>('child');
    const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        childName: '',
        childAge: '',
        childGender: 'ذكر' as 'ذكر' | 'أنثى',
        childTraits: '',
        storyValue: '',
        customGoal: '',
        familyNames: '',
        friendNames: '',
        deliveryType: 'printed' as 'printed' | 'electronic',
        shippingOption: 'my_address' as 'my_address' | 'gift',
        governorate: 'القاهرة',
        giftName: '',
        giftAddress: '',
        giftPhone: '',
    });
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [imageFiles, setImageFiles] = useState<{ [key: string]: File | null }>({});
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);


    const product = useMemo(() => 
        orderData?.personalizedProducts.find(p => p.key === productKey), 
    [orderData, productKey]);
    
    useEffect(() => {
        if(product?.key === 'gift_box' && orderData) {
            const addonKeys = orderData.personalizedProducts
                .filter(p => !['custom_story', 'gift_box'].includes(p.key))
                .map(p => p.key);
            setSelectedAddons(addonKeys);
        }
    }, [product, orderData]);

    const isLoading = productContextLoading || orderDataLoading;
    
    const addonProducts = useMemo(() => 
        orderData?.personalizedProducts.filter(p => !['custom_story', 'gift_box'].includes(p.key)) || [],
    [orderData]);

    const basePrice = useMemo(() => {
        if (!prices || !product) return 0;
        if (formData.deliveryType === 'electronic' && (product.key === 'custom_story' || product.key === 'gift_box')) {
            return prices.story.electronic;
        }
        return getPrice(product.key, prices);
    }, [prices, product, formData.deliveryType]);
    
    const addonsPrice = useMemo(() => {
        return selectedAddons.reduce((total, key) => total + getPrice(key, prices), 0);
    }, [selectedAddons, prices]);

    const shippingPrice = useMemo(() => {
        if (formData.deliveryType === 'electronic' || !shippingCosts) return 0;
        return shippingCosts[formData.governorate] || 0;
    }, [formData.governorate, formData.deliveryType, shippingCosts]);
    
    const totalPrice = basePrice + addonsPrice;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if(errors[name]) setErrors(prev => {
            const newErrors = {...prev};
            delete newErrors[name];
            return newErrors;
        });
    };

    const handleFileChange = (id: string, file: File | null) => {
        setImageFiles(prev => ({ ...prev, [id]: file }));
         if (id === 'child_photo_1') {
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
                childAge: child.age.toString(),
                childGender: child.gender,
            }));
        } else {
            // This is for manual entry
            setSelectedChildId(null);
            setFormData(prev => ({
                ...prev,
                childName: '',
                childAge: '',
                childGender: 'ذكر',
            }));
        }
    };
    
    const handleToggleAddon = (key: string) => {
        setSelectedAddons(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    };

     const validateStep = () => {
        const newErrors: { [key: string]: string } = {};
        switch(step) {
            case 'child':
                if (!formData.childName.trim()) newErrors.childName = 'اسم الطفل مطلوب.';
                if (!formData.childAge) newErrors.childAge = 'عمر الطفل مطلوب.';
                else if (parseInt(formData.childAge) <= 0) newErrors.childAge = 'العمر يجب أن يكون أكبر من صفر.';
                break;
            case 'images':
                 if (!imageFiles.child_photo_1) newErrors.child_photo_1 = 'صورة وجه الطفل إلزامية.';
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
            navigate(-1); // Go back to the store if on the first step
        }
    };

    const handleSubmit = () => {
        if (!validateStep()) return;
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
        switch (step) {
            case 'child': return <ChildDetailsSection 
                                    formData={formData} 
                                    handleChange={handleChange} 
                                    errors={errors}
                                    childProfiles={childProfiles}
                                    onSelectChild={handleSelectChild}
                                    selectedChildId={selectedChildId}
                                />;
            case 'customization': return <StoryCustomizationSection formData={formData} handleChange={handleChange} />;
            case 'images': return <ImageUploadSection files={imageFiles} onFileChange={handleFileChange} errors={errors} />;
            case 'addons': return <AddonsSection addonProducts={addonProducts} selectedAddons={selectedAddons} onToggle={handleToggleAddon} prices={prices} />;
            case 'delivery': return <DeliverySection formData={formData} handleChange={handleChange} />;
        }
    };

    return (
        <div className="bg-gray-50 py-12 sm:py-16">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-12">
                         <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-800 mb-4">تخصيص: {product.title}</h1>
                         <OrderStepper steps={stepsConfig} currentStep={step} />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border space-y-10">
                            {renderStepContent()}
                            <div className="flex justify-between pt-6 border-t">
                                <Button onClick={handleBack} variant="outline" icon={<ArrowLeft className="transform rotate-180" />}>
                                    {step === 'child' ? 'رجوع' : 'السابق'}
                                </Button>
                                {step !== 'delivery' ? (
                                    <Button onClick={handleNext}>التالي <ArrowLeft className="mr-2 h-4 w-4" /></Button>
                                ) : (
                                    <Button onClick={handleSubmit} loading={isSubmitting} variant="success" icon={<ShoppingCart />}>إضافة إلى السلة</Button>
                                )}
                            </div>
                        </div>
                        <div className="lg:col-span-1 sticky top-24">
                            <InteractivePreview 
                                formData={formData} 
                                product={product}
                                basePrice={basePrice}
                                addons={selectedAddons.map(key => ({ key, title: addonProducts.find(p => p.key === key)?.title || '', price: getPrice(key, prices) }))}
                                totalPrice={totalPrice}
                                imagePreviewUrl={imagePreviewUrl}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderPage;