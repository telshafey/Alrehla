import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useProduct } from '../contexts/ProductContext';
import { Send, Gift, Check } from 'lucide-react';
import Accordion from '../components/ui/Accordion';
import ImageUpload from '../components/order/ImageUpload';
import { EGYPTIAN_GOVERNORATES } from '../utils/governorates';
import ShareButtons from '../components/shared/ShareButtons';
import { Button } from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';

const SubscriptionPage: React.FC = () => {
    const { addItemToCart } = useCart();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { prices } = useProduct();
    const pageUrl = window.location.href;

    const [formData, setFormData] = useState({
        childName: '',
        childAge: '',
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

    const subscriptionPrice = prices?.subscriptionBox || 250;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (id: string, file: File | null) => {
        setImageFiles(prev => ({ ...prev, [id]: file }));
    };

    const handleSubmit = async () => {
        if (!formData.childName || !formData.childAge) {
            addToast('يرجى إدخال اسم وعمر الطفل للاشتراك.', 'warning');
            return;
        }
        if (!imageFiles['child_photo_1']) {
            addToast('يرجى رفع صورة وجه الطفل للاشتراك.', 'warning');
            return;
        }

        setIsSubmitting(true);
        addItemToCart({
            type: 'subscription',
            payload: { 
                formData, 
                imageFiles,
                total: subscriptionPrice,
                summary: 'صندوق الرحلة الشهري',
            }
        });
        
        addToast('تمت إضافة الاشتراك إلى السلة بنجاح!', 'success');
        navigate('/cart');
        setIsSubmitting(false);
    };

    return (
        <div className="bg-gray-50 py-16 sm:py-20 animate-fadeIn">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 leading-tight">
                        صندوق <span className="text-orange-500">الرحلة الشهري</span>
                    </h1>
                    <p className="mt-6 max-w-3xl mx-auto text-lg text-gray-600">
                        هدية متجددة كل شهر، تفتح لطفلك أبواباً جديدة من الخيال والمعرفة. في كل صندوق، قصة جديدة ومجموعة من الأنشطة الإبداعية التي تنمي مهاراته وتعزز ارتباطه باللغة.
                    </p>
                    <div className="mt-8 flex justify-center">
                        <ShareButtons 
                            title='اكتشف صندوق الرحلة الشهري - هدية متجددة لطفلك!' 
                            url={pageUrl} 
                            label="شارك الاشتراك:"
                        />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Form */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border space-y-8">
                         <div>
                            <h3 className="text-lg font-bold text-gray-700 mb-4">1. تفاصيل الطفل الأساسية</h3>
                            <div className="p-4 bg-gray-50 rounded-lg border grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField label="اسم الطفل*" htmlFor="childName">
                                    <Input type="text" id="childName" name="childName" value={formData.childName} onChange={handleChange} required />
                                </FormField>
                                <FormField label="العمر*" htmlFor="childAge">
                                    <Input type="number" id="childAge" name="childAge" value={formData.childAge} onChange={handleChange} required />
                                </FormField>
                                <FormField label="الجنس*" htmlFor="childGender" className="md:col-span-2">
                                    <Select id="childGender" name="childGender" value={formData.childGender} onChange={handleChange}>
                                        <option value="ذكر">ذكر</option>
                                        <option value="أنثى">أنثى</option>
                                    </Select>
                                </FormField>
                            </div>
                        </div>

                        <Accordion title="2. تفاصيل تخصيص القصة">
                           <div className="p-6 space-y-6">
                                <FormField label="أخبرنا عن طفلك" htmlFor="childTraits">
                                    <Textarea id="childTraits" name="childTraits" value={formData.childTraits} onChange={handleChange} rows={4} placeholder="مثال: شجاع، يحب الديناصورات..."/>
                                </FormField>
                                <FormField label="أسماء أفراد العائلة (اختياري)" htmlFor="familyNames">
                                    <Textarea id="familyNames" name="familyNames" value={formData.familyNames} onChange={handleChange} rows={2} placeholder="مثال: الأم: فاطمة، الأب: علي"/>
                                </FormField>
                                <FormField label="أسماء الأصدقاء (اختياري)" htmlFor="friendNames">
                                    <Textarea id="friendNames" name="friendNames" value={formData.friendNames} onChange={handleChange} rows={2} placeholder="مثال: صديقه المقرب: خالد"/>
                                </FormField>
                           </div>
                        </Accordion>
                        
                        <Accordion title="3. صور التخصيص (للطفل)">
                           <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                               <ImageUpload id="child_photo_1" label="صورة وجه الطفل (إلزامي)" onFileChange={handleFileChange} file={imageFiles['child_photo_1']} />
                               <ImageUpload id="child_photo_2" label="صورة ثانية للطفل (اختياري)" onFileChange={handleFileChange} file={imageFiles['child_photo_2']} />
                               <ImageUpload id="child_photo_3" label="صورة ثالثة للطفل (اختياري)" onFileChange={handleFileChange} file={imageFiles['child_photo_3']} />
                           </div>
                        </Accordion>

                        <Accordion title="4. تفاصيل التوصيل">
                             <div className="p-6 space-y-4">
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
                                        <FormField label="اسم المستلم*" htmlFor="giftName" className="md:col-span-2">
                                            <Input type="text" id="giftName" name="giftName" value={formData.giftName} onChange={handleChange} required={formData.shippingOption === 'gift'} />
                                        </FormField>
                                        <FormField label="عنوان المستلم*" htmlFor="giftAddress" className="md:col-span-2">
                                            <Input type="text" id="giftAddress" name="giftAddress" value={formData.giftAddress} onChange={handleChange} required={formData.shippingOption === 'gift'} />
                                        </FormField>
                                        <FormField label="هاتف المستلم*" htmlFor="giftPhone">
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
                        </Accordion>
                    </div>

                    {/* Summary & CTA */}
                    <div className="lg:col-span-1 sticky top-24">
                        <div className="bg-white p-8 rounded-2xl shadow-xl border">
                            <div className="text-center">
                                <Gift className="mx-auto h-16 w-16 text-orange-400" />
                                <h2 className="text-2xl font-bold mt-4">ملخص الاشتراك</h2>
                                <p className="text-5xl font-extrabold my-4">{subscriptionPrice} <span className="text-xl font-normal">ج.م/شهرياً</span></p>
                            </div>
                            <div className="mt-8 space-y-3 pt-4 border-t">
                                <div className="flex items-center gap-3"><Check className="text-green-500"/><span>قصة مخصصة جديدة كل شهر.</span></div>
                                <div className="flex items-center gap-3"><Check className="text-green-500"/><span>أنشطة تفاعلية وألعاب تعليمية.</span></div>
                                <div className="flex items-center gap-3"><Check className="text-green-500"/><span>هدية إضافية مختارة بعناية.</span></div>
                            </div>
                            <Button 
                                onClick={handleSubmit}
                                loading={isSubmitting}
                                disabled={!formData.childName || !formData.childAge || !imageFiles['child_photo_1']}
                                variant="special"
                                icon={<Send />}
                                className="mt-8 w-full">
                                 {isSubmitting ? 'جاري...' : 'إضافة إلى السلة'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;