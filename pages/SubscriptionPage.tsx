import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useAppMutations } from '../hooks/mutations.ts';
import { useToast } from '../contexts/ToastContext.tsx';
import { Loader2, Send, Gift, Check, Package } from 'lucide-react';
import Accordion from '../components/ui/Accordion.tsx';
import ImageUpload from '../components/order/ImageUpload.tsx';
import { EGYPTIAN_GOVERNORATES } from '../utils/governorates.ts';
import ShareButtons from '../components/shared/ShareButtons.tsx';

const SubscriptionPage: React.FC = () => {
    const { currentUser, isLoggedIn } = useAuth();
    const { createSubscription } = useAppMutations();
    const navigate = useNavigate();
    const { addToast } = useToast();
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (id: string, file: File | null) => {
        setImageFiles(prev => ({ ...prev, [id]: file }));
    };

    const handleSubmit = async () => {
        if (!isLoggedIn) {
            navigate('/account', { state: { from: { pathname: '/enha-lak/subscription' } } });
            return;
        }
        if (!formData.childName || !formData.childAge) {
            addToast('يرجى إدخال اسم وعمر الطفل للاشتراك.', 'warning');
            return;
        }
        if (!imageFiles['child_photo_1']) {
            addToast('يرجى رفع صورة وجه الطفل للاشتراك.', 'warning');
            return;
        }

        setIsSubmitting(true);
        try {
            // Correctly call the mutation function using `.mutateAsync`.
            const newSub = await createSubscription.mutateAsync({ formData, imageFiles });
            navigate(`/checkout?type=subscription&id=${newSub.id}`);
        } catch (e) {
            // Error handled in hook
        } finally {
            setIsSubmitting(false);
        }
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
                                <div>
                                    <label htmlFor="childName" className="block text-sm font-bold text-gray-700 mb-2">اسم الطفل*</label>
                                    <input type="text" id="childName" name="childName" value={formData.childName} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                                </div>
                                <div>
                                    <label htmlFor="childAge" className="block text-sm font-bold text-gray-700 mb-2">العمر*</label>
                                    <input type="number" id="childAge" name="childAge" value={formData.childAge} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="childGender" className="block text-sm font-bold text-gray-700 mb-2">الجنس*</label>
                                    <select id="childGender" name="childGender" value={formData.childGender} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white">
                                        <option value="ذكر">ذكر</option>
                                        <option value="أنثى">أنثى</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <Accordion title="2. تفاصيل تخصيص القصة">
                           <div className="p-6 space-y-6">
                                <div>
                                    <label htmlFor="childTraits" className="block text-sm font-bold text-gray-700 mb-2">أخبرنا عن طفلك</label>
                                    <textarea id="childTraits" name="childTraits" value={formData.childTraits} onChange={handleChange} rows={4} className="w-full p-2 border rounded-lg" placeholder="مثال: شجاع، يحب الديناصورات..."></textarea>
                                </div>
                                <div>
                                    <label htmlFor="familyNames" className="block text-sm font-bold text-gray-700 mb-2">أسماء أفراد العائلة (اختياري)</label>
                                    <textarea id="familyNames" name="familyNames" value={formData.familyNames} onChange={handleChange} rows={2} className="w-full p-2 border rounded-lg" placeholder="مثال: الأم: فاطمة، الأب: علي"></textarea>
                                </div>
                                <div>
                                    <label htmlFor="friendNames" className="block text-sm font-bold text-gray-700 mb-2">أسماء الأصدقاء (اختياري)</label>
                                    <textarea id="friendNames" name="friendNames" value={formData.friendNames} onChange={handleChange} rows={2} className="w-full p-2 border rounded-lg" placeholder="مثال: صديقه المقرب: خالد"></textarea>
                                </div>
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
                                        <div className="md:col-span-2">
                                            <label htmlFor="giftName" className="block text-sm font-bold text-gray-700 mb-2">اسم المستلم*</label>
                                            <input type="text" id="giftName" name="giftName" value={formData.giftName} onChange={handleChange} className="w-full p-2 border rounded-lg" required={formData.shippingOption === 'gift'} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label htmlFor="giftAddress" className="block text-sm font-bold text-gray-700 mb-2">عنوان المستلم*</label>
                                            <input type="text" id="giftAddress" name="giftAddress" value={formData.giftAddress} onChange={handleChange} className="w-full p-2 border rounded-lg" required={formData.shippingOption === 'gift'} />
                                        </div>
                                        <div>
                                            <label htmlFor="giftPhone" className="block text-sm font-bold text-gray-700 mb-2">هاتف المستلم*</label>
                                            <input type="tel" id="giftPhone" name="giftPhone" value={formData.giftPhone} onChange={handleChange} className="w-full p-2 border rounded-lg" required={formData.shippingOption === 'gift'} />
                                        </div>
                                    </div>
                                )}
                                
                                <div>
                                    <label htmlFor="governorate" className="block text-sm font-bold text-gray-700 mb-2">
                                        {formData.shippingOption === 'gift' ? 'محافظة المستلم' : 'المحافظة'}
                                    </label>
                                    <select id="governorate" name="governorate" value={formData.governorate} onChange={handleChange} className="w-full p-2 border rounded-lg bg-white">
                                        {EGYPTIAN_GOVERNORATES.map(gov => <option key={gov} value={gov}>{gov}</option>)}
                                    </select>
                                </div>
                            </div>
                        </Accordion>
                    </div>

                    {/* Summary & CTA */}
                    <div className="lg:col-span-1 sticky top-24">
                        <div className="bg-white p-8 rounded-2xl shadow-xl border">
                            <div className="text-center">
                                <Gift className="mx-auto h-16 w-16 text-orange-400" />
                                <h2 className="text-2xl font-bold mt-4">ملخص الاشتراك</h2>
                                <p className="text-5xl font-extrabold my-4">250 <span className="text-xl font-normal">ج.م/شهرياً</span></p>
                            </div>
                            <div className="mt-8 space-y-3 pt-4 border-t">
                                <div className="flex items-center gap-3"><Check className="text-green-500"/><span>قصة مخصصة جديدة كل شهر.</span></div>
                                <div className="flex items-center gap-3"><Check className="text-green-500"/><span>أنشطة تفاعلية وألعاب تعليمية.</span></div>
                                <div className="flex items-center gap-3"><Check className="text-green-500"/><span>هدية إضافية مختارة بعناية.</span></div>
                            </div>
                            <button 
                                onClick={handleSubmit}
                                disabled={isSubmitting || !formData.childName || !formData.childAge || !imageFiles['child_photo_1']}
                                className="mt-8 w-full flex items-center justify-center gap-2 bg-orange-500 text-white font-bold py-3 px-4 rounded-full hover:bg-orange-600 transition-transform transform hover:scale-105 shadow-lg disabled:bg-gray-400">
                                 {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
                                <span>{isSubmitting ? 'جاري...' : 'الانتقال إلى الدفع'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;
