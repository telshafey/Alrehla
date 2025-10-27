import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePublicData } from '../hooks/publicQueries';
import { useProduct } from '../contexts/ProductContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { Loader2, Send } from 'lucide-react';
import InteractivePreview from '../components/order/InteractivePreview';
import ChildDetailsSection from '../components/order/ChildDetailsSection';
import StoryCustomizationSection from '../components/order/StoryCustomizationSection';
import ImageUploadSection from '../components/order/ImageUploadSection';
import DeliverySection from '../components/order/DeliverySection';
import StoryIdeasModal from '../components/order/StoryIdeasModal';
import AddonsSection from '../components/order/AddonsSection';
import { Button } from '../components/ui/Button';
import type { Prices } from '../contexts/ProductContext';
import PageLoader from '../components/ui/PageLoader';
import { ArrowLeft } from 'lucide-react';

const getPrice = (key: string, prices: Prices | null, deliveryType?: 'printed' | 'electronic'): number => {
    if (!prices) return 0;
    if (key === 'custom_story') {
        return deliveryType === 'printed' ? prices.story.printed : prices.story.electronic;
    }
    const camelKey = key.replace(/_(\w)/g, (_, c) => c.toUpperCase()) as keyof Omit<Prices, 'story'>;
    return (prices as any)[camelKey] || 0;
};


const OrderPage: React.FC = () => {
    const { productKey } = useParams<{ productKey: string }>();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { data, isLoading: productsLoading } = usePublicData();
    const { prices, loading: pricesLoading } = useProduct();
    const { addItemToCart } = useCart();
    const personalizedProducts = data?.personalizedProducts || [];

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
    const [imageFiles, setImageFiles] = useState<{ [key: string]: File | null }>({});
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // New state for AI ideas
    const [isIdeasModalOpen, setIsIdeasModalOpen] = useState(false);
    const [storyIdeas, setStoryIdeas] = useState<any[]>([]);
    const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
    
    const product = useMemo(() => personalizedProducts.find(p => p.key === productKey), [personalizedProducts, productKey]);

    const addonProducts = useMemo(() => 
        personalizedProducts.filter(p => !['custom_story', 'gift_box'].includes(p.key)),
    [personalizedProducts]);
    
    const basePrice = useMemo(() => {
        if (!product || !prices) return 0;
        return getPrice(product.key, prices, formData.deliveryType);
    }, [product, prices, formData.deliveryType]);

    const addonsPrice = useMemo(() => {
        if (!prices) return 0;
        return selectedAddons.reduce((total, addonKey) => {
            return total + getPrice(addonKey, prices);
        }, 0);
    }, [selectedAddons, prices]);

    const totalPrice = basePrice + addonsPrice;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (id: string, file: File | null) => {
        setImageFiles(prev => ({ ...prev, [id]: file }));
    };

    const handleToggleAddon = (key: string) => {
        setSelectedAddons(prev => 
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };
    
    const handleGenerateIdeas = async () => {
        if (!formData.childName || !formData.childAge) {
            addToast('يرجى إدخال اسم وعمر الطفل أولاً للحصول على أفكار.', 'warning');
            return;
        }
        setIsGeneratingIdeas(true);
        try {
            const response = await fetch('/api/generateStoryIdeas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    childName: formData.childName,
                    childAge: formData.childAge,
                    childGender: formData.childGender,
                    childTraits: formData.childTraits,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'فشل توليد الأفكار.');
            }
            setStoryIdeas(data.ideas);
            setIsIdeasModalOpen(true);
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsGeneratingIdeas(false);
        }
    };

    const handleSelectIdea = (idea: any) => {
        setFormData(prev => ({
            ...prev,
            childTraits: `${prev.childTraits}\n\nفكرة القصة: ${idea.premise}`.trim(),
            storyValue: idea.goal_key,
            customGoal: '', // Reset custom goal
        }));
        setIsIdeasModalOpen(false);
        addToast('تم اختيار الفكرة وتطبيقها!', 'success');
    };

    const handleSubmit = async () => {
        if (!formData.childName || !formData.childAge) {
            addToast('يرجى إدخال اسم وعمر الطفل.', 'warning');
            return;
        }
        if (!imageFiles['child_photo_1']) {
            addToast('يرجى رفع صورة وجه الطفل على الأقل.', 'warning');
            return;
        }

        setIsSubmitting(true);
        addItemToCart({
            type: 'order',
            payload: {
                product,
                formData,
                imageFiles,
                selectedAddons,
                totalPrice,
                summary: `${product?.title || 'منتج'} لـ ${formData.childName}`,
            }
        });
        addToast('تمت إضافة الطلب إلى السلة بنجاح!', 'success');
        navigate('/cart');
        setIsSubmitting(false);
    };

    const isLoading = productsLoading || pricesLoading;

    if (isLoading) {
        return <PageLoader text="جاري تحميل صفحة الطلب..." />;
    }
    
    if (!product) {
        return <div className="text-center py-20">عفواً، هذا المنتج غير متوفر حالياً.</div>;
    }

    return (
        <>
            <StoryIdeasModal 
                isOpen={isIdeasModalOpen}
                onClose={() => setIsIdeasModalOpen(false)}
                ideas={storyIdeas}
                onSelectIdea={handleSelectIdea}
            />
            <div className="bg-gray-50 py-12 sm:py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Form Section */}
                        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border space-y-8">
                            <h1 className="text-3xl font-extrabold text-gray-800">تخصيص: {product.title}</h1>
                            <ChildDetailsSection formData={formData} handleChange={handleChange} />
                            {(product.key === 'custom_story' || product.key === 'gift_box') && (
                                <StoryCustomizationSection
                                    formData={formData}
                                    handleChange={handleChange}
                                    onGenerateIdeas={handleGenerateIdeas}
                                    isGeneratingIdeas={isGeneratingIdeas}
                                />
                            )}
                            <ImageUploadSection files={imageFiles} onFileChange={handleFileChange} />
                            <DeliverySection formData={formData} handleChange={handleChange} />
                            <AddonsSection 
                                addonProducts={addonProducts}
                                selectedAddons={selectedAddons}
                                onToggle={handleToggleAddon}
                                prices={prices}
                            />
                        </div>

                        {/* Summary Section */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">
                                <InteractivePreview
                                    formData={formData}
                                    product={product}
                                    basePrice={basePrice}
                                    addons={selectedAddons.map(key => ({
                                        key,
                                        title: addonProducts.find(p => p.key === key)?.title || key,
                                        price: getPrice(key, prices) || 0
                                    }))}
                                    totalPrice={totalPrice}
                                />
                                <Button
                                    onClick={handleSubmit}
                                    loading={isSubmitting}
                                    disabled={!formData.childName || !formData.childAge || !imageFiles['child_photo_1']}
                                    variant="special"
                                    icon={<Send />}
                                    className="w-full"
                                >
                                    {isSubmitting ? 'جاري الإضافة...' : 'إضافة إلى السلة'}
                                </Button>
                                 <div className="text-center">
                                    <button onClick={() => navigate('/enha-lak/store')} className="text-sm text-gray-500 hover:underline flex items-center justify-center gap-1 mx-auto">
                                        <ArrowLeft size={16} />
                                        <span>العودة إلى المتجر</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default OrderPage;