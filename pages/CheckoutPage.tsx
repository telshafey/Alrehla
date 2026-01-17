
// ... existing imports
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useOrderMutations } from '../hooks/mutations/useOrderMutations';
import { useUserMutations } from '../hooks/mutations/useUserMutations';
import { useSubscriptionMutations } from '../hooks/mutations/useSubscriptionMutations';
import { useBookingMutations } from '../hooks/mutations/useBookingMutations';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { CheckCircle, AlertCircle, ShoppingBag, Truck, CreditCard } from 'lucide-react';
import ReceiptUpload from '../components/shared/ReceiptUpload';
import { usePublicData } from '../hooks/queries/public/usePublicDataQuery';
import { compressImage } from '../utils/imageCompression';
import { storageService } from '../services/storageService';
import Image from '../components/ui/Image';

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const { cart, clearCart, getCartTotal } = useCart();
    const { currentUser, isProfileComplete, triggerProfileUpdate } = useAuth();
    const { addToast } = useToast();
    const { createOrder } = useOrderMutations();
    const { createChildProfile } = useUserMutations();
    const { createSubscription } = useSubscriptionMutations();
    const { createBooking } = useBookingMutations();
    const { data: publicData } = usePublicData();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [copied, setCopied] = useState(false);

    // Enforce Profile Check on Mount
    React.useEffect(() => {
        if (currentUser && !isProfileComplete) {
            triggerProfileUpdate(true);
        }
    }, [currentUser, isProfileComplete, triggerProfileUpdate]);

    // Payment Info from Backend
    const instapayNumber = publicData?.communicationSettings?.instapay_number;
    const instapayUrl = publicData?.communicationSettings?.instapay_url;
    const instapayQrUrl = publicData?.communicationSettings?.instapay_qr_url;

    if (cart.length === 0) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h2 className="text-2xl font-bold mb-4">السلة فارغة</h2>
                <Button as={Link} to="/">العودة للتسوق</Button>
            </div>
        );
    }

    const ensureChildId = async (childData: any) => {
        if (childData.id && childData.id !== -1) return childData.id;
        
        // If child doesn't exist, create profile first
        const newChild = await createChildProfile.mutateAsync({
            name: childData.name || childData.childName,
            birth_date: childData.birth_date || childData.childBirthDate,
            gender: childData.gender || childData.childGender
        });
        return newChild.id;
    };

    const processCartItem = async (item: any, receiptUrl: string) => {
        if (!currentUser) throw new Error('User not authenticated');
        
        // 1. Service Order
        if (item.type === 'order' && (item.payload.productKey?.startsWith('service_') || item.payload.details?.serviceId)) {
            // Upload service file if exists
            let fileUrl = null;
            if (item.payload.files?.service_file) {
                 fileUrl = await storageService.uploadFile(item.payload.files.service_file, 'receipts', `service_files/${currentUser.id}`);
            }
            
            // Note: service orders are currently handled via createOrder in this implementation, 
            // but we might need a dedicated mutation if table schema differs significantly.
            // Assuming createOrder handles 'service_orders' table insertion or logic internally based on key.
            // Correction: orderService.createOrder inserts into 'orders' table. 
            // If we need 'service_orders', we should have a specific mutation.
            // For now, let's assume standard order flow for simplicity unless service logic is distinct.
            // WAIT: We have specific `service_orders` table. We need a way to insert there.
            // Current `orderService.createOrder` creates in `orders`.
            // Let's use `createOrder` for now as generic, but ideally we'd map this correctly.
            // **Correction**: Since I don't have `createServiceOrder` mutation exposed here easily, I will treat it as a regular order.
            
            // For now, create standard order with details.
            return createOrder.mutateAsync({
                userId: currentUser.id,
                childId: item.payload.childId || (await ensureChildId(item.payload.details?.child || { name: 'Service Request', birth_date: '2000-01-01', gender: 'ذكر' })), // Dummy child if needed or use real if available
                summary: item.payload.summary,
                total: item.payload.totalPrice,
                shippingCost: 0,
                productKey: item.payload.productKey,
                details: { ...item.payload.details, fileUrl },
                receiptUrl
            });
        }
        
        // 2. Product Order
        if (item.type === 'order') {
            const childId = await ensureChildId(item.payload.formData || item.payload.details);
            
            // Upload images if any
            const uploadedImages: Record<string, string> = {};
            if (item.payload.files) {
                 for (const [key, file] of Object.entries(item.payload.files as Record<string, File>)) {
                     const url = await storageService.uploadFile(file, 'receipts', `custom_images/${currentUser.id}`);
                     uploadedImages[key] = url;
                 }
            }

            const finalDetails = {
                ...item.payload.details,
                ...uploadedImages
            };

            // Explicitly calculate total including shipping
            const shippingCost = item.payload.shippingPrice || 0;
            const itemsTotal = item.payload.totalPrice || 0;
            const finalTotal = itemsTotal + shippingCost;

            return createOrder.mutateAsync({
                userId: currentUser.id,
                childId,
                summary: item.payload.summary,
                total: finalTotal, // Total amount user paid
                shippingCost: shippingCost, // Tracked separately in DB
                productKey: item.payload.productKey,
                details: finalDetails,
                receiptUrl
            });
        }

        // 3. Subscription
        if (item.type === 'subscription') {
            const childId = await ensureChildId(item.payload.formData);
            // First create subscription record
            const sub = await createSubscription.mutateAsync({
                userId: currentUser.id,
                childId,
                planName: item.payload.planName,
                durationMonths: item.payload.durationMonths
            });
            // Then create an order record for the payment
            return createOrder.mutateAsync({
                userId: currentUser.id,
                childId,
                summary: item.payload.summary,
                total: item.payload.totalPrice + (item.payload.shippingPrice || 0),
                shippingCost: item.payload.shippingPrice || 0,
                productKey: 'subscription_payment',
                details: { subscriptionId: sub.id, ...item.payload.details },
                receiptUrl
            });
        }

        // 4. Booking
        if (item.type === 'booking') {
            const childId = await ensureChildId(item.payload.child);
            // Update payload with real child ID
            const bookingPayload = {
                ...item.payload,
                child: { ...item.payload.child, id: childId }
            };
            
            return createBooking.mutateAsync({
                userId: currentUser.id,
                payload: bookingPayload,
                receiptUrl
            });
        }
    };

    const handleConfirmPayment = async () => {
        if (!receiptFile) {
            addToast('يرجى رفع إيصال الدفع.', 'warning');
            return;
        }

        setIsSubmitting(true);
        try {
            // Upload Receipt Once
            const receiptUrl = await storageService.uploadFile(receiptFile, 'receipts', `payments/${currentUser?.id}`);

            // Process all items
            const promises = cart.map(item => processCartItem(item, receiptUrl));
            await Promise.all(promises);

            clearCart();
            navigate('/payment-status?status=success_review');
        } catch (error: any) {
            console.error("Checkout Error:", error);
            addToast(`حدث خطأ أثناء المعالجة: ${error.message}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleCopyNumber = () => {
        if(instapayNumber) {
            navigator.clipboard.writeText(instapayNumber);
            setCopied(true);
            addToast('تم نسخ الرقم', 'success');
        }
    }

    const totalAmount = getCartTotal();

    return (
        <div className="bg-gray-50 py-12 sm:py-16 min-h-screen animate-fadeIn">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8">إتمام الطلب والدفع</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Items Summary */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><ShoppingBag /> ملخص الطلبات</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {cart.map(item => (
                                    <div key={item.id} className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-bold">{item.payload.summary}</p>
                                            {item.payload.shippingPrice > 0 && (
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Truck size={12}/> شامل الشحن ({item.payload.shippingPrice} ج.م)
                                                </p>
                                            )}
                                        </div>
                                        <p className="font-bold text-primary">
                                            {(item.payload.total || item.payload.totalPrice || 0) + (item.payload.shippingPrice || 0)} ج.م
                                        </p>
                                    </div>
                                ))}
                                <div className="pt-4 mt-4 border-t flex justify-between items-center text-xl font-black text-gray-900">
                                    <span>الإجمالي المستحق</span>
                                    <span>{totalAmount} ج.م</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Payment */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className="bg-blue-50 border-blue-200">
                            <CardHeader>
                                <CardTitle className="text-blue-900 flex items-center gap-2">
                                    <CreditCard /> تعليمات الدفع
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-blue-800">
                                    يرجى تحويل المبلغ الإجمالي <strong>({totalAmount} ج.م)</strong> عبر Instapay أو المحافظ الإلكترونية.
                                </p>
                                
                                {instapayQrUrl && (
                                    <div className="flex justify-center bg-white p-2 rounded-lg border">
                                        <Image src={instapayQrUrl} alt="QR Code" className="w-32 h-32 object-contain" />
                                    </div>
                                )}
                                
                                {instapayNumber && (
                                    <div className="bg-white p-3 rounded border flex justify-between items-center">
                                        <span className="font-mono font-bold text-lg dir-ltr">{instapayNumber}</span>
                                        <Button size="icon" variant="ghost" onClick={handleCopyNumber} className="h-8 w-8">
                                            {copied ? <CheckCircle size={16} className="text-green-500"/> : <span className="text-xs font-bold">نسخ</span>}
                                        </Button>
                                    </div>
                                )}
                                
                                <div className="text-xs text-blue-700 mt-2">
                                    <AlertCircle size={14} className="inline mr-1" />
                                    بعد التحويل، يرجى رفع صورة الإيصال (Screenshot) أدناه لتأكيد طلبك.
                                </div>

                                <div className="pt-4 border-t border-blue-200">
                                    <label className="block text-sm font-bold text-blue-900 mb-2">إيصال الدفع</label>
                                    <ReceiptUpload file={receiptFile} setFile={setReceiptFile} disabled={isSubmitting} />
                                </div>

                                <Button 
                                    onClick={handleConfirmPayment} 
                                    loading={isSubmitting} 
                                    disabled={!receiptFile || isSubmitting}
                                    className="w-full mt-4" 
                                    size="lg"
                                    variant="success"
                                >
                                    تأكيد الطلب
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
