import React, { useReducer, useMemo, useEffect } from 'react';
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
import type { ChildProfile, PersonalizedProduct } from '../lib/database.types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import DynamicTextFields from '../components/order/DynamicTextFields';
import ChildProfileModal from '../components/account/ChildProfileModal';

// --- State Management with Reducer ---

type OrderStep = string;

type State = {
  step: OrderStep;
  selectedChildId: number | null;
  formData: { [key: string]: any };
  selectedAddons: string[];
  imageFiles: { [key: string]: File | null };
  errors: { [key: string]: string };
  imagePreviewUrl: string | null;
  isChildModalOpen: boolean;
  isSubmitting: boolean;
};

type Action =
  | { type: 'SET_STEP'; payload: OrderStep }
  | { type: 'SET_SELECTED_CHILD'; payload: { child: ChildProfile | null } }
  | { type: 'SELECT_SELF'; payload: { name: string } }
  | { type: 'UPDATE_FORM_DATA'; payload: { name: string; value: any } }
  | { type: 'SET_FORM_DATA'; payload: { [key: string]: any } }
  | { type: 'TOGGLE_ADDON'; payload: string }
  | { type: 'SET_ADDONS'; payload: string[] }
  | { type: 'SET_IMAGE_FILE'; payload: { id: string; file: File | null; isPreviewSource?: boolean } }
  | { type: 'SET_ERRORS'; payload: { [key: string]: string } }
  | { type: 'CLEAR_ERROR'; payload: string }
  | { type: 'OPEN_CHILD_MODAL' }
  | { type: 'CLOSE_CHILD_MODAL' }
  | { type: 'SET_SUBMITTING'; payload: boolean };


const orderReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload, errors: {} };
    case 'SET_SELECTED_CHILD':
      if (action.payload.child) {
        return {
          ...state,
          selectedChildId: action.payload.child.id,
          formData: {
            ...state.formData,
            childName: action.payload.child.name,
            childBirthDate: action.payload.child.birth_date,
            childGender: action.payload.child.gender,
          },
        };
      }
      return {
        ...state,
        selectedChildId: null,
        formData: {
          ...state.formData,
          childName: '',
          childBirthDate: '',
          childGender: '',
        },
      };
    case 'SELECT_SELF':
        return {
            ...state,
            selectedChildId: null,
            formData: {
                ...state.formData,
                childName: action.payload.name,
                childBirthDate: '',
                childGender: '',
            }
        };
    case 'UPDATE_FORM_DATA':
      const newErrors = { ...state.errors };
      delete newErrors[action.payload.name];
      return {
        ...state,
        formData: { ...state.formData, [action.payload.name]: action.payload.value },
        errors: newErrors,
      };
    case 'SET_FORM_DATA':
      return { ...state, formData: { ...state.formData, ...action.payload } };
    case 'TOGGLE_ADDON':
      const newAddons = state.selectedAddons.includes(action.payload)
        ? state.selectedAddons.filter(k => k !== action.payload)
        : [...state.selectedAddons, action.payload];
      return { ...state, selectedAddons: newAddons };
    case 'SET_ADDONS':
        return { ...state, selectedAddons: action.payload };
    case 'SET_IMAGE_FILE':
      const newImageFiles = { ...state.imageFiles, [action.payload.id]: action.payload.file };
      const newImageErrors = { ...state.errors };
      delete newImageErrors[action.payload.id];

      let imagePreviewUrl = state.imagePreviewUrl;
      if (action.payload.isPreviewSource) {
          if (action.payload.file) {
              imagePreviewUrl = URL.createObjectURL(action.payload.file);
          } else {
              imagePreviewUrl = null;
          }
      }
      
      return { ...state, imageFiles: newImageFiles, errors: newImageErrors, imagePreviewUrl };
    case 'SET_ERRORS':
      return { ...state, errors: action.payload };
    case 'CLEAR_ERROR':
        const clearedErrors = { ...state.errors };
        delete clearedErrors[action.payload];
        return { ...state, errors: clearedErrors };
    case 'OPEN_CHILD_MODAL':
      return { ...state, isChildModalOpen: true };
    case 'CLOSE_CHILD_MODAL':
      return { ...state, isChildModalOpen: false };
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.payload };
    default:
      return state;
  }
};


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

// --- Component ---
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
    
    const initialState: State = {
        step: stepsConfig[0].key,
        selectedChildId: null,
        formData: {
            deliveryType: 'printed',
            shippingOption: 'my_address',
            governorate: 'القاهرة',
            recipientName: '',
            recipientAddress: '',
            recipientPhone: '',
            recipientEmail: '',
            giftMessage: '',
            sendDigitalCard: true,
        },
        selectedAddons: [],
        imageFiles: {},
        errors: {},
        imagePreviewUrl: null,
        isChildModalOpen: false,
        isSubmitting: false,
    };
    
    const [state, dispatch] = useReducer(orderReducer, initialState);
    const { step, selectedChildId, formData, selectedAddons, imageFiles, errors, imagePreviewUrl, isChildModalOpen, isSubmitting } = state;

    
    useEffect(() => {
        if (product) {
            if (!product.has_printed_version) {
                dispatch({ type: 'UPDATE_FORM_DATA', payload: { name: 'deliveryType', value: 'electronic' } });
            }
            if (product.component_keys && product.component_keys.length > 0) {
                dispatch({ type: 'SET_ADDONS', payload: product.component_keys });
            } else {
                dispatch({ type: 'SET_ADDONS', payload: [] });
            }
        }
    }, [product]);

    const isLoading = productContextLoading || orderDataLoading;
    
    const allProducts = useMemo(() => orderData?.personalizedProducts || [], [orderData]);
    
    const addonProducts = useMemo(() => allProducts.filter(p => p.is_addon), [allProducts]);

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
    
     const validateStep = () => {
        const newErrors: { [key: string]: string } = {};
        if (!product) return false;
        
        const checkRequiredTextFields = (fields: any[]) => {
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
        dispatch({ type: 'SET_ERRORS', payload: newErrors });
        return Object.keys(newErrors).length === 0;
    };
    
    const handleNext = () => {
        if (!validateStep()) {
            addToast('يرجى إكمال الحقول المطلوبة للمتابعة.', 'warning');
            return;
        }
        const currentIndex = stepsConfig.findIndex(s => s.key === step);
        if (currentIndex < stepsConfig.length - 1) {
            dispatch({ type: 'SET_STEP', payload: stepsConfig[currentIndex + 1].key as OrderStep });
        }
    };
    
    const handleBack = () => {
        const currentIndex = stepsConfig.findIndex(s => s.key === step);
        if (currentIndex > 0) {
            dispatch({ type: 'SET_STEP', payload: stepsConfig[currentIndex - 1].key as OrderStep });
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

        dispatch({ type: 'SET_SUBMITTING', payload: true });
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
        dispatch({ type: 'SET_SUBMITTING', payload: false });
    };


    if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;
    if (!product) return <div className="text-center py-20">المنتج غير موجود.</div>;
    
    const previewSourceSlot = product.image_slots?.find(s => s.required)?.id;

    const childDetailsProps = {
        formData: { childName: formData.childName, childBirthDate: formData.childBirthDate, childGender: formData.childGender },
        handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => dispatch({ type: 'UPDATE_FORM_DATA', payload: { name: e.target.name, value: e.target.value } }),
        errors: errors,
        childProfiles: childProfiles,
        onSelectChild: (child: ChildProfile | null) => dispatch({ type: 'SET_SELECTED_CHILD', payload: { child } }),
        selectedChildId: selectedChildId,
        onSelectSelf: () => dispatch({ type: 'SELECT_SELF', payload: { name: currentUser?.name || '' } }),
        currentUser: currentUser,
        onAddChild: () => dispatch({ type: 'OPEN_CHILD_MODAL' })
    };

    const stepContentMap: { [key: string]: React.ReactNode } = {
        'child': <ChildDetailsSection {...childDetailsProps} />,
        'customization': <StoryCustomizationSection formData={formData} handleChange={(e) => dispatch({ type: 'UPDATE_FORM_DATA', payload: { name: e.target.name, value: e.target.value } })} errors={errors} textFields={product.text_fields || null} goalConfig={product.goal_config || 'none'} storyGoals={storyGoals} />,
        'images': <ImageUploadSection files={imageFiles} onFileChange={(id, file) => dispatch({ type: 'SET_IMAGE_FILE', payload: { id, file, isPreviewSource: id === previewSourceSlot } })} errors={errors} imageSlots={product.image_slots || null}/>,
        'addons': <AddonsSection addonProducts={addonProducts} selectedAddons={selectedAddons} onToggle={(key) => dispatch({ type: 'TOGGLE_ADDON', payload: key })} />,
        'delivery': <DeliverySection formData={formData as any} handleChange={(e) => dispatch({ type: 'UPDATE_FORM_DATA', payload: { name: e.target.name, value: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value } })} product={product} errors={errors} />,
        
        // Emotion Story Steps
        'child_context': (
            <div>
                <ChildDetailsSection {...childDetailsProps} />
                <div className="mt-8 pt-8 border-t">
                    <h3 className="text-xl font-bold text-gray-700 mb-4">معلومات إضافية عن السياق</h3>
                     <DynamicTextFields fields={product.text_fields?.slice(0, 4) || []} formData={formData} errors={errors} handleChange={(e) => dispatch({ type: 'UPDATE_FORM_DATA', payload: { name: e.target.name, value: e.target.value } })} />
                </div>
            </div>
        ),
        'emotion_journey': (
             <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">رحلة المشاعر</h3>
                <StoryCustomizationSection formData={formData} handleChange={(e) => dispatch({ type: 'UPDATE_FORM_DATA', payload: { name: e.target.name, value: e.target.value } })} errors={errors} textFields={[]} goalConfig={product.goal_config || 'none'} storyGoals={storyGoals} />
                <div className="mt-6">
                    <DynamicTextFields fields={product.text_fields?.slice(4, 8) || []} formData={formData} errors={errors} handleChange={(e) => dispatch({ type: 'UPDATE_FORM_DATA', payload: { name: e.target.name, value: e.target.value } })} />
                </div>
            </div>
        ),
        'creative_touches': (
             <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">لمسات إبداعية</h3>
                <DynamicTextFields fields={product.text_fields?.slice(8, 11) || []} formData={formData} errors={errors} handleChange={(e) => dispatch({ type: 'UPDATE_FORM_DATA', payload: { name: e.target.name, value: e.target.value } })} />
            </div>
        ),
    };

    const currentStepTitle = stepsConfig.find(s => s.key === step)?.title;

    return (
        <>
        <ChildProfileModal isOpen={isChildModalOpen} onClose={() => dispatch({ type: 'CLOSE_CHILD_MODAL' })} childToEdit={null} />
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
                              {stepContentMap[step]}
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
        </>
    );
};

export default OrderPage;