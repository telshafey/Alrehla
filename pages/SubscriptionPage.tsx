import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { usePublicData } from '../hooks/queries/public/usePublicDataQuery';
import { Send, Gift, Check, Star, ArrowLeft } from 'lucide-react';
import ShareButtons from '../components/shared/ShareButtons';
import { Button } from '../components/ui/Button';
import PageLoader from '../components/ui/PageLoader';
import type { SubscriptionPlan } from '../lib/database.types';
import OrderStepper from '../components/order/OrderStepper';
import SubscriptionSummary from '../components/subscription/SubscriptionSummary';
import FormField from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import ImageUpload from '../components/shared/ImageUpload';
import { EGYPTIAN_GOVERNORATES } from '../utils/governorates';

type SubscriptionStep = 'plan' | 'child' | 'customization' | 'images' | 'delivery';

const stepsConfig = [
    { key: 'plan', title: 'اختر الباقة' },
    { key: 'child', title: 'بيانات الطفل' },
    { key: 'customization', title: 'تخصيص القصة' },
    { key: 'images', title: 'رفع الصور' },
    { key: 'delivery', title: 'التوصيل' },
];

const PlanCard: React.FC<{ plan: SubscriptionPlan, isSelected: boolean, onSelect: () => void }> = ({ plan, isSelected, onSelect }) => (
    <button
        type="button"
        onClick={onSelect}
        className={`relative text-right p-6 border-2 rounded-2xl transition-all duration-300 w-full ${isSelected ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' : 'bg-white hover:border-blue-300'}`}
    >
        {plan.is_best_value && (
            <div className="absolute -top-3 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Star size={12} /> الأفضل قيمة
            </div>
        )}
        <h3 className="text-xl font-extrabold text-gray-800">{plan.name}</h3>
        <p className="text-3xl font-black my-2">{plan.price} <span className="text-lg font-medium">ج.م</span></p>
        <p className="text-sm text-gray-500">~{plan.price_per_month} ج.م / شهرياً</p>
        {plan.savings_text && <p className="text-sm font-bold text-green-600 mt-2">{plan.savings_text}</p>}
    </button>
);


const SubscriptionPage: React.FC = () => {
    const { addItemToCart } = useCart();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { data, isLoading: contentLoading } = usePublicData();
    const content = data?.siteContent?.enhaLakPage.subscription;
    const subscriptionPlans = data?.subscriptionPlans || [];
    const pageUrl = window.location.href;

    const [step, setStep] = useState<SubscriptionStep>('plan');
    const [formData, setFormData] = useState({
        childName: '',
        childBirthDate: '',
        childGender: 'ذكر' as 'ذكر' | 'أنثى',
        childTraits: '',
        familyNames: '',
        friendNames: '',
        shippingOption: 'my_address' as 'my_address' | 'gift',
        governorate: 'القاهرة',
        giftName: '',
        giftAddress: '',
        giftPhone: '',
    });
    const [imageFiles, setImageFiles] = useState<{ [key: string]: File | null }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    
    const bestValuePlan = subscriptionPlans.find((p: SubscriptionPlan) => p.is_best_value) || subscriptionPlans[0];
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(bestValuePlan);

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
         if(errors[id]) setErrors(prev => {
            const newErrors = {...prev};
            delete newErrors[id];
            return newErrors;
        });
    };
    
    const validateStep = () => {
        const newErrors: { [key: string]: string } = {};
        switch(step) {
            case 'plan':
                if (!selectedPlan) newErrors.plan = 'يجب اختيار باقة للمتابعة.';
                break;
            case 'child':
                if (!formData.childName.trim()) newErrors.childName = 'اسم الطفل مطلوب.';
                if (!formData.childBirthDate) newErrors.childBirthDate = 'تاريخ ميلاد الطفل مطلوب.';
                break;
            case 'images':
                 if (!imageFiles['child_photo_1']) newErrors['child_photo_1'] = 'صورة وجه الطفل إلزامية.';
                break;
            case 'delivery':
                if (formData.shippingOption === 'gift') {
                    if (!formData.giftName) newErrors.giftName = 'اسم المستلم مطلوب.';
                    if (!formData.giftAddress) newErrors.giftAddress = 'عنوان المستلم مطلوب.';
                    if (!formData.giftPhone) newErrors.giftPhone = 'هاتف المستلم مطلوب.';
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
        setErrors({});
        const currentIndex = stepsConfig.findIndex(s => s.key === step);
        if (currentIndex < stepsConfig.length - 1) {
            setStep(stepsConfig[currentIndex + 1].key as SubscriptionStep);
        }
    };
    
    const handleBack = () => {
        const currentIndex = stepsConfig.findIndex(s => s.key === step);
        if (currentIndex > 0) {
            setStep(stepsConfig[currentIndex - 1].key as SubscriptionStep);
        }
    };

    const handleSubmit = async () => {
         if (!validateStep()) {
            addToast('يرجى مراجعة بيانات التوصيل.', 'warning');
            return;
        }

        setIsSubmitting(true);
        addItemToCart({
            type: 'subscription',
            payload: { 
                formData, 
                imageFiles,
                total: selectedPlan!.price,
                summary: `صندوق الرحلة (${selectedPlan!.name})`,
                plan: selectedPlan,
            }
        });
        
        addToast('تمت إضافة الاشتراك إلى السلة بنجاح!', 'success');
        navigate('/cart');
        setIsSubmitting(false);
    };
    
    const renderStepContent = () => {
        switch (step) {
            case 'plan':
                return (
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">1. اختر باقة الاشتراك</h3>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {(subscriptionPlans as SubscriptionPlan[]).map(plan => (
                                <PlanCard key={plan.id} plan={plan} isSelected={selectedPlan?.id === plan.id} onSelect={() => setSelectedPlan(plan)} />
                            ))}
                        </div>
                         {errors.plan && <p className="mt-4 text-sm text-red-600">{errors.plan}</p>}
                    </div>
                );
            case 'child':
                return (
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">2. تفاصيل الطفل الأساسية</h3>
                        <div className="p-4 bg-gray-50 rounded-lg border grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="اسم الطفل*" htmlFor="childName" error={errors.childName}>
                                <Input type="text" id="childName" name="childName" value={formData.childName} onChange={handleChange} required />
                            </FormField>
                            <FormField label="تاريخ الميلاد*" htmlFor="childBirthDate" error={errors.childBirthDate}>
                                <Input type="date" id="childBirthDate" name="childBirthDate" value={formData.childBirthDate} onChange={handleChange} required />
                            </FormField>
                            <FormField label="الجنس*" htmlFor="childGender" className="md:col-span-2">
                                <Select id="childGender" name="childGender" value={formData.childGender} onChange={handleChange}>
                                    <option value="ذكر">ذكر</option>
                                    <option value="أنثى">أنثى</option>
                                </Select>
                            </FormField>
                        </div>
                    </div>
                );
            case 'customization':
                return (
                     <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">3. تفاصيل تخصيص القصة (اختياري)</h3>
                        <div className="p-6 space-y-6 bg-gray-50 rounded-lg border">
                            <FormField label="أخبرنا عن طفلك" htmlFor="childTraits">
                                <Textarea id="childTraits" name="childTraits" value={formData.childTraits} onChange={handleChange} rows={4} placeholder="مثال: شجاع، يحب الديناصورات..."/>
                            </FormField>
                            <FormField label="أسماء أفراد العائلة" htmlFor="familyNames">
                                <Textarea id="familyNames" name="familyNames" value={formData.familyNames} onChange={handleChange} rows={2} placeholder="مثال: الأم: فاطمة، الأب: علي"/>
                            </FormField>
                            <FormField label="أسماء الأصدقاء" htmlFor="friendNames">
                                <Textarea id="friendNames" name="friendNames" value={formData.friendNames} onChange={handleChange} rows={2} placeholder="مثال: صديقه المقرب: خالد"/>
                            </FormField>
                       </div>
                    </div>
                );
            case 'images':
                 return (
                     <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">4. صور التخصيص (للطفل)</h3>
                         {errors['child_photo_1'] && <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{errors['child_photo_1']}</p>}
                       <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 rounded-lg border">
                           <ImageUpload id="child_photo_1" label="صورة وجه الطفل (إلزامي)" onFileChange={handleFileChange} file={imageFiles['child_photo_1']} />
                           <ImageUpload id="child_photo_2" label="صورة ثانية للطفل (اختياري)" onFileChange={handleFileChange} file={imageFiles['child_photo_2']} />
                           <ImageUpload id="child_photo_3" label="صورة ثالثة للطفل (اختياري)" onFileChange={handleFileChange} file={imageFiles['child_photo_3']} />
                       </div>
                    </div>
                 );
            case 'delivery':
                return (
                     <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">5. تفاصيل التوصيل</h3>
                         <div className="p-6 space-y-4 bg-gray-50 rounded-lg border">
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
                                    <FormField label="اسم المستلم*" htmlFor="giftName" className="md:col-span-2" error={errors.giftName}>
                                        <Input type="text" id="giftName" name="giftName" value={formData.giftName} onChange={handleChange} required={formData.shippingOption === 'gift'} />
                                    </FormField>
                                    <FormField label="عنوان المستلم*" htmlFor="giftAddress" className="md:col-span-2" error={errors.giftAddress}>
                                        <Input type="text" id="giftAddress" name="giftAddress" value={formData.giftAddress} onChange={handleChange} required={formData.shippingOption === 'gift'} />
                                    </FormField>
                                    <FormField label="هاتف المستلم*" htmlFor="giftPhone" error={errors.giftPhone}>
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
                    </div>
                );
        }
    };


    if (contentLoading) return <PageLoader />;

    return (
        <div className="bg-gray-50 py-16 sm:py-20 animate-fadeIn">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 leading-tight">
                        {content?.heroTitle.split(' ')[0]} <span className="text-orange-500">{content?.heroTitle.split(' ').slice(1).join(' ')}</span>
                    </h1>
                    <p className="mt-6 max-w-3xl mx-auto text-lg text-gray-600">
                        {content?.heroSubtitle}
                    </p>
                    <div className="mt-8 flex justify-center">
                        <ShareButtons 
                            title='اكتشف صندوق الرحلة الشهري - هدية متجددة لطفلك!' 
                            url={pageUrl} 
                            label="شارك الاشتراك:"
                        />
                    </div>
                </div>
                
                <div className="max-w-6xl mx-auto">
                    <div className="mb-12">
                         <OrderStepper steps={stepsConfig} currentStep={step} />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border space-y-10">
                            {renderStepContent()}
                            <div className="flex justify-between pt-6 border-t">
                                <Button onClick={handleBack} variant="outline" icon={<ArrowLeft className="transform rotate-180" />} disabled={step === 'plan'}>
                                    السابق
                                </Button>
                                {step !== 'delivery' ? (
                                    <Button onClick={handleNext}>التالي <ArrowLeft className="mr-2 h-4 w-4" /></Button>
                                ) : (
                                    <p className="text-sm text-gray-500">أكمل طلبك من الملخص على اليسار.</p>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-1 sticky top-24">
                            <SubscriptionSummary
                                selectedPlan={selectedPlan}
                                isSubmitting={isSubmitting}
                                onSubmit={handleSubmit}
                                step={step}
                                features={content?.features}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;