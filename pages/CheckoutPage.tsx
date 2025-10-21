import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAppMutations } from '../hooks/mutations.ts';
import { useProduct } from '../contexts/ProductContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { Loader2, ArrowLeft, CreditCard, Upload } from 'lucide-react';
import ReceiptUpload from '../components/shared/ReceiptUpload.tsx';

const CheckoutPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { updateReceipt } = useAppMutations();
    const { prices, shippingCosts, loading: productLoading } = useProduct();
    const [item, setItem] = useState<any>(null);
    const [itemType, setItemType] = useState<'order' | 'booking' | 'subscription' | null>(null);
    const [loading, setLoading] = useState(true);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const type = searchParams.get('type') as 'order' | 'booking' | 'subscription';
        const id = searchParams.get('id');

        if (!type || !id) {
            navigate('/');
            return;
        }

        // In a real app with useAdminData, we would find the item from the fetched data
        // For now, we'll just store the id and type
        setItem({ id });
        setItemType(type);
        setLoading(false);

    }, [location.search, navigate]);
    
    const handleConfirmPayment = async () => {
        if (!receiptFile || !item) {
            addToast('يرجى رفع إيصال الدفع أولاً.', 'warning');
            return;
        }
        
        setIsSubmitting(true);
        try {
            // Correctly call the mutation function using `.mutateAsync`.
            await updateReceipt.mutateAsync({
                itemId: item.id,
                itemType: itemType!,
                receiptFile
            });
            navigate(`/payment-status?status=success_review&type=${itemType}`);
        } catch (error) {
            // Error is handled in the hook
        } finally {
            setIsSubmitting(false);
        }
    };
    

    if (loading || productLoading) {
        return <Loader2 className="animate-spin mx-auto my-12" />;
    }

    const isManualPayment = itemType === 'order' || itemType === 'booking';

    return (
        <div className="container mx-auto px-4 py-12 sm:py-16">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-800">الدفع</h1>
                    <p className="text-gray-500 mt-2">أنت على وشك إتمام طلبك. يرجى مراجعة التفاصيل والمتابعة.</p>
                </div>

                {isManualPayment ? (
                    <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg text-center">
                            <h2 className="text-xl font-bold text-blue-800">الدفع عبر Instapay / المحافظ الإلكترونية</h2>
                            <p className="mt-2 text-gray-600">
                                لإتمام طلبك، يرجى تحويل المبلغ المطلوب إلى الحساب التالي ثم رفع صورة من إيصال الدفع.
                            </p>
                            <p className="mt-4 font-mono text-lg font-bold bg-white p-3 rounded-lg border">instapay@alrehlah</p>
                        </div>
                         <div>
                            <h3 className="text-lg font-bold text-gray-700 mb-2">2. ارفع صورة الإيصال</h3>
                            <ReceiptUpload file={receiptFile} setFile={setReceiptFile} disabled={isSubmitting} />
                        </div>
                        <button 
                            onClick={handleConfirmPayment}
                            disabled={!receiptFile || isSubmitting}
                            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-4 rounded-full hover:bg-green-700 transition-colors shadow-lg disabled:bg-gray-400">
                            {isSubmitting ? <Loader2 className="animate-spin" /> : <Upload />}
                            <span>{isSubmitting ? 'جاري الرفع...' : 'تأكيد ورفع الإيصال'}</span>
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-gray-600 mb-6">سيتم توجيهك إلى بوابة دفع آمنة لإتمام الاشتراك.</p>
                         <button 
                            disabled={isSubmitting}
                            // In a real scenario, this would trigger a payment gateway integration
                            onClick={() => navigate(`/payment-status?status=success_auto&type=${itemType}&itemId=${item.id}`)}
                            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-4 rounded-full hover:bg-green-700 transition-colors shadow-lg disabled:bg-gray-400">
                            <CreditCard />
                            <span>الانتقال إلى الدفع</span>
                        </button>
                    </div>
                )}
                
                <div className="mt-8 text-center">
                    <Link to="/" className="text-sm text-gray-500 hover:underline flex items-center justify-center gap-1">
                        <ArrowLeft size={16} />
                        <span>العودة ومتابعة التسوق</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
