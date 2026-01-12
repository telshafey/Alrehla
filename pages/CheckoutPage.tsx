
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
    const { currentUser, isProfileComplete, triggerProfileUpdate } = useAuth();
    const { createOrder } = useOrderMutations();
    const { createBooking } = useBookingMutations();
    const { createSubscription } = useSubscriptionMutations();
    const { cart, clearCart, removeItemFromCart } = useCart();
    const { data: publicData } = usePublicData();
    
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);

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

    const ensureChildId = async (childPayload: any): Promise<number | null> => {
        if (childPayload.id && childPayload.id > 0) return childPayload.id;
        if (!childPayload.name && !childPayload.childName) return null;
        try {
            const newChild = await userService.createChildProfile({
                name: childPayload.name || childPayload.childName,
                birth_date: childPayload.birth_date || childPayload.childBirthDate || new Date().toISOString().split('T')[0],
                gender: childPayload.gender || childPayload.childGender || 'ذكر',
                avatar_url: null
            });
            return newChild.id;
        } catch (error) {
            throw new Error("فشل إنشاء ملف الطفل.");
        }
    };
    
    const processCartItem = async (item: CartItem, receiptUrl: string) => {
        if (!currentUser) throw new Error('User not authenticated');

        // 1. الترتيب مهم جداً: التحقق أولاً من الخدمات الإبداعية Standalone Services
        if (item.type === 'order' && (item.payload.productKey?.startsWith('service_') || item.payload.details?.serviceId)) {
            const childId = await ensureChildId(item.payload.formData || {});
            return orderService.createServiceOrder({
                userId: currentUser.id,
                childId,
                total: (item.payload.totalPrice || 0) + (item.payload.shippingPrice || 0),
                details: item.payload.details,
                receiptUrl
            });
        } 
        // 2. طلبات إنها لك (القصص المخصصة)
        else if (item.type === 'order') {
            const childId = await ensureChildId(item.payload.formData || {});
            const total = (item.payload.totalPrice || 0) + (item.payload.shippingPrice || 0);
            return createOrder.mutateAsync({
                userId: currentUser.id,
                childId,
                summary: item.payload.summary,
                total,
                productKey: item.payload.productKey,
                details: item.payload.details, 
                receiptUrl
            });
        }
        // 3. اشتراكات صندوق الرحلة
        else if (item.type === 'subscription') {
            const childId = await ensureChildId(item.payload.formData);
            const total = (item.payload.total || 0) + (item.payload.shippingPrice || 0);
            return createSubscription.mutateAsync({
                userId: currentUser.id,
                childId,
                planId: item.payload.plan?.id,
                planName: item.payload.plan?.name,
                durationMonths: item.payload.plan?.duration_months,
                total,
                shippingCost: item.payload.shippingPrice,
                shippingDetails: item.payload.formData,
                receiptUrl
            });
        }
        // 4. حجوزات الباقات (بداية الرحلة)
        else if (item.type === 'booking') {
            const childId = await ensureChildId(item.payload.child);
            const updatedPayload = { ...item.payload, child: { ...item.payload.child, id: childId } };
            return createBooking.mutateAsync({ userId: currentUser.id, payload: updatedPayload, receiptUrl });
        }
    };

    const handleConfirmPayment = async () => {
        // Enforce Profile Completion
        if (!isProfileComplete) {
            triggerProfileUpdate(true); // Mandatory
            addToast('يرجى استكمال بيانات التواصل قبل تأكيد الدفع.', 'info');
            return;
        }

        if (!receiptFile) {
            addToast('يرجى رفع إيصال الدفع أولاً.', 'warning');
            return;
        }
        setIsSubmitting(true);
        try {
            const receiptUrl = await orderService.uploadOrderFile(receiptFile, `receipts/${currentUser?.id}`);
            for (const item of cart) {
                await processCartItem(item, receiptUrl);
            }
            clearCart();
            navigate('/payment-status?status=success_review');
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cart.length === 0) return <div className="container mx-auto py-16 text-center"><p>سلة التسوق فارغة.</p><Link to="/">العودة للرئيسية</Link></div>;

    return (
        <div className="bg-muted/50 py-12 sm:py-16 animate-fadeIn">
            <div className="container mx-auto px-4 max-w-2xl">
                <Card>
                    <CardHeader className="text-center">
                        <CreditCard className="mx-auto h-10 w-10 text-primary mb-2" />
                        <CardTitle className="text-3xl">إتمام الدفع</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="p-4 bg-muted rounded-lg border space-y-4">
                            <h3 className="font-bold border-b pb-2">ملخص السلة</h3>
                            {cart.map(item => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span>{item.payload.summary}</span>
                                    <span className="font-bold">{(item.payload.totalPrice || item.payload.total || 0) + (item.payload.shippingPrice || 0)} ج.م</span>
                                </div>
                            ))}
                            <div className="border-t pt-3 flex justify-between items-center font-bold">
                                <span>الإجمالي الكلي</span>
                                <span className="text-xl text-primary">{cartTotal} ج.م</span>
                            </div>
                        </div>
                        <div className="p-6 rounded-lg border bg-background space-y-4">
                            <h2 className="text-xl font-bold">1. الدفع عبر Instapay</h2>
                            {instapayQrUrl && <div className="flex justify-center"><div className="w-64 h-64 bg-white p-2 border rounded-lg"><Image src={instapayQrUrl} alt="QR" className="w-full h-full object-contain" /></div></div>}
                            {instapayNumber && (
                                <div className="flex items-center justify-between bg-muted p-3 rounded-md border">
                                    <span className="text-sm">رقم التحويل:</span>
                                    <div className="flex items-center gap-3"><span className="font-mono font-bold text-lg">{instapayNumber}</span><Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(instapayNumber); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? <Check size={16} /> : <Copy size={16} />}</Button></div>
                                </div>
                            )}
                            <a href={instapayUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 w-full bg-primary text-white font-bold py-3 rounded-full hover:bg-primary/90 transition-colors">فتح التطبيق</a>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-2">2. ارفع صورة الإيصال <span className="text-red-500">*</span></h3>
                            <ReceiptUpload file={receiptFile} setFile={setReceiptFile} disabled={isSubmitting} />
                            {!receiptFile && <p className="text-xs text-red-500 mt-1 text-center">رفع الإيصال إلزامي لإتمام الطلب</p>}
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col items-stretch space-y-4">
                         <Button onClick={handleConfirmPayment} loading={isSubmitting} disabled={!receiptFile || isSubmitting} variant="success" size="lg">تأكيد ورفع الإيصال</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default CheckoutPage;
