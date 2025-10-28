import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

const PaymentStatusPage: React.FC = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const status = searchParams.get('status');
    
    const statusConfig = {
        success: {
            icon: <CheckCircle className="h-16 w-16 text-green-500" />,
            title: 'تم استلام طلبك بنجاح!',
            message: 'شكراً لطلبك. فريقنا سيبدأ في تجهيزه فوراً وسيتم إعلامك بالتحديثات.'
        },
        success_review: {
            icon: <Clock className="h-16 w-16 text-blue-500" />,
            title: 'تم رفع الإيصال بنجاح!',
            message: 'شكراً لك. طلبك الآن قيد المراجعة وسيتم تأكيده خلال 24 ساعة.'
        },
        cancelled: {
            icon: <AlertCircle className="h-16 w-16 text-red-500" />,
            title: 'تم إلغاء الطلب',
            message: 'تم إلغاء طلبك. إذا كان هذا خطأ، يرجى التواصل مع الدعم.'
        }
    };

    const currentStatus = statusConfig[status as keyof typeof statusConfig] || statusConfig.cancelled;

    return (
        <div className="flex items-center justify-center min-h-[70vh] bg-gray-50">
            <div className="text-center bg-white p-12 rounded-2xl shadow-lg max-w-lg mx-auto">
                <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gray-100 mb-6">
                   {currentStatus.icon}
                </div>
                <h1 className="text-3xl font-extrabold text-gray-800">{currentStatus.title}</h1>
                <p className="mt-4 text-gray-600">{currentStatus.message}</p>
                <div className="mt-8">
                    <Link to="/account" className="px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700">
                        الذهاب إلى حسابي
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentStatusPage;
