
import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useOrderMutations } from '../hooks/mutations/useOrderMutations';
import { useBookingMutations } from '../hooks/mutations/useBookingMutations';
import { useSubscriptionMutations } from '../hooks/mutations/useSubscriptionMutations';
import { useToast } from '../contexts/ToastContext';
import { useCart, CartItem } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { usePublicData } from '../hooks/queries/public/usePublicDataQuery';
import { ArrowLeft, Upload, ShoppingCart, CreditCard, Link as LinkIcon, AlertCircle, Copy, Check, Truck, Trash2, Loader2 } from 'lucide-react';
import ReceiptUpload from '../components/shared/ReceiptUpload';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import Image from '../components/ui/Image';
import { orderService } from '../services/orderService';
import { userService } from '../services/userService';

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { currentUser } = useAuth();
    const { createOrder } = useOrderMutations();
    const { createBooking } = useBookingMutations();
    const { createSubscription } = useSubscriptionMutations();
    const { cart, clearCart, removeItemFromCart, getCartTotal } = useCart();
    const { data: publicData } = usePublicData();
    
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);

    // Calculate totals including shipping
    const cartTotal = useMemo(() => {
        return cart.reduce((total, item) => {
            const itemBase = item.payload.total || item.payload.totalPrice || 0;
            const shipping = item.payload.shippingPrice || 0;
            return total + itemBase + shipping;
        }, 0);
    }, [cart]);

    const instapayUrl = publicData?.communicationSettings?.instapay_url || '#';
    const instapayQrUrl = publicData?.communicationSettings?.instapay_qr_url;
    const instapayNumber = publicData?.communicationSettings?.instapay_number;

    if (cart.length === 0) {
        return (
             <div className="container mx-auto px-4 py-16 text-center">
                <Card className="max-w-md mx-auto">
                    <CardContent className="pt-12 pb-12">
                        <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-foreground font-semibold">سلة التسوق فارغة.</p>
                        <Button as={Link} to="/" variant="link" className="mt-4">
                            <ArrowLeft size={16} className="transform rotate-180 ml-1" />
                            <span>العودة للتسوق</span>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    /**
     * دالة مساعدة للتأكد من وجود معرف طفل صالح في قاعدة البيانات.
     * إذا كان المعرف هو -1، يتم إنشاء بروفايل جديد وحفظه.
     */
    const ensureChildId = async (childPayload: any): Promise<number | null> => {
        // إذا كان المعرف صالحاً (أكبر من 0)، نستخدمه مباشرة
        if (childPayload.id && childPayload.id > 0) {
            return childPayload.id;
        }

        // إذا كانت البيانات ناقصة والتعريف غير موجود، قد يكون الطلب لنفس المستخدم
        if (!childPayload.name && !childPayload.childName) {
            return null;
        }

        // إنشاء بروفايل جديد للطفل في قاعدة البيانات
        try {
            console.log("Creating shadow child profile for manual entry...");
            const newChild = await userService.createChildProfile({
                name: childPayload.name || childPayload.childName,
                birth_date: childPayload.birth_date || childPayload.childBirthDate || new Date().toISOString().split('T')[0],
                gender: childPayload.gender || childPayload.childGender || 'ذكر',
                avatar_url: null,
                interests: null,
                strengths: null
            });
            return newChild.id;
        } catch (error) {
            console.error("Failed to create on-the-fly child profile:", error);
            throw new Error("فشل إنشاء ملف الطفل، يرجى المحاولة لاحقاً.");
        }
    };
    
    const processCartItem = async (item: CartItem, receiptUrl: string) => {
        if (!currentUser) throw new Error('User not authenticated');

        if (!item.payload) {
            console.error("Cart item missing payload", item);
            return;
        }

        // 1. Handle Order (Enha Lak)
        if (item.type === 'order') {
            const { imageFiles, formData, details, shippingPrice } = item.payload;
            const safeFormData = formData || {};
            const safeDetails = details || {};
            const finalDetails = { ...safeFormData, ...safeDetails };

            // التأكد من معرف الطفل (Fix for Foreign Key Constraint)
            const childId = await ensureChildId({
                id: item.payload.childId || safeDetails.childId,
                name: safeFormData.childName || safeDetails.childName,
                birth_date: safeFormData.childBirthDate || safeDetails.childBirthDate,
                gender: safeFormData.childGender || safeDetails.childGender
            });

            // Handle Image Uploads
            const filesToUpload = { ...(imageFiles || {}) };
            Object.keys(finalDetails).forEach(key => {
                if (finalDetails[key] instanceof File) {
                    filesToUpload[key] = finalDetails[key];
                }
            });

            if (Object.keys(filesToUpload).length > 0) {
                for (const [key, file] of Object.entries(filesToUpload)) {
                    if (file instanceof File) {
                        try {
                            const publicUrl = await orderService.uploadOrderFile(file, `order-images/${currentUser.id}`);
                            finalDetails[key] = publicUrl; 
                        } catch (err) {
                            console.error(`Failed to upload ${key}`, err);
                        }
                    }
                }
            }
            
            const baseTotal = item.payload.totalPrice || item.payload.total || 0;
            const finalTotal = baseTotal + (shippingPrice || 0);

            return createOrder.mutateAsync({
                userId: currentUser.id,
                childId: childId,
                summary: item.payload.summary || 'طلب جديد',
                total: finalTotal,
                productKey: item.payload.productKey,
                details: finalDetails, 
                receiptUrl
            });
        }

        // 2. Handle Subscription
        if (item.type === 'subscription') {
            const { plan, formData } = item.payload;
            
            // التأكد من معرف الطفل
            const childId = await ensureChildId(formData);

            const shippingPrice = item.payload.shippingPrice || 0;
            const subTotal = (item.payload.total || 0) + shippingPrice;
            
            const imageFiles = item.payload.imageFiles || {};
             const uploadedImages: Record<string, string> = {};
            if (Object.keys(imageFiles).length > 0) {
                 for (const [key, file] of Object.entries(imageFiles)) {
                    if (file instanceof File) {
                        try {
                             uploadedImages[key] = await orderService.uploadOrderFile(file, `subscription-images/${currentUser.id}`);
                        } catch(e) {
                            console.error("Failed to upload sub image", e);
                        }
                    }
                 }
            }

            const shippingDetails = {
                ...formData,
                ...uploadedImages
            };

            return createSubscription.mutateAsync({
                userId: currentUser.id,
                childId: childId, 
                planId: plan?.id,
                planName: plan?.name,
                durationMonths: plan?.duration_months || 1,
                total: subTotal,
                shippingCost: shippingPrice,
                shippingDetails: shippingDetails, 
                receiptUrl
            });
        }

        // 3. Handle Booking
        if (item.type === 'booking') {
            // التأكد من معرف الطفل (Fix for Foreign Key Constraint)
            const childId = await ensureChildId(item.payload.child);
            
            // تحديث المعرف في الـ payload قبل الإرسال
            const updatedPayload = {
                ...item.payload,
                child: {
                    ...item.payload.child,
                    id: childId
                }
            };

            return createBooking.mutateAsync({
                userId: currentUser.id,
                payload: updatedPayload,
                receiptUrl 
            });
        }
    };

    const handleConfirmPayment = async () => {
        if (!receiptFile) {
            addToast('يرجى رفع إيصال الدفع أولاً.', 'warning');
            return;
        }
        if (!currentUser) {
            addToast('يجب تسجيل الدخول لإتمام العملية.', 'error');
            return;
        }
        
        setIsSubmitting(true);
        try {
            let receiptUrl = '';
            try {
                receiptUrl = await orderService.uploadOrderFile(receiptFile, `receipts/${currentUser.id}`);
            } catch (uploadErr: any) {
                throw new Error("فشل رفع صورة الإيصال. يرجى التحقق من حجم الملف.");
            }

            // تنفيذ معالجة عناصر السلة تتابعياً لضمان عدم حدوث تضارب في قاعدة البيانات
            for (const item of cart) {
                await processCartItem(item, receiptUrl);
            }
            
            clearCart();
            navigate('/payment-status?status=success_review');
        } catch (error: any) {
            console.error("Checkout Error:", error);
            // تحسين رسالة الخطأ للمستخدم
            let userFriendlyMsg = error.message;
            if (userFriendlyMsg.includes('violates foreign key constraint')) {
                userFriendlyMsg = "عذراً، حدث خطأ في ربط بيانات الطفل. يرجى المحاولة مرة أخرى أو التواصل مع الدعم.";
            }
            addToast(userFriendlyMsg, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopyNumber = () => {
      if (instapayNumber) {
          navigator.clipboard.writeText(instapayNumber);
          setCopied(true);
          addToast('تم نسخ الرقم بنجاح', 'success');
          setTimeout(() => setCopied(false), 2000);
      }
    };

    return (
        <div className="bg-muted/50 py-12 sm:py-16 animate-fadeIn">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <CardHeader className="text-center">
                            <CreditCard className="mx-auto h-10 w-10 text-primary mb-2" />
                            <CardTitle className="text-3xl">إتمام الدفع</CardTitle>
                            <CardDescription>أنت على وشك إتمام طلبك. يرجى مراجعة التفاصيل والمتابعة.</CardDescription>
                        </CardHeader>
                        
                        <CardContent className="space-y-6">
                            <div className="p-4 bg-muted rounded-lg border space-y-4">
                                <h3 className="font-bold text-lg border-b pb-2">ملخص السلة</h3>
                                {cart.map(item => {
                                    const basePrice = item.payload.total || item.payload.totalPrice || 0;
                                    const shippingPrice = item.payload.shippingPrice || 0;
                                    const itemTotal = basePrice + shippingPrice;
                                    
                                    return (
                                     <div key={item.id} className="flex flex-col gap-1 border-b last:border-0 pb-2 last:pb-0">
                                        <div className="flex justify-between items-center text-sm font-semibold">
                                            <span className="text-foreground flex items-center gap-2">
                                                {item.payload.formData?.shippingOption === 'gift' && <span title="هدية">🎁</span>}
                                                {item.payload.summary}
                                                <button onClick={() => removeItemFromCart(item.id)} className="text-destructive hover:bg-red-100 p-1 rounded-full" disabled={isSubmitting}><Trash2 size={14}/></button>
                                            </span>
                                            <span className="text-foreground">{itemTotal} ج.م</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground pr-4">
                                            <span>السعر الأساسي: {basePrice} ج.م</span>
                                            {shippingPrice > 0 ? (
                                                <span className="flex items-center gap-1 text-green-700">
                                                    <Truck size={10} /> الشحن: {shippingPrice} ج.م
                                                </span>
                                            ) : (
                                                <span>الشحن: مجاني/مشمول</span>
                                            )}
                                        </div>
                                    </div>
                                )})}
                                <div className="border-t pt-3 flex justify-between items-center bg-white p-3 rounded-lg">
                                     <span className="font-bold text-xl text-foreground">الإجمالي الكلي</span>
                                    <span className="font-extrabold text-2xl text-primary">{cartTotal} ج.م</span>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="p-6 rounded-lg border bg-background space-y-4">
                                    <h2 className="text-xl font-bold text-foreground mb-4">1. الدفع عبر Instapay</h2>
                                    
                                     {instapayQrUrl && (
                                        <div className="mb-4 flex justify-center">
                                            <div className="w-64 h-64 bg-white p-2 rounded-lg shadow-sm border">
                                                <Image src={instapayQrUrl} alt="Instapay QR Code" className="w-full h-full object-contain" />
                                            </div>
                                        </div>
                                    )}

                                    {instapayNumber && (
                                        <div className="flex items-center justify-between bg-muted p-3 rounded-md border">
                                            <span className="text-sm text-gray-500">رقم التحويل:</span>
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono font-bold text-lg dir-ltr">{instapayNumber}</span>
                                                <Button size="sm" variant="ghost" onClick={handleCopyNumber} className="h-8 w-8 p-0" disabled={isSubmitting}>
                                                    {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    <a href={instapayUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-full hover:bg-primary/90 transition-colors ${isSubmitting ? 'pointer-events-none opacity-50' : ''}`}>
                                        <LinkIcon size={18} />
                                        <span>فتح التطبيق / رابط الدفع</span>
                                    </a>
                                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <AlertCircle size={24} />
                                        <span>سينقلك هذا الرابط إلى موقع خارجي آمن لإتمام عملية الدفع.</span>
                                    </div>
                                </div>
                                 <div>
                                    <h3 className="text-lg font-bold text-foreground mb-2">2. ارفع صورة الإيصال</h3>
                                    <ReceiptUpload file={receiptFile} setFile={setReceiptFile} disabled={isSubmitting} />
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex-col items-stretch space-y-4">
                             <Button 
                                onClick={handleConfirmPayment}
                                loading={isSubmitting}
                                disabled={!receiptFile || isSubmitting}
                                variant="success"
                                icon={isSubmitting ? <Loader2 className="animate-spin" /> : <Upload />}
                                className="w-full"
                                size="lg"
                            >
                                {isSubmitting ? 'جاري معالجة الطلب وإنشاء البيانات...' : 'تأكيد ورفع الإيصال'}
                            </Button>
                             <Button as={Link} to="/cart" variant="link" size="sm" className="text-muted-foreground" disabled={isSubmitting}>
                                <ArrowLeft size={16} className="transform rotate-180 ml-1"/>
                                <span>العودة إلى السلة</span>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
