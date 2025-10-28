import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// REFACTOR: Use specialized mutation hooks instead of the general app mutations hook.
// FIX: Corrected import paths
import { useOrderMutations, useBookingMutations, useSubscriptionMutations } from '../hooks/mutations';
import { useToast } from '../contexts/ToastContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Upload, ShoppingCart } from 'lucide-react';
import ReceiptUpload from '../components/shared/ReceiptUpload';
import { Button } from '../components/ui/Button';

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { currentUser } = useAuth();
    const { createOrder } = useOrderMutations();
    const { createBooking } = useBookingMutations();
    const { createSubscription } = useSubscriptionMutations();
    const { cart, clearCart, getCartTotal } = useCart();
    
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const cartTotal = useMemo(() => getCartTotal(), [cart, getCartTotal]);

    if (cart.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4">
                <ShoppingCart className="h-12 w-12 text-gray-400" />
                <p className="mt-4 text-gray-700 font-semibold">سلة التسوق فارغة.</p>
                 <Link to="/" className="mt-6 text-sm text-blue-600 hover:underline flex items-center justify-center gap-1">
                    <ArrowLeft size={16} className="transform rotate-180" />
                    <span>العودة للتسوق</span>
                </Link>
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

    return (
        <div className="container mx-auto px-4 py-12 sm:py-16">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border">
                <div className="text-center mb-8">
                    <ShoppingCart className="mx-auto h-12 w-12 text-blue-500 mb-4" />
                    <h1 className="text-3xl font-extrabold text-gray-800">إتمام الدفع</h1>
                    <p className="text-gray-500 mt-2">أنت على وشك إتمام طلبك. يرجى مراجعة التفاصيل والمتابعة.</p>
                </div>
                
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border space-y-3">
                    <h3 className="font-bold text-lg mb-2">ملخص السلة</h3>
                    {cart.map(item => (
                         <div key={item.id} className="flex justify-between items-center text-sm">
                            <span className="font-semibold text-gray-700">{item.payload.summary}</span>
                            <span className="font-bold text-gray-800">{item.payload.total || item.payload.totalPrice} ج.م</span>
                        </div>
                    ))}
                    <div className="border-t pt-3 mt-3 flex justify-between items-center">
                         <span className="font-bold text-xl text-gray-800">الإجمالي</span>
                        <span className="font-extrabold text-2xl text-blue-600">{cartTotal} ج.م</span>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg text-center">
                        <h2 className="text-xl font-bold text-blue-800">1. الدفع عبر Instapay / المحافظ الإلكترونية</h2>
                        <p className="mt-2 text-gray-600">
                            لتحويل المبلغ الإجمالي المطلوب، يرجى استخدام الحساب التالي ثم رفع صورة من إيصال الدفع.
                        </p>
                        <p className="mt-4 font-mono text-lg font-bold bg-white p-3 rounded-lg border">instapay@alrehlah</p>
                    </div>
                     <div>
                        <h3 className="text-lg font-bold text-gray-700 mb-2">2. ارفع صورة الإيصال</h3>
                        <ReceiptUpload file={receiptFile} setFile={setReceiptFile} disabled={isSubmitting} />
                    </div>
                    <Button 
                        onClick={handleConfirmPayment}
                        loading={isSubmitting}
                        disabled={!receiptFile}
                        variant="success"
                        icon={<Upload />}
                        className="w-full shadow-lg"
                    >
                        {isSubmitting ? 'جاري التأكيد...' : 'تأكيد ورفع الإيصال'}
                    </Button>
                </div>
                
                <div className="mt-8 text-center">
                    <Link to="/cart" className="text-sm text-gray-500 hover:underline flex items-center justify-center gap-1">
                        <ArrowLeft size={16} />
                        <span>العودة إلى السلة</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;