import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { usePublicData } from '../hooks/queries.ts';
import { useProduct } from '../contexts/ProductContext.tsx';
import { useAppMutations } from '../hooks/mutations.ts';
import { useToast } from '../contexts/ToastContext.tsx';
import { Loader2, Send } from 'lucide-react';
import InteractivePreview from '../components/order/InteractivePreview.tsx';
import ChildDetailsSection from '../components/order/ChildDetailsSection.tsx';
import StoryCustomizationSection from '../components/order/StoryCustomizationSection.tsx';
import ImageUploadSection from '../components/order/ImageUploadSection.tsx';
import DeliverySection from '../components/order/DeliverySection.tsx';
import StoryIdeasModal from '../components/order/StoryIdeasModal.tsx';
import AddonsSection from '../components/order/AddonsSection.tsx';
import type { Prices } from '../contexts/ProductContext.tsx';

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
    const { currentUser } = useAuth();
    const { data, isLoading: productsLoading } = usePublicData();
    const { prices, loading: pricesLoading } = useProduct();
    const { createOrder } = useAppMutations();
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

    const product = personalizedProducts.find(p => p.key === productKey);
    
    const addonProducts = useMemo(() => {
        return personalizedProducts.filter(p => p.key !== productKey && !['custom_story', 'gift_box'].includes(p.key));
    }, [personalizedProducts, productKey]);

    const { basePrice, addonsPrice, totalPrice } = useMemo(() => {
        if (!product || !prices) return { basePrice: 0, addonsPrice: 0, totalPrice: 0 };
        const basePrice = getPrice(product.key, prices, formData.deliveryType);
        const addonsPrice = selectedAddons.reduce((acc, key) => acc + getPrice(key, prices), 0);
        const totalPrice = basePrice + addonsPrice;
        return { basePrice, addonsPrice, totalPrice };
    }, [product, prices, selectedAddons, formData.deliveryType]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (id: string, file: File | null) => {
        setImageFiles(prev => ({ ...prev, [id]: file }));
    };

    const handleAddonToggle = (addonKey: string) => {
        setSelectedAddons(prev => prev.includes(addonKey) ? prev.filter(k => k !== addonKey) : [...prev, addonKey]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product || !currentUser) {
            addToast('حدث خطأ. يرجى تحديث الصفحة.', 'error');
            return;
        }
        if (!formData.childName || !formData.childAge) {
            addToast('يرجى إدخال اسم وعمر الطفل.', 'warning');
            return;
        }
        if (product.key !== 'coloring_book' && product.key !== 'dua_booklet' && !imageFiles['child_photo_1']) {
            addToast('يرجى رفع صورة وجه الطفل لإتمام الطلب.', 'warning');
            return;
        }

        setIsSubmitting(true);
        try {
            // Correctly call the mutation function using `.mutateAsync`.
            const newOrder = await createOrder.mutateAsync({
                formData,
                imageFiles,
                product,
                userId: currentUser.id,
                selectedAddons,
            });
            navigate(`/checkout?type=order&id=${newOrder.id}`);
        } catch (error: any) {
            // Error toast handled in hook
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleGenerateIdeas = async () => {
        if (!formData.childName || !formData.childAge) {
            addToast('يرجى إدخال اسم وعمر الطفل أولاً للحصول على أفكار مناسبة.', 'warning');
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

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || 'Failed to fetch ideas');
            }

            const data = await response.json();
            setStoryIdeas(data.ideas || []);
            setIsIdeasModalOpen(true);
        } catch (error: any) {
            addToast(`خطأ في توليد الأفكار: ${error.message}`, 'error');
        } finally {
            setIsGeneratingIdeas(false);
        }
    };

    const handleSelectIdea = (idea: { premise: string; goal_key: string }) => {
        setFormData(prev => ({
            ...prev,
            childTraits: `${prev.childTraits}\n${idea.premise}`.trim(),
            storyValue: idea.goal_key,
        }));
        setIsIdeasModalOpen(false);
    };
    
    if (productsLoading || pricesLoading) return <Loader2 className="mx-auto my-12 h-12 w-12 animate-spin text-blue-500" />;
    if (!product) return <div className="text-center py-12">المنتج غير موجود.</div>;
    
    const showFullCustomization = product.key === 'custom_story' || product.key === 'gift_box';

    return (
        <>
            <StoryIdeasModal
                isOpen={isIdeasModalOpen}
                onClose={() => setIsIdeasModalOpen(false)}
                ideas={storyIdeas}
                onSelectIdea={handleSelectIdea}
            />
            <div className="container mx-auto px-4 py-12 sm:py-16">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-800 mb-2">طلب منتج: <span className="text-blue-600">{product.title}</span></h1>
                <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">{product.description}</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Form Fields */}
                        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border space-y-8">
                            
                            <ChildDetailsSection formData={formData} handleChange={handleChange} />

                            {showFullCustomization && (
                                <>
                                    <StoryCustomizationSection 
                                        formData={formData} 
                                        handleChange={handleChange}
                                        onGenerateIdeas={handleGenerateIdeas}
                                        isGeneratingIdeas={isGeneratingIdeas}
                                    />
                                    <ImageUploadSection files={imageFiles} onFileChange={handleFileChange} />
                                    <AddonsSection
                                        addonProducts={addonProducts}
                                        selectedAddons={selectedAddons}
                                        onToggle={handleAddonToggle}
                                        prices={prices}
                                    />
                                </>
                            )}
                            
                            <DeliverySection formData={formData} handleChange={handleChange} />

                        </div>
                        {/* Preview */}
                        <div className="lg:col-span-1 sticky top-24">
                            <InteractivePreview 
                                formData={formData} 
                                product={product}
                                basePrice={basePrice}
                                addons={selectedAddons.map(key => ({
                                    key,
                                    title: addonProducts.find(p => p.key === key)?.title || '',
                                    price: getPrice(key, prices)
                                }))}
                                totalPrice={totalPrice}
                            />
                             <button type="submit" disabled={isSubmitting} className="mt-6 w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-4 rounded-full hover:bg-green-700 transition-transform transform hover:scale-105 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
                                <span>{isSubmitting ? 'جاري إنشاء الطلب...' : 'الانتقال إلى الدفع'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default OrderPage;
