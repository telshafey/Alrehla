
import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useOrderMutations } from '../hooks/mutations/useOrderMutations';
import { useBookingMutations } from '../hooks/mutations/useBookingMutations';
import { useSubscriptionMutations } from '../hooks/mutations/useSubscriptionMutations';
import { useToast } from '../contexts/ToastContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { usePublicData } from '../hooks/queries/public/usePublicDataQuery';
import { ArrowLeft, Upload, ShoppingCart, CreditCard, Link as LinkIcon, AlertCircle, Copy, Check } from 'lucide-react';
import ReceiptUpload from '../components/shared/ReceiptUpload';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import Image from '../components/ui/Image';

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { currentUser } = useAuth();
    const { createOrder } = useOrderMutations();
    const { createBooking } = useBookingMutations();
    const { createSubscription } = useSubscriptionMutations();
    const { cart, clearCart, getCartTotal } = useCart();
    const { data: publicData } = usePublicData();
    
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);

    const cartTotal = useMemo(() => getCartTotal(), [cart, getCartTotal]);
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
            // Mock receipt upload
            const receiptUrl = 'https://example.com/mock-receipt.jpg';

            const creationPromises = cart.map(item => {
                const payload = { ...item.payload, userId: currentUser.id, userName: currentUser.name, receiptUrl };
                if (item.type === 'order') {
                    return createOrder.mutateAsync(payload);
                }
                if (item.type === 'booking') {
                    return createBooking.mutateAsync(payload);
                }
                if (item.type === 'subscription') {
                    return createSubscription.mutateAsync(payload);
                }
                return Promise.resolve();
            });

            await Promise.all(creationPromises);
            
            clearCart();
            navigate('/payment-status?status=success_review');
        } catch (error: any) {
            addToast(`حدث خطأ أثناء إنشاء الطلبات: ${error.message}`, 'error');
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
                            <div className="p-4 bg-muted rounded-lg border space-y-3">
                                <h3 className="font-bold text-lg">ملخص السلة</h3>
                                {cart.map(item => (
                                     <div key={item.id} className="flex justify-between items-center text-sm">
                                        <span className="font-semibold text-foreground flex items-center gap-2">
                                            {item.payload.formData?.shippingOption === 'gift' && <span title="هدية">🎁</span>}
                                            {item.payload.summary}
                                        </span>
                                        <span className="font-bold text-foreground">{item.payload.total || item.payload.totalPrice} ج.م</span>
                                    </div>
                                ))}
                                <div className="border-t pt-3 mt-3 flex justify-between items-center">
                                     <span className="font-bold text-xl text-foreground">الإجمالي</span>
                                    <span className="font-extrabold text-2xl text-primary">{cartTotal} ج.م</span>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="p-6 rounded-lg border bg-background space-y-4">
                                    <h2 className="text-xl font-bold text-foreground mb-4">1. الدفع عبر Instapay</h2>
                                    
                                     {instapayQrUrl && (
                                        <div className="mb-4 flex justify-center">
                                            <div className="w-40 h-40 bg-white p-2 rounded-lg shadow-sm border">
                                                <Image src={instapayQrUrl} alt="Instapay QR Code" className="w-full h-full object-contain" />
                                            </div>
                                        </div>
                                    )}

                                    {instapayNumber && (
                                        <div className="flex items-center justify-between bg-muted p-3 rounded-md border">
                                            <span className="text-sm text-gray-500">رقم التحويل:</span>
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono font-bold text-lg dir-ltr">{instapayNumber}</span>
                                                <Button size="sm" variant="ghost" onClick={handleCopyNumber} className="h-8 w-8 p-0">
                                                    {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    <a href={instapayUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-full hover:bg-primary/90 transition-colors">
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
                                disabled={!receiptFile}
                                variant="success"
                                icon={<Upload />}
                                className="w-full"
                                size="lg"
                            >
                                {isSubmitting ? 'جاري التأكيد...' : 'تأكيد ورفع الإيصال'}
                            </Button>
                             <Button as={Link} to="/cart" variant="link" size="sm" className="text-muted-foreground">
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
